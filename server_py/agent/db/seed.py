"""
Database Seeder — Loads place data from JSON files into SQLite.
"""

import json
import sys
from pathlib import Path

# Data files live inside server_py/data/
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

CITY_FILES = {
    "Mathura": "MATHURA.json",
    "Vrindavan": "VRINDAVAN.json",
    "Agra": "AGRA.json",
    "Govardhan": "GOVARDHAN.json",
    "Barsana": "BARSANA.json",
    "Gokul": "GOKUL.json",
}


def seed(force: bool = False) -> int:
    """Seed the database with place data from JSON files.

    Args:
        force: If True, clear existing data and re-seed.

    Returns:
        Number of places in the database after seeding.
    """
    from agent.db.database import get_db, get_places_count

    db = get_db()
    existing = get_places_count()

    if existing > 0 and not force:
        print(f"[Seed] Database already has {existing} places. Skipping seed. Use --force to reseed.")
        return existing

    if existing > 0 and force:
        print(f"[Seed] Force reseed — clearing {existing} existing places...")
        db.execute("DELETE FROM places")
        db.execute("INSERT INTO places_fts(places_fts) VALUES('rebuild')")
        db.commit()

    print("[Seed] Starting database seed...")

    total_inserted = 0

    for city, filename in CITY_FILES.items():
        file_path = DATA_DIR / filename

        if not file_path.exists():
            print(f"[Seed] File not found: {filename}, skipping {city}")
            continue

        raw = file_path.read_text(encoding="utf-8")
        data = json.loads(raw)

        # Find the key ending with '_places'
        place_key = next((k for k in data.keys() if k.endswith("_places")), None)
        if not place_key:
            print(f"[Seed] No places key found in {filename}")
            continue

        places = data[place_key]

        for p in places:
            coords = p.get("coordinates") or {}
            db.execute(
                """
                INSERT OR IGNORE INTO places
                (id, city, name, category, address, lat, lng, description,
                 opening_hours, entry_fee, highlight, popularity_rank, tags,
                 estimated_visit_duration, crowd_level, best_time_to_visit,
                 nearby_places, google_maps_link, images, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    p.get("id"),
                    city,
                    p.get("name"),
                    p.get("category"),
                    p.get("address", ""),
                    coords.get("lat"),
                    coords.get("lng"),
                    p.get("description", ""),
                    p.get("opening_hours", "Varies"),
                    p.get("entry_fee"),
                    1 if p.get("highlight") else 0,
                    p.get("popularity_rank", 999),
                    json.dumps(p.get("tags", [])),
                    p.get("estimated_visit_duration", 45),
                    p.get("crowd_level", "medium"),
                    p.get("best_time_to_visit", ""),
                    json.dumps(p.get("nearby_places", [])),
                    p.get("google_maps_link", ""),
                    json.dumps(p.get("images", [])),
                    p.get("source", ""),
                ),
            )

        total_inserted += len(places)
        print(f"[Seed] {city}: {len(places)} places inserted")

    db.execute("INSERT INTO places_fts(places_fts) VALUES('rebuild')")
    db.commit()

    print(f"[Seed] ✅ Total: {total_inserted} places seeded")
    return total_inserted


if __name__ == "__main__":
    force = "--force" in sys.argv
    count = seed(force)
    print(f"Seeding complete. {count} places in database.")
