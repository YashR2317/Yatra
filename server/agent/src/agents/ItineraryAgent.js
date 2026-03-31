/**
 * ItineraryAgent — Autonomous Itinerary Planning Specialist
 * 
 * Creates detailed day-by-day travel itineraries for the Braj region.
 * Autonomously decides which tools to call: fetches places, checks weather,
 * scores/ranks, enforces diversity, optimizes routes, and estimates budgets.
 * 
 * Preserves all existing itinerary logic (fallback generation, Google Maps
 * links, post-processing) from the original itinerary.js module.
 */

const AgentBase = require('./core/AgentBase');
const { ITINERARY_PROMPT, getLanguageInstruction } = require('../prompts/system-prompts');
const { formatPlaceForLLM } = require('../utils/helpers');
const { optimizeRoute, getCityCentroid } = require('../utils/geo');
const { estimateBudget } = require('./budget');
const messageBus = require('./core/MessageBus');

const GROUP_TYPE_PEOPLE = {
    solo: 1, couple: 2, family: 4, group: 6, elderly: 2
};

class ItineraryAgent extends AgentBase {
    constructor() {
        super({
            name: 'ItineraryAgent',
            role: 'Itinerary Planning Specialist',
            systemPrompt: `${ITINERARY_PROMPT}

You are an autonomous itinerary planning agent with access to tools. Follow this workflow:

STEP-BY-STEP WORKFLOW:
1. FIRST, call get_places_by_cities with the target cities to get all available places
2. THEN, call fetch_weather for the primary city to get current conditions
3. THEN, call score_and_rank_places with the places, user interests, and weather data
4. THEN, call enforce_diversity to get a balanced selection of places
5. THEN, call optimize_route to order places geographically for each city
6. FINALLY, produce your day-by-day itinerary JSON using all the gathered data

After completing all tool calls, output your final itinerary as JSON matching the exact format specified above.

IMPORTANT: You MUST use the tools to gather data before creating the itinerary. Do NOT make up places — use only places returned by the database tools.`,
            toolNames: [
                'get_places_by_cities', 'get_places_by_city', 'search_places',
                'score_and_rank_places', 'enforce_diversity',
                'fetch_weather', 'estimate_budget',
                'optimize_route', 'get_city_centroid'
            ],
            maxIterations: 7 // More iterations needed for the multi-step pipeline
        });
    }

    /**
     * Plan an itinerary with structured parameters.
     * This is the main public API matching the original itinerary.plan() signature.
     */
    async plan(params = {}) {
        const {
            cities = [], days = 1, interests = [], pace = 'moderate',
            language = 'en', group_type = 'family', budget_level = 'medium',
            weather_preference = null
        } = params;

        const targetCities = cities.length > 0 ? cities : ['Mathura', 'Vrindavan'];
        const langInstruction = getLanguageInstruction(language);

        // Build a task message with all parameters
        const taskMessage = JSON.stringify({
            request: {
                cities: targetCities,
                days,
                interests,
                pace,
                group_type,
                budget_level,
                weather_preference
            },
            instructions: `Plan a ${days}-day itinerary covering ${targetCities.join(' and ')}. ` +
                `The traveler is a ${group_type} with ${budget_level} budget. ` +
                `Pace: ${pace}. ` +
                (interests.length > 0 ? `Interests: ${interests.join(', ')}. ` : '') +
                `Use your tools to fetch places, check weather, score and rank them, enforce diversity, and optimize the route. ` +
                `Then create a detailed day-by-day itinerary JSON.`
        });

        // Update system prompt with context-specific instructions
        this.systemPrompt = `${ITINERARY_PROMPT}

You are an autonomous itinerary planning agent with access to tools.

CURRENT REQUEST:
- Cities: ${targetCities.join(', ')}
- Days: ${days}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'General'}
- Pace: ${pace} (${pace === 'relaxed' ? '4 places/day' : pace === 'intensive' ? '7 places/day' : '5 places/day'})
- Group: ${group_type}
- Budget: ${budget_level}

STEP-BY-STEP WORKFLOW:
1. Call get_places_by_cities with cities: ${JSON.stringify(targetCities)}
2. Call fetch_weather with city: "${targetCities[0]}" 
3. Call score_and_rank_places with the places, interests: ${JSON.stringify(interests)}, group_type: "${group_type}", budget_level: "${budget_level}"
4. Call enforce_diversity with the scored places, cities: ${JSON.stringify(targetCities)}, total_needed: ${days * (pace === 'relaxed' ? 4 : pace === 'intensive' ? 7 : 5)}
5. Call optimize_route to order places by city
6. Create the final itinerary JSON using ALL the data gathered from tools

CRITICAL: After using all tools, output ONLY the final JSON itinerary. The JSON must follow the exact format specified above.${langInstruction}`;

        const result = await this.run(taskMessage, { language });

        // Parse and post-process the itinerary
        if (result.success && result.text) {
            const itinerary = this._parseItinerary(result.text, targetCities, days, budget_level, group_type);
            if (itinerary) {
                return {
                    success: true,
                    itinerary,
                    source: result.source,
                    cities: targetCities,
                    agentTrace: result.trace
                };
            }
        }

        // Fallback: Generate a basic itinerary using the database directly
        console.warn('[ItineraryAgent] LLM itinerary generation failed, using fallback');
        return this._generateFallbackItinerary(targetCities, days, interests, pace, budget_level, group_type);
    }

