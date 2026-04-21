"""
Diversity Enforcement — Ensures balanced place selection.
"""


def _norm_category(cat: str) -> str:
    return (cat or "Other").lower().strip()


def enforce_diversity(
    ranked_places: list[dict],
    options: dict = None,
) -> list[dict]:
    """Enforce diversity in place selection — balanced categories, cities, hidden gems."""
    options = options or {}
    max_per_category = options.get("maxPerCategory", 4)
    cities = options.get("cities", [])
    min_per_city = options.get("minPerCity", 4)
    total_needed = options.get("totalNeeded", 20)
    surface_hidden_gems = options.get("surfaceHiddenGems", True)

    category_counts: dict[str, int] = {}
    city_counts: dict[str, int] = {}
    selected: list[dict] = []
    selected_ids: set[str] = set()

    CITY_CATEGORY_MINIMUMS = {
        "agra": {"monument": 2},
    }

    FOOD_CATEGORIES = {"restaurant", "food stall", "food", "sweet shop", "cafe"}

    # Phase 1: Ensure minimum per city
    if cities:
        for city in cities:
            city_lower = city.lower()
            city_places = [
                p for p in ranked_places
                if (p.get("city") or "").lower() == city_lower and p.get("id") not in selected_ids
            ]

            minimums = CITY_CATEGORY_MINIMUMS.get(city_lower, {})
            minimum_counts: dict[str, int] = {}

            for place in city_places:
                cat = _norm_category(place.get("category"))
                if (
                    cat in minimums
                    and minimum_counts.get(cat, 0) < minimums[cat]
                    and place.get("id") not in selected_ids
                ):
                    if cat in FOOD_CATEGORIES:
                        continue
                    selected.append(place)
                    selected_ids.add(place["id"])
                    category_counts[cat] = category_counts.get(cat, 0) + 1
                    city_counts[city_lower] = city_counts.get(city_lower, 0) + 1
                    minimum_counts[cat] = minimum_counts.get(cat, 0) + 1

            added = sum(minimum_counts.values())
            for place in city_places:
                if added >= min_per_city:
                    break
                if place.get("id") in selected_ids:
                    continue
                cat = _norm_category(place.get("category"))
                if cat in FOOD_CATEGORIES:
                    continue

                selected.append(place)
                selected_ids.add(place["id"])
                category_counts[cat] = category_counts.get(cat, 0) + 1
                city_counts[city_lower] = city_counts.get(city_lower, 0) + 1
                added += 1

    # Phase 2: Fill remaining slots with diversity constraint
    for place in ranked_places:
        if len(selected) >= total_needed:
            break
        if place.get("id") in selected_ids:
            continue

        cat = _norm_category(place.get("category"))
        if category_counts.get(cat, 0) >= max_per_category:
            continue

        selected.append(place)
        selected_ids.add(place["id"])
        category_counts[cat] = category_counts.get(cat, 0) + 1
        city_lower = (place.get("city") or "").lower()
        city_counts[city_lower] = city_counts.get(city_lower, 0) + 1

    # Phase 3: Surface hidden gems
    if surface_hidden_gems and len(selected) < total_needed:
        hidden_gems = [
            p for p in ranked_places
            if p.get("id") not in selected_ids
            and (p.get("popularity_rank") or 999) > 15
            and not p.get("highlight")
        ]

        gem_slots = max(1, int(total_needed * 0.2))
        gems_added = 0
        for gem in hidden_gems:
            if gems_added >= gem_slots or len(selected) >= total_needed:
                break
            cat = _norm_category(gem.get("category"))
            if category_counts.get(cat, 0) < max_per_category + 1:
                selected.append(gem)
                selected_ids.add(gem["id"])
                category_counts[cat] = category_counts.get(cat, 0) + 1
                gems_added += 1

    return selected


def get_category_stats(places: list[dict]) -> dict[str, int]:
    stats: dict[str, int] = {}
    for p in places:
        cat = _norm_category(p.get("category"))
        stats[cat] = stats.get(cat, 0) + 1
    return stats


def get_city_stats(places: list[dict]) -> dict[str, int]:
    stats: dict[str, int] = {}
    for p in places:
        city = p.get("city") or "Unknown"
        stats[city] = stats.get(city, 0) + 1
    return stats
