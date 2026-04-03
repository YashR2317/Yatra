/**
 * User Data Integration Tests
 * Tests authenticated CRUD operations for itineraries and sessions.
 */
const request = require('supertest');
const { createApp, initDatabases } = require('./helpers/setup');

let app;
let authToken;
const testUser = {
    name: 'User Test',
    email: `usertest_${Date.now()}@brajyatra.test`,
    password: 'TestPassword123!',
};

beforeAll(async () => {
    await initDatabases();
    app = createApp();

    // Create a test user and get token
    const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);
    authToken = res.body.token;
});

describe('User Routes — Unauthenticated', () => {
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

    it('should reject unauthenticated itinerary save', async () => {
        const res = await request(app)
            .post('/api/user/itineraries')
            .send({ title: 'Test', itinerary_data: {} });
        expect(res.status).toBe(401);
    });
});

describe('User Routes — Itineraries', () => {
    let savedItineraryId;

    it('should start with zero itineraries', async () => {
        const res = await request(app)
            .get('/api/user/itineraries/count')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(0);
    });

    it('should save a new itinerary', async () => {
        const res = await request(app)
            .post('/api/user/itineraries')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'Mathura Vrindavan Yatra',
                cities: ['Mathura', 'Vrindavan'],
                days: 2,
                itinerary_data: {
                    title: 'Mathura Vrindavan Yatra',
                    days: [
                        { day: 1, city: 'Mathura', slots: [{ place: 'Krishna Janmabhoomi', time: '09:00' }] },
                        { day: 2, city: 'Vrindavan', slots: [{ place: 'Banke Bihari', time: '10:00' }] },
                    ]
                }
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.itinerary).toBeDefined();
        savedItineraryId = res.body.itinerary.id;
    });

    it('should list itineraries after save', async () => {
        const res = await request(app)
            .get('/api/user/itineraries')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.itineraries).toBeDefined();
        expect(Array.isArray(res.body.itineraries)).toBe(true);
        expect(res.body.itineraries.length).toBeGreaterThanOrEqual(1);
    });

    it('should count = 1 after saving one itinerary', async () => {
        const res = await request(app)
            .get('/api/user/itineraries/count')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
    });

    it('should fetch saved itinerary by ID', async () => {
        if (!savedItineraryId) return;

        const res = await request(app)
            .get(`/api/user/itineraries/${savedItineraryId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.itinerary).toBeDefined();
        expect(res.body.itinerary.title).toBe('Mathura Vrindavan Yatra');
    });

    it('should reject save without title', async () => {
        const res = await request(app)
            .post('/api/user/itineraries')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ itinerary_data: { title: 'x' } });

        expect(res.status).toBe(400);
    });

    it('should delete itinerary', async () => {
        if (!savedItineraryId) return;

        const res = await request(app)
            .delete(`/api/user/itineraries/${savedItineraryId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should count = 0 after deletion', async () => {
        const res = await request(app)
            .get('/api/user/itineraries/count')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(0);
    });
});

describe('User Routes — Sessions', () => {
    it('should list sessions for authenticated user', async () => {
        const res = await request(app)
            .get('/api/user/sessions')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.sessions).toBeDefined();
        expect(Array.isArray(res.body.sessions)).toBe(true);
    });
});

// Cleanup: delete the test user
afterAll(async () => {
    if (authToken) {
        await request(app)
            .delete('/api/auth/account')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ password: testUser.password });
    }
});
