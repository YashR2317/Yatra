"""
SQLite Database Layer — Sync queries for places, sessions, itineraries.
Uses stdlib sqlite3 (sync) — matching the original sync API.
"""

import sqlite3
import json
import math
from pathlib import Path
from typing import Optional

# DB path — inside server_py/data/
DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "brajyatra.db"

_db: Optional[sqlite3.Connection] = None


def get_db() -> sqlite3.Connection:
    """Get or create the singleton SQLite connection."""
    global _db
    if _db is not None:
        return _db

    _db = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    _db.row_factory = sqlite3.Row
    _db.execute("PRAGMA journal_mode = WAL")
    _db.execute("PRAGMA foreign_keys = ON")
    _init_schema()
    return _db


def _init_schema():
    """Initialize the database schema (creates tables if not existing)."""
    db = _db

    db.executescript("""
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
    """)

    # Safe ALTER for existing DBs — add columns if missing
    for stmt in [
        "ALTER TABLE chat_sessions ADD COLUMN user_id TEXT",
        "ALTER TABLE chat_sessions ADD COLUMN title TEXT DEFAULT 'New Chat'",
        "ALTER TABLE places ADD COLUMN google_place_id TEXT",
        "ALTER TABLE places ADD COLUMN photo_reference TEXT",
    ]:
        try:
            db.execute(stmt)
        except sqlite3.OperationalError:
            pass  # Column already exists

    # Create FTS5 virtual table if not exists
    row = db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='places_fts'"
    ).fetchone()

    if not row:
        db.executescript("""
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
        """)


def _row_to_dict(row: sqlite3.Row) -> dict:
    """Convert a sqlite3.Row to a regular dict."""
    if row is None:
        return None
    return dict(row)


def _rows_to_dicts(rows: list) -> list[dict]:
    """Convert a list of sqlite3.Row to list of dicts."""
    return [dict(r) for r in rows]


# ─── Places Queries ──────────────────────────────────────────

def get_all_places() -> list[dict]:
    return _rows_to_dicts(
        get_db().execute("SELECT * FROM places ORDER BY city, popularity_rank").fetchall()
    )


def get_places_by_city(city: str) -> list[dict]:
    return _rows_to_dicts(
        get_db().execute(
            "SELECT * FROM places WHERE LOWER(city) = LOWER(?) ORDER BY popularity_rank",
            (city,),
        ).fetchall()
    )


def get_place_by_id(place_id: str) -> Optional[dict]:
    row = get_db().execute("SELECT * FROM places WHERE id = ?", (place_id,)).fetchone()
    return _row_to_dict(row)


def get_places_by_category(city: str, category: str) -> list[dict]:
    return _rows_to_dicts(
        get_db().execute(
            "SELECT * FROM places WHERE LOWER(city) = LOWER(?) AND LOWER(category) = LOWER(?) ORDER BY popularity_rank",
            (city, category),
        ).fetchall()
    )


def get_highlights(city: str = None) -> list[dict]:
    if city:
        return _rows_to_dicts(
            get_db().execute(
                "SELECT * FROM places WHERE LOWER(city) = LOWER(?) AND highlight = 1 ORDER BY popularity_rank",
                (city,),
            ).fetchall()
        )
    return _rows_to_dicts(
        get_db().execute(
            "SELECT * FROM places WHERE highlight = 1 ORDER BY city, popularity_rank"
        ).fetchall()
    )


def search_places(query: str) -> list[dict]:
    if not query or not query.strip():
        return []

    import re
    sanitized = re.sub(r"[^\w\s]", "", query).strip()
    if not sanitized:
        return []

    try:
        return _rows_to_dicts(
            get_db().execute(
                """
                SELECT p.*, rank
                FROM places_fts fts
                JOIN places p ON p.rowid = fts.rowid
                WHERE places_fts MATCH ?
                ORDER BY rank
                LIMIT 20
                """,
                (sanitized + "*",),
            ).fetchall()
        )
    except Exception:
        return _rows_to_dicts(
            get_db().execute(
                "SELECT * FROM places WHERE name LIKE ? OR description LIKE ? OR category LIKE ? LIMIT 20",
                (f"%{sanitized}%", f"%{sanitized}%", f"%{sanitized}%"),
            ).fetchall()
        )


