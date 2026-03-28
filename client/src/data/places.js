// ─── Central Places Data Access Layer ──────────────────────────────
// Single source of truth: reads from places.json
// Every section uses these filter helpers. No other data source needed.
// ───────────────────────────────────────────────────────────────────

import placesData from "./places.json";

export const places = placesData;

// ── Filter helpers ──────────────────────────────────────────────────
export const getPlaceById = (id) => places.find(p => p.id === id);
export const getPlaceBySlug = (slug) => places.find(p => p.slug === slug);
export const getPlacesByCity = (city) => places.filter(p => p.city.toLowerCase() === city.toLowerCase());
export const getPlacesByCategory = (cat) => places.filter(p => p.categories.includes(cat));

export const getPlacesByCityAndCategory = (city, cat) =>
    places.filter(p => p.city.toLowerCase() === city.toLowerCase() && p.categories.includes(cat));

export const getPlacesByCityAndCategories = (city, cats) =>
    places.filter(p => p.city.toLowerCase() === city.toLowerCase() && cats.some(c => p.categories.includes(c)));

export const searchPlaces = (query) => {
    const q = query.toLowerCase();
    return places.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.nameHi && p.nameHi.includes(query)) ||
        (p.tags && p.tags.some(t => t.includes(q))) ||
        (p.tagline && p.tagline.toLowerCase().includes(q))
    );
};

export const getPlacesByMood = (mood) =>
    places.filter(p => p.mood && p.mood.includes(mood));

export const getNearbyPlaces = (placeId) => {
    const place = getPlaceById(placeId);
    if (!place || !place.nearbyPlaces) return [];
    return place.nearbyPlaces.map(id => getPlaceById(id)).filter(Boolean);
};

export default places;
