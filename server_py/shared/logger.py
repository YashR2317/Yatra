"""
Structured Logger — Loguru-based logging for production.
Provides consistent log format across auth and agent subsystems.
"""

import sys
import time
from pathlib import Path
from loguru import logger as _loguru_logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from config import get_settings


def _setup_logger():
    """Configure loguru with appropriate sinks."""
    settings = get_settings()

    # Remove default handler
    _loguru_logger.remove()

    # Console handler (always)
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> "
        "[<cyan>{extra[service]}</cyan>] "
        "<level>{level: <8}</level> "
        "<level>{message}</level>"
    )
    _loguru_logger.add(
        sys.stderr,
        format=log_format,
        level="DEBUG" if not settings.is_production else "INFO",
        colorize=True,
    )

    # File handlers in production
    if settings.is_production:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        _loguru_logger.add(
            str(log_dir / "{extra[service]}-error.log"),
            level="ERROR",
            rotation="5 MB",
            retention=5,
            format="{time:YYYY-MM-DD HH:mm:ss} [{extra[service]}] {level}: {message}",
        )
        _loguru_logger.add(
            str(log_dir / "{extra[service]}-combined.log"),
            rotation="10 MB",
            retention=5,
            format="{time:YYYY-MM-DD HH:mm:ss} [{extra[service]}] {level}: {message}",
        )


# Run setup on import
_setup_logger()


def create_logger(service: str = "app"):
    """Create a logger instance bound to a service name.

    Args:
        service: Service identifier ('auth', 'agent', 'server')

    Returns:
        A loguru logger bound with the service context.
    """
    return _loguru_logger.bind(service=service)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware that logs each request with method, URL, status, and duration."""

    def __init__(self, app, logger=None):
        super().__init__(app)
        self.logger = logger or create_logger("server")

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        response = await call_next(request)
        duration_ms = round((time.time() - start) * 1000)

        status = response.status_code
        level = "error" if status >= 500 else "warning" if status >= 400 else "info"

        self.logger.log(
            level.upper(),
            f"{request.method} {request.url.path} {status} {duration_ms}ms",
        )
        return response
