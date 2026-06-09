import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import get_settings

settings = get_settings()


def _database_url() -> str:
    if not settings.database_url.startswith("sqlite"):
        return settings.database_url

    if os.getenv("VERCEL") != "1":
        return settings.database_url

    db_name = Path(settings.database_url.rsplit("/", 1)[-1]).name or "sentinel_red.db"
    db_path = Path("/tmp") / db_name
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{db_path.as_posix()}"


database_url = _database_url()
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
