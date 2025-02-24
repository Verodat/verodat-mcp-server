import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { setApiBaseUrl, setServerConfig } from "./config/serverConfig.js";
import { setupRequestHandlers } from "./handlers/requestHandlers.js";
import { ToolHandlers } from "./handlers/toolHandlers.js";
import { SecureStdioTransport } from "./services/transportService.js";

async function main() {
    try {
        const transport = new SecureStdioTransport();
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
        const toolHandlers = new ToolHandlers(API_BASE_URL, API_KEY || "");

        // Setup request handlers
        setupRequestHandlers(server, toolHandlers);

        // Connect transport
        await server.connect(transport);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Server failed to start:', errorMessage);
        process.exit(1);
    }
}

main();