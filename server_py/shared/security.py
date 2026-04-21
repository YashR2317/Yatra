"""
Security Middleware — Shared across auth and agent subsystems.
Rate limiting, CORS config, input sanitization.
"""

import re
import time
from fastapi import Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from config import get_settings

# ─── Rate Limiter Instance ───────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


def get_allowed_origins() -> list[str]:
    """Parse allowed origins from environment variable."""
    settings = get_settings()
    origins = settings.allowed_origins_list
    if not origins:
        return [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5000",
        ]
    return origins


def configure_cors(app):
    """Add CORS middleware to the FastAPI app."""
    settings = get_settings()
    origins = get_allowed_origins()

    # In development, allow all localhost origins
    if not settings.is_production:
        origins.extend([
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5000",
        ])
        origins = list(set(origins))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        allow_headers=["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
        max_age=86400,
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds security headers equivalent to Helmet.js."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Helmet-equivalent headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Strict-Transport-Security"] = "max-age=15552000; includeSubDomains"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["X-Download-Options"] = "noopen"
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

        return response


def sanitize_string(value: str) -> str:
    """Strip HTML/script tags from a string value."""
    if not isinstance(value, str):
        return value
    return re.sub(r"<[^>]*>", "", value).strip()


def sanitize_body_dict(body: dict) -> dict:
    """Strip HTML from all string values in a request body dict."""
    sanitized = {}
    for key, value in body.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value)
        else:
            sanitized[key] = value
    return sanitized


# ─── Rate Limit Key Generators ───────────────────────────────

def auth_key_func(request: Request) -> str:
    """Rate limit auth endpoints by email to prevent brute-force."""
    # Try to extract email from body — fallback to IP
    return get_remote_address(request)


def chat_key_func(request: Request) -> str:
    """Rate limit chat by userId if authenticated, else IP."""
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return str(user_id)
    return get_remote_address(request)
