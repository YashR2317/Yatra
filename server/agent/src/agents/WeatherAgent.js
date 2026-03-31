/**
 * WeatherAgent — Autonomous Weather Information Specialist
 * 
 * Provides live weather data, travel advisories, and clothing recommendations
 * for cities in the Braj region. Can be consulted by other agents.
 */

const AgentBase = require('./core/AgentBase');
const { WEATHER_PROMPT } = require('../prompts/system-prompts');

class WeatherAgent extends AgentBase {
    constructor() {
        super({
            name: 'WeatherAgent',
            role: 'Weather Information Specialist',
            systemPrompt: `${WEATHER_PROMPT}

You are an autonomous agent with access to tools. Use the fetch_weather tool to get real-time weather data for any city in the Braj region.

WORKFLOW:
1. When asked about weather, use fetch_weather tool with the city name
2. Analyze the returned data (temperature, humidity, conditions)
3. Provide a comprehensive travel advisory based on the conditions
4. Recommend what to wear, when to visit outdoor sites, and any precautions

AVAILABLE CITIES: Mathura, Vrindavan, Agra, Govardhan, Barsana, Gokul

If the user doesn't specify a city, default to Mathura (the main hub of the Braj region).

Format your response in markdown with emoji for readability.`,
            toolNames: ['fetch_weather', 'get_city_centroid'],
            maxIterations: 3
        });
    }

    /**
     * Override _handleMessage for structured inter-agent requests.
     * When another agent asks for weather, return structured data instead of formatted text.
     */
    async _handleMessage(message) {
        console.log(`[WeatherAgent] Inter-agent request from ${message.from}`);

        const content = typeof message.content === 'string'
            ? message.content
            : message.content;

        // If another agent is asking, return raw weather data
        if (message.type === 'weather_request') {
            const city = typeof content === 'object' ? content.city : content;
            const toolRegistry = require('./core/ToolRegistry');
            const weatherData = await toolRegistry.executeTool('fetch_weather', { city: city || 'Mathura' });
            return { success: true, data: weatherData, source: 'WeatherAgent' };
        }

        // Otherwise, run the full agent loop
        const taskStr = typeof content === 'string' ? content : JSON.stringify(content);
        return await this.run(taskStr, {});
    }
}

module.exports = WeatherAgent;
