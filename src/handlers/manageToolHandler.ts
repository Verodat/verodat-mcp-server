import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
import { ToolDefinitions } from "./toolDefinition.js";

/**
 * Tool handler for the MANAGE category
 */
export class ManageToolHandler extends BaseToolHandler {
    constructor(server: Server, toolHandlers: ToolHandlers) {
        super(server, toolHandlers);
        this.setupTools();
    }

    private setupTools(): void {
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
            ToolDefinitions["create-dataset"],
            this.toolHandlers.handleCreateDataset.bind(this.toolHandlers)
        );
        
        this.addTool(
            ToolDefinitions["execute-ai-query"],
            this.toolHandlers.handleExecuteAIQuery.bind(this.toolHandlers)
        );
        
        this.addTool(
            ToolDefinitions["upload-dataset-rows"],
            this.toolHandlers.handleUploadDatasetRows.bind(this.toolHandlers)
        );
    }
}