"""
Place Scoring Algorithm — Scores and ranks places by user preferences.
"""

from agent.utils.helpers import parse_tags

INTEREST_CATEGORY_MAP = {
    "pilgrimage": ["Temple", "Shrine", "Sacred Site", "Religious Site", "Ashram"],
    "heritage": ["Heritage", "Monument", "Museum", "Fort", "Palace", "Historical"],
    "nature": ["Park", "Garden", "Lake", "Ghat", "Hill", "Nature"],
    "food": ["Restaurant", "Food Stall", "Sweet Shop", "Cafe", "Prasad"],
    "market": ["Market", "Bazaar", "Shopping"],
    "ghat": ["Ghat", "River Bank"],
    "aarti": ["Temple", "Ghat", "Sacred Site"],
    "festival": ["Temple", "Cultural Site", "Heritage"],
}


def score_place(place: dict, intent: dict, weather: dict = None) -> int:
    """Score a single place based on user preferences and conditions."""
    score = 0
    interests = intent.get("interests") or []
    group_type = intent.get("group_type") or "family"
    budget_level = intent.get("budget_level") or "medium"

    tags = [t.lower() for t in parse_tags(place.get("tags", "[]"))]
    category = (place.get("category") or "").lower()

    # Interest matching
    for interest in interests:
        match_cats = [c.lower() for c in INTEREST_CATEGORY_MAP.get(interest.lower(), [])]
        if category in match_cats:
            score += 10
        if any(mc in t for t in tags for mc in match_cats):
            score += 5
        if interest.lower() in tags:
            score += 8

    # Agra monument boost
    city_lower = (place.get("city") or "").lower()
    if city_lower == "agra":
        if any(t in category for t in ["monument", "heritage", "fort", "palace"]):
            score += 8
        if any(t in category for t in ["garden", "park"]):
            score += 3

    # Popularity boost
    rank = place.get("popularity_rank") or 999
    if rank <= 3:
        score += 15
    elif rank <= 10:
        score += 10
    elif rank <= 25:
        score += 5
    else:
        score += 2

    # Highlight boost
    if place.get("highlight"):
        score += 8

    # Crowd penalty
    crowd = (place.get("crowd_level") or "medium").lower()
    if crowd == "high":
        score -= 3
    if crowd in ("very_high", "very high"):
        score -= 6

    # Group type adjustments
    if group_type in ("family", "elderly"):
        duration = place.get("estimated_visit_duration") or 45
        if duration <= 60:
            score += 3
        if duration > 120:
            score -= 4
        if "museum" in category or "temple" in category:
            score += 2

    if group_type in ("solo", "couple"):
        if any(k in tags for k in ("nature", "walk", "parikrama")):
            score += 3

    # Budget adjustments
    entry_fee = float(place.get("entry_fee") or 0)
    if budget_level == "low" and entry_fee > 200:
        score -= 5
    if budget_level == "low" and entry_fee == 0:
        score += 3
    if budget_level == "high" and entry_fee > 0:
        score += 1

    # Weather adjustments
    if weather:
        desc = (weather.get("description") or "").lower()
        temp = weather.get("temp") or 25
        is_outdoor = any(
            t in category or t in tags
            for t in ["ghat", "park", "garden", "hill", "nature", "lake", "market", "bazaar"]
        )

        if is_outdoor:
            if any(w in desc for w in ("rain", "thunder", "storm")):
                score -= 10
            if temp > 38:
                score -= 6
            if temp > 42:
                score -= 10
            if any(w in desc for w in ("fog", "haze")):
                score -= 3
        else:
            if "rain" in desc or temp > 38:
                score += 5

    # Hidden gem bonus
    if rank > 15 and not place.get("highlight"):
        score += 2

    return max(0, score)


def rank_places(places: list[dict], intent: dict, weather: dict = None) -> list[dict]:
    """Score and sort places by relevance."""
    scored = [{**p, "score": score_place(p, intent, weather)} for p in places]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored
