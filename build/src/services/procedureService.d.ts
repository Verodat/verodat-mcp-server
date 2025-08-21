/**
 * Procedure Service
 * Core service for managing procedure execution and state
 */
import { ProcedureRun, ProcedureStep, StepResult, EnforcementResult, ProcedureContext } from '../types/procedureTypes.js';
export declare class ProcedureService {
    private activeRuns;
    private stateFile;
    private saveTimer;
    constructor();
    /**
     * Initialize the service
     */
    initialize(verodatHandler: any): Promise<void>;
    /**
     * Start a new procedure run
     */
    startProcedure(procedureId: string, context?: Record<string, any>): Promise<ProcedureRun>;
    /**
     * Resume an existing procedure run
     */
    resumeProcedure(runId: string): Promise<ProcedureRun | null>;
    /**
     * Get the current step for a procedure run
     */
    getCurrentStep(runId: string): Promise<ProcedureStep | null>;
    /**
     * Advance to the next step in a procedure
     * @param runId - The run ID
     * @param stepResult - The result of the current step
     * @param stepResponse - Optional response data to store for the step
     */
    advanceStep(runId: string, stepResult: StepResult, stepResponse?: any): Promise<ProcedureRun | null>;
    /**
     * Execute a procedure step
     */
    executeStep(runId: string, userInput?: any): Promise<StepResult>;
    /**
     * Check if a tool requires a procedure
     */
    checkProcedureRequirement(context: ProcedureContext): Promise<EnforcementResult>;
    /**
     * List all active procedure runs
     */
    listActiveRuns(): Array<{
        runId: string;
        procedureId: string;
        status: string;
    }>;
    /**
     * Cancel a procedure run
     */
    cancelRun(runId: string): Promise<boolean>;
    /**
     * Clean up expired runs
     */
    cleanupExpiredRuns(): Promise<void>;
    /**
     * Find an active run for a procedure
     */
    private findActiveRunForProcedure;
    /**
     * Generate a unique run ID
     */
    private generateRunId;
    /**
     * Load state from disk
     */
    private loadState;
    /**
     * Save state to disk
     */
    private saveState;
    /**
     * Get procedure statistics
     */
    getStatistics(): {
        activeRuns: number;
        completedRuns: number;
        failedRuns: number;
        expiredRuns: number;
    };
}
export declare const procedureService: ProcedureService;
