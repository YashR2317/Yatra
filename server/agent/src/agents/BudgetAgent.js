/**
 * BudgetAgent — Autonomous Budget Advisor
 * 
 * Provides detailed cost estimates, budget breakdowns, and money-saving tips
 * for travel in the Braj region. Can be consulted by other agents.
 */

const AgentBase = require('./core/AgentBase');
const { BUDGET_AGENT_PROMPT } = require('../prompts/system-prompts');

class BudgetAgent extends AgentBase {
    constructor() {
        super({
            name: 'BudgetAgent',
            role: 'Budget Advisor',
            systemPrompt: BUDGET_AGENT_PROMPT,
            toolNames: ['estimate_budget', 'get_places_by_city'],
            maxIterations: 3
        });
    }

    /**
     * Handle inter-agent budget requests with structured data.
     */
    async _handleMessage(message) {
        console.log(`[BudgetAgent] Inter-agent request from ${message.from}`);

        const content = typeof message.content === 'object' ? message.content : {};

        // If another agent needs a quick budget estimate, do it directly
        if (message.type === 'budget_request' && content.days && content.budget_level) {
            const toolRegistry = require('./core/ToolRegistry');
            const budget = await toolRegistry.executeTool('estimate_budget', {
                days: content.days,
                budget_level: content.budget_level,
                people: content.people || 2,
                places: content.places || []
            });
            return { success: true, data: budget, source: 'BudgetAgent' };
        }

        // Otherwise, run the full agent reasoning loop
        const taskStr = typeof message.content === 'string'
            ? message.content
            : JSON.stringify(message.content);
        return await this.run(taskStr, {});
    }
}

module.exports = BudgetAgent;
