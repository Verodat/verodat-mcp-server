import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ToolHandlers } from "./toolHandlers.js";
import { procedureService } from "../services/procedureService.js";
import { procedureLoader } from "../services/procedureLoader.js";
import { StartProcedureHandler } from "./startProcedureHandler.js";
import { runIdValidator } from "../services/runIdValidator.js";
import { isReadOperation, isWriteOperation, getOperationType } from "../config/operationTypes.js";
import { ServerType, getServerEnforcementConfig, shouldEnforceProcedure } from "../config/serverTypes.js";
import { orchestrationService } from "../services/orchestrationService.js";
import { defaultProcedureConfig } from "../config/procedureConfig.js";

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
    protected serverType: ServerType;
    protected enforceOnRead: boolean = false;
    protected enforceOnWrite: boolean = true;

    constructor(server: Server, toolHandlers: ToolHandlers, serverType: ServerType = ServerType.CONSUME) {
        this.server = server;
        this.toolHandlers = toolHandlers;
        this.serverType = serverType;
        this.configureEnforcement();
    }

    /**
     * Configure procedure enforcement based on server type
     */
    private configureEnforcement(): void {
        const config = getServerEnforcementConfig(this.serverType);
        this.procedureEnforcementEnabled = config.enforceProcedures;
        this.enforceOnRead = config.enforceOnRead;
        this.enforceOnWrite = config.enforceOnWrite;
        
        // Only log in test mode (when called with 'call' argument)
        if (process.argv[2] === 'call') {
            console.log(`[${this.serverType.toUpperCase()}] Server configured:`, {
                enforceProcedures: this.procedureEnforcementEnabled,
                enforceOnRead: this.enforceOnRead,
                enforceOnWrite: this.enforceOnWrite
            });
        }
    }

    /**
     * Initialize procedure system
     */
    async initializeProcedures(): Promise<void> {
        // Skip procedure initialization for DESIGN server
        if (this.serverType === ServerType.DESIGN) {
            if (process.argv[2] === 'call') {
                console.log(`[${this.serverType.toUpperCase()}] Skipping procedure system initialization (not needed for Design server)`);
            }
            return;
        }
        
        try {
            await procedureService.initialize(this.toolHandlers);
            
            // Initialize orchestration service if enabled
            if (defaultProcedureConfig.verodat.fallbackBehavior === 'orchestrate') {
                await orchestrationService.initialize(this.toolHandlers);
                if (process.argv[2] === 'call') {
                    console.log(`[${this.serverType.toUpperCase()}] Orchestration service initialized`);
                }
            }
            
            // Re-apply enforcement settings after initialization
            const config = getServerEnforcementConfig(this.serverType);
            this.procedureEnforcementEnabled = config.enforceProcedures;
            if (process.argv[2] === 'call') {
                console.log(`[${this.serverType.toUpperCase()}] Procedure system initialized with enforcement: ${this.procedureEnforcementEnabled}`);
            }
        } catch (error) {
            if (process.argv[2] === 'call') {
                console.error(`[${this.serverType.toUpperCase()}] Failed to initialize procedure system:`, error);
            }
            // Still enable enforcement for MANAGE/CONSUME even if procedure loading fails
            const config = getServerEnforcementConfig(this.serverType);
            this.procedureEnforcementEnabled = config.enforceProcedures;
            if (process.argv[2] === 'call') {
                console.log(`[${this.serverType.toUpperCase()}] Using enforcement despite initialization failure: ${this.procedureEnforcementEnabled}`);
            }
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
        // DESIGN SERVER: Never require procedures
        if (this.serverType === ServerType.DESIGN) {
            if (process.argv[2] === 'call') {
                console.log(`[${this.serverType.toUpperCase()}] Operation ${toolName} allowed without procedure (Design server)`);
            }
            return { required: false };
        }

        // SECURITY: Only accept system operations from internal sources
        // The __systemOperation flag must come from procedureLoader, not external calls
        if (args && args.__systemOperation === 'procedure-loading') {
            // Validate this is genuinely from procedureLoader
            const caller = new Error().stack;
            if (caller && caller.includes('procedureLoader')) {
                // Remove flag before passing to tool to prevent propagation
                delete args.__systemOperation;
                if (process.argv[2] === 'call') {
                    console.log(`[SECURITY] System operation allowed for ${toolName} from procedureLoader`);
                }
                return { required: false };
            }
            // If not from procedureLoader, log potential hack attempt and ignore the flag
            if (process.argv[2] === 'call') {
                console.warn(`[SECURITY WARNING] Unauthorized __systemOperation flag detected for ${toolName}`);
            }
            delete args.__systemOperation; // Remove the flag anyway
        }

        // SECURITY FIX: Validate runId properly to prevent hijacking
        if (args && args.__runId) {
            // Validate the runId is authorized for this specific tool
            const validation = await runIdValidator.validateRunIdForTool(
                args.__runId,
                toolName,
                args
            );

            if (!validation.isValid) {
                // Log security violation
                if (process.argv[2] === 'call') {
                    console.error(`[SECURITY] RunId validation failed for ${toolName}: ${validation.reason}`);
                }
                
                // Return error with security violation details
                return {
                    required: true,
                    procedure: null,
                    reason: validation.reason || 'Invalid or unauthorized runId',
                    runId: args.__runId
                };
            }

            // Valid runId for this tool - allow execution
            if (process.argv[2] === 'call') {
                console.log(`[SECURITY] RunId ${args.__runId} validated for tool ${toolName}`);
            }
            return { required: false };
        }

        // Determine if we should enforce based on operation type and server configuration
        const isRead = isReadOperation(toolName);
        const shouldEnforce = shouldEnforceProcedure(this.serverType, isRead);
        
        if (!shouldEnforce) {
            if (process.argv[2] === 'call') {
                console.log(`[${this.serverType.toUpperCase()}] ${isRead ? 'READ' : 'WRITE'} operation ${toolName} allowed without procedure`);
            }
            return { required: false };
        }

        // If we get here, we need to check for applicable procedures
        if (process.argv[2] === 'call') {
            console.log(`[${this.serverType.toUpperCase()}] ${isRead ? 'READ' : 'WRITE'} operation ${toolName} checking for required procedures`);
        }
        
        const context = await this.discoverProcedureContext(toolName, args);
        const procedures = await procedureLoader.findApplicableProcedures(context);
        
        // For READ operations that need enforcement, check for enforceOnRead flag
        if (isRead) {
            // Filter to only procedures that explicitly enforce on READ
            const readEnforcingProcedures = procedures.filter(p => p.triggers.enforceOnRead === true);
            
            if (readEnforcingProcedures.length === 0) {
                if (process.argv[2] === 'call') {
                    console.log(`[${this.serverType.toUpperCase()}] No READ-enforcing procedures found for ${toolName}`);
                }
                return { required: false };
            }
            
            const procedure = readEnforcingProcedures[0];
            if (process.argv[2] === 'call') {
                console.log(`[${this.serverType.toUpperCase()}] READ operation ${toolName} requires procedure ${procedure.id} (enforceOnRead=true)`);
            }
            
            const result = await procedureService.checkProcedureRequirement({
                toolName,
                operation: context.operation
            });
            
            return {
                required: !result.allowed,
                procedure: result.procedureRequired,
                reason: result.reason || 'This READ operation requires procedure for audit trail',
                runId: result.runId
            };
        }
        
        // For WRITE operations
        if (procedures.length === 0) {
            if (process.argv[2] === 'call') {
                console.log(`[${this.serverType.toUpperCase()}] No procedures found for WRITE operation ${toolName}`);
            }
            
            // Check if orchestration is enabled
            if (defaultProcedureConfig.verodat.fallbackBehavior === 'orchestrate' && orchestrationService.isEnabled()) {
                if (process.argv[2] === 'call') {
                    console.log(`[${this.serverType.toUpperCase()}] Triggering governance orchestration for ${toolName}`);
                }
                
                // Trigger orchestration to create governance
                const orchestrationResult = await orchestrationService.handleMissingGovernance(
                    toolName,
                    'WRITE',
                    args
                );
                
                if (orchestrationResult.success) {
                    // Orchestration completed successfully
                    const message = `Governance orchestration completed. ` +
                        (orchestrationResult.createdProcedure 
                            ? `Created procedure: ${orchestrationResult.createdProcedure.procedure_id}. `
                            : '') +
                        (orchestrationResult.createdPolicy
                            ? `Created policy: ${orchestrationResult.createdPolicy.policy_id}. `
                            : '') +
                        `Please retry your operation.`;
                    
                    return {
                        required: true,
                        procedure: orchestrationResult.createdProcedure,
                        reason: message,
                        runId: undefined
                    };
                } else {
                    // Orchestration failed or was not needed
                    return {
                        required: true,
                        procedure: null,
                        reason: orchestrationResult.error || 
                            'This WRITE operation requires a procedure for governance. Orchestration could not create one automatically.',
                        runId: undefined
                    };
                }
            }
            
            // Fallback to blocking if orchestration is disabled
            return {
                required: true,
                procedure: null,
                reason: 'This WRITE operation requires a procedure for governance. No procedures are currently available.',
                runId: undefined
            };
        }
        
        const procedure = procedures[0];
        if (process.argv[2] === 'call') {
            console.log(`[${this.serverType.toUpperCase()}] WRITE operation ${toolName} requires procedure ${procedure.id}`);
        }
        
        const result = await procedureService.checkProcedureRequirement({
            toolName,
            operation: context.operation
        });
        
        return {
            required: !result.allowed,
            procedure: result.procedureRequired,
            reason: result.reason || 'This WRITE operation requires procedure for governance',
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

        // Add operation type to context
        const operationType = getOperationType(toolName);
        context.operation = operationType;
        
        // Infer operation details from tool name
        if (toolName.includes('export') || toolName.includes('download')) {
            context.purpose = 'export';
            context.tags.push('data-export');
        } else if (toolName.includes('import') || toolName.includes('upload')) {
            context.purpose = 'import';
            context.tags.push('data-import');
        } else if (toolName.includes('delete') || toolName.includes('remove')) {
            context.purpose = 'delete';
            context.tags.push('data-deletion');
        } else if (toolName.includes('create') || toolName.includes('add')) {
            context.purpose = 'create';
            context.tags.push('data-creation');
        } else if (toolName.includes('update') || toolName.includes('modify')) {
            context.purpose = 'update';
            context.tags.push('data-modification');
        }
        
        // Tag based on operation type
        if (operationType === 'READ') {
            context.tags.push('read-operation');
        } else if (operationType === 'WRITE') {
            context.tags.push('write-operation');
        }

        // Check for specific operations that might need special handling
        if (toolName === 'get-dataset-output' && args?.max > 10000) {
            // Large export might need procedure even though it's a READ
            context.tags.push('large-export');
            context.tags.push('bulk-operation');
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
