"""
MongoDB Connection — Async connection via motor + beanie.
"""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from config import get_settings
from shared.logger import create_logger

logger = create_logger("auth")

_client = None


async def connect_db():
    """Connect to MongoDB and initialize Beanie ODM."""
    global _client
    settings = get_settings()

    if not settings.MONGO_URI:
        logger.warning("MONGO_URI not set — auth service will not function")
        return

    try:
        _client = AsyncIOMotorClient(settings.MONGO_URI)
        # Trigger a quick check
        await _client.admin.command("ping")

        from auth.models.user import User
        await init_beanie(
            database=_client.get_default_database(),
            document_models=[User],
        )

        logger.info("Database is connected")
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise


async def close_db():
    """Close the MongoDB connection."""
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("Database connection closed")
