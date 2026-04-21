"""
Budget Calculator — Accurate, city-specific cost estimates.
"""

CITY_FOOD_COSTS = {
    "Mathura":   {"low": 60,  "medium": 150, "high": 400},
    "Vrindavan": {"low": 50,  "medium": 130, "high": 350},
    "Agra":      {"low": 80,  "medium": 250, "high": 600},
    "Govardhan": {"low": 50,  "medium": 120, "high": 300},
    "Barsana":   {"low": 40,  "medium": 100, "high": 250},
    "Gokul":     {"low": 40,  "medium": 100, "high": 250},
    "default":   {"low": 60,  "medium": 180, "high": 450},
}

CITY_TRANSPORT_COSTS = {
    "Mathura":   {"low": 150,  "medium": 400,  "high": 1200},
    "Vrindavan": {"low": 100,  "medium": 300,  "high": 1000},
    "Agra":      {"low": 200,  "medium": 600,  "high": 2000},
    "Govardhan": {"low": 100,  "medium": 250,  "high": 800},
    "Barsana":   {"low": 80,   "medium": 200,  "high": 700},
    "Gokul":     {"low": 80,   "medium": 200,  "high": 700},
    "default":   {"low": 150,  "medium": 400,  "high": 1200},
}

CITY_ACCOMMODATION_COSTS = {
    "Mathura":   {"low": 400,  "medium": 1200, "high": 3500},
    "Vrindavan": {"low": 300,  "medium": 1000, "high": 3000},
    "Agra":      {"low": 600,  "medium": 2000, "high": 6000},
    "Govardhan": {"low": 300,  "medium": 800,  "high": 2500},
    "Barsana":   {"low": 200,  "medium": 600,  "high": 2000},
    "Gokul":     {"low": 200,  "medium": 600,  "high": 2000},
    "default":   {"low": 400,  "medium": 1200, "high": 3500},
}

MISC_COSTS = {
    "low": 100,
    "medium": 250,
    "high": 500,
}

MEALS_PER_DAY = 3


def estimate_budget(
    places: list[dict] = None,
    days: int = 1,
    budget_level: str = "medium",
    people: int = 2,
    cities: list[str] = None,
) -> dict:
    """Calculate budget using city-specific pricing and real entry fees."""
    places = places or []
    cities = cities or []
    level = budget_level.lower()

    # Entry Fees
    entry_fees = sum(float(p.get("entry_fee") or 0) * people for p in places)

    # Food
    unique_cities = cities if cities else list({p.get("city") for p in places if p.get("city")})
    days_per_city = max(1, -(-days // len(unique_cities))) if unique_cities else days  # ceil division

    total_food = 0
    if unique_cities:
        for city in unique_cities:
            city_food = CITY_FOOD_COSTS.get(city, CITY_FOOD_COSTS["default"])
            per_meal = city_food.get(level, city_food["medium"])
            total_food += per_meal * MEALS_PER_DAY * days_per_city * people
    else:
        default_food = CITY_FOOD_COSTS["default"].get(level, CITY_FOOD_COSTS["default"]["medium"])
        total_food = default_food * MEALS_PER_DAY * days * people

    # Transport
    total_transport = 0
    if unique_cities:
        for city in unique_cities:
            city_transport = CITY_TRANSPORT_COSTS.get(city, CITY_TRANSPORT_COSTS["default"])
            per_day = city_transport.get(level, city_transport["medium"])
            total_transport += per_day * days_per_city
    else:
        default_transport = CITY_TRANSPORT_COSTS["default"].get(level, CITY_TRANSPORT_COSTS["default"]["medium"])
        total_transport = default_transport * days

    # Accommodation
    nights = max(0, days - 1)
    total_accommodation = 0
    if nights > 0 and unique_cities:
        nights_per_city = max(1, -(-nights // len(unique_cities)))
        for city in unique_cities:
            city_accom = CITY_ACCOMMODATION_COSTS.get(city, CITY_ACCOMMODATION_COSTS["default"])
            per_night = city_accom.get(level, city_accom["medium"])
            total_accommodation += per_night * nights_per_city
    elif nights > 0:
        default_accom = CITY_ACCOMMODATION_COSTS["default"].get(level, CITY_ACCOMMODATION_COSTS["default"]["medium"])
        total_accommodation = default_accom * nights

    # Miscellaneous
    misc_per_day = MISC_COSTS.get(level, MISC_COSTS["medium"])
    total_misc = misc_per_day * days * people

    # Total
    total = entry_fees + total_food + total_transport + total_accommodation + total_misc

    return {
        "entry_fees": round(entry_fees),
        "food": round(total_food),
        "transport": round(total_transport),
        "accommodation": round(total_accommodation),
        "miscellaneous": round(total_misc),
        "total": round(total),
        "per_person": round(total / people) if people > 0 else 0,
        "currency": "INR",
        "budget_level": level,
        "days": days,
        "people": people,
        "cities": unique_cities,
        "breakdown_note": _get_budget_note(level, unique_cities),
    }


def _get_budget_note(level: str, cities: list[str] = None) -> str:
    city_str = " & ".join(cities) if cities else "Braj region"
    if level == "low":
        return f"Budget option for {city_str}: Dharamshala stays, e-rickshaws, temple prasadam & street food (pede, kachori, chaat). Includes donations & water."
    elif level == "high":
        return f"Premium option for {city_str}: AC hotel rooms, private cab with driver, restaurant dining. Includes shopping & souvenirs."
    else:
        return f"Moderate option for {city_str}: Mid-range hotels, auto-rickshaws, mix of restaurants & street food. Includes donations, snacks & water."
