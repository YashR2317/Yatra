"""
ChatAgent — General conversational assistant.
"""

from agent.agents.core.agent_base import AgentBase
from agent.prompts.system_prompts import CHAT_PROMPT


class ChatAgent(AgentBase):
    """Agent for general Q&A about Braj region — history, culture, festivals, food."""

    def __init__(self):
        super().__init__(
            name="ChatAgent",
            system_prompt=CHAT_PROMPT,
            tool_names=["search_places", "get_places_by_city", "get_highlights", "get_cities"],
            max_iterations=3,
            memory_limit=10,
        )
