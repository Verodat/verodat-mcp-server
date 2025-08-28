/**
 * Orchestration Service - Central coordinator for governance creation
 * Manages communication between agents and orchestrates the governance creation workflow
 */
import { OrchestrationSession, GovernanceCreationRequest, OrchestrationResult, OrchestrationConfig } from '../types/orchestrationTypes.js';
export declare class OrchestrationService {
    private activeSessions;
    private config;
    private agentCommunicator;
    private governanceAnalyzer;
    private verodatHandler;
    constructor(config?: Partial<OrchestrationConfig>);
    /**
     * Initialize with Verodat handler
     */
    initialize(verodatHandler: any): Promise<void>;
    /**
     * Start an orchestration session for governance creation
     */
    startOrchestration(request: GovernanceCreationRequest): Promise<OrchestrationResult>;
    /**
     * Analyze if new governance is needed
     */
    private analyzeGovernanceNeed;
    /**
     * Orchestrate policy creation with Policy Agent
     */
    private orchestratePolicyCreation;
    /**
     * Orchestrate procedure creation with Procedure Agent
     */
    private orchestrateProcedureCreation;
    /**
     * Reuse existing governance instead of creating new
     */
    private reuseExistingGovernance;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Handle missing governance (called from BaseToolHandler)
     */
    handleMissingGovernance(toolName: string, operation: string, context?: any): Promise<OrchestrationResult>;
    /**
     * Complete an orchestration session
     */
    completeOrchestration(sessionId: string): Promise<void>;
    /**
     * Get session status
     */
    getSessionStatus(sessionId: string): OrchestrationSession | null;
    /**
     * Get all active sessions
     */
    getActiveSessions(): OrchestrationSession[];
    /**
     * Check if orchestration is enabled
     */
    isEnabled(): boolean;
}
export declare const orchestrationService: OrchestrationService;
