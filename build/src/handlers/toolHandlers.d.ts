export declare class ToolHandlers {
    private readonly API_BASE_URL;
    private readonly authToken;
    constructor(apiBaseUrl: string, authToken: string);
    private makeAPIRequest;
    handleCreateDataset(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetDatasets(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetDatasetOutput(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetAccounts(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetWorkspaces(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetAIContext(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleExecuteAIQuery(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetDatasetTargetfields(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetQueries(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleUploadDatasetRows(args: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
