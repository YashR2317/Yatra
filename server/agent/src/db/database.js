const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'brajyatra.db');

let db = null;

function getDB() {
    if (db) return db;

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    return db;
}

function initSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS places (
            id TEXT PRIMARY KEY,
            city TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            address TEXT,
            lat REAL,
            lng REAL,
            description TEXT,
            opening_hours TEXT,
            entry_fee REAL,
            highlight INTEGER DEFAULT 0,
            popularity_rank INTEGER DEFAULT 999,
            tags TEXT DEFAULT '[]',
            estimated_visit_duration INTEGER DEFAULT 45,
            crowd_level TEXT DEFAULT 'medium',
            best_time_to_visit TEXT,
            nearby_places TEXT DEFAULT '[]',
            google_maps_link TEXT,
            images TEXT DEFAULT '[]',
            source TEXT
        );

        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT DEFAULT 'New Chat',
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
            content TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
        );

        CREATE TABLE IF NOT EXISTS saved_itineraries (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            cities TEXT DEFAULT '[]',
            days INTEGER DEFAULT 1,
            itinerary_data TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_itineraries_user ON saved_itineraries(user_id);
    `);

    // Safe ALTER for existing DBs — add columns if missing
    try { db.exec("ALTER TABLE chat_sessions ADD COLUMN user_id TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE chat_sessions ADD COLUMN title TEXT DEFAULT 'New Chat'"); } catch (e) { }
    try { db.exec("ALTER TABLE places ADD COLUMN google_place_id TEXT"); } catch (e) { }
    try { db.exec("ALTER TABLE places ADD COLUMN photo_reference TEXT"); } catch (e) { }

    const ftsExists = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='places_fts'"
    ).get();

    if (!ftsExists) {
        db.exec(`
            CREATE VIRTUAL TABLE places_fts USING fts5(
                name, description, category, tags, city,
                content='places',
                content_rowid='rowid'
            );

            CREATE TRIGGER IF NOT EXISTS places_ai AFTER INSERT ON places BEGIN
                INSERT INTO places_fts(rowid, name, description, category, tags, city)
                VALUES (new.rowid, new.name, new.description, new.category, new.tags, new.city);
            END;

            CREATE TRIGGER IF NOT EXISTS places_ad AFTER DELETE ON places BEGIN
                INSERT INTO places_fts(places_fts, rowid, name, description, category, tags, city)
                VALUES ('delete', old.rowid, old.name, old.description, old.category, old.tags, old.city);
            END;

            CREATE TRIGGER IF NOT EXISTS places_au AFTER UPDATE ON places BEGIN
                INSERT INTO places_fts(places_fts, rowid, name, description, category, tags, city)
                VALUES ('delete', old.rowid, old.name, old.description, old.category, old.tags, old.city);
                INSERT INTO places_fts(rowid, name, description, category, tags, city)
                VALUES (new.rowid, new.name, new.description, new.category, new.tags, new.city);
            END;
        `);
    }
}

function getAllPlaces() {
    return getDB().prepare('SELECT * FROM places ORDER BY city, popularity_rank').all();
}

function getPlacesByCity(city) {
    return getDB().prepare(
        'SELECT * FROM places WHERE LOWER(city) = LOWER(?) ORDER BY popularity_rank'
    ).all(city);
}

function getPlaceById(id) {
    return getDB().prepare('SELECT * FROM places WHERE id = ?').get(id);
}

function getPlacesByCategory(city, category) {
    return getDB().prepare(
        'SELECT * FROM places WHERE LOWER(city) = LOWER(?) AND LOWER(category) = LOWER(?) ORDER BY popularity_rank'
    ).all(city, category);
}

function getHighlights(city) {
    if (city) {
        return getDB().prepare(
            'SELECT * FROM places WHERE LOWER(city) = LOWER(?) AND highlight = 1 ORDER BY popularity_rank'
        ).all(city);
    }
    return getDB().prepare(
        'SELECT * FROM places WHERE highlight = 1 ORDER BY city, popularity_rank'
    ).all();
}

function searchPlaces(query) {
    if (!query || query.trim().length === 0) return [];
    
    const sanitized = query.replace(/[^\w\s]/g, '').trim();
    if (!sanitized) return [];

    try {
        return getDB().prepare(`
            SELECT p.*, rank
            FROM places_fts fts
            JOIN places p ON p.rowid = fts.rowid
            WHERE places_fts MATCH ?
            ORDER BY rank
            LIMIT 20
        `).all(sanitized + '*');
    } catch (e) {
        
        return getDB().prepare(
            `SELECT * FROM places WHERE name LIKE ? OR description LIKE ? OR category LIKE ? LIMIT 20`
        ).all(`%${sanitized}%`, `%${sanitized}%`, `%${sanitized}%`);
    }
}

function getNearbyPlaces(lat, lng, radiusKm = 5) {
    
    const degDelta = radiusKm / 111.0;
    const candidates = getDB().prepare(`
        SELECT * FROM places
        WHERE lat BETWEEN ? AND ?
          AND lng BETWEEN ? AND ?
    `).all(lat - degDelta, lat + degDelta, lng - degDelta, lng + degDelta);

    return candidates.filter(p => {
        const d = haversine(lat, lng, p.lat, p.lng);
        return d <= radiusKm;
    }).sort((a, b) => haversine(lat, lng, a.lat, a.lng) - haversine(lat, lng, b.lat, b.lng));
}

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createSession(id, userId = null) {
    getDB().prepare('INSERT OR IGNORE INTO chat_sessions (id, user_id) VALUES (?, ?)').run(id, userId);
    // Also update user_id if it was null before and now we have one
    if (userId) {
        getDB().prepare('UPDATE chat_sessions SET user_id = COALESCE(user_id, ?) WHERE id = ?').run(userId, id);
    }
    return { id, user_id: userId, created_at: new Date().toISOString() };
}

function ensureSession(id, userId = null) {
    const existing = getDB().prepare('SELECT id FROM chat_sessions WHERE id = ?').get(id);
    if (!existing) {
        getDB().prepare('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)').run(id, userId);
    } else if (userId) {
        getDB().prepare('UPDATE chat_sessions SET user_id = COALESCE(user_id, ?) WHERE id = ?').run(userId, id);
    }
}

function saveMessage(sessionId, role, content, metadata = {}) {
    // Auto-create session if it doesn't exist (prevents FK failures)
    ensureSession(sessionId);
    getDB().prepare(
        'INSERT INTO chat_messages (session_id, role, content, metadata) VALUES (?, ?, ?, ?)'
    ).run(sessionId, role, content, JSON.stringify(metadata));
    getDB().prepare(
        "UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?"
    ).run(sessionId);
}

function getSessionHistory(sessionId, limit = 20) {
    return getDB().prepare(
        'SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT ?'
    ).all(sessionId, limit).reverse();
}

function getPlacesCount() {
    const row = getDB().prepare('SELECT COUNT(*) as count FROM places').get();
    return row ? row.count : 0;
}

function getCities() {
    return getDB().prepare('SELECT DISTINCT city FROM places ORDER BY city').all().map(r => r.city);
}

function getPlacesByMultipleCities(cities) {
    if (!cities || cities.length === 0) return getAllPlaces();
    const placeholders = cities.map(() => '?').join(',');
    return getDB().prepare(
        `SELECT * FROM places WHERE LOWER(city) IN (${placeholders}) ORDER BY city, popularity_rank`
    ).all(...cities.map(c => c.toLowerCase()));
}

function getPlacesByTags(tags) {
    if (!tags || tags.length === 0) return [];
    const results = [];
    const seen = new Set();
    for (const tag of tags) {
        const matches = getDB().prepare(
            `SELECT * FROM places WHERE LOWER(tags) LIKE ? OR LOWER(category) LIKE ?`
        ).all(`%${tag.toLowerCase()}%`, `%${tag.toLowerCase()}%`);
        for (const m of matches) {
            if (!seen.has(m.id)) {
                results.push(m);
                seen.add(m.id);
            }
        }
    }
    return results;
}

function getCategoryDistribution(city = null) {
    if (city) {
        return getDB().prepare(
            `SELECT category, COUNT(*) as count FROM places WHERE LOWER(city) = LOWER(?) GROUP BY category ORDER BY count DESC`
        ).all(city);
    }
    return getDB().prepare(
        `SELECT category, COUNT(*) as count FROM places GROUP BY category ORDER BY count DESC`
    ).all();
}

function linkSessionToUser(sessionId, userId) {
    getDB().prepare('UPDATE chat_sessions SET user_id = ? WHERE id = ?').run(userId, sessionId);
}

function updateSessionTitle(sessionId, title) {
    getDB().prepare('UPDATE chat_sessions SET title = ? WHERE id = ?').run(title, sessionId);
}

function getSessionsByUser(userId, limit = 30) {
    return getDB().prepare(`
        SELECT s.id, s.title, s.created_at, s.updated_at,
               (SELECT content FROM chat_messages WHERE session_id = s.id AND role = 'user' ORDER BY id LIMIT 1) as first_message,
               (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) as message_count
        FROM chat_sessions s
        WHERE s.user_id = ?
          AND (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) > 0
        ORDER BY s.updated_at DESC
        LIMIT ?
    `).all(userId, limit);
}

function saveItinerary(id, userId, title, cities, days, itineraryData) {
    getDB().prepare(
        'INSERT INTO saved_itineraries (id, user_id, title, cities, days, itinerary_data) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, userId, title, JSON.stringify(cities), days, JSON.stringify(itineraryData));
    return { id, title, cities, days, created_at: new Date().toISOString() };
}

function getItinerariesByUser(userId) {
    return getDB().prepare(
        'SELECT id, title, cities, days, created_at FROM saved_itineraries WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId).map(row => ({
        ...row,
        cities: JSON.parse(row.cities || '[]')
    }));
}

function getItineraryById(id) {
    const row = getDB().prepare('SELECT * FROM saved_itineraries WHERE id = ?').get(id);
    if (!row) return null;
    return {
        ...row,
        cities: JSON.parse(row.cities || '[]'),
        itinerary_data: JSON.parse(row.itinerary_data || '{}')
    };
}

function deleteItinerary(id, userId) {
    const result = getDB().prepare('DELETE FROM saved_itineraries WHERE id = ? AND user_id = ?').run(id, userId);
    return result.changes > 0;
}

function getItineraryCount(userId) {
    const row = getDB().prepare('SELECT COUNT(*) as count FROM saved_itineraries WHERE user_id = ?').get(userId);
    return row ? row.count : 0;
}

function updatePlacePhoto(placeId, googlePlaceId, photoReference) {
    getDB().prepare(
        'UPDATE places SET google_place_id = ?, photo_reference = ? WHERE id = ?'
    ).run(googlePlaceId, photoReference, placeId);
}

module.exports = {
    getDB,
    getAllPlaces,
    getPlacesByCity,
    getPlaceById,
    getPlacesByCategory,
    getHighlights,
    searchPlaces,
    getNearbyPlaces,
    createSession,
    ensureSession,
    saveMessage,
    getSessionHistory,
    getPlacesCount,
    getCities,
    getPlacesByMultipleCities,
    getPlacesByTags,
    getCategoryDistribution,
    linkSessionToUser,
    updateSessionTitle,
    getSessionsByUser,
    saveItinerary,
    getItinerariesByUser,
    getItineraryById,
    deleteItinerary,
    getItineraryCount,
    updatePlacePhoto
};