    /**
     * Parse the LLM's text response into a structured itinerary object.
     * Handles JSON extraction and post-processing.
     * @private
     */
    _parseItinerary(text, cities, days, budgetLevel, groupType) {
        try {
            let jsonText = text;

            // Try to extract JSON from markdown code blocks
            const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) jsonText = jsonMatch[1];

            // Try to find JSON object in the text
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1) return null;

            jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
            const itinerary = JSON.parse(jsonText);

            if (!itinerary.days || !Array.isArray(itinerary.days)) return null;

            // Post-processing: Add Google Maps links, budget, weather notes
            itinerary.google_maps_url = this._buildGoogleMapsRoute(itinerary);
            this._addPerDayRoutes(itinerary);
            this._addPlaceMapLinks(itinerary);

            // Add budget estimate
            const allPlaces = [];
            for (const day of itinerary.days) {
                for (const slot of (day.slots || [])) {
                    if (slot.place_id) allPlaces.push(slot);
                }
            }

            itinerary.budget = estimateBudget({
                places: allPlaces,
                days,
                budgetLevel,
                people: GROUP_TYPE_PEOPLE[groupType] || 2
            });

            if (!itinerary.alternate_indoor || itinerary.alternate_indoor.length === 0) {
                itinerary.alternate_indoor = this._getIndoorAlternatives(cities);
            }

