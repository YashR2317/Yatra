require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
console.log('API Key:', API_KEY ? API_KEY.substring(0, 15) + '...' : 'MISSING');
console.log('Env file:', require('path').join(__dirname, '.env'));

async function test() {
    // Test 1: Places API (New) - Text Search
    console.log('\n--- Test 1: Places API (New) Text Search ---');
    try {
        const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
            },
            body: JSON.stringify({
                textQuery: 'Taj Mahal, Agra, India',
                languageCode: 'en',
                maxResultCount: 1,
            }),
        });
        console.log('Status:', res.status);
        const body = await res.text();
        console.log('Response:', body.substring(0, 800));
    } catch (e) {
        console.error('Error:', e.message);
    }

    // Test 2: Legacy Places API - Text Search
    console.log('\n--- Test 2: Legacy Places Text Search ---');
    try {
        const query = encodeURIComponent('Taj Mahal, Agra, India');
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`;
        const res = await fetch(url);
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Status field:', data.status);
        if (data.results && data.results[0]) {
            const place = data.results[0];
            console.log('Found:', place.name);
            console.log('Place ID:', place.place_id);
            console.log('Photos:', place.photos ? place.photos.length : 0);
            if (place.photos && place.photos[0]) {
                console.log('Photo ref:', place.photos[0].photo_reference.substring(0, 50) + '...');
            }
        } else {
            console.log('No results. Error:', data.error_message || 'none');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();
