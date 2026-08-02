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
            command.upgrade(alembic_cfg, "head")
            logger.info("Database migrations completed successfully.")
        except Exception as e:
            logger.error(f"Error running database migrations: {e}")

    thread = threading.Thread(target=_upgrade)
    thread.start()
    thread.join()



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Programmatically run Alembic migrations on startup
    run_migrations()
    
    # Ensure database schema fallback if using direct tables
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


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
