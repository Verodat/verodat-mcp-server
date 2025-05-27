import { CreateDatasetArgumentsSchema, ExecuteAIQueryArgumentsSchema, GetAIContextArgumentsSchema, GetDatasetOutputArgumentsSchema, GetDatasetsArgumentsSchema, GetWorkspacesArgumentsSchema, GetQueriesArgumentsSchema, GetDatasetTargetFieldsArgumentsSchema, UploadDatasetRowsArgumentsSchema } from "../types/schemas.js";

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
            "Accept": "application/json, text/plain, */*"
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
    
            const responseData = await response.json();
    
            if (!response.ok) {
                return {
                    data: null,
                    error: responseData.message || `HTTP error! status: ${response.status}`,
                };
            }
    
            return { data: responseData as T };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    }    

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
            content: [{ type: "text", text: `Dataset '${validatedArgs.name}' created successfully.` }]
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
}