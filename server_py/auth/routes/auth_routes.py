"""
Auth Routes — FastAPI router for /api/auth/*.
Imports the controller router and adds the Google auth endpoint.
"""

from fastapi import APIRouter

from auth.controllers.auth_controller import router as auth_controller_router
from auth.controllers.google_auth import google_login
from shared.validators import GoogleAuthRequest

router = APIRouter()

# Include all auth controller routes
router.include_router(auth_controller_router)

# Google OAuth endpoint
router.post("/google")(google_login)
