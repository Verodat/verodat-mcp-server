/**
 * Operation Type Definitions
 * Maps tools to their operation categories for procedure enforcement
 */
export declare enum OperationType {
    READ = "READ",
    WRITE = "WRITE"
}
/**
 * Tool to operation type mapping
 * READ operations don't modify data/configuration
 * WRITE operations create, update, or delete data/configuration
 */
export declare const TOOL_OPERATION_TYPES: Record<string, OperationType>;
/**
 * Get operation type for a tool
 * Defaults to WRITE for unknown tools (safer default)
 */
export declare function getOperationType(toolName: string): OperationType;
/**
 * Check if a tool is a READ operation
 */
export declare function isReadOperation(toolName: string): boolean;
/**
 * Check if a tool is a WRITE operation
 */
export declare function isWriteOperation(toolName: string): boolean;
