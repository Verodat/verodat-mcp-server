/**
 * Procedure Service
 * Core service for managing procedure execution and state
 */
import { procedureLoader } from './procedureLoader.js';
import { stepExecutor } from './stepExecutor.js';
import { procedureAuditLogger } from './procedureAuditLogger.js';
import { storageConfig } from '../config/procedureConfig.js';
import * as fs from 'fs/promises';
import * as path from 'path';
export class ProcedureService {
    activeRuns = new Map();
    stateFile;
    saveTimer = null;
    constructor() {
        this.stateFile = path.join(storageConfig.stateDirectory, storageConfig.runFileName);
        this.loadState();
    }
    /**
     * Initialize the service
     */
    async initialize(verodatHandler) {
        // Initialize procedure loader
        procedureLoader.initialize(verodatHandler);
        // Set tool handler for step executor
        stepExecutor.setToolHandler(verodatHandler);
        // Initialize audit logger (if workspace/account IDs are available)
        if (verodatHandler.workspaceId && verodatHandler.accountId) {
            procedureAuditLogger.initialize(verodatHandler, verodatHandler.workspaceId, verodatHandler.accountId);
        }
        // Load procedures on startup
        await procedureLoader.loadProcedures();
        console.log('ProcedureService initialized');
    }
    /**
     * Start a new procedure run
     */
    async startProcedure(procedureId, context) {
        // Get the procedure
        const procedure = await procedureLoader.getProcedure(procedureId);
        if (!procedure) {
            throw new Error(`Procedure not found: ${procedureId}`);
        }
        // Validate the procedure
        const validation = procedureLoader.validateProcedure(procedure);
        if (!validation.valid) {
            throw new Error(`Invalid procedure: ${validation.errors.join(', ')}`);
        }
        // Create a new run
        const runId = this.generateRunId();
        const run = {
            runId,
            procedureId,
            currentStepIndex: 0,
            status: 'active',
            startedAt: new Date().toISOString(),
            completedSteps: [],
            stepResponses: new Map(),
            context: context || {},
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
        };
        // Store the run
        this.activeRuns.set(runId, run);
        await this.saveState();
        // Log procedure start
        await procedureAuditLogger.logProcedureStart(run, procedure);
        console.log(`Started procedure ${procedureId} with runId ${runId}`);
        return run;
    }
    /**
     * Resume an existing procedure run
     */
    async resumeProcedure(runId) {
        const run = this.activeRuns.get(runId);
        if (!run) {
            return null;
        }
        // Check if expired
        if (run.expiresAt && new Date(run.expiresAt) < new Date()) {
            run.status = 'expired';
            await this.saveState();
            return null;
        }
        return run;
    }
    /**
     * Get the current step for a procedure run
     */
    async getCurrentStep(runId) {
        const run = this.activeRuns.get(runId);
        if (!run || run.status !== 'active') {
            return null;
        }
        const procedure = await procedureLoader.getProcedure(run.procedureId);
        if (!procedure) {
            return null;
        }
        if (run.currentStepIndex >= procedure.steps.length) {
            return null;
        }
        return procedure.steps[run.currentStepIndex];
    }
    /**
     * Advance to the next step in a procedure
     * @param runId - The run ID
     * @param stepResult - The result of the current step
     * @param stepResponse - Optional response data to store for the step
     */
    async advanceStep(runId, stepResult, stepResponse) {
        const run = this.activeRuns.get(runId);
        if (!run || run.status !== 'active') {
            return null;
        }
        const procedure = await procedureLoader.getProcedure(run.procedureId);
        if (!procedure) {
            return null;
        }
        // Store the step result
        const currentStep = procedure.steps[run.currentStepIndex];
        if (currentStep) {
            run.completedSteps.push(currentStep.id);
            // Store the response if provided
            if (stepResponse !== undefined) {
                run.stepResponses.set(currentStep.id, stepResponse);
            }
            else if (stepResult.response) {
                run.stepResponses.set(currentStep.id, stepResult.response);
            }
        }
        // Check if the step failed
        if (stepResult.status === 'failure') {
            run.status = 'failed';
            await this.saveState();
            // Log procedure failure
            await procedureAuditLogger.logProcedureFail(run, stepResult.error || 'Step execution failed');
            return run;
        }
        // Log step completion
        if (currentStep) {
            await procedureAuditLogger.logStepComplete(run, currentStep.id, currentStep.name);
        }
        // Move to next step
        run.currentStepIndex++;
        // Check if procedure is complete
        if (run.currentStepIndex >= procedure.steps.length) {
            run.status = 'completed';
            // Log procedure completion
            await procedureAuditLogger.logProcedureComplete(run);
        }
        await this.saveState();
        return run;
    }
    /**
     * Execute a procedure step
     */
    async executeStep(runId, userInput) {
        const run = this.activeRuns.get(runId);
        if (!run || run.status !== 'active') {
            throw new Error(`No active run found: ${runId}`);
        }
        const procedure = await procedureLoader.getProcedure(run.procedureId);
        if (!procedure) {
            throw new Error(`Procedure not found: ${run.procedureId}`);
        }
        if (run.currentStepIndex >= procedure.steps.length) {
            throw new Error('No more steps to execute');
        }
        const step = procedure.steps[run.currentStepIndex];
        const context = { ...run.context, userInput };
        // Execute the step with retry logic
        const result = await stepExecutor.executeStepWithRetry(step, context, run.stepResponses);
        // Advance to next step if successful
        if (result.status === 'success') {
            await this.advanceStep(runId, result);
        }
        return result;
    }
    /**
     * Check if a tool requires a procedure
     */
    async checkProcedureRequirement(context) {
        // Find applicable procedures
        const procedures = await procedureLoader.findApplicableProcedures({
            toolName: context.toolName,
            operation: context.operation,
            purpose: context.operation,
            tags: []
        });
        if (procedures.length === 0) {
            return { allowed: true };
        }
        // Use the highest priority procedure
        const procedure = procedures[0];
        // Check if there's an active run for this procedure
        const activeRun = this.findActiveRunForProcedure(procedure.id);
        if (activeRun) {
            return {
                allowed: false,
                procedureRequired: procedure,
                reason: 'Procedure in progress',
                runId: activeRun.runId
            };
        }
        return {
            allowed: false,
            procedureRequired: procedure,
            reason: 'Procedure required for this operation'
        };
    }
    /**
     * List all active procedure runs
     */
    listActiveRuns() {
        return Array.from(this.activeRuns.values()).map(run => ({
            runId: run.runId,
            procedureId: run.procedureId,
            status: run.status
        }));
    }
    /**
     * Cancel a procedure run
     */
    async cancelRun(runId) {
        const run = this.activeRuns.get(runId);
        if (!run) {
            return false;
        }
        run.status = 'failed';
        await this.saveState();
        return true;
    }
    /**
     * Clean up expired runs
     */
    async cleanupExpiredRuns() {
        const now = new Date();
        let changed = false;
        for (const [runId, run] of this.activeRuns.entries()) {
            if (run.expiresAt && new Date(run.expiresAt) < now) {
                if (run.status === 'active') {
                    run.status = 'expired';
                    changed = true;
                    // Log procedure expiration
                    await procedureAuditLogger.logProcedureExpire(run);
                }
            }
            // Remove completed/failed/expired runs older than 1 hour
            if (run.status !== 'active') {
                const age = now.getTime() - new Date(run.startedAt).getTime();
                if (age > 60 * 60 * 1000) {
                    this.activeRuns.delete(runId);
                    changed = true;
                }
            }
        }
        if (changed) {
            await this.saveState();
        }
    }
    /**
     * Find an active run for a procedure
     */
    findActiveRunForProcedure(procedureId) {
        for (const run of this.activeRuns.values()) {
            if (run.procedureId === procedureId && run.status === 'active') {
                // Check if not expired
                if (!run.expiresAt || new Date(run.expiresAt) > new Date()) {
                    return run;
                }
            }
        }
        return null;
    }
    /**
     * Generate a unique run ID
     */
    generateRunId() {
        return `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Load state from disk
     */
    async loadState() {
        try {
            // Ensure directory exists
            await fs.mkdir(storageConfig.stateDirectory, { recursive: true });
            // Load state file
            const data = await fs.readFile(this.stateFile, 'utf-8');
            const state = JSON.parse(data);
            // Restore runs
            if (state.runs && Array.isArray(state.runs)) {
                for (const runData of state.runs) {
                    // Convert stepResponses array back to Map
                    const run = {
                        ...runData,
                        stepResponses: new Map(runData.stepResponses || [])
                    };
                    this.activeRuns.set(run.runId, run);
                }
            }
            console.log(`Loaded ${this.activeRuns.size} procedure runs from state`);
        }
        catch (error) {
            // File doesn't exist or is invalid, start fresh
            console.log('No existing procedure state found, starting fresh');
        }
    }
    /**
     * Save state to disk
     */
    async saveState() {
        // Debounce saves
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        this.saveTimer = setTimeout(async () => {
            try {
                // Ensure directory exists
                await fs.mkdir(storageConfig.stateDirectory, { recursive: true });
                // Convert runs to serializable format
                const runs = Array.from(this.activeRuns.values()).map(run => ({
                    ...run,
                    stepResponses: Array.from(run.stepResponses.entries())
                }));
                const state = {
                    version: '1.0.0',
                    savedAt: new Date().toISOString(),
                    runs
                };
                await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
                console.log(`Saved ${runs.length} procedure runs to state`);
            }
            catch (error) {
                console.error('Failed to save procedure state:', error);
            }
        }, 1000);
    }
    /**
     * Get procedure statistics
     */
    getStatistics() {
        let active = 0;
        let completed = 0;
        let failed = 0;
        let expired = 0;
        for (const run of this.activeRuns.values()) {
            switch (run.status) {
                case 'active':
                    active++;
                    break;
                case 'completed':
                    completed++;
                    break;
                case 'failed':
                    failed++;
                    break;
                case 'expired':
                    expired++;
                    break;
            }
        }
        return { activeRuns: active, completedRuns: completed, failedRuns: failed, expiredRuns: expired };
    }
}
// Export singleton instance
export const procedureService = new ProcedureService();
