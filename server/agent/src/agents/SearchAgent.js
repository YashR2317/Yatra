/**
 * SearchAgent — Google Search-Grounded Specialist
 *
 * Uses Gemini's built-in Google Search grounding to find real-time info
 * about hotels, restaurants, tourist places, transport, events, etc.
 * Returns structured results with source citations and booking links.
 */

const AgentBase = require('./core/AgentBase');
const { SEARCH_PROMPT, getLanguageInstruction } = require('../prompts/system-prompts');

const HOTEL_KEYWORDS = [
    'hotel', 'hotels', 'stay', 'accommodation', 'lodge', 'resort',
    'dharamshala', 'guesthouse', 'guest house', 'hostel', 'oyo',
    'room', 'rooms', 'booking', 'where to stay', 'near taj mahal',
    'check-in', 'checkin'
];

const BOOKING_PLATFORMS = [
    { name: 'MakeMyTrip', icon: '🔶', baseUrl: 'https://www.makemytrip.com/hotels/hotel-listing', param: 'city' },
    { name: 'Booking.com', icon: '🟦', baseUrl: 'https://www.booking.com/searchresults.html', param: 'ss' },
    { name: 'Goibibo', icon: '🟢', baseUrl: 'https://www.goibibo.com/hotels/', param: 'query' },
    { name: 'OYO', icon: '🔴', baseUrl: 'https://www.oyorooms.com/search', param: 'location' },
];

class SearchAgent extends AgentBase {
    constructor() {
        super({
            name: 'SearchAgent',
            role: 'Google Search Specialist',
            systemPrompt: SEARCH_PROMPT,
            toolNames: [], // No function-calling tools — uses Google Search grounding via generateResponse
            maxIterations: 1 // Single-shot: send query → get grounded response
        });
    }

    /**
     * Perform a Google-grounded search query.
     * @param {string} query — the search query
     * @param {Object} context — { language, cities, searchType }
     * @returns {Promise<Object>} — { text, groundingMetadata, isHotelSearch, bookingLinks, searchQuery }
     */
    async search(query, context = {}) {
        const lang = context.language || 'en';
        const langInstruction = getLanguageInstruction(lang);

        // Detect hotel searches
        const lowerQuery = query.toLowerCase();
        const isHotelSearch = HOTEL_KEYWORDS.some(kw => lowerQuery.includes(kw));

        // Build an enriched search prompt
        let enrichedQuery = query;
        if (isHotelSearch) {
            enrichedQuery = `${query}\n\nPlease include: hotel names, approximate price range per night in INR, star rating if available, location/area, contact info or website if known, and amenities highlights. Format as a clear list.`;
        }

        // Use the base class run() which calls _think() → generateResponse() with Google Search grounding
        const result = await this.run(enrichedQuery, { language: lang });

        if (!result.success) {
            return {
                success: false,
                text: 'I could not find information for your search. Please try again.',
                error: result.error
            };
        }

        // Build booking links for hotel searches
        let bookingLinks = [];
        if (isHotelSearch) {
            const city = context.cities?.[0] || this._extractCity(query) || 'Mathura';
            const searchTerm = encodeURIComponent(`${city} Hotels`);
            bookingLinks = BOOKING_PLATFORMS.map(p => ({
                name: p.name,
                icon: p.icon,
                url: `${p.baseUrl}?${p.param}=${searchTerm}`
            }));
        }

        return {
            success: true,
            text: result.text,
            groundingMetadata: result.groundingMetadata || null,
            isHotelSearch,
            bookingLinks,
            searchQuery: query,
            source: 'SearchAgent'
        };
    }

    /**
     * Try to extract a city name from the query text.
     * @private
     */
    _extractCity(query) {
        const cities = ['Mathura', 'Vrindavan', 'Agra', 'Govardhan', 'Barsana', 'Gokul'];
        const lower = query.toLowerCase();
        return cities.find(c => lower.includes(c.toLowerCase())) || null;
    }
}

module.exports = SearchAgent;
