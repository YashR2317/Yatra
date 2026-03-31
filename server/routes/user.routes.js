/**
 * User Data Routes — itinerary and session management.
 * These routes were previously missing — both AccountPage.jsx
 * and the agent frontend reference them but they were never defined.
 *
 * All routes require authentication via the agent-auth middleware.
 */
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../agent/src/middleware/agent-auth');
const db = require('../agent/src/db/database');
const { generateId } = require('../agent/src/utils/helpers');

// ─── Itineraries ────────────────────────────────────────────────

// List all itineraries for the authenticated user
router.get('/itineraries', requireAuth, (req, res) => {
    try {
        const itineraries = db.getItinerariesByUser(req.userId);
        res.json({ itineraries });
    } catch (err) {
        console.error('[User] Failed to fetch itineraries:', err.message);
        res.status(500).json({ error: 'Failed to fetch itineraries' });
    }
});

// Get itinerary count
router.get('/itineraries/count', requireAuth, (req, res) => {
    try {
        const count = db.getItineraryCount(req.userId);
        res.json({ count });
    } catch (err) {
        console.error('[User] Failed to count itineraries:', err.message);
        res.status(500).json({ error: 'Failed to count itineraries' });
    }
});

// Get a single itinerary by ID
router.get('/itineraries/:id', requireAuth, (req, res) => {
    try {
        const itinerary = db.getItineraryById(req.params.id);
        if (!itinerary) {
            return res.status(404).json({ error: 'Itinerary not found' });
        }
        // Ensure user owns this itinerary
        if (itinerary.user_id !== req.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json({ itinerary });
    } catch (err) {
        console.error('[User] Failed to fetch itinerary:', err.message);
        res.status(500).json({ error: 'Failed to fetch itinerary' });
    }
});

// Save a new itinerary
router.post('/itineraries', requireAuth, (req, res) => {
    try {
        const { title, cities, days, itinerary_data } = req.body;
        if (!title || !itinerary_data) {
            return res.status(400).json({ error: 'Title and itinerary data are required' });
        }
        const id = generateId();
        const result = db.saveItinerary(
            id,
            req.userId,
            title,
            cities || [],
            days || 1,
            itinerary_data
        );
        res.status(201).json({ success: true, itinerary: result });
    } catch (err) {
        console.error('[User] Failed to save itinerary:', err.message);
        res.status(500).json({ error: 'Failed to save itinerary' });
    }
});

// Delete an itinerary
router.delete('/itineraries/:id', requireAuth, (req, res) => {
    try {
        const deleted = db.deleteItinerary(req.params.id, req.userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Itinerary not found or access denied' });
        }
        res.json({ success: true });
    } catch (err) {
        console.error('[User] Failed to delete itinerary:', err.message);
        res.status(500).json({ error: 'Failed to delete itinerary' });
    }
});

// ─── Chat Sessions ──────────────────────────────────────────────

// List all sessions for the authenticated user
router.get('/sessions', requireAuth, (req, res) => {
    try {
        const sessions = db.getSessionsByUser(req.userId);
        res.json({ sessions });
    } catch (err) {
        console.error('[User] Failed to fetch sessions:', err.message);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get session messages
router.get('/sessions/:id', requireAuth, (req, res) => {
    try {
        const messages = db.getSessionHistory(req.params.id, 100);
        res.json({ messages });
    } catch (err) {
        console.error('[User] Failed to fetch session:', err.message);
        res.status(500).json({ error: 'Failed to fetch session messages' });
    }
});

module.exports = router;
