import { BaseToolHandler } from "./BaseToolHandler.js";
import { DesignToolDefinitions } from "./designToolDefinitions.js";
import { ServerType } from "../config/serverTypes.js";
/**
 * Tool handler for the DESIGN category
 */
export class DesignToolHandler extends BaseToolHandler {
    constructor(server, toolHandlers, serverType = ServerType.DESIGN) {
        super(server, toolHandlers, serverType);
        this.setupTools();
    }
    setupTools() {
        this.addTool(DesignToolDefinitions["get-datasets"], this.toolHandlers.handleGetDatasets.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["get-dataset-output"], this.toolHandlers.handleGetDatasetOutput.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["get-accounts"], this.toolHandlers.handleGetAccounts.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["get-workspaces"], this.toolHandlers.handleGetWorkspaces.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["get-dataset-targetfields"], this.toolHandlers.handleGetDatasetTargetfields.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["get-queries"], this.toolHandlers.handleGetQueries.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["get-ai-context"], this.toolHandlers.handleGetAIContext.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["execute-ai-query"], this.toolHandlers.handleExecuteAIQuery.bind(this.toolHandlers));
        this.addTool(DesignToolDefinitions["create-dataset"], this.toolHandlers.handleCreateDataset.bind(this.toolHandlers));
        // Critical for bootstrap operations
        this.addTool(DesignToolDefinitions["upload-dataset-rows"], this.toolHandlers.handleUploadDatasetRows.bind(this.toolHandlers));
    }
}
