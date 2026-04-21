"""
ToolRegistry — Central registry for agent tools.
Maps tool names to implementations and provides function declarations
for LLM function calling.
"""

import json
import httpx
from typing import Any

from agent.db import database as db
from agent.agents.scoring import rank_places, INTEREST_CATEGORY_MAP
from agent.agents.diversity import enforce_diversity
from agent.agents.budget import estimate_budget
from agent.utils.helpers import format_place_for_llm, parse_tags
from agent.utils.geo import haversine, optimize_route, get_city_centroid
from config import get_settings


# ─── Tool Declarations (Gemini function calling format) ──────

TOOL_DECLARATIONS = {
    "search_places": {
        "name": "search_places",
        "description": "Search for places in the Braj region by keyword. Returns matching temples, ghats, monuments, etc.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search keyword (e.g. 'Krishna temple', 'best ghats', 'Mughal monument')."
                }
            },
            "required": ["query"],
        },
    },

    "get_places_by_city": {
        "name": "get_places_by_city",
        "description": "Get all places and attractions in a specific city (Mathura, Vrindavan, Agra, Govardhan, Barsana, or Gokul).",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City name. One of: Mathura, Vrindavan, Agra, Govardhan, Barsana, Gokul."
                }
            },
            "required": ["city"],
        },
    },

    "get_places_by_interest": {
        "name": "get_places_by_interest",
        "description": "Get places filtered by interest categories across one or more cities.",
        "parameters": {
            "type": "object",
            "properties": {
                "interests": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Interest categories (e.g. ['pilgrimage', 'heritage', 'nature'])."
                },
                "cities": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "City filter. Leave empty for all cities."
                }
            },
            "required": ["interests"],
        },
    },

    "fetch_weather": {
        "name": "fetch_weather",
        "description": "Get current weather conditions for a city in the Braj region.",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City name for weather data."
                }
            },
            "required": ["city"],
        },
    },

    "get_ranked_places": {
        "name": "get_ranked_places",
        "description": "Get places ranked by relevance to user preferences, weather conditions, and group type.",
        "parameters": {
            "type": "object",
            "properties": {
                "cities": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Cities to include."
                },
                "interests": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "User interests."
                },
                "group_type": {
                    "type": "string",
                    "description": "Group type: solo, couple, family, group, elderly."
                },
                "budget_level": {
                    "type": "string",
                    "description": "Budget: low, medium, high."
                }
            },
            "required": ["cities"],
        },
    },

    "estimate_budget": {
        "name": "estimate_budget",
        "description": "Estimate trip budget with city-specific pricing for food, transport, accommodation, and entry fees.",
        "parameters": {
            "type": "object",
            "properties": {
                "cities": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Cities to include."
                },
                "days": {
                    "type": "integer",
                    "description": "Number of days."
                },
                "budget_level": {
                    "type": "string",
                    "description": "Budget level: low, medium, high."
                },
                "people": {
                    "type": "integer",
                    "description": "Number of people."
                }
            },
            "required": ["cities", "days"],
        },
    },

    "optimize_route": {
        "name": "optimize_route",
        "description": "Optimize the visiting order of places to minimize travel distance.",
        "parameters": {
            "type": "object",
            "properties": {
                "place_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "IDs of places to optimize."
                }
            },
            "required": ["place_ids"],
        },
    },

    "get_nearby_places": {
        "name": "get_nearby_places",
        "description": "Find places near given coordinates.",
        "parameters": {
            "type": "object",
            "properties": {
                "lat": {"type": "number", "description": "Latitude."},
                "lng": {"type": "number", "description": "Longitude."},
                "radius_km": {"type": "number", "description": "Search radius in km (default 5)."}
            },
            "required": ["lat", "lng"],
        },
    },

    "delegate_to_agent": {
        "name": "delegate_to_agent",
        "description": "Delegate a task to a specialist agent (ItineraryAgent, RecommenderAgent, WeatherAgent, ChatAgent, BudgetAgent, SearchAgent).",
        "parameters": {
            "type": "object",
            "properties": {
                "agent": {
                    "type": "string",
                    "description": "Agent name: ItineraryAgent, RecommenderAgent, WeatherAgent, ChatAgent, BudgetAgent, or SearchAgent."
                },
                "task": {
                    "type": "string",
                    "description": "Task description for the agent."
                },
                "context": {
                    "type": "object",
                    "description": "Additional context (parameters, previous results)."
                }
            },
            "required": ["agent", "task"],
        },
    },

    "get_category_distribution": {
        "name": "get_category_distribution",
        "description": "Get the distribution of place categories (how many temples, monuments, ghats, etc.) for a city.",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City name (optional, omit for all cities)."
                }
            },
        },
    },

    "get_highlights": {
        "name": "get_highlights",
        "description": "Get the must-visit highlighted places for a city or all cities.",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "City name (optional)."
                }
            },
        },
    },

    "get_cities": {
        "name": "get_cities",
        "description": "Get the list of all available cities in the Braj region.",
        "parameters": {
            "type": "object",
            "properties": {},
        },
    },
}

