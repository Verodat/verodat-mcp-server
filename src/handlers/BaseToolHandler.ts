import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ToolHandlers } from "./toolHandlers.js";

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}

export class BaseToolHandler {
    protected server: Server;
    protected toolHandlers: ToolHandlers;
    protected toolDefinitions: ToolDefinition[] = [];
    protected toolHandlerMap: Map<string, (args: unknown) => Promise<any>> = new Map();

    constructor(server: Server, toolHandlers: ToolHandlers) {
        this.server = server;
        this.toolHandlers = toolHandlers;
    }

    registerTools(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.toolDefinitions,
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const handler = this.toolHandlerMap.get(name);

            if (!handler) {
                throw new Error(`Unknown tool: ${name}`);
            }

            try {
                return await handler(args);
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Invalid arguments: ${error.message}`);
                }
                throw error;
            }
        });
    }

    protected addTool(definition: ToolDefinition, handler: (args: unknown) => Promise<any>): void {
        this.toolDefinitions.push(definition);
        this.toolHandlerMap.set(definition.name, handler);
    }
}