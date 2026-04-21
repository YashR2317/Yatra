"""
Google OAuth Controller — Verifies Google ID tokens and creates/links user accounts.
"""

import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from auth.models.user import User
from auth.middleware.auth_middleware import sign_jwt
from auth.utils.email import send_welcome_email
from shared.validators import GoogleAuthRequest
from config import get_settings
from shared.logger import create_logger

logger = create_logger("auth")


async def google_login(body: GoogleAuthRequest):
    """POST /api/auth/google — Verify Google ID token and login/register."""
    settings = get_settings()
    client_id = settings.GOOGLE_CLIENT_ID

    if not client_id:
        logger.error("GOOGLE_CLIENT_ID not set")
        raise HTTPException(500, "Google authentication is not configured.")

    # Verify the Google ID token
    try:
        payload = id_token.verify_oauth2_token(
            body.idToken,
            google_requests.Request(),
            client_id,
        )
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(401, "Invalid Google credential.")

    google_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("name")
    picture = payload.get("picture")

    if not email:
        raise HTTPException(400, "Google account does not have an email address.")

    # Find or create user
    user = await User.find_one(User.googleId == google_id)
    is_new_user = False

    if not user:
        # Check if a local account exists with same email → link
        user = await User.find_one(User.email == email.lower())

        if user:
            # Link Google to existing local account
            user.googleId = google_id
            if not user.avatar and picture:
                user.avatar = picture
            await user.save()
            logger.info(f"🔗 Google linked to existing account: {email}")
        else:
            # Create brand new Google-only account
            user = User(
                name=name or email.split("@")[0],
                email=email.lower(),
                authProvider="google",
                googleId=google_id,
                avatar=picture or "",
                isVerified=True,
            )
            await user.insert()
            is_new_user = True
            logger.info(f"👤 New Google user: {email} ({name})")
    else:
        # Returning Google user — update avatar if changed
        if picture and user.avatar != picture:
            user.avatar = picture
            await user.save()

    # Sign JWT
    token = sign_jwt(str(user.id), user.name)

    # Send welcome email for new users
    if is_new_user:
        asyncio.create_task(
            send_welcome_email(user.email, user.name)
        )

    return JSONResponse(
        status_code=201 if is_new_user else 200,
        content={
            "success": True,
            "message": "Account created with Google!" if is_new_user else "Logged in with Google!",
            "token": token,
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "avatar": user.avatar,
                "authProvider": user.authProvider,
                "hasPassword": user.has_password,
            },
        },
    )
