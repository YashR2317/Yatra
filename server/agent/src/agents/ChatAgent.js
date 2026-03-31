/**
 * ChatAgent — Autonomous Conversational Specialist
 * 
 * Handles general Q&A about the Braj region: history, culture, festivals,
 * food, travel tips, and conversational queries. Autonomously pulls relevant
 * data from the database to enrich its answers.
 */

const AgentBase = require('./core/AgentBase');
const { CHAT_PROMPT, getLanguageInstruction } = require('../prompts/system-prompts');

class ChatAgent extends AgentBase {
    constructor() {
        super({
            name: 'ChatAgent',
            role: 'Conversational Travel Assistant',
            systemPrompt: `${CHAT_PROMPT}

You are an autonomous agent with access to tools. Use them to provide accurate, data-backed answers.

TOOL USAGE GUIDELINES:
1. When the user mentions a specific city, use get_places_by_city to fetch relevant places data
2. When the user asks about a specific place, use search_places to find it
3. When asked for "highlights" or "top places", use get_highlights
4. Use tool results to provide accurate descriptions, opening hours, and practical details
5. If the question is general knowledge (history, culture, festivals), you may answer directly without tools

RESPONSE STYLE:
- Warm, friendly, and culturally respectful
- Use markdown formatting (bold, bullet points, headers)
- Include relevant emoji
- Suggest related places or activities when relevant
- Always provide practical tips alongside cultural information`,
            toolNames: ['search_places', 'get_places_by_city', 'get_highlights', 'get_place_by_id', 'get_cities'],
            maxIterations: 3
        });
    }

    /**
     * Run with language support.
     */
    async handleChat(message, context = {}) {
        const langPrompt = getLanguageInstruction(context.language || 'en');
        this.systemPrompt = `${CHAT_PROMPT}

You are an autonomous agent with access to tools. Use them to provide accurate, data-backed answers.

TOOL USAGE GUIDELINES:
1. When the user mentions a specific city, use get_places_by_city to fetch relevant places data
2. When the user asks about a specific place, use search_places to find it
3. When asked for "highlights" or "top places", use get_highlights
4. Use tool results to provide accurate descriptions, opening hours, and practical details
5. If the question is general knowledge (history, culture, festivals), you may answer directly without tools

RESPONSE STYLE:
- Warm, friendly, and culturally respectful
- Use markdown formatting (bold, bullet points, headers)
- Include relevant emoji
- Suggest related places or activities when relevant
- Always provide practical tips alongside cultural information${langPrompt}`;

        return await this.run(message, context);
    }
}

module.exports = ChatAgent;
