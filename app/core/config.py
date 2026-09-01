from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ADMIN_1_USERNAME: str = "i"
    ADMIN_1_PASSWORD: str = "admin1pass"
    ADMIN_2_USERNAME: str = "a"
    ADMIN_2_PASSWORD: str = "admin2pass"
    
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/food_castle_db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if v:
            v = v.strip()
            v = v.replace("&channel_binding=require", "").replace("?channel_binding=require&", "?").replace("?channel_binding=require", "")
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+"):
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