# Agent → Tools mapping
AGENT_TOOLS = {
    "SupervisorAgent": ["delegate_to_agent"],
    "ItineraryAgent": [
        "get_places_by_city", "get_places_by_interest", "fetch_weather",
        "get_ranked_places", "estimate_budget", "optimize_route",
        "get_highlights", "get_category_distribution",
    ],
    "RecommenderAgent": [
        "search_places", "get_places_by_city", "get_places_by_interest",
        "get_highlights", "get_category_distribution", "get_ranked_places",
    ],
    "WeatherAgent": ["fetch_weather"],
    "ChatAgent": ["search_places", "get_places_by_city", "get_highlights", "get_cities"],
    "BudgetAgent": ["estimate_budget", "get_places_by_city"],
    "SearchAgent": [],  # Uses Google Search grounding, no function tools
}


def get_declarations(agent_name: str) -> list[dict]:
    """Get the tool declarations for a specific agent."""
    tool_names = AGENT_TOOLS.get(agent_name, [])
    return [TOOL_DECLARATIONS[name] for name in tool_names if name in TOOL_DECLARATIONS]


async def execute_tool(tool_name: str, args: dict = None) -> Any:
    """Execute a tool by name with given arguments."""
    args = args or {}

    if tool_name == "search_places":
        return _tool_search_places(args)
    elif tool_name == "get_places_by_city":
        return _tool_get_places_by_city(args)
    elif tool_name == "get_places_by_interest":
        return _tool_get_places_by_interest(args)
    elif tool_name == "fetch_weather":
        return await _tool_fetch_weather(args)
    elif tool_name == "get_ranked_places":
        return _tool_get_ranked_places(args)
    elif tool_name == "estimate_budget":
        return _tool_estimate_budget(args)
    elif tool_name == "optimize_route":
        return _tool_optimize_route(args)
    elif tool_name == "get_nearby_places":
        return _tool_get_nearby_places(args)
    elif tool_name == "get_category_distribution":
        return _tool_get_category_distribution(args)
    elif tool_name == "get_highlights":
        return _tool_get_highlights(args)
    elif tool_name == "get_cities":
        return _tool_get_cities(args)
    else:
        return {"error": f"Unknown tool: {tool_name}"}


# ─── Tool Implementations ───────────────────────────────────

def _tool_search_places(args: dict) -> list[dict]:
    query = args.get("query", "")
    places = db.search_places(query)
    return [format_place_for_llm(p) for p in places[:15]]


def _tool_get_places_by_city(args: dict) -> list[dict]:
    city = args.get("city", "")
    places = db.get_places_by_city(city)
    return [format_place_for_llm(p) for p in places]


