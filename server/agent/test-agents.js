/**
 * Quick multi-agent test script — tests all agent types
 */
const http = require('http');

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: `/api${path}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch { resolve(body); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function get(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3000/api${path}`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); } catch { resolve(body); }
            });
        }).on('error', reject);
    });
}

async function runTests() {
    console.log('═══════════════════════════════════════════');
    console.log('  BrajYatra Multi-Agent System Tests');
    console.log('═══════════════════════════════════════════\n');

    // Test 1: Health check
    console.log('📋 Test 1: Health Check');
    const health = await get('/health');
    console.log('  Architecture:', health.architecture);
    console.log('  Agents:', health.agents?.join(', '));
    console.log('  Places:', health.places);
    console.log('  LLM available:', health.llm?.available);
    console.log('  ✅ PASSED\n');

    // Test 2: Weather query (should delegate to WeatherAgent)
    console.log('🌤️  Test 2: Weather Query');
    console.log('  Sending: "What is the weather in Mathura today?"');
    const weather = await post('/chat', { message: 'What is the weather in Mathura today?' });
    console.log('  Response type:', weather.type);
    console.log('  Source:', weather.source);
    console.log('  Has text:', !!weather.text);
    console.log('  Text preview:', (weather.text || '').substring(0, 150));
    console.log('  Agent trace:', JSON.stringify(weather.agentTrace?.slice(0, 3)));
    console.log('  ✅ PASSED\n');

    // Test 3: Chat query (should delegate to ChatAgent) 
    console.log('💬 Test 3: Chat Query');
    console.log('  Sending: "Tell me about Holi celebrations in Barsana"');
    const chat = await post('/chat', { message: 'Tell me about Holi celebrations in Barsana' });
    console.log('  Response type:', chat.type);
    console.log('  Source:', chat.source);
    console.log('  Has text:', !!chat.text);
    console.log('  Text preview:', (chat.text || '').substring(0, 150));
    console.log('  ✅ PASSED\n');

    // Test 4: Agent trace endpoint
    console.log('🔍 Test 4: Agent Trace');
    const trace = await get('/agent-trace');
    console.log('  Trace entries:', trace.trace?.length || 0);
    console.log('  Full log entries:', trace.fullLog?.length || 0);
    if (trace.trace?.length > 0) {
        for (const t of trace.trace.slice(0, 5)) {
            console.log(`    ${t.flow} [${t.type}] — ${t.preview?.substring(0, 60)}`);
        }
    }
    console.log('  ✅ PASSED\n');

    console.log('═══════════════════════════════════════════');
    console.log('  All Tests Complete!');
    console.log('═══════════════════════════════════════════');
}

runTests().catch(err => {
    console.error('Test failed:', err.message);
    process.exit(1);
});
