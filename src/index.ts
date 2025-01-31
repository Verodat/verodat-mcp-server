import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Rate Limiter Implementation
class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private readonly maxTokens: number;
    private readonly refillInterval: number;

    constructor(maxTokens: number, refillInterval: number) {
        this.maxTokens = maxTokens;
        this.tokens = maxTokens;
        this.lastRefill = Date.now();
        this.refillInterval = refillInterval;
    }

    tryAcquire(): boolean {
        this.refill();

        if (this.tokens > 0) {
            this.tokens--;
            return true;
        }

        return false;
    }

    private refill(): void {
        const now = Date.now();
        const elapsed = now - this.lastRefill;

        // Only refill if a complete interval has passed
        if (elapsed >= this.refillInterval) {
            this.tokens = this.maxTokens;
            this.lastRefill = now;
        }
    }
}

// Secure Transport Implementation
export const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB
export const MAX_REQUESTS_PER_MINUTE = 100;
export const CONNECTION_TIMEOUT = 30000; // 30 seconds

const MessageSchema = z.object({
    jsonrpc: z.literal("2.0"),
    id: z.union([z.number(), z.string()]).optional(),
    method: z.string().optional(),
    params: z.record(z.unknown()).optional(),
    result: z.unknown().optional(),
    error: z.object({
        code: z.number(),
        message: z.string(),
        data: z.unknown().optional()
    }).optional()
});

export class SecureStdioTransport implements Transport {
    private rateLimiter: RateLimiter;
    private connectionActive: boolean = false;
    private messageQueue: Array<{ message: any, timestamp: number }> = [];
    private lastHealthCheck: number = Date.now();

    constructor() {
        this.rateLimiter = new RateLimiter(MAX_REQUESTS_PER_MINUTE, 60000);
    }

    onmessage?: (message: any) => void;
    onerror?: (error: Error) => void;
    onclose?: () => void;

