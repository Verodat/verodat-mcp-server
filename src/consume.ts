import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { setApiBaseUrl, setServerConfig } from "./config/serverConfig.js";
import { ToolHandlers } from "./handlers/toolHandlers.js";
import { SecureStdioTransport } from "./services/transportService.js";
import { ConsumeToolHandler } from "./handlers/consumeToolHandler.js";

async function main() {
    try {
        // Setup the transport layer
        const transport = new SecureStdioTransport();
        
        // Create the server instance
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

        // Configure server
        const API_KEY = process.env.VERODAT_AI_API_KEY;
        const CONFIGURED_API_URL = process.env.VERODAT_API_BASE_URL;
        const API_BASE_URL = CONFIGURED_API_URL || "https://verodat.io/api/v3";

        if (CONFIGURED_API_URL) {
            setApiBaseUrl(CONFIGURED_API_URL);
        }

        if (API_KEY) {
            setServerConfig({ authToken: API_KEY });
        }

        // Create tool handlers instance
        const allToolHandler = new ToolHandlers(API_BASE_URL, API_KEY || "");

        // Initialize CONSUME category handler
        const consumeToolHandler = new ConsumeToolHandler(server, allToolHandler);
        
        // Register the tools
        consumeToolHandler.registerTools();

        // Connect transport
        await server.connect(transport);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        process.exit(1);
    }
}

main();