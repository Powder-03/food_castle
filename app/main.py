from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.database import async_engine, Base
# Import models so Base.metadata is populated
import app.models  # noqa: F401

logger = logging.getLogger("uvicorn")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize all database tables directly on startup
    try:
        print(f"INFO: Initializing database tables for host: {async_engine.url.host}...", flush=True)
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("INFO: Database tables initialized successfully.", flush=True)
    except Exception as e:
        print(f"ERROR initializing database tables: {e}", flush=True)
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
