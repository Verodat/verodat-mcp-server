/**
 * Agent Communicator - Handles message routing between agents
 * Manages message queues, delivery, and session tracking
 */
import { AgentMessage, AgentCapability } from '../types/orchestrationTypes.js';
interface MessageQueueConfig {
    queueSize: number;
    timeout: number;
    retryAttempts: number;
}
export declare class AgentCommunicator {
    private agents;
    private messageQueue;
    private config;
    private messageHandlers;
    private messageHistory;
    constructor(config: MessageQueueConfig);
    /**
     * Register an agent with its capabilities
     */
    registerAgent(agent: AgentCapability): void;
    /**
     * Register a message handler for an agent
     */
    registerHandler(agentId: string, handler: (message: AgentMessage) => Promise<void>): void;
    /**
     * Send a message to an agent
     */
    sendMessage(message: AgentMessage): Promise<void>;
    /**
     * Route a message to the appropriate handler
     */
    private routeMessage;
    /**
     * Simulate agent processing (placeholder for actual agent integration)
     */
    private simulateAgentProcessing;
    /**
     * Start the message processor
     */
    private startMessageProcessor;
    /**
     * Process messages in the queue
     */
    private processMessageQueue;
    /**
     * Get agent capabilities
     */
    getAgentCapabilities(agentId: string): AgentCapability | undefined;
    /**
     * Get all registered agents
     */
    getAllAgents(): AgentCapability[];
    /**
     * Get message history for a session
     */
    getSessionHistory(sessionId: string): AgentMessage[];
    /**
     * Clear message history for a session
     */
    clearSessionHistory(sessionId: string): void;
    /**
     * Get queue status
     */
    getQueueStatus(): {
        size: number;
        messages: Array<{
            to: string;
            action: string;
            priority: string;
        }>;
    };
}
export {};
