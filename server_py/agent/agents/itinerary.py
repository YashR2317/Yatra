"""
ItineraryAgent — Travel itinerary planning specialist.
The most complex agent — orchestrates a multi-step pipeline:
1. Fetch places from DB
2. Get weather data
3. Score & rank places
4. Enforce diversity
5. Optimize route
6. Generate itinerary via LLM
7. Post-process (budget, links, validation)
"""

import json
from typing import Optional

from agent.agents.core.agent_base import AgentBase
from agent.agents.core.tool_registry import execute_tool
from agent.prompts.system_prompts import ITINERARY_PROMPT, get_language_instruction
from agent.db import database as db
from agent.utils.helpers import format_place_for_llm
from agent.utils.geo import optimize_route, get_city_centroid
from agent.agents.scoring import rank_places
from agent.agents.diversity import enforce_diversity
from agent.agents.budget import estimate_budget
from agent.llm import connector as llm


class ItineraryAgent(AgentBase):
    """Agent for generating detailed day-by-day travel itineraries."""

    def __init__(self):
        super().__init__(
            name="ItineraryAgent",
            system_prompt=ITINERARY_PROMPT,
            tool_names=[
                "get_places_by_city", "get_places_by_interest", "fetch_weather",
                "get_ranked_places", "estimate_budget", "optimize_route",
                "get_highlights", "get_category_distribution",
            ],
            max_iterations=5,
            memory_limit=5,
        )

    async def plan(self, params: dict) -> dict:
        """Generate a complete itinerary using the multi-step pipeline.

        Args:
            params: { cities, days, interests, pace, group_type, budget_level, language? }

        Returns:
            { type, itinerary, budget?, source }
        """
        cities = params.get("cities", [])
        days = params.get("days", 1)
        interests = params.get("interests", [])
        pace = params.get("pace", "moderate")
        group_type = params.get("group_type", "family")
        budget_level = params.get("budget_level", "medium")
        language = params.get("language", "en")

        # If no cities specified, use defaults
        if not cities:
            cities = ["Mathura", "Vrindavan"]

        print(f"[{self.name}] Planning {days}-day itinerary for {cities}")

        # ── Step 1: Fetch places ────────────────────────────────
        all_places = db.get_places_by_multiple_cities(cities)
        if not all_places:
            return {
                "type": "text",
                "text": f"I couldn't find any places in {', '.join(cities)}. Please check the city names.",
                "source": self.name,
            }

        # ── Step 2: Fetch weather ───────────────────────────────
        primary_city = cities[0]
        weather = await execute_tool("fetch_weather", {"city": primary_city})

        # ── Step 3: Score & rank ────────────────────────────────
        intent = {
            "interests": interests,
            "group_type": group_type,
            "budget_level": budget_level,
            "cities": cities,
        }
        ranked = rank_places(all_places, intent, weather)

        # ── Step 4: Enforce diversity ───────────────────────────
        places_per_day = 6 if pace == "intensive" else 5 if pace == "moderate" else 4
        total_needed = days * places_per_day

        diversified = enforce_diversity(ranked, {
            "cities": cities,
            "totalNeeded": total_needed,
            "minPerCity": max(4, total_needed // len(cities)) if cities else 4,
            "maxPerCategory": 4,
        })

        # ── Step 5: Optimize route per city ─────────────────────
        places_by_city = {}
        for p in diversified:
            city = p.get("city", "Unknown")
            places_by_city.setdefault(city, []).append(p)

        optimized_places = []
        for city in cities:
            city_places = places_by_city.get(city, [])
            if city_places:
                centroid = get_city_centroid(city)
                start_lat = centroid["lat"] if centroid else city_places[0].get("lat", 0)
                start_lng = centroid["lng"] if centroid else city_places[0].get("lng", 0)
                optimized = optimize_route(city_places, start_lat, start_lng)
                optimized_places.extend(optimized)

        # ── Step 6: Generate itinerary via LLM ──────────────────
        slim_places = [format_place_for_llm(p) for p in optimized_places]

        weather_summary = ""
        if weather and not weather.get("error"):
            weather_summary = (
                f"Current weather in {primary_city}: {weather.get('description', 'N/A')}, "
                f"Temp: {weather.get('temp', 'N/A')}°C, "
                f"Feels like: {weather.get('feels_like', 'N/A')}°C, "
                f"Humidity: {weather.get('humidity', 'N/A')}%, "
                f"Rainy: {'Yes' if weather.get('is_rainy') else 'No'}"
            )

        lang_instruction = get_language_instruction(language)

        prompt = f"""{self.system_prompt}{lang_instruction}

User request: Plan a {days}-day itinerary covering {', '.join(cities)}.
Interests: {', '.join(interests) if interests else 'General'}
Pace: {pace}
Group type: {group_type}
Budget: {budget_level}

{weather_summary}

Available places (pre-ranked and optimized):
{json.dumps(slim_places, ensure_ascii=False)}

IMPORTANT: Use ONLY the place_id values from the provided places list. Do NOT invent place IDs.
"""

        result = await llm.generate_json(prompt, f"Generate a {days}-day itinerary for {', '.join(cities)}")

        if result.get("success") and result.get("data"):
            itinerary = result["data"]

            # ── Step 7: Post-process ────────────────────────────
            itinerary = self._post_process(itinerary, all_places, cities, days)

            # ── Step 8: Budget estimation ───────────────────────
            budget = estimate_budget(
                places=all_places,
                days=days,
                budget_level=budget_level,
                people=2,
                cities=cities,
            )

            return {
                "type": "itinerary",
                "itinerary": itinerary,
                "budget": budget,
                "weather": weather if not weather.get("error") else None,
                "source": self.name,
            }

        # Fallback: try using ReAct loop
        print(f"[{self.name}] JSON generation failed, falling back to ReAct loop")
        run_result = await self.run(
            f"Plan a {days}-day itinerary for {', '.join(cities)} with interests: {', '.join(interests)}",
            params,
        )
        return {
            "type": "text",
            "text": run_result.get("text", ""),
            "source": self.name,
        }

    def _post_process(self, itinerary: dict, all_places: list, cities: list, days: int) -> dict:
        """Post-process the LLM-generated itinerary."""
        # Build a lookup map
        place_map = {p["id"]: p for p in all_places}

        # Enrich each slot with links and validated data
        for day in itinerary.get("days", []):
            for slot in day.get("slots", []):
                place_id = slot.get("place_id")
                if place_id and place_id in place_map:
                    db_place = place_map[place_id]
                    # Add Google Maps link
                    if db_place.get("google_maps_link"):
                        slot["google_maps_link"] = db_place["google_maps_link"]
                    elif db_place.get("lat") and db_place.get("lng"):
                        slot["google_maps_link"] = (
                            f"https://www.google.com/maps?q={db_place['lat']},{db_place['lng']}"
                        )
                    # Add image
                    from agent.utils.place_images import get_place_image
                    slot["image"] = get_place_image(db_place)

        return itinerary
