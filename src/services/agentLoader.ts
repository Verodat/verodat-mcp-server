/**
 * Agent Loader Service
 * Loads agent definitions from AI_Agent_Identity dataset in Verodat
 */

import { AgentDefinition } from '../types/orchestrationTypes.js';

export class AgentLoader {
  private agentCache: Map<string, AgentDefinition> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private verodatHandler: any; // Will be injected from BaseToolHandler

  constructor() {
    if (process.argv[2] === 'call') {
      console.log('[AgentLoader] Initialized');
    }
  }

  /**
   * Initialize with Verodat handler
   */
  initialize(verodatHandler: any): void {
    this.verodatHandler = verodatHandler;
    if (process.argv[2] === 'call') {
      console.log('[AgentLoader] Initialized with Verodat handler');
    }
  }

  /**
   * Load all agent definitions from AI_Agent_Identity dataset
   */
  async loadAgents(): Promise<Map<string, AgentDefinition>> {
    // Check cache validity
    if (this.agentCache.size > 0 && Date.now() - this.cacheTimestamp < this.CACHE_TTL) {
      if (process.argv[2] === 'call') {
        console.log('[AgentLoader] Returning cached agents');
      }
      return this.agentCache;
    }

    if (!this.verodatHandler) {
      if (process.argv[2] === 'call') {
        console.log('[AgentLoader] No Verodat handler, returning default agents');
      }
      return this.getDefaultAgents();
    }

    try {
      // Query AI_Agent_Identity_Ops dataset
      const agents = await this.queryAgentDataset();
      
      // Clear and rebuild cache
      this.agentCache.clear();
      
      for (const agent of agents) {
        const agentDef: AgentDefinition = {
          agentId: agent.agent_id,
          name: agent.agent_name,
          specialization: agent.specialization,
          primaryDataset: agent.primary_dataset,
          capabilities: this.parseCapabilities(agent),
          coordinationRole: agent.coordination_role,
          status: agent.agent_status || 'active'
        };
        
        this.agentCache.set(agentDef.agentId, agentDef);
      }

      this.cacheTimestamp = Date.now();
      
      if (process.argv[2] === 'call') {
        console.log(`[AgentLoader] Loaded ${this.agentCache.size} agents from Verodat`);
      }

      return this.agentCache;
    } catch (error) {
      if (process.argv[2] === 'call') {
        console.error('[AgentLoader] Error loading agents from Verodat:', error);
        console.log('[AgentLoader] Falling back to default agents');
      }
      return this.getDefaultAgents();
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(agentId: string): Promise<AgentDefinition | undefined> {
    const agents = await this.loadAgents();
    return agents.get(agentId);
  }

  /**
   * Query the AI_Agent_Identity_Ops dataset
   */
  private async queryAgentDataset(): Promise<any[]> {
    if (!this.verodatHandler) {
      return [];
    }

    // Simulate querying the dataset
    // In real implementation, would use the actual Verodat query
    return [
      {
        agent_id: 'AGENT-VERA',
        agent_name: 'VERA Governance Orchestrator',
        specialization: 'Governance orchestration, policy/procedure creation coordination',
        primary_dataset: 'Core_RAIDA',
        tool_permissions: '["verodat-manage", "verodat-consume"]',
        coordination_role: 'Orchestrates governance creation when procedures are missing',
        agent_status: 'Active'
      },
      {
        agent_id: 'AGENT-POLICIES-OPS',
        agent_name: 'Policy Management Specialist',
        specialization: 'Policy creation, review schedules, compliance monitoring',
        primary_dataset: 'Business_Policies_Ops',
        tool_permissions: '["verodat-manage", "verodat-consume"]',
        coordination_role: 'Maintains policy governance and health',
        agent_status: 'Active'
      },
      {
        agent_id: 'AGENT-PROCEDURES-OPS',
        agent_name: 'Procedure Management Specialist',
        specialization: 'Procedure creation, execution tracking, optimization',
        primary_dataset: 'AI_Agent_Procedures_Ops',
        tool_permissions: '["verodat-manage", "verodat-consume"]',
        coordination_role: 'Ensures procedure effectiveness and compliance',
        agent_status: 'Active'
      },
      {
        agent_id: 'AGENT-RAIDA-OPS',
        agent_name: 'RAIDA Management Specialist',
        specialization: 'RAIDA tracking, audit logging, change management',
        primary_dataset: 'Core_RAIDA',
        tool_permissions: '["verodat-manage", "verodat-consume"]',
        coordination_role: 'Logs all governance changes automatically',
        agent_status: 'Active'
      },
      {
        agent_id: 'AGENT-DATAMODEL-OPS',
        agent_name: 'Data Model Governance Agent',
        specialization: 'Impact analysis, schema changes, relationship management',
        primary_dataset: 'AI_Data_Model_Registry',
        tool_permissions: '["verodat-manage", "verodat-consume"]',
        coordination_role: 'Coordinates all schema changes and model evolution',
        agent_status: 'Active'
      }
    ];
  }

  /**
   * Parse agent capabilities from tool permissions
   */
  private parseCapabilities(agent: any): string[] {
    const capabilities: string[] = [];
    
    // Parse specialization into capabilities
    if (agent.specialization) {
      const specs = agent.specialization.split(',').map((s: string) => s.trim());
      capabilities.push(...specs);
    }

    // Parse tool permissions
    if (agent.tool_permissions) {
      try {
        const permissions = JSON.parse(agent.tool_permissions);
        capabilities.push(...permissions.map((p: string) => `Can use ${p}`));
      } catch {
        // Invalid JSON, ignore
      }
    }

    return capabilities;
  }

  /**
   * Get default agent definitions
   */
  private getDefaultAgents(): Map<string, AgentDefinition> {
    const defaults = new Map<string, AgentDefinition>();

    // VERA orchestrator
    defaults.set('AGENT-VERA', {
      agentId: 'AGENT-VERA',
      name: 'VERA Governance Orchestrator',
      specialization: 'Governance orchestration and coordination',
      primaryDataset: 'Core_RAIDA',
      capabilities: [
        'Orchestrate governance creation',
        'Coordinate specialist agents',
        'Analyze governance requirements',
        'Create draft policies and procedures'
      ],
      coordinationRole: 'Primary orchestrator for governance creation',
      status: 'active'
    });

    // Policy specialist
    defaults.set('AGENT-POLICIES-OPS', {
      agentId: 'AGENT-POLICIES-OPS',
      name: 'Policy Management Specialist',
      specialization: 'Policy creation and management',
      primaryDataset: 'Business_Policies_Ops',
      capabilities: [
        'Create new policies',
        'Analyze policy requirements',
        'Optimize policy rules',
        'Deduplicate policies'
      ],
      coordinationRole: 'Policy governance specialist',
      status: 'active'
    });

    // Procedure specialist
    defaults.set('AGENT-PROCEDURES-OPS', {
      agentId: 'AGENT-PROCEDURES-OPS',
      name: 'Procedure Management Specialist',
      specialization: 'Procedure creation and management',
      primaryDataset: 'AI_Agent_Procedures_Ops',
      capabilities: [
        'Create procedures from policies',
        'Optimize procedure steps',
        'Track procedure execution',
        'Validate procedure compliance'
      ],
      coordinationRole: 'Procedure governance specialist',
      status: 'active'
    });

    return defaults;
  }

  /**
   * Check if an agent exists and is active
   */
  async isAgentActive(agentId: string): Promise<boolean> {
    const agent = await this.getAgent(agentId);
    return agent?.status === 'active' || agent?.status === 'Active';
  }

  /**
   * Get agents by capability
   */
  async getAgentsByCapability(capability: string): Promise<AgentDefinition[]> {
    const agents = await this.loadAgents();
    const matches: AgentDefinition[] = [];

    for (const agent of agents.values()) {
      if (agent.capabilities.some((c: string) => 
        c.toLowerCase().includes(capability.toLowerCase())
      )) {
        matches.push(agent);
      }
    }

    return matches;
  }

  /**
   * Refresh agent cache
   */
  async refreshCache(): Promise<void> {
    this.cacheTimestamp = 0; // Force refresh on next load
    await this.loadAgents();
  }
}

// Singleton instance
export const agentLoader = new AgentLoader();
