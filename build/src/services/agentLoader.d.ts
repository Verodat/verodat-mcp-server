/**
 * Agent Loader Service
 * Loads agent definitions from AI_Agent_Identity dataset in Verodat
 */
import { AgentDefinition } from '../types/orchestrationTypes.js';
export declare class AgentLoader {
    private agentCache;
    private cacheTimestamp;
    private readonly CACHE_TTL;
    private verodatHandler;
    constructor();
    /**
     * Initialize with Verodat handler
     */
    initialize(verodatHandler: any): void;
    /**
     * Load all agent definitions from AI_Agent_Identity dataset
     */
    loadAgents(): Promise<Map<string, AgentDefinition>>;
    /**
     * Get a specific agent by ID
     */
    getAgent(agentId: string): Promise<AgentDefinition | undefined>;
    /**
     * Query the AI_Agent_Identity_Ops dataset
     */
    private queryAgentDataset;
    /**
     * Parse agent capabilities from tool permissions
     */
    private parseCapabilities;
    /**
     * Get default agent definitions
     */
    private getDefaultAgents;
    /**
     * Check if an agent exists and is active
     */
    isAgentActive(agentId: string): Promise<boolean>;
    /**
     * Get agents by capability
     */
    getAgentsByCapability(capability: string): Promise<AgentDefinition[]>;
    /**
     * Refresh agent cache
     */
    refreshCache(): Promise<void>;
}
export declare const agentLoader: AgentLoader;
