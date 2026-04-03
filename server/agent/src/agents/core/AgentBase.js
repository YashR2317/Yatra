/**
 * AgentBase — Base Class for All Multi-Agent System Agents
 * 
 * Every agent (Supervisor, Itinerary, Recommender, etc.) extends this class.
 * Provides:
 *   - Identity (name, role, systemPrompt)
 *   - Tool execution via ToolRegistry
 *   - ReAct loop (think → tool-call → observe → think → ... → final answer)
 *   - Per-agent memory (conversation history)
 *   - Inter-agent communication via MessageBus
 */

const llm = require('../../llm/connector');
const messageBus = require('./MessageBus');
const toolRegistry = require('./ToolRegistry');

class AgentBase {
    /**
     * @param {Object} config
     * @param {string} config.name — unique agent name (e.g., 'ItineraryAgent')
     * @param {string} config.role — human-readable role description
     * @param {string} config.systemPrompt — the agent's system prompt
     * @param {string[]} config.toolNames — names of tools this agent can use
     * @param {number} config.maxIterations — max ReAct loop iterations (default: 5)
     * @param {number} config.memoryLimit — max conversation turns to keep (default: 20)
     */
    constructor({ name, role, systemPrompt, toolNames = [], maxIterations = 5, memoryLimit = 20 }) {
        this.name = name;
        this.role = role;
        this.systemPrompt = systemPrompt;
        this.toolNames = toolNames;
        this.maxIterations = maxIterations;
        this.memoryLimit = memoryLimit;
        this.memory = [];
        this.trace = []; // Execution trace for this run
        this.sessionHistory = []; // Injected from API for multi-turn context

        // Register with the message bus
        messageBus.subscribe(this.name, this._handleMessage.bind(this));
    }

    /**
     * Main entry point — process a message through the ReAct loop.
     * Loops: think → tool-call → observe → think → ... → final text answer.
     * 
     * @param {string} message — the user/delegated message
     * @param {Object} context — additional context (sessionId, language, etc.)
     * @returns {Promise<Object>} — { success, result, trace }
     */
    async run(message, context = {}) {
        this.trace = [];
        const startTime = Date.now();

        console.log(`\n[${this.name}] ═══ Starting run ═══`);
        console.log(`[${this.name}] Message: ${message.substring(0, 150)}`);

        // Get tool declarations for this agent
        const toolDeclarations = toolRegistry.getDeclarations(this.toolNames);

        let currentMessage = message;
        let iteration = 0;
        let finalResult = null;
        let toolContext = ''; // Accumulate tool results instead of broken history

        while (iteration < this.maxIterations) {
            iteration++;
            console.log(`[${this.name}] ── Iteration ${iteration}/${this.maxIterations} ──`);

            // Build the message with accumulated tool context
            const fullMessage = toolContext
                ? `Original task: ${message}\n\nTool results so far:\n${toolContext}\n\nBased on the tool results above, either call another tool or provide your final answer.`
                : currentMessage;

            // THINK: Send message + tools to LLM with conversation memory
            const recentMemory = [
                ...this.sessionHistory.slice(-6), // Last 3 exchanges from session DB
                ...this.memory.slice(-6),          // Last 3 exchanges from agent memory
            ].slice(-8); // Cap at 8 total messages for context window
            const thinkResult = await this._think(fullMessage, toolDeclarations, recentMemory, context);

            if (!thinkResult.success) {
                console.error(`[${this.name}] Think failed:`, thinkResult.error);
                this.trace.push({ step: 'error', error: thinkResult.error, iteration });
                finalResult = { success: false, error: thinkResult.error };
                break;
            }

            // Check if LLM returned a function call or a text response
            if (thinkResult.type === 'text') {
                // LLM produced a final text answer — we're done
                console.log(`[${this.name}] Final answer produced (${thinkResult.text.length} chars)`);
                this.trace.push({ step: 'final_answer', iteration, preview: thinkResult.text.substring(0, 200) });
                finalResult = { success: true, text: thinkResult.text, source: thinkResult.source };
                break;
            }

            if (thinkResult.type === 'functionCall') {
                const { name: toolName, args } = thinkResult.functionCall;
                console.log(`[${this.name}] Tool call: ${toolName}(${JSON.stringify(args).substring(0, 100)})`);
                this.trace.push({ step: 'tool_call', tool: toolName, args, iteration });

                // EXECUTE: Run the tool
                const toolResult = await this._executeTool(toolName, args);
                this.trace.push({ step: 'tool_result', tool: toolName, resultPreview: JSON.stringify(toolResult).substring(0, 200), iteration });

                // OBSERVE: Accumulate tool result for next iteration
                const toolResultStr = typeof toolResult === 'string'
                    ? toolResult
                    : JSON.stringify(toolResult);

                toolContext += `\n[Tool: ${toolName}] Args: ${JSON.stringify(args)}\nResult: ${toolResultStr.substring(0, 2000)}\n`;
            }
        }

        if (!finalResult) {
            console.warn(`[${this.name}] Max iterations reached without final answer`);
            finalResult = { success: false, error: 'Max iterations reached' };
        }

        // Add to agent memory
        this.addMemory('user', message);
        if (finalResult.text) {
            this.addMemory('assistant', finalResult.text);
        }

        const elapsed = Date.now() - startTime;
        console.log(`[${this.name}] ═══ Run complete (${elapsed}ms, ${iteration} iterations) ═══\n`);

        return {
            ...finalResult,
            agentName: this.name,
            iterations: iteration,
            trace: this.trace,
            elapsedMs: elapsed
        };
    }

