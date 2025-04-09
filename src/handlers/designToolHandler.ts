import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolHandlers } from "./toolHandlers.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
import { DesignToolDefinitions } from "./designToolDefinitions.js";

/**
 * Tool handler for the DESIGN category
 */
export class DesignToolHandler extends BaseToolHandler {
    constructor(server: Server, toolHandlers: ToolHandlers) {
        super(server, toolHandlers);
        this.setupTools();
    }

    private setupTools(): void {
        this.addTool(
            DesignToolDefinitions["get-datasets"],
            this.toolHandlers.handleGetDatasets.bind(this.toolHandlers)
        );
        
        this.addTool(
            DesignToolDefinitions["get-dataset-output"],
            this.toolHandlers.handleGetDatasetOutput.bind(this.toolHandlers)
        );
        
        this.addTool(
            DesignToolDefinitions["get-accounts"],
            this.toolHandlers.handleGetAccounts.bind(this.toolHandlers)
        );
        
        this.addTool(
            DesignToolDefinitions["get-workspaces"],
            this.toolHandlers.handleGetWorkspaces.bind(this.toolHandlers)
        );
        
        this.addTool(
            DesignToolDefinitions["get-dataset-targetfields"],
            this.toolHandlers.handleGetDatasetTargetfields.bind(this.toolHandlers)
        );
        
        this.addTool(
            DesignToolDefinitions["get-queries"],
            this.toolHandlers.handleGetQueries.bind(this.toolHandlers)
        );

        this.addTool(
            DesignToolDefinitions["get-ai-context"],
            this.toolHandlers.handleGetAIContext.bind(this.toolHandlers)
        );

        this.addTool(
            DesignToolDefinitions["execute-ai-query"],
            this.toolHandlers.handleExecuteAIQuery.bind(this.toolHandlers)
        );
        
        this.addTool(
            DesignToolDefinitions["create-dataset"],
            this.toolHandlers.handleCreateDataset.bind(this.toolHandlers)
        );
    }
}