/**
 * MessageBus — Inter-Agent Communication Channel
 * 
 * Provides pub/sub messaging between agents with request/response support.
 * Singleton pattern — all agents share the same bus instance.
 */

const { EventEmitter } = require('events');

class MessageBus extends EventEmitter {
    constructor() {
        super();
        this.log = [];
        this.handlers = new Map();
        this.messageId = 0;
    }

    /**
     * Subscribe an agent to receive messages addressed to it.
     * @param {string} agentName — the name of the subscribing agent
     * @param {Function} handler — async (message) => response
     */
    subscribe(agentName, handler) {
        this.handlers.set(agentName, handler);
        console.log(`[MessageBus] ${agentName} subscribed`);
    }

    /**
     * Unsubscribe an agent.
     */
    unsubscribe(agentName) {
        this.handlers.delete(agentName);
    }

    /**
     * Publish a fire-and-forget message from one agent to another.
     * @param {string} from — sender agent name
     * @param {string} to — recipient agent name
     * @param {string} type — message type (e.g., 'task', 'info', 'result')
     * @param {*} content — message payload
     * @returns {string} message ID
     */
    publish(from, to, type, content) {
        const msg = {
            id: `msg_${++this.messageId}`,
            from,
            to,
            type,
            content,
            timestamp: new Date().toISOString()
        };

        this.log.push(msg);
        console.log(`[MessageBus] ${from} → ${to} [${type}]: ${typeof content === 'string' ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100)}`);

        const handler = this.handlers.get(to);
        if (handler) {
            handler(msg).catch(err => {
                console.error(`[MessageBus] Handler error for ${to}:`, err.message);
            });
        } else {
            console.warn(`[MessageBus] No handler registered for agent: ${to}`);
        }

        return msg.id;
    }

    /**
     * Send a message and wait for a response (request/response pattern).
     * Used for inter-agent delegation (e.g., Supervisor → ItineraryAgent).
     * @param {string} from — sender agent name
     * @param {string} to — recipient agent name
     * @param {string} type — message type
     * @param {*} content — message payload
     * @param {number} timeoutMs — timeout in milliseconds (default 60s)
     * @returns {Promise<*>} response from the target agent
     */
    async request(from, to, type, content, timeoutMs = 60000) {
        const msg = {
            id: `msg_${++this.messageId}`,
            from,
            to,
            type,
            content,
            timestamp: new Date().toISOString()
        };

        this.log.push(msg);
        console.log(`[MessageBus] ${from} → ${to} [${type}] (request): ${typeof content === 'string' ? content.substring(0, 100) : JSON.stringify(content).substring(0, 100)}`);

        const handler = this.handlers.get(to);
        if (!handler) {
            throw new Error(`No handler registered for agent: ${to}`);
        }

        return new Promise(async (resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Request to ${to} timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            try {
                const response = await handler(msg);

                clearTimeout(timer);

                const responseMsg = {
                    id: `msg_${++this.messageId}`,
                    from: to,
                    to: from,
                    type: 'response',
                    content: response,
                    timestamp: new Date().toISOString(),
                    inResponseTo: msg.id
                };
                this.log.push(responseMsg);

                console.log(`[MessageBus] ${to} → ${from} [response]: ${JSON.stringify(response).substring(0, 100)}`);
                resolve(response);
            } catch (err) {
                clearTimeout(timer);
                reject(err);
            }
        });
    }

    /**
     * Get the full message trace log.
     * Useful for debugging and showing multi-agent communication.
     */
    getLog() {
        return [...this.log];
    }

    /**
     * Get a summary of recent agent interactions.
     */
    getTraceSummary() {
        return this.log.map(m => ({
            id: m.id,
            flow: `${m.from} → ${m.to}`,
            type: m.type,
            timestamp: m.timestamp,
            preview: typeof m.content === 'string'
                ? m.content.substring(0, 80)
                : JSON.stringify(m.content).substring(0, 80)
        }));
    }

    /**
     * Clear the log (e.g., between requests).
     */
    clearLog() {
        this.log = [];
    }
}

// Singleton instance — all agents share the same bus
const messageBus = new MessageBus();

module.exports = messageBus;
