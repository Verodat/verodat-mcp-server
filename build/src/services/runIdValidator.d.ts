/**
 * RunIdValidator Service
 *
 * Provides secure validation of runIds to prevent procedure hijacking.
 * Ensures that runIds can only be used for operations that the associated
 * procedure actually governs.
 */
export interface ValidationResult {
    isValid: boolean;
    reason?: string;
    procedureId?: string;
    allowedTools?: string[];
    violation?: SecurityViolation;
}
export interface SecurityViolation {
    type: 'RUNID_HIJACK' | 'UNAUTHORIZED_TOOL' | 'EXPIRED_RUN' | 'INVALID_STEP';
    attemptedTool: string;
    runId: string;
    procedureId: string;
    message: string;
    timestamp: string;
}
export declare class RunIdValidator {
    private static instance;
    private violationLog;
    private constructor();
    static getInstance(): RunIdValidator;
    /**
     * Validate that a runId is authorized for a specific tool operation
     *
     * This is the CRITICAL security check that prevents runId hijacking
     */
    validateRunIdForTool(runId: string, toolName: string, args?: any): Promise<ValidationResult>;
    /**
     * Extract all tools that a procedure governs
     */
    private extractGovernedTools;
    /**
     * Expand tool patterns to actual tool names
     */
    private expandToolPatterns;
    /**
     * Get tools allowed in the current step
     */
    private getStepAllowedTools;
    /**
     * Additional validation for WRITE operations
     */
    private validateWriteOperation;
    /**
     * Check if tool is a procedure management tool
     */
    private isProcedureManagementTool;
    /**
     * Log security violation for audit
     */
    private logViolation;
    /**
     * Get recent security violations
     */
    getViolations(limit?: number): SecurityViolation[];
    /**
     * Clear violation log (for testing)
     */
    clearViolations(): void;
}
export declare const runIdValidator: RunIdValidator;
