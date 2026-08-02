from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.database import async_engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created on startup if tables do not exist
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
