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
        // ===== CORE DATASET MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["get-datasets"],
            this.toolHandlers.handleGetDatasets.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-dataset-output"],
            this.toolHandlers.handleGetDatasetOutput.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["create-dataset"],
            this.toolHandlers.handleCreateDataset.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["update-dataset"],
            this.toolHandlers.handleUpdateDataset.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["delete-dataset"],
            this.toolHandlers.handleDeleteDataset.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["archive-dataset"],
            this.toolHandlers.handleArchiveDataset.bind(this.toolHandlers)
        );

        // ===== ACCOUNT & WORKSPACE MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["get-accounts"],
            this.toolHandlers.handleGetAccounts.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-workspaces"],
            this.toolHandlers.handleGetWorkspaces.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-ai-context"],
            this.toolHandlers.handleGetAIContext.bind(this.toolHandlers)
        );

        // ===== TARGET FIELD MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["get-dataset-targetfields"],
            this.toolHandlers.handleGetDatasetTargetfields.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["update-dataset-targetfields"],
            this.toolHandlers.handleUpdateTargetFields.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["save-validation-rule"],
            this.toolHandlers.handleSaveValidationRule.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["update-validation-rule"],
            this.toolHandlers.handleUpdateValidationRule.bind(this.toolHandlers)
        );

        // ===== AI QUERY MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["get-queries"],
            this.toolHandlers.handleGetQueries.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["execute-ai-query"],
            this.toolHandlers.handleExecuteAIQuery.bind(this.toolHandlers)
        );

        // ===== FILE MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["upload-file"],
            this.toolHandlers.handleUploadFile.bind(this.toolHandlers)
        );

        // ===== MAPPING MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["add-mapping"],
            this.toolHandlers.handleAddMapping.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-mappings"],
            this.toolHandlers.handleGetMappings.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-mapping"],
            this.toolHandlers.handleGetMapping.bind(this.toolHandlers)
        );

        // this.addTool(
        //     ManageToolDefinitions["update-mapping"],
        //     this.toolHandlers.handleUpdateMapping.bind(this.toolHandlers)
        // );

        // ===== MARKETPLACE/RECIPE MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["install-recipe"],
            this.toolHandlers.handleInstallRecipe.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-recipe-progress"],
            this.toolHandlers.handleGetRecipeProgress.bind(this.toolHandlers)
        );

        // ===== CODE EVALUATION =====
        this.addTool(
            ManageToolDefinitions["compile-expression"],
            this.toolHandlers.handleCompileExpression.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["evaluate-filter-rule"],
            this.toolHandlers.handleEvaluateFilterRule.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["compile-filter-rule"],
            this.toolHandlers.handleCompileFilterRule.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["evaluate-validation-rule"],
            this.toolHandlers.handleEvaluateValidationRule.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["evaluate-transformation-rule"],
            this.toolHandlers.handleEvaluateTransformationRule.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["evaluate-expression"],
            this.toolHandlers.handleEvaluateExpression.bind(this.toolHandlers)
        );

        // ===== ASSET MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["upload-dataset-rows"],
            this.toolHandlers.handleUploadDatasetRows.bind(this.toolHandlers)
        );

        // this.addTool(
        //     ManageToolDefinitions["get-task-status"],
        //     this.toolHandlers.handleGetTaskStatus.bind(this.toolHandlers)
        // );

        this.addTool(
            ManageToolDefinitions["get-asset"],
            this.toolHandlers.handleGetAsset.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["update-asset"],
            this.toolHandlers.handleUpdateAsset.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-asset-progress"],
            this.toolHandlers.handleGetAssetProgress.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-asset-state"],
            this.toolHandlers.handleGetAssetState.bind(this.toolHandlers)
        );

        // ===== MISSING ASSET MANAGEMENT TOOLS =====
        this.addTool(
            ManageToolDefinitions["commit-asset"],
            this.toolHandlers.handleCommitAsset.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-asset-error-summary"],
            this.toolHandlers.handleGetAssetErrorSummary.bind(this.toolHandlers)
        );

        // this.addTool(
        //     ManageToolDefinitions["get-asset-editor-rows"],
        //     this.toolHandlers.handleGetAssetEditorRows.bind(this.toolHandlers)
        // );

        // ===== SUPPLIER GROUP MANAGEMENT =====
        this.addTool(
            ManageToolDefinitions["get-supplier-groups"],
            this.toolHandlers.handleGetSupplierGroups.bind(this.toolHandlers)
        );

        // ===== WORKSPACE VERSIONING =====
        this.addTool(
            ManageToolDefinitions["dataset-promote-configuration"],
            this.toolHandlers.handlePromoteConfiguration.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["get-promotion-progress"],
            this.toolHandlers.handleGetPromotionProgress.bind(this.toolHandlers)
        );

        this.addTool(
            ManageToolDefinitions["compare-dataset-version"],
            this.toolHandlers.handleCompareDatasetVersion.bind(this.toolHandlers)
        );

        // this.addTool(
        //     ManageToolDefinitions["get-configuration-changes"],
        //     this.toolHandlers.handleGetConfigurationChanges.bind(this.toolHandlers)
        // );

        this.addTool(
            ManageToolDefinitions["get-promotable-ids"],
            this.toolHandlers.handleGetPromotableIds.bind(this.toolHandlers)
        );

        // this.addTool(
        //     ManageToolDefinitions["get-workspace-state"],
        //     this.toolHandlers.handleGetWorkspaceState.bind(this.toolHandlers)
        // );

        this.addTool(
            ManageToolDefinitions["create-target-fields"],
            this.toolHandlers.handleCreateTargetFields.bind(this.toolHandlers)
        );
    }
}