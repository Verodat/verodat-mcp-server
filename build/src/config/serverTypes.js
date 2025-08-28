/**
 * Server Type Configuration
 * Defines the three MCP server types and their enforcement rules
 */
export var ServerType;
(function (ServerType) {
    ServerType["DESIGN"] = "design";
    ServerType["MANAGE"] = "manage";
    ServerType["CONSUME"] = "consume";
})(ServerType || (ServerType = {}));
/**
 * Enforcement configurations for each server type
 */
export const SERVER_ENFORCEMENT_CONFIGS = {
    [ServerType.DESIGN]: {
        type: ServerType.DESIGN,
        enforceProcedures: false, // No enforcement for bootstrap/setup
        enforceOnRead: false,
        enforceOnWrite: false,
        description: 'Design server for data architects - no procedure enforcement for bootstrap and setup operations'
    },
    [ServerType.MANAGE]: {
        type: ServerType.MANAGE,
        enforceProcedures: true,
        enforceOnRead: false, // READ operations don't require procedures
        enforceOnWrite: true, // WRITE operations require procedures
        description: 'Manage server for data management - procedures required for write operations'
    },
    [ServerType.CONSUME]: {
        type: ServerType.CONSUME,
        enforceProcedures: true,
        enforceOnRead: false, // READ operations don't require procedures
        enforceOnWrite: true, // WRITE operations (like execute-ai-query) require procedures
        description: 'Consume server for data analysts - procedures required for write operations only'
    }
};
/**
 * Get enforcement configuration for a server type
 */
export function getServerEnforcementConfig(serverType) {
    return SERVER_ENFORCEMENT_CONFIGS[serverType];
}
/**
 * Check if procedures should be enforced for a given operation
 */
export function shouldEnforceProcedure(serverType, isReadOperation) {
    const config = getServerEnforcementConfig(serverType);
    if (!config.enforceProcedures) {
        return false;
    }
    if (isReadOperation) {
        return config.enforceOnRead;
    }
    else {
        return config.enforceOnWrite;
    }
}
