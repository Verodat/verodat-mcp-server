import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
/**
 * Tool handler for the DESIGN category
 */
export declare class DesignToolHandler extends BaseToolHandler {
    constructor(server: Server, toolHandlers: ToolHandlers);
    private setupTools;
}
