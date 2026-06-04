from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Sentinel Red AI API"
    environment: str = "development"
    frontend_origin: str = "http://localhost:3000"
    database_url: str = "sqlite:///./sentinel_red.db"
    jwt_secret: str = Field(default="change-me-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 1440
    fernet_key: str = ""
    chroma_path: str = "./chroma"
    report_base_url: str = "http://localhost:8000"
    rate_limit: str = "120/minute"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
