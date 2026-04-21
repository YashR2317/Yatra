"""
Auth Middleware — JWT verification for protected routes.
"""

from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError, ExpiredSignatureError

from config import get_settings
from auth.models.user import User


def _get_jwt_secret() -> str:
    settings = get_settings()
    secret = settings.JWT_SECRET
    if not secret:
        if settings.is_production:
            raise RuntimeError("FATAL: JWT_SECRET is not set")
        return "brajyatra-dev-secret-do-not-use-in-production"
    return secret


async def ensure_authenticated(request: Request):
    """Strict JWT auth — returns 401 if not authenticated.

    On success, sets request.state.user with the full User document.
    """
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authorized, no token")

    token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authorized, no token")

    try:
        settings = get_settings()
        decoded = jwt.decode(
            token,
            _get_jwt_secret(),
            algorithms=["HS256"],
            options={"verify_iss": True},
            issuer=settings.JWT_ISSUER or "brajyatra.ai",
        )

        user = await User.get(decoded.get("id"))
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        request.state.user = user

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired. Please log in again.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed.")


def sign_jwt(user_id: str, user_name: str) -> str:
    """Create a JWT token for a user."""
    settings = get_settings()
    return jwt.encode(
        {"id": user_id, "name": user_name},
        _get_jwt_secret(),
        algorithm="HS256",
        headers={"iss": settings.JWT_ISSUER or "brajyatra.ai"},
    )
