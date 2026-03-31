const express = require('express');
const router = express.Router();
const SupervisorAgent = require('../agents/SupervisorAgent');
const ItineraryAgent = require('../agents/ItineraryAgent');
const WeatherAgent = require('../agents/WeatherAgent');
const db = require('../db/database');
const llm = require('../llm/connector');
const messageBus = require('../agents/core/MessageBus');
const { generateId, sanitizeInput } = require('../utils/helpers');
const { enrichWithImage, getCityImage, CITY_IMAGES } = require('../utils/place-images');
const { chatLimiter } = require('../../../shared/security');
const { validate, chatSchema } = require('../../../shared/validators');

// ─── Initialize Multi-Agent System ─────────────────────────────
const supervisor = new SupervisorAgent();
const directItineraryAgent = new ItineraryAgent();
const directWeatherAgent = new WeatherAgent();

console.log('[API] Multi-Agent System initialized');

// ─── Main Chat Endpoint (Supervisor Agent handles all routing) ──

router.post('/chat', chatLimiter(), validate(chatSchema), async (req, res) => {
    try {
        const { message, sessionId, language } = req.body;
        const userLang = language || 'en';

        const sanitized = sanitizeInput(message);
        let sid = sessionId;

        if (!sid) {
            sid = generateId();
            try { db.createSession(sid); } catch (e) { }
        }

        // ══════════════════════════════════════════════════════════
        // MULTI-AGENT: Supervisor Agent handles ALL routing via LLM
        // Replaces the old hardcoded switch statement
        // ══════════════════════════════════════════════════════════
        const response = await supervisor.handleRequest(sanitized, {
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