    async start(): Promise<void> {
        try {
            this.connectionActive = true;
            this.startHealthCheck();

            process.stdin.on('data', async (data) => {
                try {
                    await this.handleIncomingMessage(data);
                } catch (error) {
                    this.handleError(error as Error);
                }
            });

            process.stdin.on('end', () => this.close());
            process.stdin.on('error', (error) => this.handleError(error));

        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }

    public async handleIncomingMessage(data: Buffer): Promise<void> {
        if (data.length > MAX_MESSAGE_SIZE) {
            throw new Error(`Message size exceeds limit of ${MAX_MESSAGE_SIZE} bytes`);
        }

        if (!this.rateLimiter.tryAcquire()) {
            throw new Error('Rate limit exceeded');
        }

        try {
            const message = JSON.parse(data.toString());
            const validatedMessage = MessageSchema.parse(message);

            this.messageQueue.push({
                message: validatedMessage,
                timestamp: Date.now()
            });

            if (this.onmessage) {
                await this.onmessage(validatedMessage);
            }

            this.cleanMessageQueue();

        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Invalid message format: ${error.message}`);
            }
            throw error;
        }
    }

    async send(message: any): Promise<void> {
        try {
            const validatedMessage = MessageSchema.parse(message);

            if (!this.connectionActive) {
                throw new Error('Transport is not connected');
            }

            const messageSize = Buffer.from(JSON.stringify(validatedMessage)).length;
            if (messageSize > MAX_MESSAGE_SIZE) {
                throw new Error(`Message size exceeds limit of ${MAX_MESSAGE_SIZE} bytes`);
            }

            process.stdout.write(JSON.stringify(validatedMessage) + '\n');

        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }

    private handleError(error: Error): void {
        if (this.onerror) {
            this.onerror(error);
        }
    }

    private cleanMessageQueue(): void {
        const now = Date.now();
        const timeoutThreshold = now - CONNECTION_TIMEOUT;
        this.messageQueue = this.messageQueue.filter(item => item.timestamp > timeoutThreshold);
    }

    private startHealthCheck(): void {
        setInterval(() => {
            const now = Date.now();
            if (now - this.lastHealthCheck > CONNECTION_TIMEOUT) {
                this.handleError(new Error('Health check failed - connection timeout'));
                this.close();
            }
            this.lastHealthCheck = now;
        }, 5000);
    }

    async close(): Promise<void> {
        this.connectionActive = false;
        this.messageQueue = [];

        if (this.onclose) {
            this.onclose();
        }
    }
}

let API_BASE_URL = "https://verodat.io/api/v3";

function setApiBaseUrl(url: string) {
    API_BASE_URL = url;
}

const FieldTypeEnum = z.enum(["string", "number", "integer", "date"]);
type FieldType = z.infer<typeof FieldTypeEnum>;

// Define Zod schemas for validation
const CreateDatasetArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    name: z.string(),
    description: z.string().optional(),
    targetFields: z
        .array(
            z.object({
                name: z.string(),
                type: FieldTypeEnum,
                mandatory: z.boolean(),
                isKeyComponent: z.boolean().optional(),
                description: z.string().optional(),
            })
        )
        .nonempty(),
});

const GetDatasetsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    offset: z.number().default(0),
    max: z.number().default(9999),
    filter: z.string()
});

const GetDatasetOutputArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    offset: z.number().default(0),
    max: z.number().default(9999),
    filter: z.string()
});

const GetWorkspacesArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
});

const GetAIContextArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
});

const ExecuteAIQueryArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    query: z.string()
});

interface ServerConfig {
    authToken?: string;
}

let serverConfig: ServerConfig = {};

// Create server instance
const server = new Server(
    {
        name: "verodat-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create-dataset",
                description: `WHEN TO USE:
- When setting up a new data structure from scratch
- When you need to store a new type of data with specific validation rules
- When creating companion datasets
- When separating data into different logical collections
- When you need to enforce specific data types and mandatory fields

Tool Description:
Creates a new dataset with defined schema and validation rules in a specified workspace.

Required parameters:
- accountId: Target account ID
- workspaceId: Target workspace ID
- name: Dataset name (must be unique)
- targetFields: Array of field definitions

Each targetField must have:
- name: Field identifier (e.g., "customer_id")
- type: One of ["string", "number", "integer", "date"]
- mandatory: Boolean indicating if field is required
- Optional: isKeyComponent (boolean), description (string)

Example usage:
Creating a customer dataset:
{
  "accountId": 123,
  "workspaceId": 123,
  "name": "Customer_Database",
  "description": "Customer information tracking system",
  "targetFields": [
    {
      "name": "customer_id",
      "type": "string",
      "mandatory": true,
      "isKeyComponent": true,
      "description": "Unique customer identifier"
    },
    {
      "name": "join_date",
      "type": "date",
      "mandatory": true
    }
  ]
}`,
                inputSchema: {
                    type: "object",
                    properties: {
                        accountId: {
                            type: "number",
                            description: "Account ID where the workspace belongs",
                        },
                        workspaceId: {
                            type: "number",
                            description: "Workspace ID where the dataset will be created",
                        },
                        name: {
                            type: "string",
                            description: "Name of the dataset",
                        },
                        description: {
                            type: "string",
                            description: "Description of the dataset",
                        },
                        targetFields: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    type: {
                                        type: "string",
                                        enum: ["string", "number", "integer", "date"],
                                        description: "Field data type"
                                    },
                                    mandatory: { type: "boolean" },
                                    isKeyComponent: { type: "boolean" },
                                    description: { type: "string" },
                                },
                                required: ["name", "type", "mandatory"],
                            },
                        },
                    },
                    required: ["workspaceId", "name", "targetFields", "accountId"],
                },
            },
            {
                name: "get-datasets",
                description: `WHEN TO USE:
- When you need to list all available datasets in a workspace
- When checking if a specific dataset exists
- When displaying dataset metadata to users
- When finding datasets by state (DRAFT/STAGE/PUBLISHED)
- When you need to know the last update time of datasets
- Before performing operations that require dataset IDs
- Use default filter = 'vscope=PUBLISHED and vstate=ACTIVE' when filter is not available from request
- Use other tools like get-accounts and get-workspaces to retrieve the account and workspace IDs when they are not provided in the request.

Tool Description:
Retrieves datasets from a workspace with filtering capabilities.

Required parameters:
- workspaceId: Workspace ID to query
- accountId: accountId where workspace is located
- filter: vscope and vstate value

Optional parameters:
- max: Maximum records to return (default: 9999)
- offset: Pagination offset (default: 0)

Common filter patterns:
- Published & Active: "vscope=PUBLISHED and vstate=ACTIVE"

Example usage:
Getting draft datasets:
{
  "accountId": 123,
  "workspaceId": 123,
  "filter": "vscope=DRAFT and vstate=ACTIVE"
}`,
                inputSchema: {
                    type: "object",
                    properties: {
                        workspaceId: {
                            type: "number",
                            description: "Workspace ID to get datasets from",
                        },
                        accountId: {
                            type: "number",
                            description: "Account ID where the workspace belongs",
                        },
                        offset: {
                            type: "number",
                            description: "Offset for pagination",
                            default: 0
                        },
                        max: {
                            type: "number",
                            description: "Maximum number of datasets to return",
                            default: 9999
                        },
                        filter: {
                            type: "string",
                            description: "Filter string for datasets",
                            default: "vscope=PUBLISHED and vstate=ACTIVE"
                        }
                    },
                    required: ["workspaceId", "accountId", "filter"],
                },
            },
            {
                name: "get-dataset-output",
                description: `WHEN TO USE:
- When you need to read actual data stored in a dataset
- When analyzing data for reporting or visualization
- When validating data quality or completeness
- When exporting data for external use
- When searching for specific records within a dataset
- When paginating through large datasets
- When filtering data based on specific criteria
- Use default filter = 'vscope=PUBLISHED and vstate=ACTIVE' when filter is not available from request
- Use other tools like get-accounts and get-workspaces to retrieve the account and workspace IDs when they are not provided in the request.

Tool Description:
Retrieves actual data records from a dataset with filtering and pagination.

Required parameters:
- datasetId: dataset ID to get data output for
- workspaceId: Workspace ID to query
- accountId: where workspace is located
- filter: vscope and vstate value

Optional parameters:
- max: Maximum records (default: 9999)
- offset: Pagination offset (default: 0)

Example usage:
Getting recent customer records:
{
  "accountId": 123,
  "workspaceId": 123,
  "datasetId": 456,
  "filter": "vscope=DRAFT and vstate=ACTIVE",
  "max": 9999
}`,
                inputSchema: {
                    type: "object",
                    properties: {
                        workspaceId: {
                            type: "number",
                            description: "Workspace ID",
                        },
                        accountId: {
                            type: "number",
                            description: "Account ID where the workspace belongs",
                        },
                        datasetId: {
                            type: "number",
                            description: "Dataset ID to fetch output from",
                        },
                        offset: {
                            type: "number",
                            description: "Offset for pagination",
                            default: 0
                        },
                        max: {
                            type: "number",
                            description: "Maximum number of records to return",
                            default: 9999
                        },
                        filter: {
                            type: "string",
                            description: "Filter string for output data",
                            default: "vscope=PUBLISHED and vstate=ACTIVE"
                        }
                    },
                    required: ["workspaceId", "datasetId", "filter", "accountId"],
                },
            },
            {
                name: "get-accounts",
                description: `WHEN TO USE:
- At the start of operations to identify available accounts
- When switching between different accounts
- When validating user access permissions
- When displaying account selection options to users
- When needing the account ID for other operations
- Before performing any workspace-related operations
- When mapping account IDs to account names

Tool Description:
Retrieves available accounts for the authenticated user.
`,
                inputSchema: {
                    type: "object",
                    properties: {
                    },
                    required: [""],
                },
            },
            {
                name: "get-workspaces",
                description: `WHEN TO USE:
- After selecting an account to view available workspaces
- When switching between different workspaces
- When validating workspace access permissions
- Before performing dataset operations that require workspace ID
- When displaying workspace selection options to users
- When needing to map workspace IDs to workspace names

Tool Description:
Lists all workspaces within a specified account.

Required parameters:
- accountId: Target account ID

Example usage:
{
  "accountId": 123
}`,
                inputSchema: {
                    type: "object",
                    properties: {
                        accountId: {
                            type: "number",
                            description: "Account ID to get workspaces from",
                        }
                    },
                    required: ["accountId"],
                },
            },
            {
                name: "get-ai-context",
                description: `WHEN TO USE:
- Before executing AI queries to understand available data structure
- When needing to know the schema of datasets in a workspace
- When mapping dataset fields for query construction
- When validating data relationships
- When building context-aware AI operations
- When needing metadata about workspace configuration
- When checking for recent updates to dataset structures

Tool Description:
Retrieves comprehensive workspace context including dataset configurations and metadata.

Required parameters:
- workspaceId: Target workspace ID
- accountId: Account ID

Example usage:
{
  "workspaceId": 123,
  "accountId": 456
}`,
                inputSchema: {
                    type: "object",
                    properties: {
                        accountId: {
                            type: "number",
                            description: "Account ID where the workspace belongs",
                        },
                        workspaceId: {
                            type: "number",
                            description: "Workspace ID to get context from",
                        }
                    },
                    required: ["workspaceId", "accountId"],
                },
            },
            {
                name: "execute-ai-query",
                description: `WHEN TO USE:
- When performing queries on data
- When analyzing data
- When generating reports from complex data relationships
- When users need to query data without knowing SQL
- When performing ad-hoc data analysis
- When filtering and aggregating data based on specific criteria
- When transforming data for visualization or export

Tool Description:
Executes AI-powered queries on dataset data, get structured queries and give data by executing that queries.
Model have to transform natural language into queries and pass that generated queries in request.
e.g.
Retrieve the name of the product which has the highest rate.
Now Model will convert above input of user into query and that query will used as input in this tool to get data.

Required parameters:
- accountId: Account ID
- workspaceId: Workspace ID
- query: queries that can be executable (e.g. SELECT product_name FROM products ORDER BY rate DESC LIMIT 1)

Example usage:
{
  "accountId": 123,
  "workspaceId": 456,
  "query": "SELECT product_name FROM products ORDER BY rate DESC LIMIT 1"
}`,
                inputSchema: {
                    type: "object",
                    properties: {
                        accountId: {
                            type: "number",
                            description: "Account ID where the workspace belongs",
                        },
                        workspaceId: {
                            type: "number",
                            description: "Workspace ID where to execute the query",
                        },
                        query: {
                            type: "string",
                            description: "The AI query to execute",
                        }
                    },
                    required: ["accountId", "workspaceId", "query"],
                },
            }
        ],
    };
});

function getAuthToken(toolName: string): string {

    // get authToken from configuration environment
    if (serverConfig.authToken) {
        return serverConfig.authToken;
    }

    throw new Error(`${toolName} requires an authToken. Please provide it in the request or configure it in Claude settings.`);
}

// Helper function for making API requests
async function makeAPIRequest<T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: unknown
): Promise<{ data: T | null; error?: string }> {
    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const responseData = await response.json();

        if (response.status && response.status != 200) {
            return {
                data: null,
                error: responseData.message || `HTTP error! status: ${response.status}`,
            };
        }

        return { data: JSON.stringify(responseData, null, 2) as T };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        if (name === "create-dataset") {
            const {
                accountId,
                workspaceId,
                name,
                description,
                targetFields,
            } = CreateDatasetArgumentsSchema.parse(args);

            const useableAuthToken = getAuthToken("create-dataset");
            const url = `${API_BASE_URL}/ai/accounts/${accountId}/workspaces/${workspaceId}/save-dataset-through-mcp`;
            const headers = {
                Authorization: `ApiKey ${useableAuthToken}`,
                "Content-Type": "application/json"
            };
            const payload = {
                name,
                description: description || "",
                targetFields,
            };

            const { data, error } = await makeAPIRequest(url, "POST", headers, payload);

            if (error) {
                return {
                    content: [
                        {
                            type: "error",
                            text: error.toString(),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Dataset '${name}' created successfully usong tool.`,
                    },
                ],
            };
        } else if (name === "get-datasets") {
            const {
                accountId,
                workspaceId,
                offset = 0,
                max = 9999,
                filter
            } = GetDatasetsArgumentsSchema.parse(args);

            const useableAuthToken = getAuthToken("get-datasets");

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                max: max.toString(),
            });

            if (filter) {
                queryParams.append('filter', filter);
            }

            const url = `${API_BASE_URL}/ai/accounts/${accountId}/workspaces/${workspaceId}/datasets?${queryParams}`;
            const headers = {
                Authorization: `ApiKey ${useableAuthToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
            };

            const { data, error } = await makeAPIRequest<any>(url, "GET", headers);

            if (error) {
                return {
                    content: [
                        {
                            type: "error",
                            text: error.toString(),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: data.toString(),
                    },
                ],
            };

        } else if (name === "get-dataset-output") {
            const {
                accountId,
                workspaceId,
                datasetId,
                offset = 0,
                max = 1000,
                filter
            } = GetDatasetOutputArgumentsSchema.parse(args);

            const useableAuthToken = getAuthToken("get-dataset-output");

            const queryParams = new URLSearchParams({
                offset: offset.toString(),
                max: max.toString(),
                filter: filter
            });

            const url = `${API_BASE_URL}/ai/accounts/${accountId}/workspaces/${workspaceId}/datasets/${datasetId}/dout-data?${queryParams}`;
            const headers = {
                Authorization: `ApiKey ${useableAuthToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            };

            const { data, error } = await makeAPIRequest<any>(url, "GET", headers);

            if (error) {
                return {
                    content: [
                        {
                            type: "error",
                            text: error.toString(),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: data.toString(),
                    },
                ],
            };
        }
        else if (name === "get-accounts") {
            const useableAuthToken = getAuthToken("get-accounts");

            const url = `${API_BASE_URL}/ai/ai-accounts`;
            const headers = {
                Authorization: `ApiKey ${useableAuthToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            };

            const { data, error } = await makeAPIRequest<any>(url, "GET", headers);

            if (error) {
                return {
                    content: [
                        {
                            type: "error",
                            text: error.toString(),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: data.toString(),
                    },
                ],
            };
        }
        else if (name === "get-workspaces") {
            const {
                accountId
            } = GetWorkspacesArgumentsSchema.parse(args);

            const useableAuthToken = getAuthToken("get-workspaces");

            const url = `${API_BASE_URL}/ai/accounts/${accountId}/ai-list`;
            const headers = {
                Authorization: `ApiKey ${useableAuthToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            };

            const { data, error } = await makeAPIRequest<any>(url, "GET", headers);

            if (error) {
                return {
                    content: [
                        {
                            type: "error",
                            text: error.toString(),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: data.toString(),
                    },
                ],
            };
        }
        else if (name === "get-ai-context") {
            const {
                accountId,
                workspaceId,
            } = GetAIContextArgumentsSchema.parse(args);

            const useableAuthToken = getAuthToken("get-ai-context");

            const url = `${API_BASE_URL}/ai/accounts/${accountId}/workspaces/${workspaceId}/ai-context`;
            const headers = {
                Authorization: `ApiKey ${useableAuthToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            };

            const { data, error } = await makeAPIRequest<any>(url, "GET", headers);

            if (error) {
                return {
                    content: [
                        {
                            type: "error",
                            text: error.toString(),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: data.toString(),
                    },
                ],
            };
        }
        else if (name === "execute-ai-query") {
            const {
                accountId,
                workspaceId,
                query
            } = ExecuteAIQueryArgumentsSchema.parse(args);

            const useableAuthToken = getAuthToken("execute-ai-query");

            const url = `${API_BASE_URL}/ai/accounts/${accountId}/workspaces/${workspaceId}/ai-query`;
            const headers = {
                Authorization: `ApiKey ${useableAuthToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            };

            const payload = {
                query
            };

            const { data, error } = await makeAPIRequest<any>(url, "POST", headers, payload);

            if (error) {
                return {
                    content: [
                        {
                            type: "error",
                            text: error.toString(),
                        },
                    ],
                };
            }

            return {
                content: [
                    {
                        type: "text",
                        text: data.toString(),
                    },
                ],
            };
        }
        else {
            throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(
                `Invalid arguments: ${error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ")}`
            );
        }
        throw error;
    }
});

async function main() {
    const transport = new SecureStdioTransport();
    const API_KEY = process.env.VERODAT_AI_API_KEY;
    const CONFIGURED_API_URL = process.env.VERODAT_API_BASE_URL;

    if (CONFIGURED_API_URL) {
        setApiBaseUrl(CONFIGURED_API_URL);
    }

    if (API_KEY) {
        serverConfig = {
            authToken: API_KEY
        };
    }

    await server.connect(transport);
}

main().catch((error) => {
    process.exit(1);
});