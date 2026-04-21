"""
Auth Controller — Signup, login, profile management, password reset.
"""

import asyncio

from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from passlib.hash import bcrypt
from jose import jwt, JWTError

from auth.models.user import User
from auth.middleware.auth_middleware import ensure_authenticated, sign_jwt, _get_jwt_secret
from auth.utils.email import send_welcome_email, send_password_reset_email
from shared.validators import (
    SignupRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest,
    UpdateProfileRequest, ChangePasswordRequest, DeleteAccountRequest,
)
from config import get_settings
from shared.logger import create_logger

logger = create_logger("auth")

router = APIRouter()


def _sign_token_and_respond(user: User, status_code: int, message: str):
    """Sign JWT and return token + sanitized user."""
    token = sign_jwt(str(user.id), user.name)
    user_dict = user.to_safe_dict()

    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "token": token,
            "user": user_dict,
        },
    )


# ── REGISTER ────────────────────────────────────────────
@router.post("/signup")
async def user_signup(body: SignupRequest):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(400, "An account with this email already exists.")

    hashed_password = bcrypt.hash(body.password)
    user = User(
        name=body.name,
        email=body.email,
        password=hashed_password,
        authProvider="local",
    )
    await user.insert()

    logger.info(f"👤 User registered: {user.email} ({user.name})")
    asyncio.create_task(
        send_welcome_email(user.email, user.name)
    )

    return _sign_token_and_respond(user, 201, "Account created successfully! Welcome to BrajYatra.")


# ── LOGIN ───────────────────────────────────────────────
@router.post("/login")
async def user_login(body: LoginRequest):
    user = await User.find_one(User.email == body.email)
    if not user:
        raise HTTPException(404, "Email not registered. Please sign up first.")

    if user.authProvider == "google" and not user.password:
        raise HTTPException(401, "This account uses Google sign-in. Please use the Google button.")

    if not user.password or not bcrypt.verify(body.password, user.password):
        raise HTTPException(401, "Invalid email or password.")

    return _sign_token_and_respond(user, 200, "Logged in successfully.")


# ── GET ME (protected) ──────────────────────────────────
@router.get("/me")
async def get_me(request: Request, _=Depends(ensure_authenticated)):
    return JSONResponse({"success": True, "user": request.state.user.to_safe_dict()})


# ── LOGOUT ──────────────────────────────────────────────
@router.post("/logout")
async def logout(request: Request, _=Depends(ensure_authenticated)):
    return JSONResponse({"success": True, "message": "Logged out successfully."})


# ── FORGOT PASSWORD ─────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    settings = get_settings()
    safe_response = {
        "success": True,
        "message": "If an account with that email exists, we've sent a password reset link.",
    }

    user = await User.find_one(User.email == body.email)
    if not user:
        return JSONResponse(safe_response)

    if user.authProvider == "google" and not user.password:
        return JSONResponse(safe_response)

    reset_secret = _get_jwt_secret() + (user.password or "")
    reset_token = jwt.encode(
        {"id": str(user.id), "purpose": "password-reset"},
        reset_secret,
        algorithm="HS256",
    )

    logger.info(f"🔑 Password reset requested for: {user.email}")
    asyncio.create_task(
        send_password_reset_email(user.email, user.name, reset_token)
    )

    response = dict(safe_response)
    if not settings.is_production:
        response["resetToken"] = reset_token

    return JSONResponse(response)


# ── RESET PASSWORD ──────────────────────────────────────
@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    try:
        decoded = jwt.decode(body.token, options={"verify_signature": False})
    except Exception:
        raise HTTPException(400, "Invalid or expired reset link.")

    if not decoded or not decoded.get("id") or decoded.get("purpose") != "password-reset":
        raise HTTPException(400, "Invalid or expired reset link.")

    user = await User.get(decoded["id"])
    if not user:
        raise HTTPException(400, "Invalid or expired reset link.")

    reset_secret = _get_jwt_secret() + (user.password or "")
    try:
        settings = get_settings()
        jwt.decode(
            body.token,
            reset_secret,
            algorithms=["HS256"],
        )
    except JWTError:
        raise HTTPException(400, "Invalid or expired reset link.")

    user.password = bcrypt.hash(body.password)
    await user.save()

    logger.info(f"✅ Password reset successful for: {user.email}")

    return JSONResponse({
        "success": True,
        "message": "Password reset successfully! You can now log in with your new password.",
    })


# ── UPDATE PROFILE (protected) ─────────────────────────
@router.put("/profile")
async def update_profile(request: Request, body: UpdateProfileRequest, _=Depends(ensure_authenticated)):
    user: User = request.state.user

    if body.name:
        user.name = body.name
    if body.avatar is not None:
        user.avatar = body.avatar

    await user.save()

    logger.info(f'✏️ Profile updated: {user.email} → name="{user.name}"')

    return JSONResponse({
        "success": True,
        "message": "Profile updated successfully.",
        "user": user.to_safe_dict(),
    })


# ── CHANGE PASSWORD (protected) ────────────────────────
@router.put("/change-password")
async def change_password(request: Request, body: ChangePasswordRequest, _=Depends(ensure_authenticated)):
    user: User = request.state.user

    if user.authProvider == "google" and not user.password:
        raise HTTPException(400, "Google accounts cannot change password. Use Google to manage your credentials.")

    if not user.password or not bcrypt.verify(body.currentPassword, user.password):
        raise HTTPException(401, "Current password is incorrect.")

    if body.currentPassword == body.newPassword:
        raise HTTPException(400, "New password must be different from the current one.")

    user.password = bcrypt.hash(body.newPassword)
    await user.save()

    logger.info(f"🔑 Password changed for: {user.email}")

    token = sign_jwt(str(user.id), user.name)

    return JSONResponse({
        "success": True,
        "message": "Password changed successfully.",
        "token": token,
    })


# ── DELETE ACCOUNT (protected) ─────────────────────────
@router.delete("/account")
async def delete_account(request: Request, body: DeleteAccountRequest, _=Depends(ensure_authenticated)):
    user: User = request.state.user

    if user.authProvider == "local" and user.password:
        if not bcrypt.verify(body.password, user.password):
            raise HTTPException(401, "Password is incorrect.")

    email = user.email
    user_id = str(user.id)

    await user.delete()

    # Purge agent data (best-effort)
    try:
        from agent.db import database as agent_db
        db_conn = agent_db.get_db()
        db_conn.execute("DELETE FROM saved_itineraries WHERE user_id = ?", (user_id,))
        db_conn.execute(
            "DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = ?)",
            (user_id,),
        )
        db_conn.execute("DELETE FROM chat_sessions WHERE user_id = ?", (user_id,))
        db_conn.commit()
        logger.info(f"🗑️ Agent data purged for user: {user_id}")
    except Exception as e:
        logger.warning(f"Agent data cleanup skipped: {e}")

    logger.info(f"❌ Account deleted: {email} ({user_id})")

    return JSONResponse({
        "success": True,
        "message": "Your account has been permanently deleted.",
    })
