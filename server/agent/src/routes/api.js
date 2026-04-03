const express = require('express');
const router = express.Router();
const SupervisorAgent = require('../agents/SupervisorAgent');
const ItineraryAgent = require('../agents/ItineraryAgent');
const WeatherAgent = require('../agents/WeatherAgent');
const db = require('../db/database');
const llm = require('../llm/connector');
const messageBus = require('../agents/core/MessageBus');
const { generateId, sanitizeInput } = require('../utils/helpers');
const { enrichWithImage, getCityImage, getPlaceImage, CITY_IMAGES } = require('../utils/place-images');
const { chatLimiter } = require('../../../shared/security');
const { validate, chatSchema } = require('../../../shared/validators');
const { agentAuth } = require('../middleware/agent-auth');
const { streamResponse, setupSSE, sendSSEData } = require('../llm/streaming');
const { CHAT_PROMPT } = require('../prompts/system-prompts');

// ─── Initialize Multi-Agent System ─────────────────────────────
const supervisor = new SupervisorAgent();
const directItineraryAgent = new ItineraryAgent();
const directWeatherAgent = new WeatherAgent();

console.log('[API] Multi-Agent System initialized');

// ─── Main Chat Endpoint (Supervisor Agent handles all routing) ──

router.post('/chat', chatLimiter(), agentAuth, validate(chatSchema), async (req, res) => {
    try {
        const { message, sessionId, language } = req.body;
        const userLang = language || 'en';

        const sanitized = sanitizeInput(message);
        let sid = sessionId;

        if (!sid) {
            sid = generateId();
            try { db.createSession(sid, req.userId); } catch (e) { }
        } else if (req.userId) {
            // Link existing session to user (backfill if it was anonymous)
            try { db.linkSessionToUser(sid, req.userId); } catch (e) { }
        }

        // ══════════════════════════════════════════════════════════
        // WEATHER PREFERENCE INTERCEPT
        // If this looks like an itinerary request and no weather_preference 
        // has been provided, ask the user for visit order preference first.
        // ══════════════════════════════════════════════════════════
        const isItineraryRequest = /plan\s+a\s+\d+-day.*itinerary/i.test(sanitized);
        const hasWeatherPref = req.body.weather_preference;

        if (isItineraryRequest && !hasWeatherPref) {
            console.log('[API] Itinerary request detected without weather preference — fetching weather first');

            // Extract the primary city from the message
            const cityMatch = sanitized.match(/covering\s+([A-Za-z, ]+?)[\.\!]/);
            const citiesRaw = cityMatch ? cityMatch[1] : 'Mathura';
            const primaryCity = citiesRaw.split(',')[0].trim();

            try {
                const toolRegistry = require('../agents/core/ToolRegistry');
                const weatherData = await toolRegistry.executeTool('fetch_weather', { city: primaryCity });

                const weather = weatherData || {};
                const temp = weather.temp || 30;
                const isRainy = weather.is_rainy || false;
                const isHot = temp > 32;
                const isCold = temp < 15;

                // Build weather-aware suggestions
                let suggestion = '';
                if (isRainy) suggestion = 'Since it\'s rainy, indoor temples and covered monuments are recommended first.';
                else if (isHot) suggestion = 'It\'s hot — start with indoor temples & ghats early morning, monuments later.';
                else if (isCold) suggestion = 'It\'s cold — start at a comfortable pace, ghats after the sun warms up.';
                else suggestion = 'Weather is pleasant — perfect for any visit order!';

                // Save user message to history
                try {
                    db.saveMessage(sid, 'user', sanitized, { intent: 'itinerary' });
                } catch (e) { }

                return res.json({
                    sessionId: sid,
                    type: 'weather_preference',
                    weather: {
                        city: primaryCity,
                        temp: weather.temp || 30,
                        feels_like: weather.feels_like || weather.temp || 30,
                        description: weather.description || 'Clear sky',
                        humidity: weather.humidity || 50,
                        wind_speed: weather.wind_speed || 3,
                        is_rainy: isRainy,
                        is_hot: isHot,
                        is_cold: isCold
                    },
                    options: {
                        message: `${suggestion} Choose your preferred visit order:`,
                        choices: [
                            { id: 'temples_first', icon: '🛕', label: 'Temples First', desc: 'Start with sacred temples & darshan, then ghats and markets' },
                            { id: 'ghats_first', icon: '🌊', label: 'Ghats First', desc: 'Begin with holy bath & ghat visits, then temples' },
                            { id: 'monuments_first', icon: '🏛️', label: 'Monuments First', desc: 'Start with heritage sites & forts, temples later' },
                            { id: 'auto', icon: '🔀', label: 'AI Decides', desc: 'Let BrajYatra AI choose the best order based on weather' },
                        ]
                    },
                    originalMessage: sanitized
                });
            } catch (weatherErr) {
                console.error('[API] Weather check failed, proceeding with itinerary:', weatherErr.message);
                // Fall through to normal supervisor flow if weather fails
            }
        }

        // ══════════════════════════════════════════════════════════
        // MULTI-AGENT: Supervisor Agent handles ALL routing via LLM
        // Replaces the old hardcoded switch statement
        // ══════════════════════════════════════════════════════════
        
        // If weather_preference was provided, append it to the message
        const finalMessage = hasWeatherPref 
            ? `${sanitized} Visit order preference: ${hasWeatherPref === 'temples_first' ? 'temples and darshan first, then ghats and markets' : hasWeatherPref === 'ghats_first' ? 'ghats and holy bath first, then temples' : hasWeatherPref === 'monuments_first' ? 'monuments and heritage sites first, then temples' : 'auto — decide based on weather conditions'}.`
            : sanitized;

        // Inject session history for multi-turn context
        try {
            const history = db.getSessionHistory(sid, 6);
            supervisor.setSessionHistory(history.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                content: m.content
            })));
        } catch (e) { }

        const response = await supervisor.handleRequest(finalMessage, {
            sessionId: sid,
            language: userLang
        });

        // Save to chat history
        try {
            db.saveMessage(sid, 'user', sanitized, { intent: response.intent?.intent || 'chat' });
            const assistantContent = response.itinerary
                ? JSON.stringify(response.itinerary)
                : response.recommendations
                    ? JSON.stringify(response.recommendations)
                    : response.text || '';
            db.saveMessage(sid, 'assistant', assistantContent, { type: response.type });

            // Auto-set session title from first user message
            try {
                const history = db.getSessionHistory(sid, 2);
                if (history.length <= 2) {
                    const title = sanitized.length > 50 ? sanitized.substring(0, 50) + '...' : sanitized;
                    db.updateSessionTitle(sid, title);
                }
            } catch (e) { }
        } catch (e) { }

        // Return response with sessionId and agent trace
        return res.json({
            sessionId: sid,
            ...response
        });

    } catch (error) {
        console.error('[API /chat] Error:', error);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// ─── SSE Streaming Chat Endpoint ────────────────────────────────

router.post('/chat/stream', chatLimiter(), agentAuth, validate(chatSchema), async (req, res) => {
    try {
        const { message, sessionId, language } = req.body;
        const sanitized = sanitizeInput(message);
        let sid = sessionId;

        if (!sid) {
            sid = generateId();
            try { db.createSession(sid, req.userId); } catch (e) { }
        } else if (req.userId) {
            try { db.linkSessionToUser(sid, req.userId); } catch (e) { }
        }

        // Set up SSE
        setupSSE(res);

        // Send session ID first
        sendSSEData(res, { type: 'session', sessionId: sid });

        // Build history context
        let history = [];
        try {
            const h = db.getSessionHistory(sid, 6);
            history = h.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                content: m.content
            }));
        } catch (e) { }

        // Stream the response
        const systemPrompt = CHAT_PROMPT || `You are BrajYatra AI, a knowledgeable and warm travel assistant specializing in the sacred Braj region of India (Mathura, Vrindavan, Agra, Govardhan, Barsana, Gokul). Help users plan pilgrimages, recommend places, share history and stories. Respond in ${language === 'hi' ? 'Hindi' : 'English'}.`;

        await streamResponse(res, systemPrompt, sanitized, history, {
            onComplete: (fullText) => {
                // Save to chat history
                try {
                    db.saveMessage(sid, 'user', sanitized, { intent: 'chat' });
                    db.saveMessage(sid, 'assistant', fullText, { type: 'text' });

                    // Auto-set session title
                    const hist = db.getSessionHistory(sid, 2);
                    if (hist.length <= 2) {
                        const title = sanitized.length > 50 ? sanitized.substring(0, 50) + '...' : sanitized;
                        db.updateSessionTitle(sid, title);
                    }
                } catch (e) { }
            },
        });

    } catch (error) {
        console.error('[API /chat/stream] Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Streaming failed.' });
        } else {
            res.end();
        }
    }
});

