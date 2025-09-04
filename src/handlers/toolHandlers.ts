import { z } from "zod";
import {
    CreateDatasetArgumentsSchema,
    ExecuteAIQueryArgumentsSchema,
    GetAIContextArgumentsSchema,
    GetDatasetOutputArgumentsSchema,
    GetDatasetsArgumentsSchema,
    GetWorkspacesArgumentsSchema,
    GetQueriesArgumentsSchema,
    GetDatasetTargetFieldsArgumentsSchema,
    UploadDatasetRowsArgumentsSchema,
    DeleteDatasetSchema,
    PromoteConfigurationArgumentsSchema,
    UpdateTargetFieldsArgumentsSchema,
    AddMappingArgumentsSchema,
    UploadFileArgumentsSchema,
    GetMappingsArgumentsSchema,
    GetMappingArgumentsSchema,
    //UpdateMappingArgumentsSchema,
    InstallRecipeArgumentsSchema,
    GetRecipeProgressArgumentsSchema,
    CompileExpressionArgumentsSchema,
    EvaluateFilterRuleArgumentsSchema,
    CompileFilterRuleArgumentsSchema,
    EvaluateValidationRuleArgumentsSchema,
    EvaluateTransformationRuleArgumentsSchema,
    EvaluateExpressionArgumentsSchema,
    SaveValidationRuleArgumentsSchema,
    UpdateValidationRuleArgumentsSchema,
    // GetTaskStatusArgumentsSchema,
    GetAssetArgumentsSchema,
    UpdateAssetArgumentsSchema,
    GetAssetProgressArgumentsSchema,
    GetAssetStateArgumentsSchema,
    CommitAssetArgumentsSchema,
    GetAssetErrorSummaryArgumentsSchema,
    // GetAssetEditorRowsArgumentsSchema,
    UpdateDatasetArgumentsSchema,
    GetSupplierGroupsArgumentsSchema,
    GetPromotionProgressArgumentsSchema,
    CompareDatasetVersionArgumentsSchema,
    // GetConfigurationChangesArgumentsSchema,
    GetPromotableIdsArgumentsSchema,
    // GetWorkspaceStateArgumentsSchema,
    ArchiveDatasetArgumentsSchema,
    CreateTargetFieldsArgumentsSchema
} from "../types/schemas.js";

export class ToolHandlers {
    private readonly API_BASE_URL: string;
    private readonly authToken: string;

    constructor(apiBaseUrl: string, authToken: string) {
        this.API_BASE_URL = apiBaseUrl;
        this.authToken = authToken;
    }

