/**
 * Server Type Configuration
 * Defines the three MCP server types and their enforcement rules
 */
export declare enum ServerType {
    DESIGN = "design",
    MANAGE = "manage",
    CONSUME = "consume"
}
export interface ServerEnforcementConfig {
    type: ServerType;
    enforceProcedures: boolean;
    enforceOnRead: boolean;
    enforceOnWrite: boolean;
    description: string;
}
/**
 * Enforcement configurations for each server type
 */
export declare const SERVER_ENFORCEMENT_CONFIGS: Record<ServerType, ServerEnforcementConfig>;
/**
 * Get enforcement configuration for a server type
 */
export declare function getServerEnforcementConfig(serverType: ServerType): ServerEnforcementConfig;
/**
 * Check if procedures should be enforced for a given operation
 */
export declare function shouldEnforceProcedure(serverType: ServerType, isReadOperation: boolean): boolean;
