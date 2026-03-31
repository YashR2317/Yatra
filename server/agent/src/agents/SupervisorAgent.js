/**
 * SupervisorAgent — Central Coordinator (Multi-Agent Router)
 * 
 * Replaces the hardcoded switch statement in api.js. Uses LLM reasoning
 * to analyze user intent, delegate to specialist agents, and synthesize
 * their responses into a cohesive answer.
 * 
 * This is the ONLY agent the API layer talks to. All routing decisions
 * are made by the LLM, not by deterministic code.
 */

const AgentBase = require('./core/AgentBase');
const messageBus = require('./core/MessageBus');
const toolRegistry = require('./core/ToolRegistry');
const { SUPERVISOR_PROMPT } = require('../prompts/system-prompts');

// Import specialist agents
const ItineraryAgent = require('./ItineraryAgent');
const RecommenderAgent = require('./RecommenderAgent');
const WeatherAgent = require('./WeatherAgent');
const ChatAgent = require('./ChatAgent');
const BudgetAgent = require('./BudgetAgent');

class SupervisorAgent extends AgentBase {
    constructor() {
        // Register the delegate_to_agent tool manually (not in ToolRegistry since it's Supervisor-only)
        super({
            name: 'Supervisor',
            role: 'Central Coordinator',
            systemPrompt: SUPERVISOR_PROMPT,
            toolNames: [], // We'll handle tools manually
            maxIterations: 6 // Allow multiple delegations
        });

        // Initialize specialist agents
        this.agents = {
            ItineraryAgent: new ItineraryAgent(),
            RecommenderAgent: new RecommenderAgent(),
            WeatherAgent: new WeatherAgent(),
            ChatAgent: new ChatAgent(),
            BudgetAgent: new BudgetAgent()
        };

        // The delegation tool definition
        this.delegationTool = {
            name: 'delegate_to_agent',
            description: 'Delegate a task to a specialist agent. Available agents: ItineraryAgent, RecommenderAgent, WeatherAgent, ChatAgent, BudgetAgent. The agent will autonomously process the task and return results.',
            parameters: {
                type: 'object',
                properties: {
                    agent: {
                        type: 'string',
                        description: 'Name of the specialist agent to delegate to. Must be one of: ItineraryAgent, RecommenderAgent, WeatherAgent, ChatAgent, BudgetAgent'
                    },
                    task: {
                        type: 'string',
                        description: 'Clear description of what the agent should do'
                    },
                    context: {
                        type: 'object',
                        description: 'Additional context: cities (array), days (number), interests (array), group_type (string), budget_level (string), language (string), previous_results (any prior agent outputs)'
                    }
                },
                required: ['agent', 'task']
            }
        };

        console.log('[Supervisor] Initialized with agents:', Object.keys(this.agents).join(', '));
    }

    /**
     * Main entry point for the API layer.
     * Handles a user request, delegates to agents, and returns a formatted response.
     * 
     * @param {string} message — the user's message
     * @param {Object} context — { sessionId, language, userId }
     * @returns {Promise<Object>} — response matching the existing API contract
     */
    async handleRequest(message, context = {}) {
        const startTime = Date.now();
        messageBus.clearLog(); // Start fresh trace for each request

        console.log(`\n[Supervisor] ════════════════════════════════════════`);
        console.log(`[Supervisor] New request: "${message.substring(0, 100)}"`);
        console.log(`[Supervisor] Context:`, JSON.stringify(context));
        console.log(`[Supervisor] ════════════════════════════════════════\n`);

        try {
            // Run the Supervisor's ReAct loop with the delegation tool
            const result = await this._supervisorLoop(message, context);

            const elapsed = Date.now() - startTime;
            console.log(`\n[Supervisor] Request completed in ${elapsed}ms`);
            console.log(`[Supervisor] Agent trace:`, messageBus.getTraceSummary());

            return {
                ...result,
                agentTrace: messageBus.getTraceSummary(),
                elapsedMs: elapsed
            };
        } catch (error) {
            console.error('[Supervisor] Fatal error:', error);
            return {
                type: 'chat',
                text: "I'm having trouble processing your request right now. Please try again in a moment! 🙏",
                source: 'error',
                agentTrace: messageBus.getTraceSummary()
            };
        }
    }

