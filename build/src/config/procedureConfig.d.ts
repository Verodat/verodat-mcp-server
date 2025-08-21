/**
 * Configuration for the Procedure system
 */
import { ProcedureConfig } from '../types/procedureTypes.js';
export declare const defaultProcedureConfig: ProcedureConfig;
/**
 * Storage configuration (separate from main config for backward compatibility)
 */
export declare const storageConfig: {
    stateDirectory: string;
    runFileName: string;
};
/**
 * Merge user config with defaults
 */
export declare function mergeConfig(userConfig?: Partial<ProcedureConfig>): ProcedureConfig;
/**
 * Get storage path for procedure runs
 */
export declare function getStoragePath(): string;
/**
 * Get audit log path
 */
export declare function getAuditPath(procedureId: string): string;
