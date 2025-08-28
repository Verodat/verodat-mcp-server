/**
 * Orchestration type definitions for agent-based governance creation
 */
/**
 * Message passed between agents during orchestration
 */
export interface AgentMessage {
    from: string;
    to: string;
    action: string;
    context: any;
    priority: 'urgent' | 'normal' | 'low';
    sessionId: string;
    timestamp: string;
}
/**
 * Orchestration session tracking
 */
export interface OrchestrationSession {
    sessionId: string;
    initiator: string;
    operation: string;
    status: 'active' | 'completed' | 'failed';
    agents: string[];
    messages: AgentMessage[];
    createdGovernance: {
        policyId?: string;
        procedureId?: string;
    };
    startTime: string;
    endTime?: string;
}
/**
 * Analysis of governance needs
 */
export interface GovernanceAnalysis {
    needsNewPolicy: boolean;
    needsNewProcedure: boolean;
    similarPolicies: Array<{
        id: string;
        similarity: number;
        canExtend: boolean;
    }>;
    similarProcedures: Array<{
        id: string;
        similarity: number;
        canReuse: boolean;
    }>;
    recommendation: 'create' | 'extend' | 'reuse';
}
/**
 * Agent capabilities definition
 */
export interface AgentCapability {
    agentId: string;
    actions: string[];
    datasets: string[];
    canCreatePolicy: boolean;
    canCreateProcedure: boolean;
    canAnalyze: boolean;
}
/**
 * Agent definition loaded from AI_Agent_Identity dataset
 */
export interface AgentDefinition {
    agentId: string;
    name: string;
    specialization: string;
    primaryDataset: string;
    capabilities: string[];
    coordinationRole: string;
    status: string;
}
/**
 * Request to create governance
 */
export interface GovernanceCreationRequest {
    toolName: string;
    operation: 'READ' | 'WRITE';
    requester: string;
    context: Record<string, any>;
    urgency: 'immediate' | 'deferred';
}
/**
 * Draft policy structure
 */
export interface PolicyDraft {
    policy_id: string;
    title: string;
    purpose: string;
    rules: string[];
    owner: string;
    status: 'draft' | 'review' | 'active';
    basedOn?: string;
}
/**
 * Draft procedure structure
 */
export interface ProcedureDraft {
    procedure_id: string;
    title: string;
    purpose: string;
    steps: Array<{
        type: string;
        description: string;
        required: boolean;
    }>;
    triggers: {
        tools: string[];
        operations: string[];
    };
    policyId: string;
    owner: string;
    status: 'draft' | 'review' | 'active';
}
/**
 * Orchestration configuration
 */
export interface OrchestrationConfig {
    enabled: boolean;
    agents: {
        vera: AgentCapability;
        policyOps: AgentCapability;
        procedureOps: AgentCapability;
    };
    similarity: {
        threshold: number;
        algorithm: 'levenshtein' | 'jaccard' | 'cosine';
    };
    governance: {
        autoApprove: boolean;
        requireReview: boolean;
        storageDatasets: {
            policies: string;
            procedures: string;
        };
    };
    messaging: {
        queueSize: number;
        timeout: number;
        retryAttempts: number;
    };
}
/**
 * Orchestration result
 */
export interface OrchestrationResult {
    success: boolean;
    session: OrchestrationSession;
    createdPolicy?: PolicyDraft;
    createdProcedure?: ProcedureDraft;
    error?: string;
    recommendations?: string[];
}
