/**
 * Google Places Photos — Utility for fetching real place photos
 *
 * Uses the Google Places API (New) to:
 * 1. Search for a place by name + city → get Place ID
 * 2. Get photo references for that place
 * 3. Build proxied photo URLs for the frontend
 *
 * Uses Node.js native fetch (available since Node 18+).
 */

require('dotenv').config();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_BASE = 'https://places.googleapis.com/v1';

/**
 * Search for a place using Google Places Text Search (New).
 * Returns the first result's Place ID and photo references.
 *
 * @param {string} placeName — e.g. "Krishna Janmabhoomi"
 * @param {string} city — e.g. "Mathura"
 * @returns {Promise<{ placeId: string|null, photoRef: string|null, displayName: string|null }>}
 */
async function searchPlace(placeName, city) {
    if (!API_KEY) {
        return { placeId: null, photoRef: null, displayName: null };
    }

    try {
        const query = `${placeName}, ${city}, India`;

        const res = await fetch(`${PLACES_BASE}/places:searchText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
            },
            body: JSON.stringify({
                textQuery: query,
                languageCode: 'en',
                maxResultCount: 1,
            }),
        });

        if (!res.ok) {
            console.warn(`[PlacesPhotos] Search failed for "${query}": ${res.status}`);
            return { placeId: null, photoRef: null, displayName: null };
        }

        const data = await res.json();
        const place = data.places?.[0];

        if (!place) {
            return { placeId: null, photoRef: null, displayName: null };
        }

        const photoRef = place.photos?.[0]?.name || null;
        return {
            placeId: place.id || null,
            photoRef,
            displayName: place.displayName?.text || null,
        };
    } catch (err) {
        console.error(`[PlacesPhotos] Error searching "${placeName}":`, err.message);
        return { placeId: null, photoRef: null, displayName: null };
    }
}

/**
 * Fetch a place photo from Google Places (New) API.
 * Returns the raw image response (stream) for proxying.
 *
 * @param {string} photoReference — The photo resource name (e.g. "places/xxx/photos/yyy")
 * @param {number} maxWidth — Max width in pixels (default 400)
 * @returns {Promise<{ ok: boolean, stream: ReadableStream|null, contentType: string|null }>}
 */
async function fetchPhoto(photoReference, maxWidth = 400) {
    if (!API_KEY || !photoReference) {
        return { ok: false, stream: null, contentType: null };
    }

    try {
        const url = `${PLACES_BASE}/${photoReference}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;

        const res = await fetch(url, { redirect: 'follow' });

        if (!res.ok) {
            console.warn(`[PlacesPhotos] Photo fetch failed: ${res.status}`);
            return { ok: false, stream: null, contentType: null };
        }

        return {
            ok: true,
            stream: res.body,
            contentType: res.headers.get('content-type') || 'image/jpeg',
        };
    } catch (err) {
        console.error(`[PlacesPhotos] Photo fetch error:`, err.message);
        return { ok: false, stream: null, contentType: null };
    }
}

/**
 * Build the proxied photo URL for the frontend.
 *
 * @param {string} placeId — The internal place ID (e.g. "mathura_001")
 * @param {number} maxWidth — optional max width
 * @returns {string}
 */
function buildPhotoUrl(placeId, maxWidth = 400) {
    return `/api/agent/places/${placeId}/photo?maxwidth=${maxWidth}`;
}

module.exports = { searchPlace, fetchPhoto, buildPhotoUrl };