    private async makeAPIRequest<T>(
        url: string,
        method: string,
        body?: unknown
    ): Promise<{ data: T | null; error?: string }> {
        const headers: Record<string, string> = {
            Authorization: `ApiKey ${this.authToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*",
            "api-call-type": "API_CALL_MCP"
        };

        if (this.API_BASE_URL === "https://verodat.azure-api.net") {
            headers["Ocp-Apim-Subscription-Key"] = this.authToken;
        }

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    return {
                        data: null,
                        error: errorData.message || `HTTP error! status: ${response.status}`
                    };
                } catch (e) {
                    return {
                        data: null,
                        error: `HTTP error! status: ${response.status}`
                    };
                }
            }

            const contentLength = response.headers.get('content-length');
            if (contentLength === '0') {
                return { data: { success: true } as unknown as T };
            }

            const responseText = await response.text();

            if (!responseText || responseText.trim() === '') {
                return { data: { success: true } as unknown as T };
            }

            try {
                const responseData = JSON.parse(responseText);
                return { data: responseData as T };
            } catch (e) {
                return {
                    data: null,
                    error: "Failed to parse response as JSON"
                };
            }
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    }

    // ===== ACCOUNT & WORKSPACE MANAGEMENT =====

    async handleGetAccounts(args: unknown) {
        const url = `${this.API_BASE_URL}/ai-accounts`;
        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetWorkspaces(args: unknown) {
        const validatedArgs = GetWorkspacesArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/ai-list`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetAIContext(args: unknown) {
        const validatedArgs = GetAIContextArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/ai-context`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== DATASET MANAGEMENT =====

    async handleCreateDataset(args: unknown) {
        const validatedArgs = CreateDatasetArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            name: validatedArgs.name,
            description: validatedArgs.description || "",
            targetFields: validatedArgs.targetFields,
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetDatasets(args: unknown) {
        const validatedArgs = GetDatasetsArgumentsSchema.parse(args);
        const queryParams = new URLSearchParams({
            offset: validatedArgs.offset.toString(),
            max: validatedArgs.max.toString(),
            filter: validatedArgs.filter
        });

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets?${queryParams}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleUpdateDataset(args: unknown) {
        const validatedArgs = UpdateDatasetArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}`;

        const { data, error } = await this.makeAPIRequest(url, "PATCH", {
            name: validatedArgs.name,
            description: validatedArgs.description,
            filename: validatedArgs.filename,
            filedata: validatedArgs.filedata
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleDeleteDataset(args: unknown) {
        const validatedArgs = DeleteDatasetSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/version/delete`;

        const { data, error } = await this.makeAPIRequest(url, "POST");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleArchiveDataset(args: unknown) {
        const validatedArgs = ArchiveDatasetArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/version/archive`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            mappings: validatedArgs.mappings
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetDatasetOutput(args: unknown) {
        const validatedArgs = GetDatasetOutputArgumentsSchema.parse(args);
        const queryParams = new URLSearchParams({
            offset: validatedArgs.offset.toString(),
            max: validatedArgs.max.toString(),
            filter: validatedArgs.filter
        });

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/dout-data?${queryParams}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== TARGET FIELD MANAGEMENT =====

    async handleGetDatasetTargetfields(args: unknown) {
        const validatedArgs = GetDatasetTargetFieldsArgumentsSchema.parse(args);
        const queryParams = new URLSearchParams({
            offset: validatedArgs.offset.toString(),
            max: validatedArgs.max.toString(),
        });

        if (validatedArgs.filter) {
            queryParams.append('filter', validatedArgs.filter);
        }
        if (validatedArgs.sort) {
            queryParams.append('sort', validatedArgs.sort);
        }

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/targetfields?${queryParams}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleUpdateTargetFields(args: unknown) {
        const validatedArgs = UpdateTargetFieldsArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/targetfields`;

        const payload = {
            target_fields: validatedArgs.targetFields
        };

        const { data, error } = await this.makeAPIRequest(url, "POST", payload);

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleSaveValidationRule(args: unknown) {
        const validatedArgs = SaveValidationRuleArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/targetfields/${validatedArgs.targetFieldId}/validation-rules`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            name: validatedArgs.name,
            code: validatedArgs.code,
            critical: validatedArgs.critical,
            type: validatedArgs.type,
            keepUncommittedData: validatedArgs.keepUncommittedData
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleUpdateValidationRule(args: unknown) {
        const validatedArgs = UpdateValidationRuleArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/targetfields/${validatedArgs.targetFieldId}/validation-rules/${validatedArgs.ruleId}`;

        const { data, error } = await this.makeAPIRequest(url, "PATCH", {
            name: validatedArgs.name,
            code: validatedArgs.code,
            critical: validatedArgs.critical,
            type: validatedArgs.type,
            keepUncommittedData: validatedArgs.keepUncommittedData
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== FILE MANAGEMENT =====

    async handleUploadFile(args: unknown) {
        const validatedArgs = UploadFileArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/files`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            filename: validatedArgs.filename,
            filedata: validatedArgs.filedata,
            metadata: validatedArgs.metadata,
            assetId: validatedArgs.assetId,
            supplierGroupId: validatedArgs.supplierGroupId,
            bindAsset: validatedArgs.bindAsset,
            dueDate: validatedArgs.dueDate
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== MAPPING MANAGEMENT =====

    async handleAddMapping(args: unknown) {
        const validatedArgs = AddMappingArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/mappings`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            name: validatedArgs.name,
            entries: validatedArgs.entries
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetMappings(args: unknown) {
        const validatedArgs = GetMappingsArgumentsSchema.parse(args);

        const queryParams = new URLSearchParams({
            offset: validatedArgs.offset.toString(),
            max: validatedArgs.max.toString()
        });

        if (validatedArgs.filter) {
            queryParams.append('filter', validatedArgs.filter);
        }
        if (validatedArgs.nameLike) {
            queryParams.append('nameLike', validatedArgs.nameLike);
        }

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/mappings?${queryParams}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetMapping(args: unknown) {
        const validatedArgs = GetMappingArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/mappings/${validatedArgs.mappingId}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // async handleUpdateMapping(args: unknown) {
    //     const validatedArgs = UpdateMappingArgumentsSchema.parse(args);

    //     const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/mappings/${validatedArgs.mappingId}`;

    //     const { data, error } = await this.makeAPIRequest(url, "PUT", {
    //         name: validatedArgs.name,
    //         filter_rule_name: validatedArgs.filter_rule_name,
    //         filter_rule_code: validatedArgs.filter_rule_code,
    //         entries: validatedArgs.entries
    //     });

    //     if (error) {
    //         return {
    //             content: [{ type: "text", text: error }]
    //         };
    //     }

    //     return {
    //         content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    //     };
    // }

    // ===== MARKETPLACE =====

    async handleInstallRecipe(args: unknown) {
        const validatedArgs = InstallRecipeArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/marketplace`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            templateId: validatedArgs.templateId,
            recipe: validatedArgs.recipe
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetRecipeProgress(args: unknown) {
        const validatedArgs = GetRecipeProgressArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/recipes/${validatedArgs.sequenceId}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== CODE EVALUATION =====

    async handleCompileExpression(args: unknown) {
        const validatedArgs = CompileExpressionArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/compile-expression`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            expression: validatedArgs.expression
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleEvaluateFilterRule(args: unknown) {
        const validatedArgs = EvaluateFilterRuleArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/evaluate-filter-rule`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            expression: validatedArgs.expression,
            source_fields: validatedArgs.source_fields,
            metadata: validatedArgs.metadata
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleCompileFilterRule(args: unknown) {
        const validatedArgs = CompileFilterRuleArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/compile-filter-rule`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            expression: validatedArgs.expression,
            source_fields: validatedArgs.source_fields,
            expressionTarget: validatedArgs.expressionTarget
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleEvaluateValidationRule(args: unknown) {
        const validatedArgs = EvaluateValidationRuleArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/evaluate-validation-rule`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            validation_rules: validatedArgs.validation_rules,
            target_fields: validatedArgs.target_fields
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleEvaluateTransformationRule(args: unknown) {
        const validatedArgs = EvaluateTransformationRuleArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/evaluate-transformation-rule`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            trulename: validatedArgs.trulename,
            trulecode: validatedArgs.trulecode,
            target_fields: validatedArgs.target_fields
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleEvaluateExpression(args: unknown) {
        const validatedArgs = EvaluateExpressionArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/evaluate-expression`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            expressions: validatedArgs.expressions,
            source_fields: validatedArgs.source_fields,
            metadata: validatedArgs.metadata
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== ASSET MANAGEMENT =====

    async handleUploadDatasetRows(args: unknown) {
        const validatedArgs = UploadDatasetRowsArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/upload`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            data: validatedArgs.data
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // async handleGetTaskStatus(args: unknown) {
    //     const validatedArgs = GetTaskStatusArgumentsSchema.parse(args);

    //     const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/tasks/${validatedArgs.taskId}`;

    //     const { data, error } = await this.makeAPIRequest(url, "GET");

    //     if (error) {
    //         return {
    //             content: [{ type: "text", text: error }]
    //         };
    //     }

    //     return {
    //         content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    //     };
    // }

    async handleGetAsset(args: unknown) {
        const validatedArgs = GetAssetArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/assets/${validatedArgs.assetId}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleUpdateAsset(args: unknown) {
        const validatedArgs = UpdateAssetArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/assets/${validatedArgs.assetId}`;

        const { data, error } = await this.makeAPIRequest(url, "PATCH", {
            name: validatedArgs.name,
            mapping: validatedArgs.mapping,
            metadata: validatedArgs.metadata
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetAssetProgress(args: unknown) {
        const validatedArgs = GetAssetProgressArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/assets/${validatedArgs.assetId}/progress`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetAssetState(args: unknown) {
        const validatedArgs = GetAssetStateArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/assets/${validatedArgs.assetId}/state`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleCommitAsset(args: unknown) {
        const validatedArgs = CommitAssetArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/assets/${validatedArgs.assetId}/state/commit`;

        const { data, error } = await this.makeAPIRequest(url, "PATCH");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetAssetErrorSummary(args: unknown) {
        const validatedArgs = GetAssetErrorSummaryArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/assets/${validatedArgs.assetId}/editor/error-summary`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // async handleGetAssetEditorRows(args: unknown) {
    //     const validatedArgs = GetAssetEditorRowsArgumentsSchema.parse(args);

    //     const queryParams = new URLSearchParams({
    //         offset: validatedArgs.offset.toString(),
    //         max: validatedArgs.max.toString()
    //     });

    //     const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/assets/${validatedArgs.assetId}/editor-rows?${queryParams}`;

    //     const { data, error } = await this.makeAPIRequest(url, "GET");

    //     if (error) {
    //         return {
    //             content: [{ type: "text", text: error }]
    //         };
    //     }

    //     return {
    //         content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    //     };
    // }

    // ===== SUPPLIER GROUP =====

    async handleGetSupplierGroups(args: unknown) {
        const validatedArgs = GetSupplierGroupsArgumentsSchema.parse(args);

        const queryParams = new URLSearchParams({
            offset: validatedArgs.offset.toString(),
            max: validatedArgs.max.toString()
        });

        if (validatedArgs.filterBy) {
            queryParams.append('filterBy', validatedArgs.filterBy);
        }
        if (validatedArgs.name) {
            queryParams.append('name', validatedArgs.name);
        }
        if (validatedArgs.sort) {
            queryParams.append('sort', validatedArgs.sort);
        }

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/supplier-group?${queryParams}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== AI QUERY MANAGEMENT =====

    async handleGetQueries(args: unknown) {
        const validatedArgs = GetQueriesArgumentsSchema.parse(args);
        const queryParams = new URLSearchParams({
            offset: validatedArgs.offset.toString(),
            max: validatedArgs.max.toString()
        });

        if (validatedArgs.filter) {
            queryParams.append('filter', validatedArgs.filter);
        }
        if (validatedArgs.sort) {
            queryParams.append('sort', validatedArgs.sort);
        }

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/queries?${queryParams}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleExecuteAIQuery(args: unknown) {
        const validatedArgs = ExecuteAIQueryArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/ai-query`;

        const { data, error } = await this.makeAPIRequest(url, "POST", {
            query: validatedArgs.query
        });

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // ===== WORKSPACE VERSIONING =====

    async handlePromoteConfiguration(args: unknown) {
        const validatedArgs = PromoteConfigurationArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/configuration/promote/${validatedArgs.scope}`;

        const payload = {
            keepUncommittedData: validatedArgs.keepUncommittedData ?? false,
            dataSetIds: validatedArgs.dataSetIds ?? [],
            promoteAll: validatedArgs.promoteAll ?? true
        };

        const { data, error } = await this.makeAPIRequest(url, "POST", payload);

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleGetPromotionProgress(args: unknown) {
        const validatedArgs = GetPromotionProgressArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/configuration/promote/progress`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    async handleCompareDatasetVersion(args: unknown) {
        const validatedArgs = CompareDatasetVersionArgumentsSchema.parse(args);

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/configuration/datasets/${validatedArgs.datasetId}/compare-version`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // async handleGetConfigurationChanges(args: unknown) {
    //     const validatedArgs = GetConfigurationChangesArgumentsSchema.parse(args);

    //     const queryParams = new URLSearchParams({
    //         target: validatedArgs.target,
    //         offset: validatedArgs.offset.toString(),
    //         max: validatedArgs.max.toString(),
    //         sort: validatedArgs.sort
    //     });

    //     if (validatedArgs.filter) {
    //         queryParams.append('filter', validatedArgs.filter);
    //     }

    //     const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/configuration/changes?${queryParams}`;

    //     const { data, error } = await this.makeAPIRequest(url, "GET");

    //     if (error) {
    //         return {
    //             content: [{ type: "text", text: error }]
    //         };
    //     }

    //     return {
    //         content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    //     };
    // }

    async handleGetPromotableIds(args: unknown) {
        const validatedArgs = GetPromotableIdsArgumentsSchema.parse(args);

        const queryParams = new URLSearchParams();
        if (validatedArgs.filter) {
            queryParams.append('filter', validatedArgs.filter);
        }

        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/configuration/promote/ids?${queryParams}`;

        const { data, error } = await this.makeAPIRequest(url, "GET");

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }

    // async handleGetWorkspaceState(args: unknown) {
    //     const validatedArgs = GetWorkspaceStateArgumentsSchema.parse(args);

    //     const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/configuration/state`;

    //     const { data, error } = await this.makeAPIRequest(url, "GET");

    //     if (error) {
    //         return {
    //             content: [{ type: "text", text: error }]
    //         };
    //     }

    //     return {
    //         content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
    //     };
    // }

    async handleCreateTargetFields(args: unknown) {
        const validatedArgs = CreateTargetFieldsArgumentsSchema.parse(args);
        const url = `${this.API_BASE_URL}/accounts/${validatedArgs.accountId}/workspaces/${validatedArgs.workspaceId}/mcp/datasets/${validatedArgs.datasetId}/targetfields`;

        const payload = {
            target_fields: validatedArgs.target_fields
        };

        const { data, error } = await this.makeAPIRequest(url, "POST", payload);

        if (error) {
            return {
                content: [{ type: "text", text: error }]
            };
        }

        return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
        };
    }
}