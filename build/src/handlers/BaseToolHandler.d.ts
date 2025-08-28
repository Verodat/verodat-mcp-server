import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { ServerType } from "../config/serverTypes.js";
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}
export declare class BaseToolHandler {
    protected server: Server;
    protected toolHandlers: ToolHandlers;
    protected toolDefinitions: ToolDefinition[];
    protected toolHandlerMap: Map<string, (args: unknown) => Promise<any>>;
    protected procedureEnforcementEnabled: boolean;
    protected serverType: ServerType;
    protected enforceOnRead: boolean;
    protected enforceOnWrite: boolean;
    constructor(server: Server, toolHandlers: ToolHandlers, serverType?: ServerType);
    /**
     * Configure procedure enforcement based on server type
     */
    private configureEnforcement;
    /**
     * Initialize procedure system
     */
    initializeProcedures(): Promise<void>;
    registerTools(): void;
    protected addTool(definition: ToolDefinition, handler: (args: unknown) => Promise<any>): void;
    /**
     * Check if a tool requires a procedure
     */
    protected checkProcedureRequirement(toolName: string, args: any): Promise<{
        required: boolean;
        procedure?: any;
        reason?: string;
        runId?: string;
    }>;
    /**
     * Discover procedure context from tool name and arguments
     */
    protected discoverProcedureContext(toolName: string, args: any): Promise<{
        toolName: string;
        operation?: string;
        purpose?: string;
        tags?: string[];
    }>;
    /**
     * Check if a tool is a procedure-related tool
     */
    protected isProcedureTool(toolName: string): boolean;
    /**
     * Register procedure tools
     */
    protected registerProcedureTools(): void;
}