    /**
     * Send a message + tools to the LLM and get back either a tool call or text.
     * @private
     */
    async _think(message, toolDeclarations, history, context) {
        const langInstruction = context.language === 'hi'
            ? '\n\nIMPORTANT: Respond ENTIRELY in Hindi (Devanagari script). Place names stay in English.'
            : '';

        const fullPrompt = this.systemPrompt + langInstruction;

        // If we have tools, use function calling
        if (toolDeclarations.length > 0) {
            const result = await llm.generateWithTools(fullPrompt, message, toolDeclarations, history);
            return result;
        }

        // No tools — standard text generation
        const result = await llm.generateResponse(fullPrompt, message, history);
        if (!result.success) {
            return { success: false, error: result.error };
        }
        return { success: true, type: 'text', text: result.text, source: result.source };
    }

    /**
     * Execute a tool via the ToolRegistry.
     * @private
     */
    async _executeTool(toolName, args) {
        try {
            return await toolRegistry.executeTool(toolName, args);
        } catch (err) {
            console.error(`[${this.name}] Tool execution error (${toolName}):`, err.message);
            return { error: err.message };
        }
    }

    /**
     * Send a message to another agent via the MessageBus.
     * @param {string} toAgent — target agent name
     * @param {string} type — message type
     * @param {*} content — message payload
     * @returns {Promise<*>} response from the target agent
     */
    async sendMessage(toAgent, type, content) {
        return messageBus.request(this.name, toAgent, type, content);
    }

    /**
     * Handle an incoming message from the MessageBus.
     * Subclasses can override this for custom inter-agent behavior.
     * Default: runs the message content through the agent's ReAct loop.
     * @private
     */
    async _handleMessage(message) {
        console.log(`[${this.name}] Received message from ${message.from}: ${message.type}`);
        const content = typeof message.content === 'string'
            ? message.content
            : JSON.stringify(message.content);
        const result = await this.run(content, {});
        return result;
    }

    /**
     * Add a message to the agent's memory (capped at memoryLimit).
     */
    addMemory(role, content) {
        this.memory.push({ role, content });
        if (this.memory.length > this.memoryLimit) {
            this.memory = this.memory.slice(-this.memoryLimit);
        }
    }

    /**
     * Clear the agent's memory.
     */
    clearMemory() {
        this.memory = [];
        this.sessionHistory = [];
    }

    /**
     * Inject session history from the database for multi-turn context.
     * Call this before run() for follow-up messages.
     * @param {Array} history — [{role, content}, ...]
     */
    setSessionHistory(history = []) {
        this.sessionHistory = history;
    }

    /**
     * Get the agent's execution trace.
     */
    getTrace() {
        return [...this.trace];
    }
}

module.exports = AgentBase;
