/**
 * SSE Streaming for Agent Chat
 * =============================
 * Provides Server-Sent Events streaming for real-time chat responses.
 * This module wraps Gemini's generateContentStream for token-by-token delivery.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Stream a response from Gemini via SSE.
 * Sends incremental text chunks as they arrive.
 *
 * @param {object} res — Express response object for SSE
 * @param {string} systemPrompt — system instruction
 * @param {string} userMessage — user's message
 * @param {object[]} history — conversation history
 * @param {object} options — { onComplete }
 */
async function streamResponse(res, systemPrompt, userMessage, history = [], options = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        sendSSEError(res, 'GEMINI_API_KEY not configured');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
    });

    const chat = model.startChat({
        history: history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }]
        }))
    });

    try {
        const result = await chat.sendMessageStream(userMessage);

        let fullText = '';

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                fullText += text;
                sendSSEData(res, {
                    type: 'chunk',
                    text: text,
                    accumulated: fullText,
                });
            }
        }

        // Send completion event
        sendSSEData(res, {
            type: 'done',
            text: fullText,
        });

        // Callback with full response
        if (options.onComplete) {
            options.onComplete(fullText);
        }

    } catch (error) {
        console.error('[Stream] Error:', error.message);
        sendSSEError(res, error.message);
    } finally {
        res.end();
    }
}

/**
 * Send an SSE data event.
 */
function sendSSEData(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Send an SSE error event and close.
 */
function sendSSEError(res, message) {
    res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`);
    res.end();
}

/**
 * Set up SSE headers on an Express response.
 */
function setupSSE(res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
    });
    res.flushHeaders();
}

module.exports = { streamResponse, setupSSE, sendSSEData, sendSSEError };
