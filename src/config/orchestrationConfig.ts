/**
 * Configuration for the Governance Orchestration System
 */

import { OrchestrationConfig } from '../types/orchestrationTypes.js';

export const defaultOrchestrationConfig: OrchestrationConfig = {
  enabled: true,
  
  agents: {
    vera: {
      agentId: 'VERA',
      actions: ['orchestrate', 'coordinate', 'analyze', 'decide'],
      datasets: ['AI_Agent_Identity', 'Core_RAIDA'],
      canCreatePolicy: false,
      canCreateProcedure: false,
      canAnalyze: true
    },
    policyOps: {
      agentId: 'AGENT-POLICIES-OPS',
      actions: ['create-policy', 'analyze-policy', 'optimize-policies', 'deduplicate'],
      datasets: ['Business_Policies', 'Business_Policies_Ops'],
      canCreatePolicy: true,
      canCreateProcedure: false,
      canAnalyze: true
    },
    procedureOps: {
      agentId: 'AGENT-PROCEDURES-OPS',
      actions: ['create-procedure', 'optimize-steps', 'map-policy-to-procedure', 'validate'],
      datasets: ['AI_Agent_Procedures', 'AI_Agent_Procedures_Ops'],
      canCreatePolicy: false,
      canCreateProcedure: true,
      canAnalyze: true
    }
  },
  
  similarity: {
    threshold: 0.75,  // 75% similarity triggers deduplication check
    algorithm: 'jaccard'
  },
  
  governance: {
    autoApprove: false,   // Require explicit user approval
    requireReview: true,  // Always review generated governance
    storageDatasets: {
      policies: 'Business_Policies_Ops',
      procedures: 'AI_Agent_Procedures_Ops'
    }
  },
  
  messaging: {
    queueSize: 100,
    timeout: 30000,  // 30 seconds
    retryAttempts: 3
  }
};

/**
 * Merge user config with defaults
 */
export function mergeOrchestrationConfig(
  userConfig?: Partial<OrchestrationConfig>
): OrchestrationConfig {
  if (!userConfig) {
    return defaultOrchestrationConfig;
  }
  
  return {
    enabled: userConfig.enabled ?? defaultOrchestrationConfig.enabled,
    agents: {
      vera: {
        ...defaultOrchestrationConfig.agents.vera,
        ...(userConfig.agents?.vera || {})
      },
      policyOps: {
        ...defaultOrchestrationConfig.agents.policyOps,
        ...(userConfig.agents?.policyOps || {})
      },
      procedureOps: {
        ...defaultOrchestrationConfig.agents.procedureOps,
        ...(userConfig.agents?.procedureOps || {})
      }
    },
    similarity: {
      ...defaultOrchestrationConfig.similarity,
      ...(userConfig.similarity || {})
    },
    governance: {
      ...defaultOrchestrationConfig.governance,
      ...(userConfig.governance || {})
    },
    messaging: {
      ...defaultOrchestrationConfig.messaging,
      ...(userConfig.messaging || {})
    }
  };
}