            return itinerary;
        } catch (e) {
            console.error('[ItineraryAgent] Failed to parse itinerary JSON:', e.message);
            return null;
        }
    }

    /**
     * Generate a fallback itinerary when LLM fails.
     * Preserves the existing fallback logic from the original module.
     * @private
     */
    _generateFallbackItinerary(cities, days, interests, pace, budgetLevel, groupType) {
        const db = require('../db/database');
        const { rankPlaces } = require('./scoring');
        const { enforceDiversity } = require('./diversity');

        // Fetch and process places
        let allPlaces = db.getPlacesByMultipleCities(cities);
        if (allPlaces.length === 0) {
            for (const city of cities) {
                allPlaces.push(...db.getPlacesByCity(city));
            }
        }

        const intent = { interests, cities, group_type: groupType, budget_level: budgetLevel, pace };
        allPlaces = rankPlaces(allPlaces, intent, null);

        const placesPerDay = pace === 'relaxed' ? 4 : pace === 'intensive' ? 7 : 5;
        const totalNeeded = Math.min(allPlaces.length, days * placesPerDay);

        const diversified = enforceDiversity(allPlaces, {
            maxPerCategory: 4,
            cities,
            minPerCity: Math.max(3, days * 2),
            totalNeeded,
            surfaceHiddenGems: true
        });

        // Organize by city and optimize routes
        const placesByCity = {};
        for (const p of diversified) {
            if (!placesByCity[p.city]) placesByCity[p.city] = [];
            placesByCity[p.city].push(p);
        }
        for (const city of Object.keys(placesByCity)) {
            const centroid = getCityCentroid(city);
            if (centroid) {
                placesByCity[city] = optimizeRoute(placesByCity[city], centroid.lat, centroid.lng);
            }
        }

        // Build the itinerary
        const itinerary = {
            title: `${days}-Day ${cities.join(' & ')} Sacred Yatra`,
            summary: `A curated ${days}-day pilgrimage through ${cities.join(' and ')} with temple darshan, prasadam breaks, and evening aarti.`,
            days: [],
            tips: [
                'Start each day early (6 AM) for peaceful darshan at temples',
                'Carry modest clothing — shoulders and knees should be covered in temples',
                'Remove shoes before entering all temples (carry a bag for them)',
                'Stay hydrated — carry a water bottle especially in summer',
                'Keep small cash for donations (chadhava) and prasadam',
                'Photography may be restricted inside some temples — check before clicking',
                'Try the famous Mathura ke pede and Vrindavan kheer'
            ],
            weather_notes: null,
            alternate_indoor: this._getIndoorAlternatives(cities),
            total_estimated_hours: 0,
            best_season: 'October–March'
        };

        const foodSpots = {
            'Mathura': 'Brijwasi Mithai Wale for famous Mathura ke pede, street chaat near Holi Gate',
            'Vrindavan': 'ISKCON MVT Dining Hall for sattvic prasadam and Govinda\'s Restaurant for thali',
            'Agra': 'Dasaprakash for South Indian, or try local kachori and petha from Panchhi Petha',
            'Govardhan': 'Temple langar at Daan Ghati Temple, or local dhaba for dal-chaawal',
            'Barsana': 'Temple langar at Radha Rani Temple, local dhaba for puri-sabji',
            'Gokul': 'Nand Bhavan temple prasadam, local dhaba for fresh lassi and kachori'
        };

        let dayNum = 1;
        const daysPerCity = Math.max(1, Math.floor(days / cities.length));

        for (const city of cities) {
            const places = placesByCity[city] || [];
            const ppd = Math.ceil(places.length / daysPerCity);

            for (let d = 0; d < daysPerCity && dayNum <= days; d++) {
                const dayPlaces = places.slice(d * ppd, (d + 1) * ppd).slice(0, 5);
                const slots = [];

                const schedule = [
                    { time: '06:00–07:30', period: 'morning' },
                    { time: '08:00–09:30', period: 'morning' },
                    { time: '10:00–11:30', period: 'morning' },
                    { time: '12:30–13:30', period: 'afternoon', isMeal: true },
                    { time: '14:00–15:30', period: 'afternoon' },
                    { time: '16:00–17:30', period: 'evening' },
                    { time: '18:00–19:30', period: 'evening' },
                ];

                let placeIdx = 0;
                for (const sched of schedule) {
                    if (sched.isMeal) {
                        slots.push({
                            time: sched.time,
                            period: sched.period,
                            place: '🍛 Lunch & Prasadam Break',
                            duration_mins: 60,
                            description: `Enjoy local prasadam and food. ${foodSpots[city] || 'Try the local temple langar or nearby dhaba.'}`,
                            tip: 'Temple langar is usually free — donate generously 🙏',
                            is_meal: true
                        });
                    } else if (placeIdx < dayPlaces.length) {
                        const p = dayPlaces[placeIdx];
                        slots.push({
                            time: sched.time,
                            period: sched.period,
                            place: p.name,
                            place_id: p.id,
                            duration_mins: p.estimated_visit_duration || 60,
                            description: p.description || `Visit ${p.name} in ${city}.`,
                            tip: `Crowd level: ${p.crowd_level || 'moderate'}`,
                            entry_fee: parseFloat(p.entry_fee) || 0,
                            travel_cost_from_previous: placeIdx === 0 ? 0 : 50
                        });
                        placeIdx++;
                    }
                }

                itinerary.days.push({
                    day: dayNum,
                    city,
                    theme: city.toLowerCase() === 'agra' ? `Agra's Monuments & Heritage` : `Exploring ${city}`,
                    overview: `Visit ${dayPlaces.length} sacred places in ${city} with a prasadam lunch break`,
                    slots
                });

                itinerary.total_estimated_hours += dayPlaces.reduce((sum, p) => sum + (p.estimated_visit_duration || 60), 0) / 60 + 1;
                dayNum++;
            }
        }

        itinerary.google_maps_url = this._buildGoogleMapsRoute(itinerary);
        this._addPerDayRoutes(itinerary);
        this._addPlaceMapLinks(itinerary);

        const allFallbackPlaces = Object.values(placesByCity).flat();
        itinerary.budget = estimateBudget({
            places: allFallbackPlaces,
            days,
            budgetLevel: budgetLevel,
            people: GROUP_TYPE_PEOPLE[groupType] || 2
        });

        return { success: true, itinerary, source: 'fallback', cities, agentTrace: [{ step: 'fallback', reason: 'LLM failed' }] };
    }

    // ─── Post-Processing Helpers ────────────────────────────────

    _isActualPlace(slot) {
        if (!slot || !slot.place) return false;
        if (slot.is_meal) return false;
        const lower = slot.place.toLowerCase();
        const skipPatterns = [
            'travel to', 'travel from', 'transit', 'drive to', 'walk to', 'commute',
            'rest', 'leisure', 'break', 'check-in', 'check in', 'checkout', 'check out',
            'lunch', 'breakfast', 'dinner', 'snack', 'prasadam break', 'food break', '🍛'
        ];
        return !skipPatterns.some(p => lower.includes(p));
    }

    _isMealSlot(slot) {
        if (!slot || !slot.place) return false;
        if (slot.is_meal) return true;
        const lower = slot.place.toLowerCase();
        return lower.includes('lunch') || lower.includes('breakfast') || lower.includes('dinner') ||
            lower.includes('prasadam break') || lower.includes('food break') || lower.includes('🍛');
    }

    _buildGoogleMapsRoute(itinerary) {
        if (!itinerary.days || itinerary.days.length === 0) return null;
        const allStops = [];
        for (const day of itinerary.days) {
            for (const slot of (day.slots || [])) {
                if (!this._isActualPlace(slot)) continue;
                allStops.push(`${slot.place}, ${day.city || ''}, India`);
            }
        }
        if (allStops.length < 2) return null;
        const origin = encodeURIComponent(allStops[0]);
        const destination = encodeURIComponent(allStops[allStops.length - 1]);
        const waypoints = allStops.slice(1, -1).map(s => encodeURIComponent(s)).join('|');
        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        if (waypoints) url += `&waypoints=${waypoints}`;
        return url;
    }

    _addPerDayRoutes(itinerary) {
        if (!itinerary.days) return;
        for (const day of itinerary.days) {
            const stops = (day.slots || [])
                .filter(s => this._isActualPlace(s))
                .map(s => `${s.place}, ${day.city || ''}, India`);
            if (stops.length < 2) {
                day.google_maps_url = stops.length === 1
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`
                    : null;
                continue;
            }
            const origin = encodeURIComponent(stops[0]);
            const destination = encodeURIComponent(stops[stops.length - 1]);
            const waypoints = stops.slice(1, -1).map(s => encodeURIComponent(s)).join('|');
            let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
            if (waypoints) url += `&waypoints=${waypoints}`;
            day.google_maps_url = url;
        }
    }

    _addPlaceMapLinks(itinerary) {
        if (!itinerary.days) return;
        for (const day of itinerary.days) {
            for (const slot of (day.slots || [])) {
                if (this._isMealSlot(slot)) slot.is_meal = true;
                if (!this._isActualPlace(slot)) continue;
                slot.google_maps_url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(slot.place + ', ' + (day.city || '') + ', India')}`;
            }
        }
    }

    _getIndoorAlternatives(cities) {
        const indoor = {
            'Mathura': ['Mathura Museum (Buddhist sculptures)', 'Shri Krishna Janmabhoomi Temple (covered)', 'Government Museum Mathura'],
            'Vrindavan': ['ISKCON Temple (air-conditioned hall)', 'Prem Mandir (covered galleries)', 'Vrindavan Chandrodaya Mandir'],
            'Agra': ['Agra Fort (covered halls)', 'Itimad-ud-Daulah (Baby Taj)', 'Mehtab Bagh (shaded viewing)'],
            'Govardhan': ['Daan Ghati Temple (covered)', 'Jatipura Temple'],
            'Barsana': ['Shriji Temple (Radha Rani Temple, covered)', 'Rangeeli Mahal'],
            'Gokul': ['Nand Bhavan Temple (covered)', 'Raman Reti (shaded groves)']
        };
        const result = [];
        for (const city of cities) {
            if (indoor[city]) result.push(...indoor[city]);
        }
        return result.slice(0, 5);
    }
}

module.exports = ItineraryAgent;
