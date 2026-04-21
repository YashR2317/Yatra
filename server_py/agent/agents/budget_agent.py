"""
BudgetAgent — Budget estimation specialist.
"""

from agent.agents.core.agent_base import AgentBase
from agent.prompts.system_prompts import BUDGET_AGENT_PROMPT


class BudgetAgent(AgentBase):
    """Agent specialized in budget estimation and cost advice."""

    def __init__(self):
        super().__init__(
            name="BudgetAgent",
            system_prompt=BUDGET_AGENT_PROMPT,
            tool_names=["estimate_budget", "get_places_by_city"],
            max_iterations=3,
            memory_limit=5,
        )
