import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
/**
 * Tool handler for the MANAGE category
 */
export declare class ManageToolHandler extends BaseToolHandler {
    constructor(server: Server, toolHandlers: ToolHandlers);
    private setupTools;
}
