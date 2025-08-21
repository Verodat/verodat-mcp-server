/**
 * Start Procedure Handler
 * Handles the start-procedure, list-procedures, and resume-procedure tools
 */
export declare class StartProcedureHandler {
    /**
     * Handle start-procedure tool
     */
    static handleStartProcedure(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
    /**
     * Handle list-procedures tool
     */
    static handleListProcedures(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
    /**
     * Handle resume-procedure tool
     */
    static handleResumeProcedure(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
    /**
     * Get available procedures for a given context
     */
    static getAvailableProcedures(context: {
        toolName?: string;
        operation?: string;
        tags?: string[];
    }): Promise<import("../types/procedureTypes.js").Procedure[]>;
    /**
     * Check if a tool requires a procedure
     */
    static checkProcedureRequirement(toolName: string, operation?: string): Promise<{
        required: boolean;
        procedure: import("../types/procedureTypes.js").Procedure;
        reason: string | undefined;
        runId: string | undefined;
    } | {
        required: boolean;
        procedure?: undefined;
        reason?: undefined;
        runId?: undefined;
    }>;
}
