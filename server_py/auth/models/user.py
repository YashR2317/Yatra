"""
User Model — Beanie Document for MongoDB.
"""

from typing import Optional
from datetime import datetime
from beanie import Document
from pydantic import Field


class User(Document):
    """User document model."""

    name: str
    email: str
    password: Optional[str] = None
    authProvider: str = Field(default="local")  # "local" | "google"
    googleId: Optional[str] = None
    avatar: str = ""
    isVerified: bool = False
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    @property
    def initials(self) -> str:
        """Get user initials for avatar fallback."""
        if self.name:
            return "".join(n[0] for n in self.name.split() if n)[:2].upper()
        return "?"

    @property
    def has_password(self) -> bool:
        return bool(self.password)

    def to_safe_dict(self) -> dict:
        """Return user dict without password."""
        d = self.model_dump()
        d.pop("password", None)
        d["id"] = str(self.id)
        d["_id"] = str(self.id)
        d["hasPassword"] = self.has_password
        d["initials"] = self.initials
        return d

    class Settings:
        name = "users"
        indexes = [
            "email",
        ]
