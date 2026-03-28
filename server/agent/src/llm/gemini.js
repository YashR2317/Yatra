const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const MODEL_FAST = 'gemini-2.5-flash-preview-05-20';    // Fast model for chat, weather, classification
const MODEL_FULL = 'gemini-2.5-flash-preview-05-20';    // Full model for itinerary JSON generation
let genAI = null;

function init() {
    if (genAI) return;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set in .env');
    genAI = new GoogleGenerativeAI(apiKey);
}

function toSystemInstruction(text) {
    return { role: 'user', parts: [{ text }] };
}

async function generateResponse(systemPrompt, userMessage, history = [], options = {}) {
    init();

    const { useSearch = false, fast = false } = options;
    const modelName = fast ? MODEL_FAST : MODEL_FAST; // Use fast model for all generateResponse calls

    const config = {
        model: modelName,
        systemInstruction: toSystemInstruction(systemPrompt),
    };

    // Only attach Google Search when explicitly requested (search intent)
    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const chatModel = genAI.getGenerativeModel(config);

    const chat = chatModel.startChat({
        history: history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }]
        }))
    });

    const maxAttempts = 2; // Reduced from 3
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const result = await chat.sendMessage(userMessage);
            const text = result.response.text();

            let groundingMetadata = null;
            if (useSearch) {
                try {
                    const candidate = result.response.candidates?.[0];
                    const gm = candidate?.groundingMetadata;
                    if (gm && gm.groundingChunks && gm.groundingChunks.length > 0) {
                        groundingMetadata = {
                            searchQueries: gm.webSearchQueries || [],
                            sources: gm.groundingChunks
                                .filter(c => c.web)
                                .map(c => ({ url: c.web.uri, title: c.web.title }))
                        };
                    }
                } catch (e) { }
            }

            return { success: true, text, source: 'gemini', groundingMetadata };
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                return { success: false, error: error.message, source: 'gemini' };
            }
            // Reduced delay: 500ms, 1000ms (was 2000ms, 4000ms, 8000ms)
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempts - 1)));
        }
    }
}

async function generateJSON(systemPrompt, userMessage, options = {}) {
    init();

    const { fast = false } = options;
    const modelName = fast ? MODEL_FAST : MODEL_FULL; // Use full model for itinerary JSON

    const jsonModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: toSystemInstruction(systemPrompt),
        generationConfig: { responseMimeType: 'application/json' }
    });

    const maxAttempts = 2; // Reduced from 3
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const result = await jsonModel.generateContent(userMessage);
            const text = result.response.text();
            const parsed = JSON.parse(text);
            return { success: true, data: parsed, raw: text, source: 'gemini' };
        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                return { success: false, error: error.message, source: 'gemini' };
            }
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempts - 1)));
        }
    }
}

async function healthCheck() {
    try {
        init();
        const model = genAI.getGenerativeModel({ model: MODEL_FAST });
        const result = await model.generateContent('Reply with OK');
        return result.response.text().length > 0;
    } catch {
        return false;
    }
}

module.exports = { generateResponse, generateJSON, healthCheck };
