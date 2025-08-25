/**
 * Operation Type Definitions
 * Maps tools to their operation categories for procedure enforcement
 */

export enum OperationType {
  READ = 'READ',
  WRITE = 'WRITE'
}

/**
 * Tool to operation type mapping
 * READ operations don't modify data/configuration
 * WRITE operations create, update, or delete data/configuration
 */
export const TOOL_OPERATION_TYPES: Record<string, OperationType> = {
  // READ operations - no data modification
  'get-datasets': OperationType.READ,
  'get-dataset-output': OperationType.READ,
  'get-dataset-targetfields': OperationType.READ,
  'get-workspaces': OperationType.READ,
  'get-accounts': OperationType.READ,
  'get-queries': OperationType.READ,
  'get-ai-context': OperationType.READ,
  'list-procedures': OperationType.READ,
  
  // WRITE operations - modify data/configuration
  'execute-ai-query': OperationType.WRITE,  // Can execute UPDATE/INSERT/DELETE queries
  'create-dataset': OperationType.WRITE,
  'upload-dataset-rows': OperationType.WRITE,
  'update-dataset': OperationType.WRITE,
  'delete-dataset': OperationType.WRITE,
  'update-dataset-targetfields': OperationType.WRITE,
  'delete-dataset-rows': OperationType.WRITE,
  
  // Procedure management tools (exempt from enforcement)
  'start-procedure': OperationType.READ,
  'resume-procedure': OperationType.READ,
  'procedure-quiz-answer': OperationType.READ,
  'procedure-approval-check': OperationType.READ,
  'procedure-acknowledge': OperationType.READ
};

/**
 * Get operation type for a tool
 * Defaults to WRITE for unknown tools (safer default)
 */
export function getOperationType(toolName: string): OperationType {
  return TOOL_OPERATION_TYPES[toolName] || OperationType.WRITE;
}

/**
 * Check if a tool is a READ operation
 */
export function isReadOperation(toolName: string): boolean {
  return getOperationType(toolName) === OperationType.READ;
}

/**
 * Check if a tool is a WRITE operation
 */
export function isWriteOperation(toolName: string): boolean {
  return getOperationType(toolName) === OperationType.WRITE;
}
