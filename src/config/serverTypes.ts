/**
 * Server Type Configuration
 * Defines the three MCP server types and their enforcement rules
 */

export enum ServerType {
  DESIGN = 'design',
  MANAGE = 'manage',
  CONSUME = 'consume'
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
export const SERVER_ENFORCEMENT_CONFIGS: Record<ServerType, ServerEnforcementConfig> = {
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
    enforceOnRead: false,    // READ operations don't require procedures
    enforceOnWrite: true,     // WRITE operations require procedures
    description: 'Manage server for data management - procedures required for write operations'
  },
  [ServerType.CONSUME]: {
    type: ServerType.CONSUME,
    enforceProcedures: true,
    enforceOnRead: false,    // READ operations don't require procedures
    enforceOnWrite: true,     // WRITE operations (like execute-ai-query) require procedures
    description: 'Consume server for data analysts - procedures required for write operations only'
  }
};

/**
 * Get enforcement configuration for a server type
 */
export function getServerEnforcementConfig(serverType: ServerType): ServerEnforcementConfig {
  return SERVER_ENFORCEMENT_CONFIGS[serverType];
}

/**
 * Check if procedures should be enforced for a given operation
 */
export function shouldEnforceProcedure(
  serverType: ServerType, 
  isReadOperation: boolean
): boolean {
  const config = getServerEnforcementConfig(serverType);
  
  if (!config.enforceProcedures) {
    return false;
  }
  
  if (isReadOperation) {
    return config.enforceOnRead;
  } else {
    return config.enforceOnWrite;
  }
}