def _tool_get_places_by_interest(args: dict) -> list[dict]:
    interests = args.get("interests", [])
    cities = args.get("cities", [])

    if cities:
        places = db.get_places_by_multiple_cities(cities)
    else:
        places = db.get_all_places()

    # Filter by matching interests
    matched_tags = set()
    for interest in interests:
        cats = INTEREST_CATEGORY_MAP.get(interest.lower(), [])
        for c in cats:
            matched_tags.add(c.lower())

    filtered = []
    for p in places:
        cat = (p.get("category") or "").lower()
        tags = [t.lower() for t in parse_tags(p.get("tags", "[]"))]

        if cat in matched_tags or any(t in matched_tags for t in tags):
            filtered.append(p)

    return [format_place_for_llm(p) for p in filtered[:20]]


async def _tool_fetch_weather(args: dict) -> dict:
    city = args.get("city", "Mathura")
    settings = get_settings()
    api_key = settings.OPENWEATHER_API_KEY

    if not api_key:
        return {"error": "Weather service unavailable", "city": city}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={"q": f"{city},IN", "appid": api_key, "units": "metric"},
            )

        if resp.status_code != 200:
            return {"error": f"Weather API returned {resp.status_code}", "city": city}

        data = resp.json()
        weather = data.get("weather", [{}])[0]
        main = data.get("main", {})
        wind = data.get("wind", {})

        return {
            "city": city,
            "temp": main.get("temp"),
            "feels_like": main.get("feels_like"),
            "temp_min": main.get("temp_min"),
            "temp_max": main.get("temp_max"),
            "humidity": main.get("humidity"),
            "description": weather.get("description", ""),
            "main": weather.get("main", ""),
            "wind_speed": wind.get("speed"),
            "wind_deg": wind.get("deg"),
            "is_rainy": weather.get("main", "").lower() in ("rain", "drizzle", "thunderstorm"),
        }

    except Exception as e:
        return {"error": str(e), "city": city}


def _tool_get_ranked_places(args: dict) -> list[dict]:
    cities = args.get("cities", [])
    interests = args.get("interests", [])
    group_type = args.get("group_type", "family")
    budget_level = args.get("budget_level", "medium")

    if cities:
        places = db.get_places_by_multiple_cities(cities)
    else:
        places = db.get_all_places()

    intent = {
        "interests": interests,
        "group_type": group_type,
        "budget_level": budget_level,
        "cities": cities,
    }

    ranked = rank_places(places, intent)
    diversified = enforce_diversity(ranked, {
        "cities": cities,
        "totalNeeded": 20,
        "minPerCity": 4,
        "maxPerCategory": 4,
    })

    return [format_place_for_llm(p) for p in diversified]


def _tool_estimate_budget(args: dict) -> dict:
    cities = args.get("cities", [])
    days = args.get("days", 1)
    budget_level = args.get("budget_level", "medium")
    people = args.get("people", 2)

    # Get places for entry fee calculation
    places = db.get_places_by_multiple_cities(cities) if cities else []

    return estimate_budget(
        places=places,
        days=days,
        budget_level=budget_level,
        people=people,
        cities=cities,
    )


def _tool_optimize_route(args: dict) -> list[dict]:
    place_ids = args.get("place_ids", [])
    if not place_ids:
        return []

    places = [db.get_place_by_id(pid) for pid in place_ids]
    places = [p for p in places if p and p.get("lat") and p.get("lng")]

    if not places:
        return []

    first = places[0]
    optimized = optimize_route(places, first.get("lat", 0), first.get("lng", 0))
    return [format_place_for_llm(p) for p in optimized]


def _tool_get_nearby_places(args: dict) -> list[dict]:
    lat = args.get("lat", 0)
    lng = args.get("lng", 0)
    radius_km = args.get("radius_km", 5)

    places = db.get_nearby_places(lat, lng, radius_km)
    return [format_place_for_llm(p) for p in places[:10]]


def _tool_get_category_distribution(args: dict) -> list[dict]:
    city = args.get("city")
    return db.get_category_distribution(city)


def _tool_get_highlights(args: dict) -> list[dict]:
    city = args.get("city")
    places = db.get_highlights(city)
    return [format_place_for_llm(p) for p in places]


def _tool_get_cities(args: dict) -> list[str]:
    return db.get_cities()
