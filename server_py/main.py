"""
BrajYatra.AI — Unified Python Backend
=======================================
Single FastAPI application combining:
 - Auth service (MongoDB via Beanie)
 - Agent service (SQLite + Multi-Agent System)
 - User data routes

Preserves the exact API contract for the React frontend.
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from config import get_settings
from shared.logger import create_logger, RequestLoggingMiddleware
from shared.security import configure_cors, SecurityHeadersMiddleware, limiter

logger = create_logger("server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    settings = get_settings()
    logger.info("=" * 60)
    logger.info("  BrajYatra.AI — Python Backend Starting")
    logger.info("=" * 60)

    # ── 1. Connect MongoDB ───────────────────────────────
    try:
        from auth.config.db import connect_db, close_db
        await connect_db()
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e} — auth endpoints may not work")

    # ── 2. Initialize Agent Subsystem ────────────────────
    try:
        from agent.server import init_agent
        init_agent()
    except Exception as e:
        logger.warning(f"Agent init failed: {e} — agent endpoints may not work")

    # ── 3. Log status ────────────────────────────────────
    logger.info("")
    logger.info(f"  🛕  Unified server ready on port {settings.AGENT_PORT}")
    logger.info(f"  🔐  Auth: MongoDB → {'connected' if settings.MONGO_URI else 'NO URI'}")
    logger.info(f"  🤖  Agent: SQLite → brajyatra.db")
    logger.info(f"  🌍  CORS: {settings.allowed_origins_list[:3]}")
    logger.info(f"  🔑  LLM: {settings.LLM_MODE}")
    logger.info("")
    logger.info("=" * 60)

    yield

    # ── Shutdown ─────────────────────────────────────────
    logger.info("Shutting down...")
    try:
        from auth.config.db import close_db
        await close_db()
    except Exception:
        pass


# ── Create FastAPI App ───────────────────────────────────────
app = FastAPI(
    title="BrajYatra.AI",
    description="Sacred journey through the land of Krishna",
    version="2.0.0",
    lifespan=lifespan,
)

# ── Middleware ───────────────────────────────────────────────
app.state.limiter = limiter
configure_cors(app)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)


# ── Rate Limit Error Handler ────────────────────────────────
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"error": "Too many requests. Please try again later."},
    )


# ── Validation Error Handler ────────────────────────────────
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc):
    errors = exc.errors()
    messages = [f"{e.get('loc', [''])[- 1]}: {e.get('msg', 'Invalid')}" for e in errors]
    return JSONResponse(
        status_code=400,
        content={"success": False, "message": "; ".join(messages)},
    )


# ── Route Registration ──────────────────────────────────────

# Auth routes: /api/auth/*
from auth.routes.auth_routes import router as auth_router
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])

# Agent routes: /api/agent/*
from agent.routes.api import router as agent_router
app.include_router(agent_router, prefix="/api/agent", tags=["Agent"])

# User data routes: /api/user/*
from routes.user_routes import router as user_router
app.include_router(user_router, prefix="/api/user", tags=["User"])


# ── Root Health Check ────────────────────────────────────────
@app.get("/")
def root():
    return JSONResponse({
        "name": "BrajYatra.AI",
        "version": "2.0.0",
        "status": "running",
        "architecture": "unified-python",
        "endpoints": {
            "auth": "/api/auth",
            "agent": "/api/agent",
            "user": "/api/user",
        },
    })


# ── Entry Point ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.AGENT_PORT,
        reload=not settings.is_production,
        log_level="info",
    )
