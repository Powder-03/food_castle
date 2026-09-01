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
            print(f"INFO: Running database migrations via Alembic for host: {async_engine.url.host}...", flush=True)
            alembic_cfg = Config("alembic.ini")
            
            # Use sync url for inspector to check existing revisions safely
            from alembic.migration import MigrationContext
            from sqlalchemy import create_engine
            from sqlalchemy.engine.reflection import Inspector
            from app.core.config import settings
            
            sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
            engine = create_engine(sync_url)
            
            with engine.connect() as connection:
                context = MigrationContext.configure(connection)
                current_rev = context.get_current_revision()
                
                inspector = Inspector.from_engine(engine)
                tables = inspector.get_table_names()
                
                if current_rev is None and "menu_items" in tables:
                    print("INFO: Tables exist but no alembic version found. Stamping initial schema...", flush=True)
                    command.stamp(alembic_cfg, "001_initial_schema")
            
            engine.dispose()
            
            # Now run the upgrade
            command.upgrade(alembic_cfg, "head")
            print("INFO: Database migrations completed successfully.", flush=True)
        except Exception as e:
            print(f"ERROR running database migrations: {e}", flush=True)
            import traceback
            traceback.print_exc()

    thread = threading.Thread(target=_upgrade)
    thread.start()
    thread.join()



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Programmatically run Alembic migrations on startup
    run_migrations()
    
    # Test async database connectivity
    try:
        async with async_engine.connect() as conn:
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
            print("INFO: Async database connection verified successfully.", flush=True)
    except Exception as e:
        print(f"ERROR connecting to database asynchronously: {e}", flush=True)
        import traceback
        traceback.print_exc()
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
