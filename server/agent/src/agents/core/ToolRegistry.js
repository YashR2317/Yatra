/**
 * ToolRegistry — Central Registry of All Agent Tools
 * 
 * Converts existing helper functions (DB queries, weather API, scoring, etc.)
 * into declarative tool definitions that agents can invoke via Gemini function calling.
 * 
 * Each tool has:
 *   - name: unique identifier
 *   - description: what the tool does (for the LLM to understand)
 *   - parameters: JSON Schema of inputs
 *   - execute: the actual function implementation
 */

const db = require('../../db/database');
const { rankPlaces } = require('../scoring');
const { enforceDiversity } = require('../diversity');
const { estimateBudget } = require('../budget');
const { optimizeRoute, getCityCentroid, estimateTravelTime } = require('../../utils/geo');
const { filterByInterests, filterByAccessibility, filterByBudget, formatPlaceForLLM } = require('../../utils/helpers');
const fetch = require('node-fetch');
require('dotenv').config();

const OWM_KEY = process.env.OPENWEATHER_API_KEY;

// ─── Tool Definitions ──────────────────────────────────────────────

const TOOLS = {

    // ═══ Database Tools ═══

    search_places: {
        name: 'search_places',
        description: 'Search for places in the Braj region database by keyword. Returns matching places with details like name, city, category, description, coordinates, crowd level, and visit duration.',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search keyword (e.g., "temple", "Krishna", "heritage", "ghat")' }
            },
            required: ['query']
        },
        execute: ({ query }) => {
            const results = db.searchPlaces(query);
            return results.slice(0, 15).map(formatPlaceForLLM);
        }
    },

    get_places_by_city: {
        name: 'get_places_by_city',
        description: 'Get all tourist places in a specific city. Returns places sorted by popularity rank. Cities available: Mathura, Vrindavan, Agra, Govardhan, Barsana, Gokul.',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: 'City name (e.g., "Mathura", "Vrindavan", "Agra")' }
            },
            required: ['city']
        },
        execute: ({ city }) => {
            const places = db.getPlacesByCity(city);
            return places.map(formatPlaceForLLM);
        }
    },

    get_places_by_cities: {
        name: 'get_places_by_cities',
        description: 'Get all tourist places across multiple cities at once. Useful for multi-city itinerary planning.',
        parameters: {
            type: 'object',
            properties: {
                cities: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of city names (e.g., ["Mathura", "Vrindavan"])'
                }
            },
            required: ['cities']
        },
        execute: ({ cities }) => {
            const places = db.getPlacesByMultipleCities(cities);
            return places.map(formatPlaceForLLM);
        }
    },

    get_highlights: {
        name: 'get_highlights',
        description: 'Get the must-visit highlight places in a city (or all cities if no city specified). These are the top-rated, most iconic places.',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: 'Optional city name. If omitted, returns highlights from all cities.' }
            },
            required: []
        },
        execute: ({ city }) => {
            const highlights = db.getHighlights(city || null);
            return highlights.map(formatPlaceForLLM);
        }
    },

    get_place_by_id: {
        name: 'get_place_by_id',
        description: 'Get detailed information about a specific place by its ID.',
        parameters: {
            type: 'object',
            properties: {
                place_id: { type: 'string', description: 'The place ID (e.g., "mathura_001")' }
            },
            required: ['place_id']
        },
        execute: ({ place_id }) => {
            const place = db.getPlaceById(place_id);
            return place ? formatPlaceForLLM(place) : null;
        }
    },

    get_cities: {
        name: 'get_cities',
        description: 'Get the list of all cities available in the database with place counts.',
        parameters: {
            type: 'object',
            properties: {},
            required: []
        },
        execute: () => {
            const cities = db.getCities();
            return cities.map(city => ({
                name: city,
                place_count: db.getPlacesByCity(city).length
            }));
        }
    },

    get_category_distribution: {
        name: 'get_category_distribution',
        description: 'Get the distribution of place categories (temple, monument, ghat, etc.) in a city or across all cities.',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: 'Optional city name. If omitted, returns distribution across all cities.' }
            },
            required: []
        },
        execute: ({ city }) => {
            return db.getCategoryDistribution(city || null);
        }
    },

    // ═══ Scoring & Filtering Tools ═══

    score_and_rank_places: {
        name: 'score_and_rank_places',
        description: 'Score and rank an array of places based on user preferences (interests, group type, budget level) and optional weather conditions. Returns the places sorted by relevance score.',
        parameters: {
            type: 'object',
            properties: {
                places: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Array of place objects to score'
                },
                interests: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'User interests (e.g., ["pilgrimage", "heritage", "nature", "food"])'
                },
                group_type: {
                    type: 'string',
                    description: 'Type of travel group: solo, couple, family, group, or elderly'
                },
                budget_level: {
                    type: 'string',
                    description: 'Budget level: low, medium, or high'
                },
                weather: {
                    type: 'object',
                    description: 'Optional current weather data with temp, description, is_rainy, is_hot fields'
                }
            },
            required: ['places', 'interests']
        },
        execute: ({ places, interests = [], group_type = 'family', budget_level = 'medium', weather = null }) => {
            // Need raw DB places for scoring (not formatted ones)
            const intent = { interests, group_type, budget_level, cities: [] };
            const scored = rankPlaces(places, intent, weather);
            return scored.map(p => ({
                ...formatPlaceForLLM(p),
                score: p.score
            }));
        }
    },

    enforce_diversity: {
        name: 'enforce_diversity',
        description: 'Enforce diversity in place selection — ensures variety across categories and cities, surfaces hidden gems. Call this AFTER scoring to get a balanced selection.',
        parameters: {
            type: 'object',
            properties: {
                places: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Scored/ranked array of place objects'
                },
                max_per_category: {
                    type: 'number',
                    description: 'Maximum places per category (default: 4)'
                },
                cities: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Target cities for minimum allocation'
                },
                total_needed: {
                    type: 'number',
                    description: 'Total number of places needed'
                }
            },
            required: ['places', 'total_needed']
        },
        execute: ({ places, max_per_category = 4, cities = [], total_needed = 20 }) => {
            const minPerCity = cities.length > 0 ? Math.max(3, total_needed / cities.length) : 0;
            const result = enforceDiversity(places, {
                maxPerCategory: max_per_category,
                cities,
                minPerCity: Math.floor(minPerCity),
                totalNeeded: total_needed,
                surfaceHiddenGems: true
            });
            return result.map(formatPlaceForLLM);
        }
    },

    // ═══ Budget Tool ═══

    estimate_budget: {
        name: 'estimate_budget',
        description: 'Estimate the total trip budget breakdown (food, transport, accommodation, entry fees) based on the number of days, budget level, and number of people.',
        parameters: {
            type: 'object',
            properties: {
                days: { type: 'number', description: 'Number of trip days' },
                budget_level: { type: 'string', description: 'Budget level: low, medium, or high' },
                people: { type: 'number', description: 'Number of travelers (default: 2)' },
                places: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Array of places to visit (for calculating entry fees)'
                }
            },
            required: ['days', 'budget_level']
        },
        execute: ({ days, budget_level, people = 2, places = [] }) => {
            return estimateBudget({ places, days, budgetLevel: budget_level, people });
        }
    },

    // ═══ Weather Tool ═══

    fetch_weather: {
        name: 'fetch_weather',
        description: 'Fetch current live weather data for a city in the Braj region from OpenWeatherMap API. Returns temperature, humidity, wind speed, conditions, and travel-relevant flags (is_rainy, is_hot, is_cold).',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: 'City name (e.g., "Mathura", "Vrindavan", "Agra")' }
            },
            required: ['city']
        },
        execute: async ({ city }) => {
            const coords = getCityCentroid(city);
            if (!coords) {
                return { error: `Unknown city: ${city}. Available: Mathura, Vrindavan, Agra, Govardhan, Barsana, Gokul.` };
            }
            if (!OWM_KEY) {
                return { error: 'Weather API key not configured.' };
            }

            try {
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${OWM_KEY}&units=metric`;
                const res = await fetch(url);
                if (!res.ok) return { error: `Weather API returned ${res.status}` };
                const data = await res.json();

                return {
                    city,
                    temp: Math.round(data.main.temp),
                    feels_like: Math.round(data.main.feels_like),
                    humidity: data.main.humidity,
                    description: data.weather?.[0]?.description || 'N/A',
                    icon: data.weather?.[0]?.icon || '',
                    wind_speed: data.wind?.speed || 0,
                    visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
                    is_rainy: ['rain', 'drizzle', 'thunderstorm'].some(w =>
                        (data.weather?.[0]?.main || '').toLowerCase().includes(w)
                    ),
                    is_hot: data.main.temp > 35,
                    is_cold: data.main.temp < 15
                };
            } catch (e) {
                return { error: `Weather fetch failed: ${e.message}` };
            }
        }
    },

    // ═══ Geo Tools ═══

    get_city_centroid: {
        name: 'get_city_centroid',
        description: 'Get the geographic center coordinates (lat, lng) of a city. Useful for route planning.',
        parameters: {
            type: 'object',
            properties: {
                city: { type: 'string', description: 'City name' }
            },
            required: ['city']
        },
        execute: ({ city }) => {
            const centroid = getCityCentroid(city);
            return centroid || { error: `Unknown city: ${city}` };
        }
    },

    optimize_route: {
        name: 'optimize_route',
        description: 'Optimize the visiting order of places using nearest-neighbor algorithm to minimize travel distance. Takes places with lat/lng coordinates and returns them in optimized order.',
        parameters: {
            type: 'object',
            properties: {
                places: {
                    type: 'array',
                    items: { type: 'object' },
                    description: 'Array of place objects with lat and lng fields'
                },
                start_city: {
                    type: 'string',
                    description: 'Starting city for route optimization'
                }
            },
            required: ['places', 'start_city']
        },
        execute: ({ places, start_city }) => {
            const centroid = getCityCentroid(start_city);
            if (!centroid) return places;
            return optimizeRoute(places, centroid.lat, centroid.lng).map(formatPlaceForLLM);
        }
    }
};

// ─── Registry API ───────────────────────────────────────────────────

/**
 * Agent-to-tool mapping — which tools each agent can access.
 */
const AGENT_TOOLS = {
    'Supervisor': ['delegate_to_agent'],
    'ItineraryAgent': [
        'get_places_by_cities', 'get_places_by_city', 'search_places',
        'score_and_rank_places', 'enforce_diversity',
        'fetch_weather', 'estimate_budget',
        'optimize_route', 'get_city_centroid'
    ],
    'RecommenderAgent': [
        'search_places', 'get_places_by_city', 'get_highlights',
        'score_and_rank_places', 'enforce_diversity',
        'get_category_distribution'
    ],
    'WeatherAgent': ['fetch_weather', 'get_city_centroid'],
    'ChatAgent': [
        'search_places', 'get_places_by_city', 'get_highlights',
        'get_place_by_id', 'get_cities'
    ],
    'BudgetAgent': ['estimate_budget', 'get_places_by_city']
};

/**
 * Get tools available for a specific agent.
 * @param {string} agentName
 * @returns {Object[]} array of tool definitions
 */
function getToolsForAgent(agentName) {
    const toolNames = AGENT_TOOLS[agentName] || [];
    return toolNames
        .map(name => TOOLS[name])
        .filter(Boolean);
}

/**
 * Get Gemini-compatible function declarations for specified tool names.
 * @param {string[]} toolNames
 * @returns {Object[]} array of { name, description, parameters }
 */
function getDeclarations(toolNames) {
    return toolNames
        .map(name => TOOLS[name])
        .filter(Boolean)
        .map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }));
}

/**
 * Execute a tool by name with given arguments.
 * @param {string} name — tool name
 * @param {Object} args — tool arguments
 * @returns {Promise<*>} tool result
 */
async function executeTool(name, args = {}) {
    const tool = TOOLS[name];
    if (!tool) {
        throw new Error(`Unknown tool: ${name}`);
    }

    console.log(`[ToolRegistry] Executing tool: ${name}(${JSON.stringify(args).substring(0, 100)})`);

    try {
        const result = await tool.execute(args);
        console.log(`[ToolRegistry] Tool ${name} returned ${Array.isArray(result) ? result.length + ' items' : typeof result}`);
        return result;
    } catch (err) {
        console.error(`[ToolRegistry] Tool ${name} error:`, err.message);
        return { error: err.message };
    }
}

/**
 * Get all registered tool names.
 */
function getAllToolNames() {
    return Object.keys(TOOLS);
}

module.exports = {
    getToolsForAgent,
    getDeclarations,
    executeTool,
    getAllToolNames,
    AGENT_TOOLS,
    TOOLS
};
