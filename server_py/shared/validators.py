"""
Input Validation Schemas — Pydantic models for all API endpoints.
Centralizes validation logic and provides clear error messages.
"""

import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator


# ─── Auth Schemas ────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not re.match(r"^[a-zA-Z\s\u0900-\u097F]+$", v):
            raise ValueError("Name can only contain letters and spaces")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        v = v.lower().strip()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Please provide a valid email address")
        return v


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        return v.lower().strip()


# ─── Agent Chat Schema ───────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    sessionId: Optional[str] = None
    language: str = Field(default="en", pattern="^(en|hi)$")
    weather_preference: Optional[str] = None

    @field_validator("message")
    @classmethod
    def strip_message(cls, v):
        return v.strip()

    model_config = {"extra": "allow"}


# ─── Agent Itinerary Schema ──────────────────────────────────

class ItineraryRequest(BaseModel):
    cities: list[str] = Field(default_factory=list, min_length=0, max_length=6)
    days: int = Field(default=1, ge=1, le=14)
    interests: list[str] = Field(default_factory=list, max_length=10)
    pace: str = Field(default="moderate", pattern="^(relaxed|moderate|intensive)$")
    group_type: Optional[str] = Field(default=None, max_length=50)
    budget_level: Optional[str] = Field(default=None, pattern="^(budget|medium|luxury)$")


# ─── Password Reset Schemas ─────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        return v.lower().strip()


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6, max_length=128)


# ─── Profile & Account Management Schemas ────────────────────

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    avatar: Optional[str] = Field(default=None, max_length=500)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if v is not None and not re.match(r"^[a-zA-Z\s\u0900-\u097F]+$", v):
            raise ValueError("Name can only contain letters and spaces")
        return v

    @model_validator(mode="after")
    def at_least_one_field(self):
        if self.name is None and self.avatar is None:
            raise ValueError("At least one field (name or avatar) must be provided")
        return self


class ChangePasswordRequest(BaseModel):
    currentPassword: str = Field(..., min_length=1, max_length=128)
    newPassword: str = Field(..., min_length=6, max_length=128)


class DeleteAccountRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=128)


# ─── Google Auth Schema ──────────────────────────────────────

class GoogleAuthRequest(BaseModel):
    idToken: str = Field(..., min_length=1)
