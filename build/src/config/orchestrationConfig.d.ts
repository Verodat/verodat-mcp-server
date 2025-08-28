/**
 * Configuration for the Governance Orchestration System
 */
import { OrchestrationConfig } from '../types/orchestrationTypes.js';
export declare const defaultOrchestrationConfig: OrchestrationConfig;
/**
 * Merge user config with defaults
 */
export declare function mergeOrchestrationConfig(userConfig?: Partial<OrchestrationConfig>): OrchestrationConfig;
