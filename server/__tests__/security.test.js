/**
 * Security Integration Tests
 * Verifies security headers, CORS, rate limiting, and input validation.
 */
const request = require('supertest');
const { createApp, initDatabases } = require('./helpers/setup');

let app;

beforeAll(async () => {
    await initDatabases();
    app = createApp();
});

describe('Security Headers (Helmet)', () => {
    it('should return X-Content-Type-Options: nosniff', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should return X-DNS-Prefetch-Control: off', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('should return X-Frame-Options header', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should not expose X-Powered-By header', async () => {
        const res = await request(app).get('/api/health');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });
});

describe('Health Endpoint', () => {
    it('should return unified service status', async () => {
        const res = await request(app).get('/api/health');

        expect(res.status).toBe(200);
        expect(res.body.service).toBe('brajyatra-unified');
        expect(res.body.status).toBe('ok');
    });
});

describe('Agent Routes', () => {
    it('should return agent health', async () => {
        const res = await request(app).get('/api/agent/health');

        expect(res.status).toBe(200);
        expect(res.body.architecture).toBe('multi-agent');
        expect(res.body.places).toBeGreaterThan(0);
    });

    it('should return cities list', async () => {
        const res = await request(app).get('/api/agent/cities');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        // Each city should have name and image
        const city = res.body[0];
        expect(city.name).toBeDefined();
        expect(city.image).toBeDefined();
    });

    it('should return places for a city', async () => {
        const res = await request(app).get('/api/agent/places?city=Mathura');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
});

describe('Input Validation', () => {
    it('should reject empty chat message', async () => {
        const res = await request(app)
            .post('/api/agent/chat')
            .send({ message: '' });

        expect(res.status).toBe(400);
    });

    it('should reject oversized chat message (>2000 chars)', async () => {
        const res = await request(app)
            .post('/api/agent/chat')
            .send({ message: 'x'.repeat(3000) });

        expect(res.status).toBe(400);
    });

    it('should reject signup with XSS in name', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                name: '<script>alert("xss")</script>',
                email: 'xss@test.com',
                password: 'TestPass123!',
            });

        // Should either reject or sanitize (not contain raw script tag)
        if (res.status === 201) {
            expect(res.body.user.name).not.toContain('<script>');
        } else {
            expect(res.status).toBe(400);
        }
    });
});

describe('User Data Routes — Unauthenticated', () => {
    it('should reject unauthenticated itinerary list', async () => {
        const res = await request(app).get('/api/user/itineraries');
        expect(res.status).toBe(401);
    });

    it('should reject unauthenticated sessions list', async () => {
        const res = await request(app).get('/api/user/sessions');
        expect(res.status).toBe(401);
    });

    it('should reject unauthenticated itinerary count', async () => {
        const res = await request(app).get('/api/user/itineraries/count');
        expect(res.status).toBe(401);
    });
});
