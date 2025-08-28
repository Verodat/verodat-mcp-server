/**
 * Step Executor Service
 * Executes different types of procedure steps
 */
export class StepExecutor {
    toolHandler; // Will be injected
    retryDelays = new Map();
    constructor(toolHandler) {
        this.toolHandler = toolHandler;
    }
    /**
     * Set the tool handler for tool step execution
     */
    setToolHandler(handler) {
        this.toolHandler = handler;
    }
    /**
     * Execute a procedure step
     */
    async executeStep(step, context, previousResponses) {
        if (process.argv[2] === 'call') {
            console.log(`Executing step: ${step.id} (${step.type})`);
        }
        // Check skip conditions
        if (this.shouldSkipStep(step, context, previousResponses)) {
            return {
                stepId: step.id,
                status: 'skipped',
                response: { reason: 'Skip condition met' },
                timestamp: new Date().toISOString()
            };
        }
        try {
            let result;
            switch (step.type) {
                case 'quiz':
                    result = await this.executeQuizStep(step, context);
                    break;
                case 'approval':
                    result = await this.executeApprovalStep(step, context);
                    break;
                case 'wait':
                    result = await this.executeWaitStep(step, context);
                    break;
                case 'information':
                    result = await this.executeInformationStep(step, context);
                    break;
                case 'tool':
                    result = await this.executeToolStep(step, context);
                    break;
                default:
                    throw new Error(`Unknown step type: ${step.type}`);
            }
            // Handle success callback
            if (result.status === 'success' && step.onSuccess) {
                await this.executeCallback(step.onSuccess, context, result);
            }
            // Handle failure callback
            if (result.status === 'failure' && step.onFailure) {
                await this.executeCallback(step.onFailure, context, result);
            }
            return result;
        }
        catch (error) {
            if (process.argv[2] === 'call') {
                console.error(`Error executing step ${step.id}:`, error);
            }
            // Handle timeout callback
            if (error instanceof TimeoutError && step.onTimeout) {
                await this.executeCallback(step.onTimeout, context, {
                    stepId: step.id,
                    status: 'failure',
                    error: 'Step timed out',
                    timestamp: new Date().toISOString()
                });
            }
            return {
                stepId: step.id,
                status: 'failure',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Execute a quiz step
     */
    async executeQuizStep(step, context) {
        // In a real implementation, this would interact with the user
        // For now, return a simulated result
        const quizResult = {
            passed: true,
            score: 100,
            answers: { [step.id]: step.correctAnswer },
            attempts: 1
        };
        return {
            stepId: step.id,
            status: quizResult.passed ? 'success' : 'failure',
            response: quizResult,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Execute an approval step
     */
    async executeApprovalStep(step, context) {
        // In a real implementation, this would request approval from the specified approvers
        // For now, return a simulated approval
        const approvalResult = {
            approved: true,
            approver: step.approvers[0] || 'system',
            comments: 'Approved for testing',
            timestamp: new Date().toISOString()
        };
        return {
            stepId: step.id,
            status: approvalResult.approved ? 'success' : 'failure',
            response: approvalResult,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Execute a wait step
     */
    async executeWaitStep(step, context) {
        switch (step.waitType) {
            case 'time':
                if (step.duration) {
                    await this.delay(step.duration);
                }
                break;
            case 'external':
                // In a real implementation, this would poll for an external condition
                await this.waitForCondition(step.condition || '', step.checkInterval, step.timeout);
                break;
            case 'confirmation':
                // In a real implementation, this would wait for user confirmation
                if (process.argv[2] === 'call') {
                    console.log(`Waiting for confirmation: ${step.message}`);
                }
                break;
        }
        return {
            stepId: step.id,
            status: 'success',
            response: { waitType: step.waitType, message: step.message },
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Execute an information step
     */
    async executeInformationStep(step, context) {
        // Display information
        if (process.argv[2] === 'call') {
            console.log(`Information: ${step.content}`);
        }
        // In a real implementation, this would display to the user and wait for acknowledgment if required
        const infoResult = {
            acknowledged: step.acknowledgmentRequired,
            timestamp: new Date().toISOString()
        };
        if (step.displayDuration) {
            await this.delay(step.displayDuration);
        }
        return {
            stepId: step.id,
            status: 'success',
            response: infoResult,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Execute a tool step
     */
    async executeToolStep(step, context) {
        if (!this.toolHandler) {
            throw new Error('Tool handler not set. Cannot execute tool steps.');
        }
        try {
            // Validate input parameters
            if (step.validationRules && step.validationRules.length > 0) {
                const validationErrors = this.validateParameters(step.parameters, step.validationRules);
                if (validationErrors.length > 0) {
                    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
                }
            }
            // Execute the tool
            const result = await this.toolHandler.handle({
                method: 'tools/call',
                params: {
                    name: step.toolName,
                    arguments: { ...context, ...step.parameters }
                }
            });
            // Validate output if configured
            if (step.outputValidation) {
                const outputErrors = this.validateOutput(result, step.outputValidation);
                if (outputErrors.length > 0) {
                    throw new Error(`Output validation failed: ${outputErrors.join(', ')}`);
                }
            }
            return {
                stepId: step.id,
                status: 'success',
                response: result,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            // Handle compensating action if configured
            if (step.compensatingAction) {
                if (process.argv[2] === 'call') {
                    console.log(`Executing compensating action: ${step.compensatingAction}`);
                }
                // Execute compensating action
            }
            throw error;
        }
    }
    /**
     * Check if a step should be skipped
     */
    shouldSkipStep(step, context, previousResponses) {
        if (!step.skipConditions || step.skipConditions.length === 0) {
            return false;
        }
        // Evaluate skip conditions
        for (const condition of step.skipConditions) {
            if (this.evaluateCondition(condition, context, previousResponses)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Evaluate a condition string
     */
    evaluateCondition(condition, context, previousResponses) {
        // Simple condition evaluation
        // In a real implementation, this would use a proper expression evaluator
        try {
            // Create a safe evaluation context
            const evalContext = {
                ...context,
                responses: previousResponses ? Object.fromEntries(previousResponses) : {}
            };
            // Very basic condition parsing (for demonstration)
            // Real implementation would need proper sandboxed evaluation
            if (condition.includes('==')) {
                const [left, right] = condition.split('==').map(s => s.trim());
                // Access with proper type checking
                const leftValue = left in evalContext ? evalContext[left] : undefined;
                return leftValue == right;
            }
            return false;
        }
        catch (error) {
            if (process.argv[2] === 'call') {
                console.error(`Error evaluating condition: ${condition}`, error);
            }
            return false;
        }
    }
    /**
     * Execute a callback
     */
    async executeCallback(callback, context, result) {
        if (process.argv[2] === 'call') {
            console.log(`Executing callback: ${callback}`);
        }
        // In a real implementation, this would execute the callback action
    }
    /**
     * Validate parameters against rules
     */
    validateParameters(parameters, rules) {
        const errors = [];
        for (const rule of rules) {
            // Simple validation (real implementation would be more sophisticated)
            if (rule.rule.includes('required') && !parameters[rule.name]) {
                errors.push(rule.message || `${rule.name} is required`);
            }
        }
        return errors;
    }
    /**
     * Validate output against schema
     */
    validateOutput(output, schema) {
        const errors = [];
        // Simple validation (real implementation would use a proper schema validator)
        if (schema.required) {
            for (const field of schema.required) {
                if (!output[field]) {
                    errors.push(`Required field missing: ${field}`);
                }
            }
        }
        return errors;
    }
    /**
     * Wait for a condition to be met
     */
    async waitForCondition(condition, checkInterval, timeout) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            // Check condition (simplified)
            if (this.evaluateCondition(condition, {}, new Map())) {
                return;
            }
            await this.delay(checkInterval);
        }
        throw new TimeoutError(`Condition not met within timeout: ${condition}`);
    }
    /**
     * Delay execution
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Execute a step with retry logic
     */
    async executeStepWithRetry(step, context, previousResponses) {
        let lastError;
        let attempts = 0;
        const maxAttempts = step.retryable ? step.maxRetries : 1;
        while (attempts < maxAttempts) {
            attempts++;
            try {
                const result = await this.executeStep(step, context, previousResponses);
                if (result.status === 'success') {
                    // Reset retry delay on success
                    this.retryDelays.delete(step.id);
                    return result;
                }
                // For non-retryable failures, return immediately
                if (!step.retryable) {
                    return result;
                }
                lastError = new Error(result.error || 'Step failed');
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (!step.retryable) {
                    throw lastError;
                }
            }
            // Calculate and apply retry delay
            if (attempts < maxAttempts) {
                const delay = this.calculateRetryDelay(step.id, attempts);
                if (process.argv[2] === 'call') {
                    console.log(`Retrying step ${step.id} after ${delay}ms (attempt ${attempts + 1}/${maxAttempts})`);
                }
                await this.delay(delay);
            }
        }
        // All retries exhausted
        return {
            stepId: step.id,
            status: 'failure',
            error: lastError?.message || 'Max retries exceeded',
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Calculate exponential backoff delay for retries
     */
    calculateRetryDelay(stepId, attempt) {
        const baseDelay = 1000; // 1 second
        const maxDelay = 30000; // 30 seconds
        const multiplier = 2;
        const delay = Math.min(baseDelay * Math.pow(multiplier, attempt - 1), maxDelay);
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 * delay;
        return Math.round(delay + jitter);
    }
}
/**
 * Custom timeout error
 */
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}
// Export singleton instance
export const stepExecutor = new StepExecutor();