def get_nearby_places(lat: float, lng: float, radius_km: float = 5) -> list[dict]:
    deg_delta = radius_km / 111.0
    candidates = _rows_to_dicts(
        get_db().execute(
            """
            SELECT * FROM places
            WHERE lat BETWEEN ? AND ?
              AND lng BETWEEN ? AND ?
            """,
            (lat - deg_delta, lat + deg_delta, lng - deg_delta, lng + deg_delta),
        ).fetchall()
    )

    def _haversine(lat1, lng1, lat2, lng2):
        R = 6371
        d_lat = math.radians(lat2 - lat1)
        d_lng = math.radians(lng2 - lng1)
        a = (
            math.sin(d_lat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
            * math.sin(d_lng / 2) ** 2
        )
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    result = [p for p in candidates if _haversine(lat, lng, p.get("lat", 0), p.get("lng", 0)) <= radius_km]
    result.sort(key=lambda p: _haversine(lat, lng, p.get("lat", 0), p.get("lng", 0)))
    return result


# ─── Session Queries ─────────────────────────────────────────

def create_session(session_id: str, user_id: str = None) -> dict:
    db = get_db()
    db.execute("INSERT OR IGNORE INTO chat_sessions (id, user_id) VALUES (?, ?)", (session_id, user_id))
    if user_id:
        db.execute("UPDATE chat_sessions SET user_id = COALESCE(user_id, ?) WHERE id = ?", (user_id, session_id))
    db.commit()
    from datetime import datetime
    return {"id": session_id, "user_id": user_id, "created_at": datetime.now().isoformat()}


def ensure_session(session_id: str, user_id: str = None):
    db = get_db()
    existing = db.execute("SELECT id FROM chat_sessions WHERE id = ?", (session_id,)).fetchone()
    if not existing:
        db.execute("INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)", (session_id, user_id))
    elif user_id:
        db.execute("UPDATE chat_sessions SET user_id = COALESCE(user_id, ?) WHERE id = ?", (user_id, session_id))
    db.commit()


def save_message(session_id: str, role: str, content: str, metadata: dict = None):
    db = get_db()
    ensure_session(session_id)
    db.execute(
        "INSERT INTO chat_messages (session_id, role, content, metadata) VALUES (?, ?, ?, ?)",
        (session_id, role, content, json.dumps(metadata or {})),
    )
    db.execute("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?", (session_id,))
    db.commit()


def get_session_history(session_id: str, limit: int = 20) -> list[dict]:
    rows = get_db().execute(
        "SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT ?",
        (session_id, limit),
    ).fetchall()
    result = _rows_to_dicts(rows)
    result.reverse()
    return result


def get_places_count() -> int:
    row = get_db().execute("SELECT COUNT(*) as count FROM places").fetchone()
    return row["count"] if row else 0


def get_cities() -> list[str]:
    rows = get_db().execute("SELECT DISTINCT city FROM places ORDER BY city").fetchall()
    return [r["city"] for r in rows]


def get_places_by_multiple_cities(cities: list[str]) -> list[dict]:
    if not cities:
        return get_all_places()
    placeholders = ",".join("?" for _ in cities)
    return _rows_to_dicts(
        get_db().execute(
            f"SELECT * FROM places WHERE LOWER(city) IN ({placeholders}) ORDER BY city, popularity_rank",
            [c.lower() for c in cities],
        ).fetchall()
    )


def get_places_by_tags(tags: list[str]) -> list[dict]:
    if not tags:
        return []
    results = []
    seen = set()
    for tag in tags:
        matches = _rows_to_dicts(
            get_db().execute(
                "SELECT * FROM places WHERE LOWER(tags) LIKE ? OR LOWER(category) LIKE ?",
                (f"%{tag.lower()}%", f"%{tag.lower()}%"),
            ).fetchall()
        )
        for m in matches:
            if m["id"] not in seen:
                results.append(m)
                seen.add(m["id"])
    return results


def get_category_distribution(city: str = None) -> list[dict]:
    if city:
        return _rows_to_dicts(
            get_db().execute(
                "SELECT category, COUNT(*) as count FROM places WHERE LOWER(city) = LOWER(?) GROUP BY category ORDER BY count DESC",
                (city,),
            ).fetchall()
        )
    return _rows_to_dicts(
        get_db().execute(
            "SELECT category, COUNT(*) as count FROM places GROUP BY category ORDER BY count DESC"
        ).fetchall()
    )


def link_session_to_user(session_id: str, user_id: str):
    get_db().execute("UPDATE chat_sessions SET user_id = ? WHERE id = ?", (user_id, session_id))
    get_db().commit()


def update_session_title(session_id: str, title: str):
    get_db().execute("UPDATE chat_sessions SET title = ? WHERE id = ?", (title, session_id))
    get_db().commit()


def get_sessions_by_user(user_id: str, limit: int = 30) -> list[dict]:
    return _rows_to_dicts(
        get_db().execute(
            """
            SELECT s.id, s.title, s.created_at, s.updated_at,
                   (SELECT content FROM chat_messages WHERE session_id = s.id AND role = 'user' ORDER BY id LIMIT 1) as first_message,
                   (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) as message_count
            FROM chat_sessions s
            WHERE s.user_id = ?
              AND (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) > 0
            ORDER BY s.updated_at DESC
            LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
    )


def save_itinerary(itinerary_id: str, user_id: str, title: str, cities: list, days: int, itinerary_data: dict) -> dict:
    get_db().execute(
        "INSERT INTO saved_itineraries (id, user_id, title, cities, days, itinerary_data) VALUES (?, ?, ?, ?, ?, ?)",
        (itinerary_id, user_id, title, json.dumps(cities), days, json.dumps(itinerary_data)),
    )
    get_db().commit()
    from datetime import datetime
    return {"id": itinerary_id, "title": title, "cities": cities, "days": days, "created_at": datetime.now().isoformat()}


def get_itineraries_by_user(user_id: str) -> list[dict]:
    rows = _rows_to_dicts(
        get_db().execute(
            "SELECT id, title, cities, days, created_at FROM saved_itineraries WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    )
    for row in rows:
        row["cities"] = json.loads(row.get("cities") or "[]")
    return rows


def get_itinerary_by_id(itinerary_id: str) -> Optional[dict]:
    row = get_db().execute("SELECT * FROM saved_itineraries WHERE id = ?", (itinerary_id,)).fetchone()
    if not row:
        return None
    d = _row_to_dict(row)
    d["cities"] = json.loads(d.get("cities") or "[]")
    d["itinerary_data"] = json.loads(d.get("itinerary_data") or "{}")
    return d


def delete_itinerary(itinerary_id: str, user_id: str) -> bool:
    cursor = get_db().execute(
        "DELETE FROM saved_itineraries WHERE id = ? AND user_id = ?",
        (itinerary_id, user_id),
    )
    get_db().commit()
    return cursor.rowcount > 0


def get_itinerary_count(user_id: str) -> int:
    row = get_db().execute(
        "SELECT COUNT(*) as count FROM saved_itineraries WHERE user_id = ?", (user_id,)
    ).fetchone()
    return row["count"] if row else 0


def update_place_photo(place_id: str, google_place_id: str, photo_reference: str):
    get_db().execute(
        "UPDATE places SET google_place_id = ?, photo_reference = ? WHERE id = ?",
        (google_place_id, photo_reference, place_id),
    )
    get_db().commit()
