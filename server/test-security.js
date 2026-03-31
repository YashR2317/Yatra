/**
 * Security Verification Tests
 * Verifies that all Phase 1 security hardening is active.
 */
const http = require('http');

function get(port, path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) }); }
                catch { resolve({ status: res.statusCode, headers: res.headers, body }); }
            });
        }).on('error', reject);
    });
}

function post(port, path, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost', port, path, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(responseBody) }); }
                catch { resolve({ status: res.statusCode, headers: res.headers, body: responseBody }); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function runTests() {
    console.log('════════════════════════════════════════════');
    console.log('  Security Verification Tests');
    console.log('════════════════════════════════════════════\n');

    let passed = 0, failed = 0;

    function check(name, condition, detail) {
        if (condition) {
            console.log(`  ✅ ${name}`);
            passed++;
        } else {
            console.log(`  ❌ ${name} — ${detail || 'FAILED'}`);
            failed++;
        }
    }

    // 1. Agent health check works
    const agentHealth = await get(3000, '/api/health');
    check('Agent health endpoint', agentHealth.status === 200 && agentHealth.body.architecture === 'multi-agent');

    // 2. Helmet security headers present (X-Content-Type-Options, etc.)
    check('X-Content-Type-Options header', agentHealth.headers['x-content-type-options'] === 'nosniff');
    check('X-DNS-Prefetch-Control header', agentHealth.headers['x-dns-prefetch-control'] === 'off');
    check('X-Frame-Options header', !!agentHealth.headers['x-frame-options']);

    // 3. Auth health check
    const authHealth = await get(5000, '/api/health');
    check('Auth health endpoint', authHealth.status === 200 && authHealth.body.service === 'auth');

    // 4. Auth Helmet headers
    check('Auth X-Content-Type-Options', authHealth.headers['x-content-type-options'] === 'nosniff');

    // 5. Input validation — signup with bad data
    const badSignup = await post(5000, '/api/auth/signup', { name: '', email: 'not-an-email', password: '12' });
    check('Auth rejects invalid signup', badSignup.status === 400 && badSignup.body.success === false,
        `Got status ${badSignup.status}: ${badSignup.body.message}`);

    // 6. Input validation — chat with empty message
    const badChat = await post(3000, '/api/chat', { message: '' });
    check('Agent rejects empty chat message', badChat.status === 400 && badChat.body.success === false,
        `Got status ${badChat.status}: ${JSON.stringify(badChat.body).substring(0, 100)}`);

    // 7. Input validation — chat with oversized message  
    const oversizedChat = await post(3000, '/api/chat', { message: 'x'.repeat(3000) });
    check('Agent rejects oversized chat message', oversizedChat.status === 400,
        `Got status ${oversizedChat.status}`);

    // 8. Rate limit headers present on agent
    const chatReq = await post(3000, '/api/chat', { message: 'Hello' });
    check('Agent returns rate limit headers',
        chatReq.headers['ratelimit-limit'] || chatReq.headers['x-ratelimit-limit'],
        `Headers: ${Object.keys(chatReq.headers).filter(h => h.includes('limit')).join(', ')}`);

    console.log(`\n════════════════════════════════════════════`);
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log('════════════════════════════════════════════');
}

runTests().catch(err => {
    console.error('Test runner failed:', err.message);
    process.exit(1);
});
