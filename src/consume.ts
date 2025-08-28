#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { setApiBaseUrl, setServerConfig } from './config/serverConfig.js';
import { ToolHandlers } from './handlers/toolHandlers.js';
import { ConsumeToolHandler } from './handlers/consumeToolHandler.js';
import { ServerType } from './config/serverTypes.js';

// Test mode handler for command-line testing
async function handleTestMode() {
    const args = process.argv.slice(2);
    if (args.length < 3 || args[0] !== 'call') {
        console.error('Usage: node consume.js call <tool-name> <json-args>');
        process.exit(1);
    }

    const toolName = args[1];
    const toolArgs = JSON.parse(args[2]);

    // Setup configuration
    const API_KEY = process.env.VERODAT_AI_API_KEY || '';
    const CONFIGURED_API_URL = process.env.VERODAT_API_BASE_URL;
    let API_BASE_URL = CONFIGURED_API_URL || 'https://verodat.io/api/v3';

    if (API_BASE_URL === 'https://verodat.io/api/v3') {
        API_BASE_URL = 'https://verodat.azure-api.net';
    } else {
        API_BASE_URL = API_BASE_URL.endsWith('/')
            ? `${API_BASE_URL}ai`
            : `${API_BASE_URL}/ai`;
    }

    setApiBaseUrl(API_BASE_URL);
    if (API_KEY) {
        setServerConfig({ authToken: API_KEY });
    }

    // Create a mock server for testing
    const server = new Server(
        { name: 'verodat-test', version: '1.0.0' },
        { capabilities: { tools: {} } }
    );

    // Create tool handlers
    const allToolHandlers = new ToolHandlers(API_BASE_URL, API_KEY);
    const consumeToolHandler = new ConsumeToolHandler(server, allToolHandlers, ServerType.CONSUME);
    
    // Initialize procedures to enable enforcement
    await consumeToolHandler.initializeProcedures();
    
    // Register tools
    consumeToolHandler.registerTools();

    // Try to execute the tool
    try {
        const handler = consumeToolHandler['toolHandlerMap'].get(toolName);
        if (!handler) {
            throw new Error(`Unknown tool: ${toolName}`);
        }

        // Check procedure requirement first
        const procedureCheck = await consumeToolHandler['checkProcedureRequirement'](toolName, toolArgs);
        if (procedureCheck.required) {
            throw new Error(`PROCEDURE_REQUIRED: ${procedureCheck.reason}`);
        }

        const result = await handler(toolArgs);
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

async function main() {
    // Check for test mode
    if (process.argv.length > 2 && process.argv[2] === 'call') {
        return handleTestMode();
    }

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
        let API_BASE_URL = CONFIGURED_API_URL || 'https://verodat.io/api/v3';

        if (API_BASE_URL === 'https://verodat.io/api/v3') {
            API_BASE_URL = 'https://verodat.azure-api.net';
        } else {
            API_BASE_URL = API_BASE_URL.endsWith('/')
                ? `${API_BASE_URL}ai`
                : `${API_BASE_URL}/ai`;
        }

        setApiBaseUrl(API_BASE_URL);

        if (API_KEY) {
            setServerConfig({ authToken: API_KEY });
        }

        // Create tool handlers instance with the final API_BASE_URL
        const allToolHandlers = new ToolHandlers(API_BASE_URL, API_KEY || '');

        // Initialize CONSUME category handler with server type
        const consumeToolHandler = new ConsumeToolHandler(server, allToolHandlers, ServerType.CONSUME);

        // Register the tools
        consumeToolHandler.registerTools();

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
