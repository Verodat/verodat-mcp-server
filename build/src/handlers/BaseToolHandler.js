import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { procedureService } from "../services/procedureService.js";
import { procedureLoader } from "../services/procedureLoader.js";
import { StartProcedureHandler } from "./startProcedureHandler.js";
import { isReadOperation, isWriteOperation, getOperationType } from "../config/operationTypes.js";
export class BaseToolHandler {
    server;
    toolHandlers;
    toolDefinitions = [];
    toolHandlerMap = new Map();
    procedureEnforcementEnabled = false;
    constructor(server, toolHandlers) {
        this.server = server;
        this.toolHandlers = toolHandlers;
    }
    /**
     * Initialize procedure system
     */
    async initializeProcedures() {
        try {
            await procedureService.initialize(this.toolHandlers);
            this.procedureEnforcementEnabled = true;
            console.log('Procedure system initialized');
        }
        catch (error) {
            console.error('Failed to initialize procedure system:', error);
            this.procedureEnforcementEnabled = false;
        }
    }
    registerTools() {
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
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Invalid arguments: ${error.message}`);
                }
                throw error;
            }
        });
    }
    addTool(definition, handler) {
        this.toolDefinitions.push(definition);
        this.toolHandlerMap.set(definition.name, handler);
    }
    /**
     * Check if a tool requires a procedure
     */
    async checkProcedureRequirement(toolName, args) {
        // SECURITY: Only accept system operations from internal sources
        // The __systemOperation flag must come from procedureLoader, not external calls
        if (args && args.__systemOperation === 'procedure-loading') {
            // Validate this is genuinely from procedureLoader
            const caller = new Error().stack;
            if (caller && caller.includes('procedureLoader')) {
                // Remove flag before passing to tool to prevent propagation
                delete args.__systemOperation;
                console.log(`[SECURITY] System operation allowed for ${toolName} from procedureLoader`);
                return { required: false };
            }
            // If not from procedureLoader, log potential hack attempt and ignore the flag
            console.warn(`[SECURITY WARNING] Unauthorized __systemOperation flag detected for ${toolName}`);
            delete args.__systemOperation; // Remove the flag anyway
        }
        // Check for existing runId in arguments
        if (args && args.__runId) {
            // Tool is part of an active procedure
            return { required: false };
        }
        // Check if this is a READ operation - skip by default unless explicitly required
        if (isReadOperation(toolName)) {
            // Only check for procedures that explicitly enforce on READ operations
            const context = await this.discoverProcedureContext(toolName, args);
            const procedures = await procedureLoader.findApplicableProcedures(context);
            // Filter to only procedures that explicitly enforce on READ
            const readEnforcingProcedures = procedures.filter(p => p.triggers.enforceOnRead === true);
            if (readEnforcingProcedures.length === 0) {
                console.log(`[PROCEDURE] READ operation ${toolName} allowed without procedure`);
                return { required: false };
            }
            // Use the highest priority procedure that enforces on READ
            const procedure = readEnforcingProcedures[0];
            console.log(`[PROCEDURE] READ operation ${toolName} requires procedure ${procedure.id} (enforceOnRead=true)`);
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
        // For WRITE operations, always check procedures
        if (isWriteOperation(toolName)) {
            console.log(`[PROCEDURE] WRITE operation ${toolName} checking for required procedures`);
            const context = await this.discoverProcedureContext(toolName, args);
            const procedures = await procedureLoader.findApplicableProcedures(context);
            if (procedures.length === 0) {
                console.log(`[PROCEDURE] No procedures found for WRITE operation ${toolName}`);
                return { required: false };
            }
            // Use the highest priority procedure
            const procedure = procedures[0];
            console.log(`[PROCEDURE] WRITE operation ${toolName} requires procedure ${procedure.id}`);
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
        // Default case - shouldn't happen but for safety
        return { required: false };
    }
    /**
     * Discover procedure context from tool name and arguments
     */
    async discoverProcedureContext(toolName, args) {
        // Default context
        const context = {
            toolName,
            operation: undefined,
            purpose: undefined,
            tags: []
        };
        // Add operation type to context
        const operationType = getOperationType(toolName);
        context.operation = operationType;
        // Infer operation details from tool name
        if (toolName.includes('export') || toolName.includes('download')) {
            context.purpose = 'export';
            context.tags.push('data-export');
        }
        else if (toolName.includes('import') || toolName.includes('upload')) {
            context.purpose = 'import';
            context.tags.push('data-import');
        }
        else if (toolName.includes('delete') || toolName.includes('remove')) {
            context.purpose = 'delete';
            context.tags.push('data-deletion');
        }
        else if (toolName.includes('create') || toolName.includes('add')) {
            context.purpose = 'create';
            context.tags.push('data-creation');
        }
        else if (toolName.includes('update') || toolName.includes('modify')) {
            context.purpose = 'update';
            context.tags.push('data-modification');
        }
        // Tag based on operation type
        if (operationType === 'READ') {
            context.tags.push('read-operation');
        }
        else if (operationType === 'WRITE') {
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
    isProcedureTool(toolName) {
        return toolName.startsWith('procedure-') ||
            toolName === 'start-procedure' ||
            toolName === 'list-procedures' ||
            toolName === 'resume-procedure';
    }
    /**
     * Register procedure tools
     */
    registerProcedureTools() {
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
