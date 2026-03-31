/**
 * RecommenderAgent — Autonomous Place Recommendation Specialist
 * 
 * Recommends places to visit based on user preferences, interests, and context.
 * Autonomously queries the database, scores places, enforces diversity, and
 * provides personalized reasoning for each recommendation.
 */

const AgentBase = require('./core/AgentBase');
const { RECOMMENDER_PROMPT, getLanguageInstruction } = require('../prompts/system-prompts');

class RecommenderAgent extends AgentBase {
    constructor() {
        super({
            name: 'RecommenderAgent',
            role: 'Place Recommendation Specialist',
            systemPrompt: `${RECOMMENDER_PROMPT}

You are an autonomous agent. Use your tools to find, score, and recommend places.

WORKFLOW:
1. First, use search_places or get_places_by_city to fetch candidate places
2. Use score_and_rank_places to rank them by relevance to user preferences
3. Use enforce_diversity to ensure variety (different categories, cities)
4. Select the top 5-8 places and provide personalized reasoning for each

TOOL USAGE:
- get_places_by_city: When user specifies a city
- search_places: When user has a specific interest or keyword
- get_highlights: When user wants "best" or "must-visit" places
- score_and_rank_places: To rank results by relevance
- enforce_diversity: To ensure variety in recommendations
- get_category_distribution: To understand what types of places are available

After getting tool results, ALWAYS provide your final recommendations as a JSON response matching the format specified in your base prompt.`,
            toolNames: [
                'search_places', 'get_places_by_city', 'get_highlights',
                'score_and_rank_places', 'enforce_diversity', 'get_category_distribution'
            ],
            maxIterations: 5
        });
    }

    /**
     * Handle a recommendation request with structured parameters.
     */
    async recommend(params = {}) {
        const {
            query = '', cities = [], interests = [], limit = 8,
            language = 'en', group_type = 'family', budget_level = 'medium'
        } = params;

        const langInstruction = getLanguageInstruction(language);
        this.systemPrompt = `${RECOMMENDER_PROMPT}

You are an autonomous agent. Use your tools to find, score, and recommend places.

WORKFLOW:
1. First, use search_places or get_places_by_city to fetch candidate places
2. Use score_and_rank_places to rank them by relevance to user preferences  
3. Use enforce_diversity to ensure variety (different categories, cities)
4. Select the top ${limit} places and provide personalized reasoning for each

CURRENT REQUEST CONTEXT:
- User query: "${query}"
- Target cities: ${cities.length > 0 ? cities.join(', ') : 'All cities'}
- Interests: ${interests.length > 0 ? interests.join(', ') : 'General'}
- Group type: ${group_type}
- Budget level: ${budget_level}

After using tools, provide your final response as JSON with this exact structure:
{
  "title": "Recommended Places",
  "recommendations": [
    {
      "place_id": "id",
      "name": "Place Name",
      "city": "City",
      "category": "category",
      "why": "Why this place matches user interests",
      "best_time": "Best visiting time",
      "duration": "Visit duration",
      "crowd_level": "low/medium/high",
      "insider_tip": "Special tip"
    }
  ],
  "summary": "Brief overall summary"
}${langInstruction}`;

        const taskMessage = query || `Recommend ${limit} places in ${cities.length > 0 ? cities.join(' and ') : 'the Braj region'} for a ${group_type} with ${budget_level} budget${interests.length > 0 ? `, interested in ${interests.join(', ')}` : ''}`;

        const result = await this.run(taskMessage, { language });

        // Parse the JSON from the agent's response
        if (result.success && result.text) {
            try {
                // Try to extract JSON from the response
                let jsonText = result.text;
                const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (jsonMatch) jsonText = jsonMatch[1];

                // Try to find JSON object in the text
                const jsonStart = jsonText.indexOf('{');
                const jsonEnd = jsonText.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
                }

                const parsed = JSON.parse(jsonText);
                return {
                    success: true,
                    ...parsed,
                    source: result.source,
                    agentTrace: result.trace
                };
            } catch (e) {
                // Return as text if JSON parsing fails
                return {
                    success: true,
                    recommendations: [],
                    summary: result.text,
                    source: result.source,
                    agentTrace: result.trace
                };
            }
        }

        return {
            success: false,
            recommendations: [],
            summary: 'Failed to generate recommendations',
            source: 'error',
            agentTrace: result.trace
        };
    }
}

module.exports = RecommenderAgent;
