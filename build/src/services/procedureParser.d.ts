/**
 * Procedure Parser Service
 * Parses procedures_protocols JSON from Verodat dataset into structured procedures
 */
import { Procedure } from '../types/procedureTypes.js';
export declare class ProcedureParser {
    /**
     * Parse a procedures_protocols JSON string from Verodat
     */
    static parseProceduresProtocol(jsonString: string): Procedure[];
    /**
     * Parse a single procedure object
     */
    private static parseProcedure;
    /**
     * Parse triggers (backward compatible with applicableTools)
     */
    private static parseTriggers;
    /**
     * Parse a single step
     */
    private static parseStep;
    /**
     * Determine step type from step data
     */
    private static determineStepType;
    /**
     * Validate a parsed procedure
     */
    static validateProcedure(procedure: Procedure): {
        valid: boolean;
        errors: string[];
    };
}
