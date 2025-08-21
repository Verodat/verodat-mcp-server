import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ToolHandlers } from "./toolHandlers.js";
import { procedureService } from "../services/procedureService.js";
import { procedureLoader } from "../services/procedureLoader.js";
import { StartProcedureHandler } from "./startProcedureHandler.js";

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
    protected procedureEnforcementEnabled: boolean = false;

    constructor(server: Server, toolHandlers: ToolHandlers) {
        this.server = server;
        this.toolHandlers = toolHandlers;
    }

    /**
     * Initialize procedure system
     */
    async initializeProcedures(): Promise<void> {
        try {
            await procedureService.initialize(this.toolHandlers);
            this.procedureEnforcementEnabled = true;
            console.log('Procedure system initialized');
        } catch (error) {
            console.error('Failed to initialize procedure system:', error);
            this.procedureEnforcementEnabled = false;
        }
    }

    registerTools(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.toolDefinitions,
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            
            // Check for procedure requirement if enforcement is enabled
            if (this.procedureEnforcementEnabled && !this.isProcedureTool(name)) {
                const procedureCheck = await this.checkProcedureRequirement(name, args);
                if (procedureCheck.required) {
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify({
                                error: 'PROCEDURE_REQUIRED',
                                procedureId: procedureCheck.procedure?.id,
                                procedureName: procedureCheck.procedure?.name,
                                reason: procedureCheck.reason,
                                runId: procedureCheck.runId,
                                message: `This operation requires completing procedure: ${procedureCheck.procedure?.name}. ${procedureCheck.reason}`
                            }, null, 2)
                        }]
                    };
                }
            }

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

    /**
     * Check if a tool requires a procedure
     */
    protected async checkProcedureRequirement(toolName: string, args: any): Promise<{
        required: boolean;
        procedure?: any;
        reason?: string;
        runId?: string;
    }> {
        // Check for existing runId in arguments
        if (args && args.__runId) {
            // Tool is part of an active procedure
            return { required: false };
        }

        // Discover applicable procedures
        const context = await this.discoverProcedureContext(toolName, args);
        const procedures = await procedureLoader.findApplicableProcedures(context);
        
        if (procedures.length === 0) {
            return { required: false };
        }

        // Use the highest priority procedure
        const procedure = procedures[0];
        
        // Check if there's an active run for this procedure
        const result = await procedureService.checkProcedureRequirement({
            toolName,
            operation: context.operation
        });
        
        return {
            required: !result.allowed,
            procedure: result.procedureRequired,
            reason: result.reason,
            runId: result.runId
        };
    }

    /**
     * Discover procedure context from tool name and arguments
     */
    protected async discoverProcedureContext(toolName: string, args: any): Promise<{
        toolName: string;
        operation?: string;
        purpose?: string;
        tags?: string[];
    }> {
        // Default context
        const context = {
            toolName,
            operation: undefined as string | undefined,
            purpose: undefined as string | undefined,
            tags: [] as string[]
        };

        // Infer operation from tool name
        if (toolName.includes('export') || toolName.includes('download')) {
            context.operation = 'export';
            context.tags.push('data-export');
        } else if (toolName.includes('import') || toolName.includes('upload')) {
            context.operation = 'import';
            context.tags.push('data-import');
        } else if (toolName.includes('delete') || toolName.includes('remove')) {
            context.operation = 'delete';
            context.tags.push('data-deletion');
        } else if (toolName.includes('create') || toolName.includes('add')) {
            context.operation = 'create';
            context.tags.push('data-creation');
        } else if (toolName.includes('update') || toolName.includes('modify')) {
            context.operation = 'update';
            context.tags.push('data-modification');
        }

        // Check for specific sensitive operations
        if (toolName === 'get-dataset-output') {
            context.operation = 'export';
            context.purpose = 'data-export';
            context.tags.push('sensitive-data');
        }

        // Analyze arguments for additional context
        if (args) {
            if (args.filter && args.filter.includes('PUBLISHED')) {
                context.tags.push('published-data');
            }
            if (args.max && args.max > 1000) {
                context.tags.push('bulk-operation');
            }
        }

        return context;
    }

    /**
     * Check if a tool is a procedure-related tool
     */
    protected isProcedureTool(toolName: string): boolean {
        return toolName.startsWith('procedure-') || 
               toolName === 'start-procedure' || 
               toolName === 'list-procedures' || 
               toolName === 'resume-procedure';
    }

    /**
     * Register procedure tools
     */
    protected registerProcedureTools(): void {
        // Start procedure tool
        this.addTool({
            name: 'start-procedure',
            description: 'Start a governed procedure to access Verodat tools. This must be called before any other tool operations.\n      \n      Returns a runId that must be included as __runId in all subsequent tool calls.\n      \n      Available procedures can be listed by calling this with an invalid procedureId.',
            inputSchema: {
                type: 'object',
                properties: {
                    procedureId: {
                        type: 'string',
                        description: 'The ID of the procedure to start (e.g., PROC-EXPORT-DATA-V1)'
                    }
                },
                required: ['procedureId']
            }
        }, async (args) => await StartProcedureHandler.handleStartProcedure(args));

        // List procedures tool
        this.addTool({
            name: 'list-procedures',
            description: 'List all available procedures and active procedure runs',
            inputSchema: {
                type: 'object',
                properties: {},
                required: []
            }
        }, async (args) => await StartProcedureHandler.handleListProcedures(args));

        // Resume procedure tool
        this.addTool({
            name: 'resume-procedure',
            description: 'Resume an existing procedure run that may have been interrupted',
            inputSchema: {
                type: 'object',
                properties: {
                    runId: {
                        type: 'string',
                        description: 'The runId of the procedure to resume'
                    }
                },
                required: ['runId']
            }
        }, async (args) => await StartProcedureHandler.handleResumeProcedure(args));
    }
}
