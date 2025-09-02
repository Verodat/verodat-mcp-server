/**
 * Basic Audit Service
 *
 * Provides audit logging for authorization decisions, security violations,
 * and procedure-related events.
 */
export interface AuditEntry {
    id: string;
    timestamp: string;
    eventType: AuditEventType;
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    toolName?: string;
    procedureId?: string;
    runId?: string;
    userId?: string;
    workspaceId?: number;
    accountId?: number;
    action: string;
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    reason?: string;
    metadata?: Record<string, any>;
}
export declare enum AuditEventType {
    AUTH_SUCCESS = "AUTH_SUCCESS",
    AUTH_FAILURE = "AUTH_FAILURE",
    AUTH_BLOCKED = "AUTH_BLOCKED",
    SECURITY_VIOLATION = "SECURITY_VIOLATION",
    RUNID_HIJACK_ATTEMPT = "RUNID_HIJACK_ATTEMPT",
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
    PROCEDURE_START = "PROCEDURE_START",
    PROCEDURE_COMPLETE = "PROCEDURE_COMPLETE",
    PROCEDURE_FAIL = "PROCEDURE_FAIL",
    PROCEDURE_EXPIRE = "PROCEDURE_EXPIRE",
    TOOL_EXECUTION = "TOOL_EXECUTION",
    TOOL_BLOCKED = "TOOL_BLOCKED",
    TOOL_ERROR = "TOOL_ERROR",
    SYSTEM_OPERATION = "SYSTEM_OPERATION",
    SYSTEM_ERROR = "SYSTEM_ERROR"
}
export declare class AuditService {
    private static instance;
    private auditLog;
    private auditDir;
    private currentLogFile;
    private maxMemoryEntries;
    private flushTimer;
    private initialized;
    private initPromise;
    private constructor();
    static getInstance(): AuditService;
    /**
     * Initialize audit directory - ensures it's only done once and properly awaited
     */
    private initializeAuditDir;
    /**
     * Actually perform the initialization
     */
    private doInitialize;
    /**
     * Generate log file name based on current date
     */
    private getLogFileName;
    /**
     * Log an authorization success
     */
    logAuthSuccess(params: {
        toolName: string;
        runId?: string;
        procedureId?: string;
        reason?: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Log an authorization failure
     */
    logAuthFailure(params: {
        toolName: string;
        runId?: string;
        procedureId?: string;
        reason: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Log a security violation
     */
    logSecurityViolation(params: {
        violationType: string;
        toolName: string;
        runId?: string;
        procedureId?: string;
        reason: string;
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Log a procedure event
     */
    logProcedureEvent(params: {
        eventType: AuditEventType;
        procedureId: string;
        runId: string;
        action: string;
        result?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Log a tool execution
     */
    logToolExecution(params: {
        toolName: string;
        runId?: string;
        procedureId?: string;
        result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
        reason?: string;
        executionTime?: number;
        metadata?: Record<string, any>;
    }): Promise<void>;
    /**
     * Core logging function
     */
    private logEntry;
    /**
     * Schedule a flush to disk
     */
    private scheduleFlush;
    /**
     * Flush audit entries to disk
     */
    private flushToDisk;
    /**
     * Force flush to disk immediately
     */
    forceFlush(): Promise<void>;
    /**
     * Get recent audit entries from memory
     */
    getRecentEntries(limit?: number, filter?: {
        eventType?: AuditEventType;
        severity?: string;
        toolName?: string;
        runId?: string;
    }): AuditEntry[];
    /**
     * Get security violations
     */
    getSecurityViolations(limit?: number): AuditEntry[];
    /**
     * Generate unique entry ID
     */
    private generateEntryId;
    /**
     * Get audit statistics
     */
    getStatistics(): Promise<{
        totalEntries: number;
        securityViolations: number;
        authFailures: number;
        toolExecutions: number;
        procedureRuns: number;
    }>;
    /**
     * Clear audit log (for testing)
     */
    clearLog(): void;
}
export declare const auditService: AuditService;
