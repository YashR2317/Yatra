"""
Agent Subsystem — Module exports and initialization.
"""

from shared.logger import create_logger
from agent.db.database import get_places_count
from agent.db.seed import seed
from agent.routes.api import router as api_routes

logger = create_logger("agent")


def init_agent():
    """Initialize the agent subsystem (seed DB if needed).
    Called by the unified server at startup.
    """
    count = get_places_count()
    if count == 0:
        logger.info("Seeding database...")
        seed()
    else:
        logger.info(f"Database has {count} places")
