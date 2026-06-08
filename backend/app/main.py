from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from app.api import admin, analytics, api_keys, attacks, auth, reports, tests
from app.core.config import get_settings
from app.core.middleware import InMemoryRateLimiter, security_headers
from app.db.session import Base, SessionLocal, engine
from app.services.seed import seed

settings = get_settings()
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])


def initialize_app() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
    Path("reports/generated").mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_app()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter

allowed_origins = [settings.frontend_origin]
if settings.frontend_origin != "http://localhost:3001":
    allowed_origins.append("http://localhost:3001")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(InMemoryRateLimiter(settings.rate_limit))
app.middleware("http")(security_headers)


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(_: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": f"Rate limit exceeded: {exc.detail}"})


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}


app.include_router(auth.router)
app.include_router(attacks.router)
app.include_router(tests.router)
app.include_router(reports.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(api_keys.router)
app.mount("/static", StaticFiles(directory="reports/generated", check_dir=False), name="static")
