const express = require('express');
const router = express.Router();
const orchestrator = require('../agents/orchestrator');
const itineraryAgent = require('../agents/itinerary');
const recommender = require('../agents/recommender');
const chatAgent = require('../agents/chat');
const weatherAgent = require('../agents/weather');
const db = require('../db/database');
const llm = require('../llm/connector');
const { generateId, sanitizeInput } = require('../utils/helpers');
const { enrichWithImage, getCityImage, CITY_IMAGES } = require('../utils/place-images');
const { agentAuth, requireAuth } = require('../middleware/agent-auth');

// Apply non-blocking auth to all routes
router.use(agentAuth);

router.post('/chat', async (req, res) => {
    try {
        const { message, sessionId, language, weather_preference } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });
        const userLang = language || 'en';

        const sanitized = sanitizeInput(message);
        let sid = sessionId;

        // Ensure session exists and is linked to user
        if (!sid) {
            sid = generateId();
        }
        try {
            db.ensureSession(sid, req.userId);
            // Auto-set session title from user's message if it's still default
            const session = db.getDB().prepare('SELECT title FROM chat_sessions WHERE id = ?').get(sid);
            if (!session || !session.title || session.title === 'New Chat') {
                const title = sanitized.length > 60 ? sanitized.substring(0, 60) + '...' : sanitized;
                db.updateSessionTitle(sid, title);
            }
            // Link to user if authenticated
            if (req.userId) {
                db.linkSessionToUser(sid, req.userId);
            }
        } catch (e) {
            console.error('[API] Session creation/linkage error:', e.message);
        }

        const routing = await orchestrator.classify(sanitized);
        let response;

        switch (routing.intent) {
            case 'itinerary':
                const primaryCity = (routing.cities && routing.cities[0]) || 'Mathura';

                // If no weather preference provided, fetch weather and ask user
                if (!weather_preference) {
                    try {
                        const weatherResult = await weatherAgent.getWeather(primaryCity);
                        if (weatherResult.success && weatherResult.data) {
                            const weatherOpts = generateWeatherOptions(weatherResult.data);
                            return res.json({
                                sessionId: sid,
                                type: 'weather_preference',
                                weather: weatherResult.data,
                                options: weatherOpts,
                                intent: routing,
                                originalMessage: sanitized
                            });
                        }
                    } catch (e) {
                        console.warn('[API] Weather preference check failed, proceeding without:', e.message);
                    }
                }

                // Generate itinerary (with or without weather preference)
                response = await itineraryAgent.plan({
                    cities: routing.cities,
                    days: routing.days,
                    interests: routing.interests,
                    pace: routing.pace,
                    group_type: routing.group_type || 'family',
                    budget_level: routing.budget_level || 'medium',
                    language: userLang,
                    weather_preference: weather_preference || null
                });

                try {
                    db.saveMessage(sid, 'user', sanitized, { intent: 'itinerary' });
                    db.saveMessage(sid, 'assistant', JSON.stringify(response.itinerary), { type: 'itinerary' });
                } catch (e) { console.error('[API] Save itinerary msg:', e.message); }

                return res.json({
                    sessionId: sid,
                    type: 'itinerary',
                    intent: routing,
                    itinerary: response.itinerary,
                    source: response.source
                });

            case 'recommend':
                response = await recommender.recommend({
                    query: routing.query,
                    cities: routing.cities,
                    interests: routing.interests,
                    group_type: routing.group_type || 'family',
                    budget_level: routing.budget_level || 'medium',
                    language: userLang
                });
                try {
                    db.saveMessage(sid, 'user', sanitized, { intent: 'recommend' });
                    db.saveMessage(sid, 'assistant', JSON.stringify(response), { type: 'recommend' });
                } catch (e) { console.error('[API] Save recommend msg:', e.message); }

                return res.json({
                    sessionId: sid,
                    type: 'recommend',
                    intent: routing,
                    recommendations: response.recommendations || [],
                    summary: response.summary || '',
                    source: response.source
                });

            case 'weather':
                const city = routing.cities[0] || 'Mathura';
                response = await weatherAgent.getWeather(city);
                try {
                    db.saveMessage(sid, 'user', sanitized, { intent: 'weather' });
                    db.saveMessage(sid, 'assistant', response.text, { type: 'weather' });
                } catch (e) { console.error('[API] Save weather msg:', e.message); }

                return res.json({
                    sessionId: sid,
                    type: 'weather',
                    intent: routing,
                    text: response.text,
                    data: response.data || null,
                    source: response.source
                });

            case 'search':
                const searchPrompt = `⚠️ MANDATORY: ALL prices MUST be in Indian Rupees (₹). NEVER use $, USD, or any other currency. Convert to ₹ if needed.

You are a helpful travel search assistant for the Braj region of India. The user wants live, up-to-date information from the web.

Use Google Search to find the LATEST information and provide a comprehensive, well-structured answer.

INCLUDE (when relevant):
- 📍 Location and how to get there
- 🕐 Opening hours and timings
- 🎫 Entry fees / ticket prices (in ₹)
- ⭐ Ratings and reviews summary
- 🏨 Hotels with names, price range PER NIGHT in ₹, Google ratings, budget tier, and ACTUAL booking URLs
- 🍽️ Restaurants with names, specialties, and price range in ₹
- 🚕 Transport options with fares in ₹
- 📸 Key highlights & what to see
- 💡 Practical visitor tips
- 🗺️ Google Maps link for each hotel/place

ALL PRICES MUST BE IN INDIAN RUPEES (₹). If you find a price in USD, convert it: $1 ≈ ₹84. Never show $ or USD.

BUDGET TIER CATEGORIES (use these exact labels):
- 🟢 Budget: up to ₹1,500/night
- 🔵 Mid-Range: ₹1,500–₹4,000/night
- 🟡 Premium: ₹4,000–₹8,000/night
- 🔴 Luxury: ₹8,000+/night

HOTEL/ACCOMMODATION FORMAT (use this EXACT format for EACH hotel):
### 🏨 [Hotel Name](https://booking-site-url.com/hotel-page)
- ⭐ **4.2/5** (Google Rating) · 🏷️ **Mid-Range**
- 💰 **₹2,000–₹3,500/night**
- 📍 [View on Google Maps](https://www.google.com/maps/search/?api=1&query=Hotel+Name+City+India)
- ✅ Highlights: Free WiFi, AC, Restaurant, Near Taj Mahal
- 🔗 Book on: [MakeMyTrip](https://www.makemytrip.com) · [Booking.com](https://www.booking.com) · [Goibibo](https://www.goibibo.com)

When listing hotels, GROUP them by budget tier with clear section headers:
## 🟢 Budget Hotels (up to ₹1,500/night)
## 🔵 Mid-Range Hotels (₹1,500–₹4,000/night)
## 🟡 Premium Hotels (₹4,000–₹8,000/night)
## 🔴 Luxury Hotels (₹8,000+/night)

CRITICAL FORMATTING RULES:
1. Use markdown headers (## and ###) with emojis for sections
2. For ALL hotel names — link to their ACTUAL page on a booking site (MakeMyTrip, Booking.com, OYO, Goibibo, Agoda, or Trivago)
3. For EVERY hotel, ALWAYS include: price range per night in ₹, Google rating out of 5, budget tier label, Google Maps link, and booking links
4. Use **bold** for price ranges and ratings
5. Use bullet points for listing options
6. ALL prices must be in Indian Rupees (₹) — NEVER use $, USD, or any other currency. This is for Indian tourists.
7. Keep response well-structured and 400-600 words.

REMINDER: Use ₹ symbol for ALL prices. Do NOT use $ or USD anywhere.`;

                response = await llm.generateResponse(searchPrompt, sanitized, [], { useSearch: true });

                // Post-process: force ₹ currency if LLM slipped and used $
                if (response.text) {
                    response.text = response.text.replace(/\$(\d)/g, '₹$1');
                }

                try {
                    db.saveMessage(sid, 'user', sanitized, { intent: 'search' });
                    db.saveMessage(sid, 'assistant', response.text || '', { type: 'search' });
                } catch (e) { console.error('[API] Save search msg:', e.message); }

                return res.json({
                    sessionId: sid,
                    type: 'search',
                    intent: routing,
                    text: response.text,
                    source: response.source,
                    groundingMetadata: response.groundingMetadata || null
                });

            default:
                response = await chatAgent.chat(sanitized, sid, userLang);
                // Save messages for chat intent (chat.js also saves, but this ensures consistency)
                try {
                    db.saveMessage(sid, 'user', sanitized, { intent: 'chat' });
                    db.saveMessage(sid, 'assistant', response.text || '', { type: 'chat' });
                } catch (e) { console.error('[API] Save chat msg:', e.message); }
                return res.json({
                    sessionId: sid,
                    type: 'chat',
                    intent: routing,
                    text: response.text,
                    source: response.source,
                    groundingMetadata: response.groundingMetadata || null
                });
        }
    } catch (error) {
        console.error('[API /chat] Error:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

router.post('/search', async (req, res) => {
    try {
        const { query, placeName, city } = req.body;
        if (!query && !placeName) return res.status(400).json({ error: 'query or placeName required' });

        const searchQuery = query || `${placeName}${city ? ', ' + city : ''}, India`;

        const SEARCH_PROMPT = `⚠️ MANDATORY: ALL prices MUST be in Indian Rupees (₹). NEVER use $, USD, or any other currency. Convert to ₹ if needed ($1 ≈ ₹84).

You are a helpful travel search assistant for the Braj region of India. The user wants live, up-to-date information from the web about a specific place, hotel, restaurant, or travel topic.

Use Google Search to find the LATEST information and provide a comprehensive, well-structured answer.

INCLUDE (when relevant):
- 📍 Location and how to get there
- 🕐 Opening hours and timings
- 🎫 Entry fees / ticket prices (in ₹)
- ⭐ Ratings and reviews summary
- 🏨 Nearby hotels with ACTUAL booking URLs, price per night in ₹, Google rating, budget tier, and Google Maps link
- 🍽️ Nearby restaurants with price range in ₹
- 📸 Key highlights & what to see
- 💡 Practical visitor tips
- 🗺️ Google Maps link for each hotel/place

ALL PRICES MUST BE IN INDIAN RUPEES (₹). If you find a price in USD, convert it: $1 ≈ ₹84. Never show $ or USD.

BUDGET TIER CATEGORIES (use these exact labels):
- 🟢 Budget: up to ₹1,500/night
- 🔵 Mid-Range: ₹1,500–₹4,000/night
- 🟡 Premium: ₹4,000–₹8,000/night
- 🔴 Luxury: ₹8,000+/night

HOTEL/ACCOMMODATION FORMAT (use this EXACT format for EACH hotel):
### 🏨 [Hotel Name](https://booking-site-url.com/hotel-page)
- ⭐ **4.2/5** (Google Rating) · 🏷️ **Mid-Range**
- 💰 **₹2,000–₹3,500/night**
- 📍 [View on Google Maps](https://www.google.com/maps/search/?api=1&query=Hotel+Name+City+India)
- ✅ Highlights: Free WiFi, AC, Restaurant, Near attraction
- 🔗 Book on: [MakeMyTrip](https://www.makemytrip.com) · [Booking.com](https://www.booking.com) · [Goibibo](https://www.goibibo.com)

When listing hotels, GROUP them by budget tier with clear section headers.

CRITICAL FORMATTING RULES:
1. Use markdown headers (## and ###) with emojis for sections
2. For ALL hotel names — link to their ACTUAL page on a booking site (MakeMyTrip, Booking.com, OYO, Goibibo, Agoda, or Trivago)
3. For EVERY hotel, ALWAYS include: price range per night in ₹, Google rating out of 5, budget tier label, Google Maps link, and booking links
4. Use **bold** for price ranges and ratings
5. Use bullet points for listing options
6. ALL prices must be in Indian Rupees (₹) — NEVER use $, USD, or any other currency. This is for Indian tourists.
7. Keep response well-structured and 400-600 words.

REMINDER: Use ₹ symbol for ALL prices. Do NOT use $ or USD anywhere.`;

        const result = await llm.generateResponse(SEARCH_PROMPT, searchQuery, [], { useSearch: true });

        if (!result.success) {
            return res.status(500).json({ error: 'Search failed. Please try again.' });
        }

        // Post-process: force ₹ currency if LLM slipped and used $
        if (result.text) {
            result.text = result.text.replace(/\$(\d)/g, '₹$1');
        }

        res.json({
            text: result.text,
            query: searchQuery,
            groundingMetadata: result.groundingMetadata || null,
            source: result.source
        });
    } catch (error) {
        console.error('[API /search] Error:', error);
        res.status(500).json({ error: 'Search failed. Please try again.' });
    }
});

router.post('/itinerary', async (req, res) => {
    try {
        const { cities, days, interests, pace } = req.body;
        const result = await itineraryAgent.plan({
            cities: cities || [],
            days: days || 1,
            interests: interests || [],
            pace: pace || 'moderate'
        });
        res.json(result);
    } catch (error) {
        console.error('[API /itinerary] Error:', error);
        res.status(500).json({ error: 'Failed to generate itinerary' });
    }
});

router.get('/places/suggest', (req, res) => {
    try {
        const { city, exclude, category } = req.query;
        if (!city) return res.json({ suggestions: [] });

        let places = db.getPlacesByCity(city);

        if (exclude) {
            const excludeSet = new Set(exclude.split(',').map(id => id.trim()));
            places = places.filter(p => !excludeSet.has(p.id));
        }

        const { rankPlaces } = require('../agents/scoring');
        const interests = category ? [category.toLowerCase()] : [];
        const scored = rankPlaces(places, { interests, cities: [city] });

        const suggestions = scored.slice(0, 5).map(p => ({
            id: p.id,
            name: p.name,
            city: p.city,
            category: p.category,
            description: p.description,
            estimated_visit_duration: p.estimated_visit_duration,
            crowd_level: p.crowd_level,
            highlight: !!p.highlight,
            score: p.score,
            image: p.image_url || null
        }));

        res.json({ suggestions });
    } catch (error) {
        console.error('[API /places/suggest] Error:', error);
        res.json({ suggestions: [] });
    }
});

router.get('/places', (req, res) => {
    try {
        const { city, category, q } = req.query;
        let places;

        if (q) {
            places = db.searchPlaces(q);
        } else if (city && category) {
            places = db.getPlacesByCategory(city, category);
        } else if (city) {
            places = db.getPlacesByCity(city);
        } else {
            places = db.getAllPlaces();
        }
        return res.json(places.map(enrichWithImage));
    } catch (error) {
        console.error('[API /places] Error:', error);
        res.status(500).json({ error: 'Failed to fetch places' });
    }
});

router.get('/places/:id', (req, res) => {
    try {
        const place = db.getPlaceById(req.params.id);
        if (!place) return res.status(404).json({ error: 'Place not found' });
        res.json(enrichWithImage(place));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch place' });
    }
});

router.get('/cities', (req, res) => {
    try {
        const cities = db.getCities().map(city => ({
            name: city,
            image: getCityImage(city),
            count: db.getPlacesByCity(city).length
        }));
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

router.get('/weather/:city', async (req, res) => {
    try {
        const result = await weatherAgent.getWeather(req.params.city);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

router.post('/session', (req, res) => {
    try {
        const id = generateId();
        db.createSession(id);
        res.json({ sessionId: id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

router.get('/session/:id/history', (req, res) => {
    try {
        const history = db.getSessionHistory(req.params.id);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.get('/health', async (req, res) => {
    const llmHealth = await llm.healthCheck();
    res.json({
        status: 'ok',
        places: db.getPlacesCount(),
        cities: db.getCities(),
        llm: llmHealth
    });
});

// ── USER ENDPOINTS (requires auth) ─────────────────────────

// Auth status check
router.get('/user/me', (req, res) => {
    if (!req.userId) return res.json({ authenticated: false });
    res.json({ authenticated: true, userId: req.userId });
});

// List user's chat sessions
router.get('/user/sessions', requireAuth, (req, res) => {
    try {
        const sessions = db.getSessionsByUser(req.userId);
        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get a session's messages
router.get('/user/sessions/:id', requireAuth, (req, res) => {
    try {
        const history = db.getSessionHistory(req.params.id, 100);
        res.json({ messages: history });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

// Save an itinerary
router.post('/user/itineraries', requireAuth, (req, res) => {
    try {
        const { title, cities, days, itinerary } = req.body;
        if (!itinerary) return res.status(400).json({ error: 'Itinerary data required' });

        const id = generateId();
        const saved = db.saveItinerary(
            id,
            req.userId,
            title || 'My Braj Yatra',
            cities || [],
            days || 1,
            itinerary
        );
        res.json({ success: true, itinerary: saved });
    } catch (error) {
        console.error('Save itinerary error:', error);
        res.status(500).json({ error: 'Failed to save itinerary' });
    }
});

// Get count of user's saved itineraries (lightweight)
router.get('/user/itineraries/count', requireAuth, (req, res) => {
    try {
        const count = db.getItineraryCount(req.userId);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch count' });
    }
});

// List user's saved itineraries
router.get('/user/itineraries', requireAuth, (req, res) => {
    try {
        const itineraries = db.getItinerariesByUser(req.userId);
        res.json({ itineraries });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch itineraries' });
    }
});

// Get a specific saved itinerary
router.get('/user/itineraries/:id', requireAuth, (req, res) => {
    try {
        const itinerary = db.getItineraryById(req.params.id);
        if (!itinerary) return res.status(404).json({ error: 'Not found' });
        res.json({ itinerary });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch itinerary' });
    }
});

// Delete a saved itinerary
router.delete('/user/itineraries/:id', requireAuth, (req, res) => {
    try {
        const deleted = db.deleteItinerary(req.params.id, req.userId);
        if (!deleted) return res.status(404).json({ error: 'Not found or not yours' });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete itinerary' });
    }
});

// ── WEATHER PREFERENCE HELPER ───────────────────────
function generateWeatherOptions(weather) {
    const temp = weather.temp;
    const isRainy = weather.is_rainy || (weather.description || '').toLowerCase().includes('rain');
    const isHot = temp > 32;
    const isCold = temp < 15;
    const isPleasant = !isRainy && !isHot && !isCold;

    if (isRainy) {
        return {
            condition: 'rainy',
            message: `It's currently raining in ${weather.city} (${temp}°C, ${weather.description}). How would you like to plan?`,
            choices: [
                { id: 'covered_first', icon: '🛕', label: 'Covered temples & museums first', desc: 'Indoor/covered sites in the morning, outdoor if rain clears later' },
                { id: 'normal_plan', icon: '🌧️', label: "Normal plan — I don't mind rain", desc: 'Follow the regular itinerary regardless of rain' }
            ]
        };
    }

    if (isHot) {
        return {
            condition: 'hot',
            message: `It's quite hot in ${weather.city} right now (${temp}°C, feels like ${weather.feels_like}°C). How would you like to arrange your day?`,
            choices: [
                { id: 'temples_first', icon: '🛕', label: 'Temples first, ghats in evening', desc: 'Visit cooler temple interiors during peak heat, enjoy ghats in the pleasant evening' },
                { id: 'early_outdoor', icon: '🌅', label: 'Early morning ghat visit, then temples', desc: 'Hit the ghats at sunrise before it heats up, temples during mid-day' },
                { id: 'indoor_focus', icon: '🏛️', label: 'Mostly indoor & shaded sites', desc: 'Prioritize museums, covered temples, and shaded spots' }
            ]
        };
    }

    if (isCold) {
        return {
            condition: 'cold',
            message: `It's chilly in ${weather.city} (${temp}°C, feels like ${weather.feels_like}°C). When would you prefer to start?`,
            choices: [
                { id: 'late_start', icon: '☀️', label: 'Start late morning when warmer', desc: 'Begin around 9-10 AM when the sun warms things up' },
                { id: 'early_start', icon: '🌅', label: 'Early morning as usual', desc: 'Start at 6 AM for peaceful darshan — carry warm layers' }
            ]
        };
    }

    // Pleasant weather — offer outdoor preferences
    return {
        condition: 'pleasant',
        message: `The weather in ${weather.city} is lovely (${temp}°C, ${weather.description})! Perfect for sightseeing. What would you like to do first?`,
        choices: [
            { id: 'ghats_first', icon: '🌊', label: 'Ghats & outdoor sites first', desc: 'Enjoy the pleasant weather at ghats, parikrama, and gardens in the morning' },
            { id: 'temples_first', icon: '🛕', label: 'Temple darshan first', desc: 'Start with early morning temple darshan, then outdoor sites' },
            { id: 'no_preference', icon: '✨', label: 'Surprise me — best order', desc: 'Let AI pick the optimal order based on timings and crowd levels' }
        ]
    };
}

module.exports = router;
