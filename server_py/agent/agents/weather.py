"""
WeatherAgent — Weather information specialist.
"""

from agent.agents.core.agent_base import AgentBase
from agent.prompts.system_prompts import WEATHER_PROMPT


class WeatherAgent(AgentBase):
    """Agent specialized in weather data and travel advisories."""

    def __init__(self):
        super().__init__(
            name="WeatherAgent",
            system_prompt=WEATHER_PROMPT,
            tool_names=["fetch_weather"],
            max_iterations=3,
            memory_limit=5,
        )

    async def get_weather_data(self, city: str) -> dict:
        """Get raw weather data for inter-agent use (no LLM formatting)."""
        from agent.agents.core.tool_registry import execute_tool
        return await execute_tool("fetch_weather", {"city": city})
