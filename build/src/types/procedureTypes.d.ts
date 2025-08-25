/**
 * Procedure type definitions for the Proof of Procedure (PoP) system
 */
/**
 * Types of steps that can be part of a procedure
 */
export type StepType = 'tool' | 'quiz' | 'approval' | 'wait' | 'information';
/**
 * Base interface for all procedure steps
 */
export interface ProcedureStep {
    id: string;
    name: string;
    type: StepType;
    description: string;
    required: boolean;
    retryable: boolean;
    maxRetries: number;
    timeout: number;
    validation: Record<string, any>;
    metadata: Record<string, any>;
    conditions: Record<string, any>;
    onSuccess?: string;
    onFailure?: string;
    onTimeout?: string;
    skipConditions: string[];
}
/**
 * Tool execution step
 */
export interface ToolStep extends ProcedureStep {
    type: 'tool';
    toolName: string;
    toolDescription?: string;
    parameters: Record<string, any>;
    validationRules: Array<{
        name: string;
        rule: string;
        message?: string;
    }>;
    outputValidation?: Record<string, any>;
    sideEffects: string[];
    compensatingAction?: string;
}
/**
 * Quiz step for knowledge verification
 */
export interface QuizStep extends ProcedureStep {
    type: 'quiz';
    question: string;
    options: string[];
    correctAnswer?: string | string[];
    multipleChoice: boolean;
    explanation?: string;
    hints: string[];
    allowedAttempts: number;
    minimumScore: number;
}
/**
 * Approval step
 */
export interface ApprovalStep extends ProcedureStep {
    type: 'approval';
    approvers: string[];
    approvalType: 'single' | 'multiple' | 'unanimous';
    minimumApprovals: number;
    escalation: {
        enabled: boolean;
        timeout: number;
        escalateTo: string[];
    };
    delegationAllowed: boolean;
    comments: {
        required: boolean;
        minLength?: number;
    };
    evidenceRequired: string[];
}
/**
 * Wait step
 */
export interface WaitStep extends ProcedureStep {
    type: 'wait';
    waitType: 'time' | 'external' | 'confirmation';
    duration?: number;
    condition?: string;
    checkInterval: number;
    message: string;
}
/**
 * Information display step
 */
export interface InformationStep extends ProcedureStep {
    type: 'information';
    content: string;
    format: 'text' | 'markdown' | 'html';
    acknowledgmentRequired: boolean;
    displayDuration?: number;
    links: Array<{
        label: string;
        url: string;
    }>;
    attachments: Array<{
        name: string;
        url: string;
        type: string;
    }>;
}
/**
 * Complete procedure definition
 */
export interface Procedure {
    id: string;
    name: string;
    description: string;
    version: string;
    purpose: string;
    triggers: {
        tools: string[];
        operations: string[];
        conditions: string[];
        enforceOnRead?: boolean;
    };
    requirements: Record<string, any>;
    steps: ProcedureStep[];
    metadata: {
        createdAt: string;
        updatedAt: string;
        createdBy: string;
        tags: string[];
        category: string;
        priority: 'low' | 'normal' | 'high' | 'critical';
        estimatedDuration: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
    validation: {
        preConditions: string[];
        postConditions: string[];
        invariants: string[];
    };
    audit: {
        required: boolean;
        level: 'minimal' | 'standard' | 'full';
        retention: number;
    };
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string;
    appliesTo: {
        roles: string[];
        departments: string[];
        operations: string[];
    };
}
/**
 * Runtime state of a procedure execution
 */
export interface ProcedureRun {
    runId: string;
    procedureId: string;
    currentStepIndex: number;
    status: 'active' | 'completed' | 'failed' | 'expired';
    startedAt: string;
    completedSteps: string[];
    stepResponses: Map<string, any>;
    context: Record<string, any>;
    expiresAt?: string;
}
/**
 * Step execution result
 */
export interface StepResult {
    stepId: string;
    status: 'success' | 'failure' | 'skipped';
    response?: any;
    error?: string;
    timestamp: string;
}
/**
 * Procedure discovery context
 */
export interface ProcedureContext {
    toolName?: string;
    operation?: string;
    parameters?: Record<string, any>;
    userRole?: string;
    riskLevel?: string;
}
/**
 * Procedure enforcement result
 */
export interface EnforcementResult {
    allowed: boolean;
    procedureRequired?: Procedure;
    reason?: string;
    runId?: string;
}
/**
 * Step execution result types
 */
export interface StepExecutionResult {
    stepId: string;
    status: 'success' | 'failure' | 'skipped';
    response?: any;
    error?: string;
    timestamp: string;
}
export interface QuizResult {
    passed: boolean;
    score: number;
    answers: Record<string, any>;
    attempts: number;
}
export interface ApprovalResult {
    approved: boolean;
    approver?: string;
    comments?: string;
    timestamp: string;
}
export interface InformationResult {
    acknowledged: boolean;
    timestamp: string;
}
/**
 * Verodat procedure format (from API)
 */
export interface VerodatProcedure {
    id: number;
    procedure_id: string;
    procedure_name: string;
    procedure_description: string;
    procedure_version: string;
    procedure_category: string;
    risk_level: string;
    procedures_protocols: string;
    created_at: string;
    updated_at: string;
    author: string;
    tags: string;
}
/**
 * Parsed procedure format
 */
export interface ParsedProcedure extends Procedure {
    sourceId: number;
    rawProtocols?: any;
}
/**
 * Procedure configuration
 */
export interface ProcedureConfig {
    cache: {
        ttl: number;
        maxSize: number;
        refreshInterval: number;
    };
    enforcement: {
        enabled: boolean;
        strict: boolean;
        runExpiry: number;
        maxConcurrentRuns: number;
        requireForWrite?: boolean;
        requireForRead?: boolean;
    };
    verodat: {
        datasetName: string;
        defaultWorkspaceId?: number;
        defaultAccountId?: number;
        refreshOnStart: boolean;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        auditEnabled: boolean;
        auditPath: string;
    };
    retry: {
        maxAttempts: number;
        initialDelay: number;
        maxDelay: number;
        backoffMultiplier: number;
    };
}
/**
 * Additional type aliases for backward compatibility
 */
export type DiscoveryContext = ProcedureContext;
export type WaitConfiguration = WaitStep;
export type InformationContent = InformationStep;
export interface ToolStepConfig {
    toolName: string;
    requiredParameters?: string[];
    validation?: {
        outputSchema?: any;
        successCriteria?: string;
    };
}
export interface QuizDefinition {
    questions: QuizQuestion[];
    passingScore: number;
    maxAttempts: number;
    showCorrectAnswers: boolean;
}
export interface QuizQuestion {
    id: string;
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    type: 'multiple-choice' | 'text' | 'multi-select';
    explanation?: string;
}
export interface ApprovalRequirement {
    approverRole: string;
    message: string;
    timeout?: number;
    escalation?: {
        after: number;
        to: string;
    };
}
export interface WaitCondition {
    type: 'time' | 'external' | 'confirmation';
    duration?: number;
    checkInterval?: number;
    condition?: string;
    message?: string;
}
export interface InformationDisplay {
    content: string;
    format: 'text' | 'markdown' | 'html';
    requiresAcknowledgment: boolean;
    links?: Array<{
        label: string;
        url: string;
    }>;
}
