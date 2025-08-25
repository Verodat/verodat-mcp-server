/**
 * Procedure Audit Logger Service
 * Logs procedure execution events to a Verodat dataset for compliance and auditing
 */
import { ToolHandlers } from '../handlers/toolHandlers.js';
import { ProcedureRun, Procedure } from '../types/procedureTypes.js';
export interface ProcedureAuditEvent {
    procedure_id: string;
    run_id: string;
    event_type: 'start' | 'complete' | 'fail' | 'expire' | 'step_complete' | 'step_fail' | 'tool_authorized';
    event_timestamp: string;
    user_id?: string;
    procedure_name: string;
    step_id?: string;
    step_name?: string;
    tool_name?: string;
    status?: string;
    error_message?: string;
    metadata?: string;
}
export declare class ProcedureAuditLogger {
    private toolHandlers?;
    private auditDatasetId?;
    private workspaceId?;
    private accountId?;
    private batchQueue;
    private batchTimer?;
    private readonly BATCH_SIZE;
    private readonly BATCH_TIMEOUT;
    private procedureCache;
    /**
     * Initialize the audit logger with tool handlers
     */
    initialize(toolHandlers: ToolHandlers, workspaceId?: number, accountId?: number): void;
    /**
     * Cache a procedure for logging purposes
     */
    cacheProcedure(procedure: Procedure): void;
    /**
     * Get procedure name from cache or return Unknown
     */
    private getProcedureName;
    /**
     * Log procedure start event
     */
    logProcedureStart(run: ProcedureRun, procedure?: Procedure): Promise<void>;
    /**
     * Log procedure completion event
     */
    logProcedureComplete(run: ProcedureRun): Promise<void>;
    /**
     * Log procedure failure event
     */
    logProcedureFail(run: ProcedureRun, error: string): Promise<void>;
    /**
     * Log procedure expiration event
     */
    logProcedureExpire(run: ProcedureRun): Promise<void>;
    /**
     * Log step completion event
     */
    logStepComplete(run: ProcedureRun, stepId: string, stepName: string): Promise<void>;
    /**
     * Log step failure event
     */
    logStepFail(run: ProcedureRun, stepId: string, stepName: string, error: string): Promise<void>;
    /**
     * Log tool authorization event
     */
    logToolAuthorized(runId: string, toolName: string, procedureId: string): Promise<void>;
    /**
     * Internal method to log an event
     */
    private logEvent;
    /**
     * Flush the batch queue to Verodat
     */
    private flushBatch;
    /**
     * Ensure the audit dataset exists
     */
    private ensureAuditDataset;
    /**
     * Force flush any pending events
     */
    flush(): Promise<void>;
}
export declare const procedureAuditLogger: ProcedureAuditLogger;
