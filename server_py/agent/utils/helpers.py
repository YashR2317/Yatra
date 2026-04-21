"""
Helper utilities — Place formatting, sanitization, filtering.
"""

import json
import re
import uuid
from typing import Optional


def parse_tags(tags_str: str) -> list[str]:
    """Parse a JSON tags string into a list."""
    if not tags_str:
        return []
    try:
        return json.loads(tags_str)
    except (json.JSONDecodeError, TypeError):
        return []


def format_place_for_llm(place: dict) -> dict:
    """Slim format — reduces token count by ~40% per place."""
    return {
        "id": place.get("id"),
        "name": place.get("name"),
        "city": place.get("city"),
        "category": place.get("category"),
        "description": (place.get("description") or "")[:120],
        "hours": place.get("opening_hours") or "",
        "duration": place.get("estimated_visit_duration") or 60,
        "crowd": place.get("crowd_level") or "medium",
        "highlight": bool(place.get("highlight")),
        "best_time": place.get("best_time_to_visit") or "",
        "entry_fee": float(place.get("entry_fee") or 0),
    }


def filter_by_interests(places: list[dict], interests: list[str] = None) -> list[dict]:
    """Filter places matching given interests."""
    if not interests:
        return places
    interest_set = {i.lower() for i in interests}
    result = []
    for p in places:
        tags = parse_tags(p.get("tags", "[]"))
        if any(t.lower() in interest_set for t in tags):
            result.append(p)
        elif p.get("category", "").lower() in interest_set:
            result.append(p)
    return result


def sanitize_input(text: str) -> str:
    """Strip HTML tags and limit length."""
    if not text:
        return ""
    cleaned = re.sub(r"<[^>]*>", "", text).strip()
    return cleaned[:2000]


def generate_id() -> str:
    """Generate a UUID v4 string."""
    return str(uuid.uuid4())


def filter_by_accessibility(places: list[dict], group_type: str = "family") -> list[dict]:
    """Filter places based on group accessibility."""
    if not group_type or group_type in ("solo", "couple"):
        return places

    result = []
    for p in places:
        duration = p.get("estimated_visit_duration") or 45
        cat = (p.get("category") or "").lower()

        if group_type == "elderly":
            if duration > 150:
                continue
            if "trek" in cat or "hike" in cat:
                continue

        if group_type == "family":
            if duration > 180:
                continue

        result.append(p)

    return result


def filter_by_budget(places: list[dict], budget_level: str = "medium") -> list[dict]:
    """Filter places by budget level."""
    if not budget_level or budget_level == "high":
        return places

    max_fee = 100 if budget_level == "low" else 500
    return [p for p in places if float(p.get("entry_fee") or 0) <= max_fee]
