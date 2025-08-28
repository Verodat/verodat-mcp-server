import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
import { ServerType } from "../config/serverTypes.js";
/**
 * Tool handler for the CONSUME category
 */
export declare class ConsumeToolHandler extends BaseToolHandler {
    constructor(server: Server, toolHandlers: ToolHandlers, serverType?: ServerType);
    private setupTools;
}
