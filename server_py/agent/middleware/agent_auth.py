"""
Agent Auth Middleware — Lightweight JWT verification for agent endpoints.
Non-blocking: sets request.state.user_id if valid, None if not.
"""

from fastapi import Request
from jose import jwt, JWTError
from config import get_settings


def _get_jwt_secret() -> str:
    settings = get_settings()
    secret = settings.JWT_SECRET
    if not secret:
        if settings.is_production:
            raise RuntimeError("FATAL: JWT_SECRET is not set")
        return "brajyatra-dev-secret-do-not-use-in-production"
    return secret


async def agent_auth(request: Request):
    """Non-blocking JWT auth: extracts user_id from token if valid.

    Sets request.state.user_id and request.state.user_name.
    Always allows the request to proceed (even without auth).
    """
    request.state.user_id = None
    request.state.user_name = None

    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return

    token = auth_header[7:]
    if not token:
        return

    try:
        settings = get_settings()
        decoded = jwt.decode(
            token,
            _get_jwt_secret(),
            algorithms=["HS256"],
            options={"verify_iss": True},
            issuer=settings.JWT_ISSUER or "brajyatra.ai",
        )
        request.state.user_id = decoded.get("id")
        request.state.user_name = decoded.get("name")
    except JWTError:
        # Invalid/expired token — continue as anonymous
        pass


async def require_auth(request: Request):
    """Strict JWT auth — raises 401 if not authenticated."""
    await agent_auth(request)
    if not request.state.user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Authentication required")