// ─── Direct Itinerary Endpoint ──────────────────────────────────

router.post('/itinerary', async (req, res) => {
    try {
        const { cities, days, interests, pace } = req.body;
        const result = await directItineraryAgent.plan({
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

// ─── Places Endpoints (unchanged) ───────────────────────────────

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

// ─── Place Photo Proxy (Google Places Photos API) ───────────────
router.get('/places/:id/photo', async (req, res) => {
    try {
        const place = db.getPlaceById(req.params.id);
        if (!place) return res.status(404).json({ error: 'Place not found' });

        if (!place.photo_reference) {
            // No Google photo — redirect to static fallback
            const fallback = getPlaceImage ? getPlaceImage(place) : '/assets/images/krishna_janmabhoomi.png';
            return res.redirect(fallback);
        }

        const maxWidth = parseInt(req.query.maxwidth) || 400;
        const { fetchPhoto } = require('../utils/places-photos');
        const result = await fetchPhoto(place.photo_reference, maxWidth);

        if (!result.ok || !result.stream) {
            const fallback = getPlaceImage ? getPlaceImage(place) : '/assets/images/krishna_janmabhoomi.png';
            return res.redirect(fallback);
        }

        res.set({
            'Content-Type': result.contentType,
            'Cache-Control': 'public, max-age=86400',  // 24h browser cache
            'X-Photo-Source': 'google-places',
        });

        result.stream.pipe(res);
    } catch (error) {
        console.error('[API /places/:id/photo] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch photo' });
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

// ─── Weather Endpoint (now uses WeatherAgent) ───────────────────

router.get('/weather/:city', async (req, res) => {
    try {
        const result = await directWeatherAgent.run(
            `What is the current weather in ${req.params.city}?`,
            {}
        );
        res.json({
            success: result.success,
            text: result.text || 'Weather data unavailable.',
            source: result.source
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

// ─── Session Endpoints (unchanged) ──────────────────────────────

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

// ─── Health & Debug Endpoints ───────────────────────────────────

router.get('/health', async (req, res) => {
    const llmHealth = await llm.healthCheck();
    res.json({
        status: 'ok',
        architecture: 'multi-agent',
        agents: ['Supervisor', 'ItineraryAgent', 'RecommenderAgent', 'WeatherAgent', 'ChatAgent', 'BudgetAgent'],
        places: db.getPlacesCount(),
        cities: db.getCities(),
        llm: llmHealth
    });
});

/**
 * NEW: Agent trace endpoint — shows the inter-agent communication log
 * from the most recent request. Useful for debugging and demonstrating
 * the multi-agent architecture.
 */
router.get('/agent-trace', (req, res) => {
    res.json({
        trace: messageBus.getTraceSummary(),
        fullLog: messageBus.getLog()
    });
});

module.exports = router;
