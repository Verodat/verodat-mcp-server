/**
 * Procedure Loader Service
 * Loads procedures from Verodat AI_Agent_Procedures dataset with caching
 */
import { Procedure, ProcedureConfig } from '../types/procedureTypes.js';
export declare class ProcedureLoader {
    private cache;
    private config;
    private initialized;
    private lastRefresh;
    private refreshPromise;
    private verodatHandler;
    constructor(config?: Partial<ProcedureConfig>);
    /**
     * Initialize the loader with Verodat handler
     */
    initialize(verodatHandler: any): void;
    /**
     * Load all procedures from Verodat dataset
     */
    loadProcedures(force?: boolean): Promise<Procedure[]>;
    /**
     * Refresh procedures from Verodat
     */
    private refreshProcedures;
    /**
     * Load default/test procedures
     * IMPORTANT: This function has been intentionally emptied as part of the governance orchestration implementation.
     * When procedures are not found in Verodat, the system will now trigger an orchestration workflow
     * to collaboratively create appropriate governance with the user, rather than using hardcoded defaults.
     */
    private loadDefaultProcedures;
    /**
     * Get a specific procedure by ID
     */
    getProcedure(procedureId: string): Promise<Procedure | null>;
    /**
     * Find procedures applicable to a tool or operation
     */
    findApplicableProcedures(context: {
        toolName?: string;
        operation?: string;
        purpose?: string;
        tags?: string[];
    }): Promise<Procedure[]>;
    /**
     * Clear the cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        lastRefresh: number;
        procedures: Array<{
            id: string;
            name: string;
            accessCount: number;
        }>;
    };
    /**
     * Enforce maximum cache size by removing least recently used entries
     */
    private enforceMaxCacheSize;
    /**
     * Validate a procedure before execution
     */
    validateProcedure(procedure: Procedure): {
        valid: boolean;
        errors: string[];
    };
}
export declare const procedureLoader: ProcedureLoader;
