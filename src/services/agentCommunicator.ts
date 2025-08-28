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

interface QueuedMessage {
  message: AgentMessage;
  attempts: number;
  timestamp: number;
}

export class AgentCommunicator {
  private agents: Map<string, AgentCapability> = new Map();
  private messageQueue: QueuedMessage[] = [];
  private config: MessageQueueConfig;
  private messageHandlers: Map<string, (message: AgentMessage) => Promise<void>> = new Map();
  private messageHistory: Map<string, AgentMessage[]> = new Map(); // sessionId -> messages

  constructor(config: MessageQueueConfig) {
    this.config = config;
    this.startMessageProcessor();
  }

  /**
   * Register an agent with its capabilities
   */
  registerAgent(agent: AgentCapability): void {
    this.agents.set(agent.agentId, agent);
    
    if (process.argv[2] === 'call') {
      console.log(`Registered agent: ${agent.agentId} with capabilities:`, agent.actions);
    }
  }

  /**
   * Register a message handler for an agent
   */
  registerHandler(agentId: string, handler: (message: AgentMessage) => Promise<void>): void {
    this.messageHandlers.set(agentId, handler);
  }

  /**
   * Send a message to an agent
   */
  async sendMessage(message: AgentMessage): Promise<void> {
    // Validate recipient exists
    if (!this.agents.has(message.to)) {
      throw new Error(`Agent ${message.to} not registered`);
    }

    // Add to session history
    if (!this.messageHistory.has(message.sessionId)) {
      this.messageHistory.set(message.sessionId, []);
    }
    this.messageHistory.get(message.sessionId)?.push(message);

    // Queue the message
    const queuedMessage: QueuedMessage = {
      message,
      attempts: 0,
      timestamp: Date.now()
    };

    // Priority queue management
    if (message.priority === 'urgent') {
      this.messageQueue.unshift(queuedMessage);
    } else {
      this.messageQueue.push(queuedMessage);
    }

    // Enforce queue size limit
    while (this.messageQueue.length > this.config.queueSize) {
      const removed = this.messageQueue.pop();
      if (removed && process.argv[2] === 'call') {
        console.warn(`Message queue full, dropped message to ${removed.message.to}`);
      }
    }

    if (process.argv[2] === 'call') {
      console.log(`Queued message from ${message.from} to ${message.to} (${message.action})`);
    }
  }

  /**
   * Route a message to the appropriate handler
   */
  private async routeMessage(message: AgentMessage): Promise<void> {
    const handler = this.messageHandlers.get(message.to);
    
    if (handler) {
      try {
        await handler(message);
      } catch (error) {
        if (process.argv[2] === 'call') {
          console.error(`Handler error for ${message.to}:`, error);
        }
        throw error;
      }
    } else {
      // Simulate message processing for agents without handlers
      // This is where actual agent logic would be integrated
      await this.simulateAgentProcessing(message);
    }
  }

  /**
   * Simulate agent processing (placeholder for actual agent integration)
   */
  private async simulateAgentProcessing(message: AgentMessage): Promise<void> {
    const agent = this.agents.get(message.to);
    if (!agent) return;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    if (process.argv[2] === 'call') {
      console.log(`${message.to} processed message: ${message.action}`);
    }

    // Simulate response based on agent capabilities
    if (agent.canCreatePolicy && message.action === 'create-policy') {
      // Policy creation simulation
      if (process.argv[2] === 'call') {
        console.log(`${agent.agentId}: Creating policy based on request`);
      }
    }

    if (agent.canCreateProcedure && message.action === 'create-procedure') {
      // Procedure creation simulation
      if (process.argv[2] === 'call') {
        console.log(`${agent.agentId}: Creating procedure based on request`);
      }
    }

    if (agent.canAnalyze && message.action === 'analyze') {
      // Analysis simulation
      if (process.argv[2] === 'call') {
        console.log(`${agent.agentId}: Analyzing governance requirements`);
      }
    }
  }

  /**
   * Start the message processor
   */
  private startMessageProcessor(): void {
    setInterval(() => this.processMessageQueue(), 100);
  }

  /**
   * Process messages in the queue
   */
  private async processMessageQueue(): Promise<void> {
    if (this.messageQueue.length === 0) return;

    const queuedMessage = this.messageQueue.shift();
    if (!queuedMessage) return;

    // Check message timeout
    const age = Date.now() - queuedMessage.timestamp;
    if (age > this.config.timeout) {
      if (process.argv[2] === 'call') {
        console.warn(`Message to ${queuedMessage.message.to} timed out`);
      }
      return;
    }

    try {
      await this.routeMessage(queuedMessage.message);
    } catch (error) {
      queuedMessage.attempts++;
      
      if (queuedMessage.attempts < this.config.retryAttempts) {
        // Retry the message
        this.messageQueue.push(queuedMessage);
        if (process.argv[2] === 'call') {
          console.log(`Retrying message to ${queuedMessage.message.to} (attempt ${queuedMessage.attempts})`);
        }
      } else {
        if (process.argv[2] === 'call') {
          console.error(`Failed to deliver message to ${queuedMessage.message.to} after ${queuedMessage.attempts} attempts`);
        }
      }
    }
  }

  /**
   * Get agent capabilities
   */
  getAgentCapabilities(agentId: string): AgentCapability | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentCapability[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get message history for a session
   */
  getSessionHistory(sessionId: string): AgentMessage[] {
    return this.messageHistory.get(sessionId) || [];
  }

  /**
   * Clear message history for a session
   */
  clearSessionHistory(sessionId: string): void {
    this.messageHistory.delete(sessionId);
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    size: number;
    messages: Array<{ to: string; action: string; priority: string }>;
  } {
    return {
      size: this.messageQueue.length,
      messages: this.messageQueue.map(q => ({
        to: q.message.to,
        action: q.message.action,
        priority: q.message.priority
      }))
    };
  }
}
