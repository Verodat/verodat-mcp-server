#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { setApiBaseUrl, setServerConfig } from './config/serverConfig.js';
import { ToolHandlers } from './handlers/toolHandlers.js';
import { ManageToolHandler } from './handlers/manageToolHandler.js';

async function main() {
    try {
        // Log server initialization
        console.error('[verodat] Initializing server...');
        
        // Setup the transport layer
        const transport = new StdioServerTransport();
        
        // Create the server instance
        const server = new Server(
            {
                name: 'verodat-mcp-server',
                version: '1.0.0',
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
        const API_BASE_URL = CONFIGURED_API_URL || 'https://verodat.io/api/v3';

        if (CONFIGURED_API_URL) {
            setApiBaseUrl(CONFIGURED_API_URL);
        }

        if (API_KEY) {
            setServerConfig({ authToken: API_KEY });
        }

        // Create tool handlers instance
        const allToolHandlers = new ToolHandlers(API_BASE_URL, API_KEY || '');

        // Initialize MANAGE category handler
        const manageToolHandler = new ManageToolHandler(server, allToolHandlers);
        
        // Register the tools
        manageToolHandler.registerTools();

        // Error handling
        server.onerror = (error) => console.error('[verodat] [MCP Error]', error);
        process.on('SIGINT', async () => {
            await server.close();
            process.exit(0);
        });

        // Connect transport
        await server.connect(transport);
        console.error('[verodat] Server started and connected successfully');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[verodat] Failed to start server:', errorMessage);
        process.exit(1);
    }
}

main().catch((err) => console.error('[verodat] Startup error:', err instanceof Error ? err.message : err));