from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from alembic.config import Config
from alembic import command

from app.api.router import api_router
from app.core.database import async_engine, Base

logger = logging.getLogger("uvicorn")


import threading

def run_migrations():
    """Run Alembic database migrations programmatically on app startup inside a separate thread."""
    def _upgrade():
        try:
            logger.info("Running database migrations via Alembic...")
            alembic_cfg = Config("alembic.ini")
            
            # Check if we need to stamp the initial schema
            # We do this by checking if Alembic says we are at 'base' but tables actually exist
            from alembic.migration import MigrationContext
            from sqlalchemy import create_engine
            from sqlalchemy.engine.reflection import Inspector
            from app.core.config import settings
            
            # Use sync url for inspector
            sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
            engine = create_engine(sync_url)
            
            with engine.connect() as connection:
                context = MigrationContext.configure(connection)
                current_rev = context.get_current_revision()
                
                # Check if tables exist
                inspector = Inspector.from_engine(engine)
                tables = inspector.get_table_names()
                
                if current_rev is None and "menu_items" in tables:
                    logger.info("Tables exist but no alembic version found. Stamping initial schema...")
                    command.stamp(alembic_cfg, "001_initial_schema")
            
            # Now run the upgrade
            command.upgrade(alembic_cfg, "head")
            logger.info("Database migrations completed successfully.")
        except Exception as e:
            logger.error(f"Error running database migrations: {e}", exc_info=True)

    thread = threading.Thread(target=_upgrade)
    thread.start()
    thread.join()



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Programmatically run Alembic migrations on startup
    run_migrations()
    
    # Ensure database schema fallback if using direct tables
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        logger.error(f"Error during Base.metadata.create_all: {e}", exc_info=True)
        raise e
    yield
    await async_engine.dispose()


app = FastAPI(
    title="Food Castle - Cafe/Cloud Kitchen Internal Management API",
    version="1.0.0",
    description="Production-grade asynchronous RESTful API built with FastAPI, SQLAlchemy (Async), PostgreSQL (asyncpg), and Clean Code Architecture.",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "healthy", "service": "food_castle_api", "driver": "asyncpg"}
