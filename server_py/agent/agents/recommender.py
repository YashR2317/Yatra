"""
RecommenderAgent — Place recommendation specialist.
"""

import json
from typing import Optional

from agent.agents.core.agent_base import AgentBase
from agent.prompts.system_prompts import RECOMMENDER_PROMPT
from agent.db import database as db
from agent.utils.helpers import format_place_for_llm
from agent.agents.scoring import rank_places
from agent.agents.diversity import enforce_diversity
from agent.llm import connector as llm


class RecommenderAgent(AgentBase):
    """Agent specialized in personalized place recommendations."""

    def __init__(self):
        super().__init__(
            name="RecommenderAgent",
            system_prompt=RECOMMENDER_PROMPT,
            tool_names=[
                "search_places", "get_places_by_city", "get_places_by_interest",
                "get_highlights", "get_category_distribution", "get_ranked_places",
            ],
            max_iterations=4,
            memory_limit=5,
        )

    async def recommend(self, params: dict) -> dict:
        """Generate place recommendations.

        Args:
            params: { cities?, interests?, group_type?, budget_level?, query? }

        Returns:
            { type, text, recommendations?, source }
        """
        cities = params.get("cities", [])
        interests = params.get("interests", [])
        query = params.get("query", "")

        # Get places from DB
        if cities:
            places = db.get_places_by_multiple_cities(cities)
        else:
            places = db.get_all_places()

        # Rank and diversify
        intent = {
            "interests": interests,
            "group_type": params.get("group_type", "family"),
            "budget_level": params.get("budget_level", "medium"),
            "cities": cities,
        }
        ranked = rank_places(places, intent)
        diversified = enforce_diversity(ranked, {
            "cities": cities,
            "totalNeeded": 15,
            "minPerCity": 3,
            "maxPerCategory": 4,
        })

        slim_places = [format_place_for_llm(p) for p in diversified]

        # Build prompt
        prompt_addition = f"""
User query: {query or "Recommend places to visit"}
User interests: {', '.join(interests) if interests else 'General'}
Cities: {', '.join(cities) if cities else 'All Braj cities'}
Group type: {params.get('group_type', 'not specified')}
Budget: {params.get('budget_level', 'not specified')}

Available places (ranked by relevance):
{json.dumps(slim_places[:12], ensure_ascii=False)}
"""

        result = await llm.generate_json(
            self.system_prompt,
            prompt_addition,
        )

        if result.get("success") and result.get("data"):
            data = result["data"]
            return {
                "type": "recommendations",
                "text": data.get("summary", ""),
                "recommendations": data.get("recommendations", []),
                "source": self.name,
            }

        # Fallback: return from the ReAct loop
        run_result = await self.run(
            f"Recommend places based on these preferences: {json.dumps(params)}",
            params,
        )
        return {
            "type": "text",
            "text": run_result.get("text", ""),
            "source": self.name,
        }
