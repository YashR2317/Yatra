"""
Google Places Photos — Utility for fetching real place photos.
"""

import httpx
from config import get_settings

PLACES_BASE = "https://places.googleapis.com/v1"


async def search_place(place_name: str, city: str) -> dict:
    """Search for a place using Google Places Text Search (New).

    Returns:
        dict with placeId, photoRef, displayName (or None values)
    """
    settings = get_settings()
    api_key = settings.GOOGLE_MAPS_API_KEY
    if not api_key:
        return {"placeId": None, "photoRef": None, "displayName": None}

    try:
        query = f"{place_name}, {city}, India"
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{PLACES_BASE}/places:searchText",
                headers={
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": api_key,
                    "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
                },
                json={
                    "textQuery": query,
                    "languageCode": "en",
                    "maxResultCount": 1,
                },
            )

        if resp.status_code != 200:
            print(f'[PlacesPhotos] Search failed for "{query}": {resp.status_code}')
            return {"placeId": None, "photoRef": None, "displayName": None}

        data = resp.json()
        place = (data.get("places") or [None])[0]
        if not place:
            return {"placeId": None, "photoRef": None, "displayName": None}

        photos = place.get("photos") or []
        photo_ref = photos[0].get("name") if photos else None

        return {
            "placeId": place.get("id"),
            "photoRef": photo_ref,
            "displayName": (place.get("displayName") or {}).get("text"),
        }
    except Exception as e:
        print(f'[PlacesPhotos] Error searching "{place_name}": {e}')
        return {"placeId": None, "photoRef": None, "displayName": None}


async def fetch_photo(photo_reference: str, max_width: int = 400) -> dict:
    """Fetch a place photo from Google Places (New) API.

    Returns:
        dict with ok, content (bytes), content_type
    """
    settings = get_settings()
    api_key = settings.GOOGLE_MAPS_API_KEY
    if not api_key or not photo_reference:
        return {"ok": False, "content": None, "content_type": None}

    try:
        url = f"{PLACES_BASE}/{photo_reference}/media?maxWidthPx={max_width}&key={api_key}"
        async with httpx.AsyncClient(follow_redirects=True) as client:
            resp = await client.get(url)

        if resp.status_code != 200:
            print(f"[PlacesPhotos] Photo fetch failed: {resp.status_code}")
            return {"ok": False, "content": None, "content_type": None}

        return {
            "ok": True,
            "content": resp.content,
            "content_type": resp.headers.get("content-type", "image/jpeg"),
        }
    except Exception as e:
        print(f"[PlacesPhotos] Photo fetch error: {e}")
        return {"ok": False, "content": None, "content_type": None}


def build_photo_url(place_id: str, max_width: int = 400) -> str:
    """Build the proxied photo URL for the frontend."""
    return f"/api/agent/places/{place_id}/photo?maxwidth={max_width}"
