import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
import { ManageToolDefinitions } from "./manageToolDefinitions.js";

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
            ManageToolDefinitions["get-datasets"],
            this.toolHandlers.handleGetDatasets.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["get-dataset-output"],
            this.toolHandlers.handleGetDatasetOutput.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["get-accounts"],
            this.toolHandlers.handleGetAccounts.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["get-workspaces"],
            this.toolHandlers.handleGetWorkspaces.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["get-dataset-targetfields"],
            this.toolHandlers.handleGetDatasetTargetfields.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["get-queries"],
            this.toolHandlers.handleGetQueries.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["get-ai-context"],
            this.toolHandlers.handleGetAIContext.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["create-dataset"],
            this.toolHandlers.handleCreateDataset.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["execute-ai-query"],
            this.toolHandlers.handleExecuteAIQuery.bind(this.toolHandlers)
        );
        
        this.addTool(
            ManageToolDefinitions["upload-dataset-rows"],
            this.toolHandlers.handleUploadDatasetRows.bind(this.toolHandlers)
        );
    }
}