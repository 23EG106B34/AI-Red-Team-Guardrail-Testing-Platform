from pathlib import Path
import os
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
    report_dir = Path("/tmp/reports/generated") if os.getenv("VERCEL") == "1" else Path("reports/generated")
    report_dir.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_app()
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter

allowed_origins = [settings.frontend_origin]
# Always allow local dev origin(s)
if "http://localhost:3001" not in allowed_origins:
    allowed_origins.append("http://localhost:3001")
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")

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


@app.get("/api/health")
def api_health():
    return health()


app.include_router(auth.router)
app.include_router(attacks.router)
app.include_router(tests.router)
app.include_router(reports.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(api_keys.router)
app.include_router(auth.router, prefix="/api")
app.include_router(attacks.router, prefix="/api")
app.include_router(tests.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(api_keys.router, prefix="/api")
static_dir = "/tmp/reports/generated" if os.getenv("VERCEL") == "1" else "reports/generated"
app.mount("/static", StaticFiles(directory=static_dir, check_dir=False), name="static")
app.mount("/api/static", StaticFiles(directory=static_dir, check_dir=False), name="api-static")
