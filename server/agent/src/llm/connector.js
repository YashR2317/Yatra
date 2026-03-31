const gemini = require('./gemini');
const kaggle = require('./kaggle-fallback');
require('dotenv').config();

function getMode() {
    return (process.env.LLM_MODE || 'gemini').toLowerCase();
}

async function generateResponse(systemPrompt, userMessage, history = []) {
    const mode = getMode();

    if (mode === 'kaggle') {
        return await kaggle.generateResponse(systemPrompt, userMessage, history);
    }

    if (mode === 'hybrid') {

        const geminiResult = await gemini.generateResponse(systemPrompt, userMessage, history);
        if (geminiResult.success) return geminiResult;

        console.warn('[LLM] Gemini failed, falling back to Kaggle:', geminiResult.error);
        const kaggleResult = await kaggle.generateResponse(systemPrompt, userMessage, history);
        if (kaggleResult.success) return kaggleResult;

        return {
            success: false,
            error: `Both backends failed. Gemini: ${geminiResult.error}. Kaggle: ${kaggleResult.error}`,
            source: 'hybrid'
        };
    }

    const geminiResult = await gemini.generateResponse(systemPrompt, userMessage, history);
    return geminiResult;
}

async function generateJSON(systemPrompt, userMessage) {
    const mode = getMode();

    if (mode === 'kaggle') {
        return await kaggle.generateJSON(systemPrompt, userMessage);
    }

    if (mode === 'hybrid') {
        const geminiResult = await gemini.generateJSON(systemPrompt, userMessage);
        if (geminiResult.success) return geminiResult;

        console.warn('[LLM] Gemini JSON failed, falling back to Kaggle:', geminiResult.error);
        const kaggleResult = await kaggle.generateJSON(systemPrompt, userMessage);
        if (kaggleResult.success) return kaggleResult;

        return {
            success: false,
            error: `Both backends failed. Gemini: ${geminiResult.error}. Kaggle: ${kaggleResult.error}`,
            source: 'hybrid'
        };
    }

    return await gemini.generateJSON(systemPrompt, userMessage);
}

async function healthCheck() {
    const [geminiOk, kaggleOk] = await Promise.all([
        gemini.healthCheck(),
        kaggle.healthCheck()
    ]);

    return {
        mode: getMode(),
        gemini: geminiOk,
        kaggle: kaggleOk,
        available: geminiOk || kaggleOk
    };
}

/**
 * Generate a response with function calling tools (ReAct pattern).
 * Falls back to text-only mode on Kaggle (no function calling support).
 * 
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {Object[]} toolDeclarations — Gemini-compatible function declarations
 * @param {Object[]} history — conversation history
 * @returns {Promise<Object>} — { success, type: 'text'|'functionCall', ... }
 */
async function generateWithTools(systemPrompt, userMessage, toolDeclarations = [], history = []) {
    const mode = getMode();

    // Gemini supports function calling natively
    if (mode === 'gemini' || mode === 'hybrid') {
        const geminiResult = await gemini.generateWithTools(systemPrompt, userMessage, toolDeclarations, history);
        if (geminiResult.success) return geminiResult;

        if (mode === 'hybrid') {
            console.warn('[LLM] Gemini function calling failed, falling back to Kaggle text-only');
            // Kaggle doesn't support function calling — degrade to text response
            const toolList = toolDeclarations.map(t => `- ${t.name}: ${t.description}`).join('\n');
            const augmentedPrompt = `${systemPrompt}\n\nYou have access to these tools but cannot call them directly. Reason about what you would do with them and provide your best answer:\n${toolList}`;
            const kaggleResult = await kaggle.generateResponse(augmentedPrompt, userMessage, history);
            if (kaggleResult.success) {
                return { ...kaggleResult, type: 'text' };
            }
        }

        return geminiResult;
    }

    // Kaggle-only mode: no function calling, text-only
    const kaggleResult = await kaggle.generateResponse(systemPrompt, userMessage, history);
    if (kaggleResult.success) {
        return { ...kaggleResult, type: 'text' };
    }
    return { success: false, error: kaggleResult.error, source: 'kaggle' };
}

module.exports = { generateResponse, generateJSON, generateWithTools, healthCheck };