    /**
     * The Supervisor's custom ReAct loop with delegation tool.
     * @private
     */
    async _supervisorLoop(message, context) {
        const llm = require('../llm/connector');
        let agentResults = {};
        let lastDelegatedAgent = null;

        // First iteration: send the original user message
        let currentMessage = message;
        // We don't use chat history — each iteration is a fresh generateContent call
        // with the accumulated context in the message itself
        let contextSoFar = '';

        for (let iteration = 0; iteration < this.maxIterations; iteration++) {
            console.log(`[Supervisor] ── Iteration ${iteration + 1}/${this.maxIterations} ──`);

            // Build the full message with accumulated context
            const fullMessage = contextSoFar
                ? `Original user message: "${message}"\n\nPrevious agent results:\n${contextSoFar}\n\nBased on the above, either delegate to another specialist agent or provide your final synthesized response to the user.`
                : currentMessage;

            // Send to LLM with delegation tool (no history — each call is stateless)
            const result = await llm.generateWithTools(
                this.systemPrompt,
                fullMessage,
                [this.delegationTool],
                [] // No history — context is in the message itself
            );

            if (!result.success) {
                console.error('[Supervisor] LLM call failed:', result.error);
                // Fallback: try ChatAgent directly
                return await this._fallbackToChat(message, context);
            }

            if (result.type === 'text') {
                // Supervisor produced a final synthesized answer
                console.log('[Supervisor] Final answer produced');

                // Determine the response type based on which agents were called
                return this._formatResponse(result.text, agentResults, lastDelegatedAgent, context);
            }

            if (result.type === 'functionCall' && result.functionCall.name === 'delegate_to_agent') {
                const { agent: agentName, task, context: delegationContext } = result.functionCall.args;
                console.log(`[Supervisor] Delegating to ${agentName}: "${task?.substring(0, 100)}"`);

                // Execute the delegation
                const agentResult = await this._delegateToAgent(
                    agentName,
                    task,
                    { ...context, ...delegationContext }
                );

                lastDelegatedAgent = agentName;
                agentResults[agentName] = agentResult;

                // Log the delegation on the message bus
                messageBus.publish('Supervisor', agentName, 'delegation', { task, context: delegationContext });

                // Accumulate context for the next iteration
                const resultSummary = JSON.stringify(agentResult).substring(0, 3000);
                contextSoFar += `\n[${agentName}] Task: ${task}\nResult: ${resultSummary}\n`;
            }
        }

        // If we ran out of iterations, use whatever results we have
        return this._formatResponse(null, agentResults, lastDelegatedAgent, context);
    }

    /**
     * Delegate a task to a specialist agent.
     * @private
     */
    async _delegateToAgent(agentName, task, context = {}) {
        const agent = this.agents[agentName];
        if (!agent) {
            console.error(`[Supervisor] Unknown agent: ${agentName}`);
            return { success: false, error: `Unknown agent: ${agentName}` };
        }

        try {
            switch (agentName) {
                case 'ItineraryAgent':
                    return await agent.plan({
                        cities: context.cities || [],
                        days: context.days || 1,
                        interests: context.interests || [],
                        pace: context.pace || 'moderate',
                        group_type: context.group_type || 'family',
                        budget_level: context.budget_level || 'medium',
                        language: context.language || 'en'
                    });

                case 'RecommenderAgent':
                    return await agent.recommend({
                        query: task,
                        cities: context.cities || [],
                        interests: context.interests || [],
                        limit: context.limit || 8,
                        group_type: context.group_type || 'family',
                        budget_level: context.budget_level || 'medium',
                        language: context.language || 'en'
                    });

                case 'WeatherAgent':
                    return await agent.run(task, context);

                case 'ChatAgent':
                    return await agent.handleChat(task, context);

                case 'BudgetAgent':
                    return await agent.run(task, context);

                default:
                    return await agent.run(task, context);
            }
        } catch (err) {
            console.error(`[Supervisor] Delegation to ${agentName} failed:`, err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Format the final response to match the existing API contract.
     * Maps agent results to the response types the frontend expects.
     * @private
     */
    _formatResponse(supervisorText, agentResults, lastAgent, context) {
        // If we have an itinerary result, format it as itinerary type
        if (agentResults.ItineraryAgent?.itinerary) {
            const itin = agentResults.ItineraryAgent;
            return {
                type: 'itinerary',
                itinerary: itin.itinerary,
                source: itin.source,
                intent: { intent: 'itinerary', cities: itin.cities || [] }
            };
        }

        // If we have recommendations, format as recommend type
        if (agentResults.RecommenderAgent?.recommendations) {
            const rec = agentResults.RecommenderAgent;
            return {
                type: 'recommend',
                recommendations: rec.recommendations || [],
                summary: rec.summary || '',
                source: rec.source,
                intent: { intent: 'recommend' }
            };
        }

        // If we have weather data, format as weather type
        if (lastAgent === 'WeatherAgent' && agentResults.WeatherAgent) {
            const weather = agentResults.WeatherAgent;
            return {
                type: 'weather',
                text: weather.text || supervisorText || 'Weather information unavailable.',
                data: weather.data || null,
                source: weather.source || 'WeatherAgent',
                intent: { intent: 'weather' }
            };
        }

        // If we have budget data
        if (lastAgent === 'BudgetAgent' && agentResults.BudgetAgent) {
            const budget = agentResults.BudgetAgent;
            return {
                type: 'chat',
                text: budget.text || supervisorText || 'Budget information unavailable.',
                source: budget.source || 'BudgetAgent',
                intent: { intent: 'budget' }
            };
        }

        // Default: chat response
        const chatResult = agentResults.ChatAgent;
        return {
            type: 'chat',
            text: supervisorText || chatResult?.text || 'I processed your request but could not generate a response. Please try again.',
            source: chatResult?.source || 'Supervisor',
            groundingMetadata: chatResult?.groundingMetadata || null,
            intent: { intent: 'chat' }
        };
    }

    /**
     * Fallback: if the Supervisor's LLM fails, route directly via ChatAgent.
     * @private
     */
    async _fallbackToChat(message, context) {
        console.log('[Supervisor] Falling back to ChatAgent');
        try {
            const chatResult = await this.agents.ChatAgent.handleChat(message, context);
            return {
                type: 'chat',
                text: chatResult.text || 'Sorry, I encountered an issue. Please try again.',
                source: chatResult.source || 'fallback',
                intent: { intent: 'chat' }
            };
        } catch (err) {
            return {
                type: 'chat',
                text: "I'm having trouble right now. Please try again! 🙏",
                source: 'error',
                intent: { intent: 'chat' }
            };
        }
    }
}

module.exports = SupervisorAgent;
