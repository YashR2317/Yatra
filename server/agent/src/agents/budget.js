/**
 * Budget Calculator — Accurate, city-specific cost estimates for BrajYatra.
 * 
 * Uses real entry fees from the database and city-specific pricing for food,
 * transport, and accommodation to produce factual budget breakdowns.
 */

const CITY_FOOD_COSTS = {
    // Per-person per-meal estimates in INR
    Mathura:    { low: 60,  medium: 150, high: 400 },
    Vrindavan:  { low: 50,  medium: 130, high: 350 },
    Agra:       { low: 80,  medium: 250, high: 600 },
    Govardhan:  { low: 50,  medium: 120, high: 300 },
    Barsana:    { low: 40,  medium: 100, high: 250 },
    Gokul:      { low: 40,  medium: 100, high: 250 },
    default:    { low: 60,  medium: 180, high: 450 },
};

const CITY_TRANSPORT_COSTS = {
    // Per-day estimates in INR (for the group, not per person)
    Mathura:    { low: 150,  medium: 400,  high: 1200 },   // e-rickshaw / auto / cab
    Vrindavan:  { low: 100,  medium: 300,  high: 1000 },   // smaller city, walkable
    Agra:       { low: 200,  medium: 600,  high: 2000 },   // larger distances
    Govardhan:  { low: 100,  medium: 250,  high: 800 },
    Barsana:    { low: 80,   medium: 200,  high: 700 },
    Gokul:      { low: 80,   medium: 200,  high: 700 },
    default:    { low: 150,  medium: 400,  high: 1200 },
};

const CITY_ACCOMMODATION_COSTS = {
    // Per-night estimates in INR (per room)
    Mathura:    { low: 400,  medium: 1200, high: 3500 },   // dharamshala / hotel / premium
    Vrindavan:  { low: 300,  medium: 1000, high: 3000 },   // many ashrams
    Agra:       { low: 600,  medium: 2000, high: 6000 },   // tourist pricing
    Govardhan:  { low: 300,  medium: 800,  high: 2500 },
    Barsana:    { low: 200,  medium: 600,  high: 2000 },
    Gokul:      { low: 200,  medium: 600,  high: 2000 },
    default:    { low: 400,  medium: 1200, high: 3500 },
};

// Miscellaneous daily costs (donations, water, snacks, etc.)
const MISC_COSTS = {
    low: 100,      // water + basic donations
    medium: 250,   // donations + snacks + bottled water
    high: 500,     // donations + shopping + packaged items
};

const MEALS_PER_DAY = 3; // breakfast, lunch, dinner

/**
 * Calculate budget using city-specific pricing and real entry fees.
 * 
 * @param {Object} params
 * @param {Array}  params.places       - Array of place objects with entry_fee
 * @param {number} params.days         - Number of days
 * @param {string} params.budgetLevel  - 'low' | 'medium' | 'high'
 * @param {number} [params.people=2]   - Number of people
 * @param {Array}  [params.cities=[]]  - Cities in the itinerary
 * @returns {Object} - Detailed budget breakdown
 */
function estimateBudget({ places = [], days = 1, budgetLevel = 'medium', people = 2, cities = [] }) {
    const level = budgetLevel.toLowerCase();

    // ── Entry Fees (use real data from DB) ──────────────────────
    const entryFees = places.reduce((sum, p) => {
        const fee = parseFloat(p.entry_fee) || 0;
        return sum + (fee * people);
    }, 0);

    // ── Food (city-specific daily costs) ────────────────────────
    const uniqueCities = cities.length > 0 ? cities : [...new Set(places.map(p => p.city).filter(Boolean))];
    const daysPerCity = uniqueCities.length > 0 ? Math.ceil(days / uniqueCities.length) : days;

    let totalFood = 0;
    if (uniqueCities.length > 0) {
        for (const city of uniqueCities) {
            const cityFood = CITY_FOOD_COSTS[city] || CITY_FOOD_COSTS.default;
            const perMeal = cityFood[level] || cityFood.medium;
            totalFood += perMeal * MEALS_PER_DAY * daysPerCity * people;
        }
    } else {
        const defaultFood = CITY_FOOD_COSTS.default[level] || CITY_FOOD_COSTS.default.medium;
        totalFood = defaultFood * MEALS_PER_DAY * days * people;
    }

    // ── Transport (city-specific daily costs) ───────────────────
    let totalTransport = 0;
    if (uniqueCities.length > 0) {
        for (const city of uniqueCities) {
            const cityTransport = CITY_TRANSPORT_COSTS[city] || CITY_TRANSPORT_COSTS.default;
            const perDay = cityTransport[level] || cityTransport.medium;
            totalTransport += perDay * daysPerCity;
        }
    } else {
        const defaultTransport = CITY_TRANSPORT_COSTS.default[level] || CITY_TRANSPORT_COSTS.default.medium;
        totalTransport = defaultTransport * days;
    }

    // ── Accommodation ───────────────────────────────────────────
    const nights = Math.max(0, days - 1);
    let totalAccommodation = 0;
    if (nights > 0 && uniqueCities.length > 0) {
        const nightsPerCity = Math.ceil(nights / uniqueCities.length);
        for (const city of uniqueCities) {
            const cityAccom = CITY_ACCOMMODATION_COSTS[city] || CITY_ACCOMMODATION_COSTS.default;
            const perNight = cityAccom[level] || cityAccom.medium;
            totalAccommodation += perNight * nightsPerCity;
        }
    } else if (nights > 0) {
        const defaultAccom = CITY_ACCOMMODATION_COSTS.default[level] || CITY_ACCOMMODATION_COSTS.default.medium;
        totalAccommodation = defaultAccom * nights;
    }

    // ── Miscellaneous (donations, water, snacks, etc.) ──────────
    const miscPerDay = MISC_COSTS[level] || MISC_COSTS.medium;
    const totalMisc = miscPerDay * days * people;

    // ── Total ───────────────────────────────────────────────────
    const total = entryFees + totalFood + totalTransport + totalAccommodation + totalMisc;

    return {
        entry_fees: Math.round(entryFees),
        food: Math.round(totalFood),
        transport: Math.round(totalTransport),
        accommodation: Math.round(totalAccommodation),
        miscellaneous: Math.round(totalMisc),
        total: Math.round(total),
        per_person: Math.round(total / people),
        currency: 'INR',
        budget_level: level,
        days,
        people,
        cities: uniqueCities,
        breakdown_note: getBudgetNote(level, uniqueCities),
    };
}

function getBudgetNote(level, cities = []) {
    const cityStr = cities.length > 0 ? cities.join(' & ') : 'Braj region';
    switch (level) {
        case 'low':
            return `Budget option for ${cityStr}: Dharamshala stays, e-rickshaws, temple prasadam & street food (pede, kachori, chaat). Includes donations & water.`;
        case 'high':
            return `Premium option for ${cityStr}: AC hotel rooms, private cab with driver, restaurant dining. Includes shopping & souvenirs.`;
        default:
            return `Moderate option for ${cityStr}: Mid-range hotels, auto-rickshaws, mix of restaurants & street food. Includes donations, snacks & water.`;
    }
}

module.exports = { estimateBudget, CITY_FOOD_COSTS, CITY_TRANSPORT_COSTS, CITY_ACCOMMODATION_COSTS };
