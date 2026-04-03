/**
 * enrich-photos.js — One-Time Google Places Photo Enrichment Script
 *
 * Reads all places from the SQLite database, searches Google Places API
 * for each one, and stores the photo reference and Google Place ID.
 *
 * Usage:
 *   node server/agent/scripts/enrich-photos.js              (full run)
 *   node server/agent/scripts/enrich-photos.js --dry-run     (preview only)
 *   node server/agent/scripts/enrich-photos.js --city Mathura (single city)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '..', '.env') });

const db = require('../src/db/database');
const { searchPlace } = require('../src/utils/places-photos');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const cityFlag = args.indexOf('--city');
const TARGET_CITY = cityFlag !== -1 ? args[cityFlag + 1] : null;

// Rate limit: 1 request per 200ms to stay well within QPS limits
const DELAY_MS = 200;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('═══════════════════════════════════════════════');
    console.log('  BrajYatra — Google Places Photo Enrichment');
    console.log('═══════════════════════════════════════════════');
    console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will update DB)'}`);
    if (TARGET_CITY) console.log(`  Target City: ${TARGET_CITY}`);
    console.log('');

    if (!process.env.GOOGLE_MAPS_API_KEY) {
        console.error('❌ GOOGLE_MAPS_API_KEY not set in .env. Exiting.');
        process.exit(1);
    }

    // Ensure columns exist
    const database = db.getDB();
    try { database.exec("ALTER TABLE places ADD COLUMN google_place_id TEXT"); } catch (e) { }
    try { database.exec("ALTER TABLE places ADD COLUMN photo_reference TEXT"); } catch (e) { }

    // Get all places
    let places;
    if (TARGET_CITY) {
        places = db.getPlacesByCity(TARGET_CITY);
    } else {
        places = db.getAllPlaces();
    }

    console.log(`📦 Found ${places.length} places to process\n`);

    const updateStmt = database.prepare(
        'UPDATE places SET google_place_id = ?, photo_reference = ? WHERE id = ?'
    );

    let enriched = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < places.length; i++) {
        const place = places[i];

        // Skip if already enriched
        if (place.photo_reference) {
            console.log(`  ⏭️  [${i + 1}/${places.length}] ${place.name} (${place.city}) — already has photo`);
            skipped++;
            continue;
        }

        console.log(`  🔍 [${i + 1}/${places.length}] Searching: "${place.name}" in ${place.city}...`);

        const result = await searchPlace(place.name, place.city);

        if (result.photoRef) {
            console.log(`     ✅ Found: ${result.displayName || 'match'} → photo ref obtained`);

            if (!DRY_RUN) {
                updateStmt.run(result.placeId, result.photoRef, place.id);
            }
            enriched++;
        } else if (result.placeId) {
            console.log(`     ⚠️  Found place ID but no photo available`);
            if (!DRY_RUN) {
                updateStmt.run(result.placeId, null, place.id);
            }
            failed++;
        } else {
            console.log(`     ❌ Not found on Google Places`);
            failed++;
        }

        // Rate limit
        await sleep(DELAY_MS);
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  Results:');
    console.log(`    ✅ Enriched: ${enriched}`);
    console.log(`    ⏭️  Skipped (already done): ${skipped}`);
    console.log(`    ❌ Failed/No photo: ${failed}`);
    console.log(`    📊 Total: ${places.length}`);
    if (DRY_RUN) console.log('\n  ℹ️  This was a DRY RUN. No database changes were made.');
    console.log('═══════════════════════════════════════════════');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
