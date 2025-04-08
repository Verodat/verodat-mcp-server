import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { ToolDefinitions } from "./toolDefinition.js";
import { BaseToolHandler } from "./BaseToolHandler.js";

/**
 * Tool handler for the CONSUME category
 */
export class ConsumeToolHandler extends BaseToolHandler {
    constructor(server: Server, toolHandlers: ToolHandlers) {
        super(server, toolHandlers);
        this.setupTools();
    }

    private setupTools(): void {
        // Add all CONSUME category tools
        this.addTool(
            ToolDefinitions["get-datasets"],
            this.toolHandlers.handleGetDatasets.bind(this.toolHandlers)
        );
        
        this.addTool(
            ToolDefinitions["get-dataset-output"],
            this.toolHandlers.handleGetDatasetOutput.bind(this.toolHandlers)
        );
        
        this.addTool(
            ToolDefinitions["get-accounts"],
            this.toolHandlers.handleGetAccounts.bind(this.toolHandlers)
        );
        
        this.addTool(
            ToolDefinitions["get-workspaces"],
            this.toolHandlers.handleGetWorkspaces.bind(this.toolHandlers)
        );
        
        this.addTool(
            ToolDefinitions["get-dataset-targetfields"],
            this.toolHandlers.handleGetDatasetTargetfields.bind(this.toolHandlers)
        );
        
        this.addTool(
            ToolDefinitions["get-queries"],
            this.toolHandlers.handleGetQueries.bind(this.toolHandlers)
        );

        this.addTool(
            ToolDefinitions["get-ai-context"],
            this.toolHandlers.handleGetAIContext.bind(this.toolHandlers)
        );

        this.addTool(
            ToolDefinitions["execute-ai-query"],
            this.toolHandlers.handleExecuteAIQuery.bind(this.toolHandlers)
        );
    }
}