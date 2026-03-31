/**
 * Auth Integration Tests
 * Tests signup, login, profile, and validation flows
 * against the actual unified Express app + MongoDB.
 */
const request = require('supertest');
const { createApp, initDatabases } = require('./helpers/setup');

let app;
let authToken;
const testUser = {
    name: 'Test Yatri',
    email: `test_${Date.now()}@brajyatra.test`,
    password: 'TestPass123!',
};

beforeAll(async () => {
    await initDatabases();
    app = createApp();
});

describe('Auth — Signup', () => {
    it('should reject signup with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: '', email: '', password: '' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject signup with invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Test', email: 'not-an-email', password: 'TestPass123!' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should reject signup with weak password', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Test', email: 'test@example.com', password: '12' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should create a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
        authToken = res.body.token;
    });

    it('should reject duplicate email', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(testUser);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('Auth — Login', () => {
    it('should reject login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'WrongPassword!' });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@nowhere.com', password: 'Something123!' });

        // Controller returns 404 for user not found (vs 401 for wrong password)
        expect([401, 404]).toContain(res.status);
        expect(res.body.success).toBe(false);
    });

    it('should login successfully with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        authToken = res.body.token; // Update token
    });
});

describe('Auth — Protected Routes', () => {
    it('should get user profile with valid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject /me without token', async () => {
        const res = await request(app)
            .get('/api/auth/me');

        expect(res.status).toBe(401);
    });

    it('should reject /me with invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer invalid.token.here');

        expect(res.status).toBe(401);
    });

    it('should update profile name', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Updated Yatri' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.name).toBe('Updated Yatri');
    });

    it('should reject profile update with invalid name', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'X' }); // Too short (min 2)

        expect(res.status).toBe(400);
    });
});

describe('Auth — Change Password', () => {
    it('should reject with wrong current password', async () => {
        const res = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ currentPassword: 'WrongPass!', newPassword: 'NewPass456!' });

        expect(res.status).toBe(401);
    });

    it('should change password successfully', async () => {
        const res = await request(app)
            .put('/api/auth/change-password')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ currentPassword: testUser.password, newPassword: 'NewTestPass456!' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined(); // New JWT issued
        authToken = res.body.token; // Update token
    });

    it('should login with new password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'NewTestPass456!' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe('Auth — Account Deletion', () => {
    it('should reject deletion with wrong password', async () => {
        const res = await request(app)
            .delete('/api/auth/account')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ password: 'WrongPass!' });

        expect(res.status).toBe(401);
    });

    it('should delete account with correct password', async () => {
        const res = await request(app)
            .delete('/api/auth/account')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ password: 'NewTestPass456!' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should not be able to login after deletion', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'NewTestPass456!' });

        // User was deleted — controller returns 404 (not found) or 401
        expect([401, 404]).toContain(res.status);
    });
});
