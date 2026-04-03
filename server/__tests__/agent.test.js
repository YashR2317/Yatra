/**
 * Agent Integration Tests
 * Tests the AI agent subsystem: health, places, cities, chat validation, weather.
 */
const request = require('supertest');
const { createApp, initDatabases } = require('./helpers/setup');

let app;

beforeAll(async () => {
    await initDatabases();
    app = createApp();
});

describe('Agent — Health', () => {
    it('should return multi-agent architecture status', async () => {
        const res = await request(app).get('/api/agent/health');

        expect(res.status).toBe(200);
        expect(res.body.architecture).toBe('multi-agent');
        expect(res.body.agents).toBeDefined();
        expect(Array.isArray(res.body.agents)).toBe(true);
        expect(res.body.agents.length).toBeGreaterThanOrEqual(5);
    });

    it('should report places count', async () => {
        const res = await request(app).get('/api/agent/health');
        expect(res.body.places).toBeGreaterThan(0);
    });

    it('should list available cities', async () => {
        const res = await request(app).get('/api/agent/health');
        expect(res.body.cities).toBeDefined();
        expect(Array.isArray(res.body.cities)).toBe(true);
    });
});

describe('Agent — Cities', () => {
    it('should return cities list with name, image, count', async () => {
        const res = await request(app).get('/api/agent/cities');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const city = res.body[0];
        expect(city.name).toBeDefined();
        expect(city.image).toBeDefined();
        expect(city.count).toBeDefined();
        expect(city.count).toBeGreaterThan(0);
    });

    it('should include Mathura and Vrindavan', async () => {
        const res = await request(app).get('/api/agent/cities');
        const names = res.body.map(c => c.name);
        expect(names).toContain('Mathura');
        expect(names).toContain('Vrindavan');
    });
});

describe('Agent — Places', () => {
    it('should return all places without filters', async () => {
        const res = await request(app).get('/api/agent/places');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(10);
    });

    it('should filter places by city', async () => {
        const res = await request(app).get('/api/agent/places?city=Mathura');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        // Every returned place should belong to Mathura
        res.body.forEach(place => {
            expect(place.city).toBe('Mathura');
        });
    });

    it('should search places by query', async () => {
        const res = await request(app).get('/api/agent/places?q=Krishna');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        // Should find at least one Krishna-related place
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return a specific place by ID', async () => {
        // First get a list to find a valid ID
        const listRes = await request(app).get('/api/agent/places?city=Mathura');
        expect(listRes.body.length).toBeGreaterThan(0);

        const placeId = listRes.body[0].id;
        const res = await request(app).get(`/api/agent/places/${placeId}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(placeId);
        expect(res.body.name).toBeDefined();
    });

    it('should 404 for non-existent place ID', async () => {
        const res = await request(app).get('/api/agent/places/nonexistent_place_id_xyz');
        expect(res.status).toBe(404);
    });
});

describe('Agent — Place Suggestions', () => {
    it('should return suggestions for a city', async () => {
        const res = await request(app).get('/api/agent/places/suggest?city=Vrindavan');

        expect(res.status).toBe(200);
        expect(res.body.suggestions).toBeDefined();
        expect(Array.isArray(res.body.suggestions)).toBe(true);
    });

    it('should return empty for unknown city', async () => {
        const res = await request(app).get('/api/agent/places/suggest?city=NonexistentCity');

        expect(res.status).toBe(200);
        expect(res.body.suggestions).toBeDefined();
        expect(res.body.suggestions.length).toBe(0);
    });
});

describe('Agent — Chat Validation', () => {
    it('should reject empty message', async () => {
        const res = await request(app)
            .post('/api/agent/chat')
            .send({ message: '' });

        expect(res.status).toBe(400);
    });

    it('should reject oversized message (>2000 chars)', async () => {
        const res = await request(app)
            .post('/api/agent/chat')
            .send({ message: 'x'.repeat(3000) });

        expect(res.status).toBe(400);
    });

    it('should reject missing message field', async () => {
        const res = await request(app)
            .post('/api/agent/chat')
            .send({});

        expect(res.status).toBe(400);
    });
});

describe('Agent — Sessions', () => {
    it('should create a new session', async () => {
        const res = await request(app)
            .post('/api/agent/session');

        expect(res.status).toBe(200);
        expect(res.body.sessionId).toBeDefined();
    });

    it('should return empty history for new session', async () => {
        const createRes = await request(app).post('/api/agent/session');
        const sid = createRes.body.sessionId;

        const res = await request(app).get(`/api/agent/session/${sid}/history`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
});

describe('Agent — Agent Trace', () => {
    it('should return trace log structure', async () => {
        const res = await request(app).get('/api/agent/agent-trace');

        expect(res.status).toBe(200);
        expect(res.body.trace).toBeDefined();
        expect(res.body.fullLog).toBeDefined();
    });
});
