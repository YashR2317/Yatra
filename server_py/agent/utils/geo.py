"""
Geo utilities — Haversine distance, route optimization, city centroids.
"""

import math
from typing import Optional


def _to_rad(deg: float) -> float:
    return deg * math.pi / 180


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the great-circle distance (km) between two coordinates."""
    R = 6371  # Earth radius in km
    d_lat = _to_rad(lat2 - lat1)
    d_lng = _to_rad(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(_to_rad(lat1)) * math.cos(_to_rad(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


CITY_CENTROIDS = {
    "mathura": {"lat": 27.4924, "lng": 77.6737},
    "vrindavan": {"lat": 27.5744, "lng": 77.6997},
    "agra": {"lat": 27.1751, "lng": 78.0421},
    "govardhan": {"lat": 27.4966, "lng": 77.462},
    "barsana": {"lat": 27.6495, "lng": 77.3763},
    "gokul": {"lat": 27.4394, "lng": 77.7195},
}


def get_city_centroid(city: str) -> Optional[dict]:
    """Get the geographic center coordinates of a city."""
    return CITY_CENTROIDS.get(city.lower())


def optimize_route(places: list[dict], start_lat: float, start_lng: float) -> list[dict]:
    """Optimize visiting order using nearest-neighbor algorithm."""
    if len(places) <= 1:
        return places

    remaining = list(places)
    ordered = []
    current_lat = start_lat if start_lat else remaining[0].get("lat", 0)
    current_lng = start_lng if start_lng else remaining[0].get("lng", 0)

    while remaining:
        nearest_idx = 0
        nearest_dist = float("inf")

        for i, place in enumerate(remaining):
            d = haversine(
                current_lat, current_lng,
                place.get("lat", 0), place.get("lng", 0),
            )
            if d < nearest_dist:
                nearest_dist = d
                nearest_idx = i

        next_place = remaining.pop(nearest_idx)
        ordered.append(next_place)
        current_lat = next_place.get("lat", current_lat)
        current_lng = next_place.get("lng", current_lng)

    return ordered


def estimate_travel_time(lat1: float, lng1: float, lat2: float, lng2: float) -> int:
    """Estimate travel time in minutes (avg 25 km/h)."""
    dist = haversine(lat1, lng1, lat2, lng2)
    hours = dist / 25
    return round(hours * 60)
