"""
Place Image Mappings — Static image URLs for places, categories, and cities.
"""

PLACE_IMAGES = {
    "mathura_001": "/assets/images/krishna_janmabhoomi.png",
    "mathura_002": "/assets/images/krishna_janmabhoomi.png",
    "mathura_003": "/assets/images/vishram_ghat.png",
    "vrindavan_001": "/assets/images/banke_bihari.png",
    "vrindavan_002": "/assets/images/prem_mandir.png",
    "vrindavan_003": "/assets/images/banke_bihari.png",
    "agra_001": "/assets/images/taj_mahal.png",
    "agra_002": "/assets/images/taj_mahal.png",
    "govardhan_001": "/assets/images/govardhan_hill.png",
    "govardhan_002": "/assets/images/govardhan_hill.png",
    "barsana_001": "/assets/images/radha_rani_temple.png",
    "barsana_002": "/assets/images/radha_rani_temple.png",
    "gokul_001": "/assets/images/nand_bhavan.png",
    "gokul_002": "/assets/images/nand_bhavan.png",
}

CATEGORY_IMAGES = {
    "temple": "/assets/images/krishna_janmabhoomi.png",
    "ghat": "/assets/images/vishram_ghat.png",
    "monument": "/assets/images/taj_mahal.png",
    "market": "/assets/images/banke_bihari.png",
    "nature": "/assets/images/govardhan_hill.png",
    "heritage": "/assets/images/taj_mahal.png",
    "museum": "/assets/images/taj_mahal.png",
    "park": "/assets/images/govardhan_hill.png",
    "religious": "/assets/images/prem_mandir.png",
    "garden": "/assets/images/govardhan_hill.png",
    "cafe": "/assets/images/banke_bihari.png",
    "restaurant": "/assets/images/banke_bihari.png",
    "church": "/assets/images/taj_mahal.png",
    "mosque": "/assets/images/taj_mahal.png",
    "gurudwara": "/assets/images/prem_mandir.png",
    "hidden_gem": "/assets/images/nand_bhavan.png",
    "parikrama_route": "/assets/images/govardhan_hill.png",
    "other": "/assets/images/krishna_janmabhoomi.png",
}

CITY_IMAGES = {
    "Mathura": "/assets/images/krishna_janmabhoomi.png",
    "Vrindavan": "/assets/images/banke_bihari.png",
    "Agra": "/assets/images/taj_mahal.png",
    "Govardhan": "/assets/images/govardhan_hill.png",
    "Barsana": "/assets/images/radha_rani_temple.png",
    "Gokul": "/assets/images/nand_bhavan.png",
}


def get_place_image(place: dict) -> str:
    """Get the best available image URL for a place."""
    if not place:
        return "/assets/images/krishna_janmabhoomi.png"

    # Priority 1: Google Places photo (via proxy endpoint)
    if place.get("photo_reference") and place.get("id"):
        return f"/api/agent/places/{place['id']}/photo?maxwidth=400"

    # Priority 2: Hardcoded place-specific image
    place_id = place.get("id")
    if place_id and place_id in PLACE_IMAGES:
        return PLACE_IMAGES[place_id]

    # Priority 3: City-based fallback
    city = place.get("city")
    if city and city in CITY_IMAGES:
        return CITY_IMAGES[city]

    # Priority 4: Category-based fallback
    category = (place.get("category") or "").lower()
    if category in CATEGORY_IMAGES:
        return CATEGORY_IMAGES[category]

    return "/assets/images/krishna_janmabhoomi.png"


def get_city_image(city: str) -> str:
    """Get the image URL for a city."""
    return CITY_IMAGES.get(city, "/assets/images/krishna_janmabhoomi.png")


def enrich_with_image(place: dict) -> dict:
    """Add image_url field to a place dict."""
    return {**place, "image_url": get_place_image(place)}
