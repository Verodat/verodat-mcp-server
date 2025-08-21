/**
 * Step Executor Service
 * Executes different types of procedure steps
 */
import { ProcedureStep, StepResult } from '../types/procedureTypes.js';
export declare class StepExecutor {
    private toolHandler;
    private retryDelays;
    constructor(toolHandler?: any);
    /**
     * Set the tool handler for tool step execution
     */
    setToolHandler(handler: any): void;
    /**
     * Execute a procedure step
     */
    executeStep(step: ProcedureStep, context: Record<string, any>, previousResponses?: Map<string, any>): Promise<StepResult>;
    /**
     * Execute a quiz step
     */
    private executeQuizStep;
    /**
     * Execute an approval step
     */
    private executeApprovalStep;
    /**
     * Execute a wait step
     */
    private executeWaitStep;
    /**
     * Execute an information step
     */
    private executeInformationStep;
    /**
     * Execute a tool step
     */
    private executeToolStep;
    /**
     * Check if a step should be skipped
     */
    private shouldSkipStep;
    /**
     * Evaluate a condition string
     */
    private evaluateCondition;
    /**
     * Execute a callback
     */
    private executeCallback;
    /**
     * Validate parameters against rules
     */
    private validateParameters;
    /**
     * Validate output against schema
     */
    private validateOutput;
    /**
     * Wait for a condition to be met
     */
    private waitForCondition;
    /**
     * Delay execution
     */
    private delay;
    /**
     * Execute a step with retry logic
     */
    executeStepWithRetry(step: ProcedureStep, context: Record<string, any>, previousResponses?: Map<string, any>): Promise<StepResult>;
    /**
     * Calculate exponential backoff delay for retries
     */
    private calculateRetryDelay;
}
export declare const stepExecutor: StepExecutor;
