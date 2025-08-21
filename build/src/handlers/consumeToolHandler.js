import { BaseToolHandler } from "./BaseToolHandler.js";
import { ConsumeToolDefinitions } from "./consumeToolDefinitions.js";
/**
 * Tool handler for the CONSUME category
 */
export class ConsumeToolHandler extends BaseToolHandler {
    constructor(server, toolHandlers) {
        super(server, toolHandlers);
        this.setupTools();
        this.registerProcedureTools(); // Register procedure tools
        this.initializeProcedures(); // Initialize procedure system
    }
    setupTools() {
        // Add all CONSUME category tools
        this.addTool(ConsumeToolDefinitions["get-datasets"], this.toolHandlers.handleGetDatasets.bind(this.toolHandlers));
        this.addTool(ConsumeToolDefinitions["get-dataset-output"], this.toolHandlers.handleGetDatasetOutput.bind(this.toolHandlers));
        this.addTool(ConsumeToolDefinitions["get-accounts"], this.toolHandlers.handleGetAccounts.bind(this.toolHandlers));
        this.addTool(ConsumeToolDefinitions["get-workspaces"], this.toolHandlers.handleGetWorkspaces.bind(this.toolHandlers));
        this.addTool(ConsumeToolDefinitions["get-dataset-targetfields"], this.toolHandlers.handleGetDatasetTargetfields.bind(this.toolHandlers));
        this.addTool(ConsumeToolDefinitions["get-queries"], this.toolHandlers.handleGetQueries.bind(this.toolHandlers));
        this.addTool(ConsumeToolDefinitions["get-ai-context"], this.toolHandlers.handleGetAIContext.bind(this.toolHandlers));
        this.addTool(ConsumeToolDefinitions["execute-ai-query"], this.toolHandlers.handleExecuteAIQuery.bind(this.toolHandlers));
    }
}
