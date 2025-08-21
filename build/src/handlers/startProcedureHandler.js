/**
 * Start Procedure Handler
 * Handles the start-procedure, list-procedures, and resume-procedure tools
 */
import { procedureService } from '../services/procedureService.js';
import { procedureLoader } from '../services/procedureLoader.js';
import { StartProcedureSchema, ListProceduresSchema, ResumeProcedureSchema } from '../types/schemas.js';
export class StartProcedureHandler {
    /**
     * Handle start-procedure tool
     */
    static async handleStartProcedure(args) {
        try {
            const { procedureId } = StartProcedureSchema.parse(args);
            // Start the procedure
            const run = await procedureService.startProcedure(procedureId);
            // Get the first step
            const currentStep = await procedureService.getCurrentStep(run.runId);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            runId: run.runId,
                            procedureId: run.procedureId,
                            status: run.status,
                            currentStep: currentStep ? {
                                id: currentStep.id,
                                name: currentStep.name,
                                type: currentStep.type,
                                description: currentStep.description
                            } : null,
                            message: `Procedure ${procedureId} started successfully. Run ID: ${run.runId}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            message: `Failed to start procedure: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    /**
     * Handle list-procedures tool
     */
    static async handleListProcedures(args) {
        try {
            ListProceduresSchema.parse(args);
            // Get all procedures
            const procedures = await procedureLoader.loadProcedures();
            // Get active runs
            const activeRuns = procedureService.listActiveRuns();
            // Get statistics
            const stats = procedureService.getStatistics();
            // Format procedure list
            const procedureList = procedures.map(proc => ({
                id: proc.id,
                name: proc.name,
                description: proc.description,
                version: proc.version,
                category: proc.metadata.category,
                priority: proc.metadata.priority,
                riskLevel: proc.metadata.riskLevel,
                steps: proc.steps.length,
                triggers: {
                    tools: proc.triggers.tools,
                    operations: proc.triggers.operations
                }
            }));
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            procedures: procedureList,
                            activeRuns: activeRuns,
                            statistics: stats,
                            message: `Found ${procedures.length} procedures, ${stats.activeRuns} active runs`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            message: `Failed to list procedures: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    /**
     * Handle resume-procedure tool
     */
    static async handleResumeProcedure(args) {
        try {
            const { runId } = ResumeProcedureSchema.parse(args);
            // Resume the procedure
            const run = await procedureService.resumeProcedure(runId);
            if (!run) {
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: 'Run not found or expired',
                                message: `Procedure run ${runId} not found or has expired`
                            }, null, 2)
                        }]
                };
            }
            // Get the current step
            const currentStep = await procedureService.getCurrentStep(runId);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            runId: run.runId,
                            procedureId: run.procedureId,
                            status: run.status,
                            currentStepIndex: run.currentStepIndex,
                            completedSteps: run.completedSteps,
                            currentStep: currentStep ? {
                                id: currentStep.id,
                                name: currentStep.name,
                                type: currentStep.type,
                                description: currentStep.description
                            } : null,
                            message: `Resumed procedure run ${runId}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : 'Unknown error',
                            message: `Failed to resume procedure: ${error instanceof Error ? error.message : 'Unknown error'}`
                        }, null, 2)
                    }],
                isError: true
            };
        }
    }
    /**
     * Get available procedures for a given context
     */
    static async getAvailableProcedures(context) {
        return await procedureLoader.findApplicableProcedures(context);
    }
    /**
     * Check if a tool requires a procedure
     */
    static async checkProcedureRequirement(toolName, operation) {
        const result = await procedureService.checkProcedureRequirement({
            toolName,
            operation
        });
        if (result.procedureRequired) {
            return {
                required: true,
                procedure: result.procedureRequired,
                reason: result.reason,
                runId: result.runId
            };
        }
        return { required: false };
    }
}
