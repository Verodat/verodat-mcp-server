/**
 * Step Executor Service
 * Executes different types of procedure steps
 */

import {
  ProcedureStep,
  StepResult,
  QuizStep,
  ApprovalStep,
  WaitStep,
  InformationStep,
  ToolStep,
  QuizResult,
  ApprovalResult,
  InformationResult
} from '../types/procedureTypes.js';

export class StepExecutor {
  private toolHandler: any; // Will be injected
  private retryDelays: Map<string, number> = new Map();

  constructor(toolHandler?: any) {
    this.toolHandler = toolHandler;
  }

  /**
   * Set the tool handler for tool step execution
   */
  setToolHandler(handler: any): void {
    this.toolHandler = handler;
  }

  /**
   * Execute a procedure step
   */
  async executeStep(
    step: ProcedureStep,
    context: Record<string, any>,
    previousResponses?: Map<string, any>
  ): Promise<StepResult> {
    console.log(`Executing step: ${step.id} (${step.type})`);

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
      let result: StepResult;

      switch (step.type) {
        case 'quiz':
          result = await this.executeQuizStep(step as QuizStep, context);
          break;
        case 'approval':
          result = await this.executeApprovalStep(step as ApprovalStep, context);
          break;
        case 'wait':
          result = await this.executeWaitStep(step as WaitStep, context);
          break;
        case 'information':
          result = await this.executeInformationStep(step as InformationStep, context);
          break;
        case 'tool':
          result = await this.executeToolStep(step as ToolStep, context);
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

    } catch (error) {
      console.error(`Error executing step ${step.id}:`, error);

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
  private async executeQuizStep(step: QuizStep, context: Record<string, any>): Promise<StepResult> {
    // In a real implementation, this would interact with the user
    // For now, return a simulated result
    const quizResult: QuizResult = {
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
  private async executeApprovalStep(step: ApprovalStep, context: Record<string, any>): Promise<StepResult> {
    // In a real implementation, this would request approval from the specified approvers
    // For now, return a simulated approval
    const approvalResult: ApprovalResult = {
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
  private async executeWaitStep(step: WaitStep, context: Record<string, any>): Promise<StepResult> {
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
        console.log(`Waiting for confirmation: ${step.message}`);
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
  private async executeInformationStep(step: InformationStep, context: Record<string, any>): Promise<StepResult> {
    // Display information
    console.log(`Information: ${step.content}`);

    // In a real implementation, this would display to the user and wait for acknowledgment if required
    const infoResult: InformationResult = {
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
  private async executeToolStep(step: ToolStep, context: Record<string, any>): Promise<StepResult> {
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

    } catch (error) {
      // Handle compensating action if configured
      if (step.compensatingAction) {
        console.log(`Executing compensating action: ${step.compensatingAction}`);
        // Execute compensating action
      }

      throw error;
    }
  }

  /**
   * Check if a step should be skipped
   */
  private shouldSkipStep(
    step: ProcedureStep,
    context: Record<string, any>,
    previousResponses?: Map<string, any>
  ): boolean {
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
  private evaluateCondition(
    condition: string,
    context: Record<string, any>,
    previousResponses?: Map<string, any>
  ): boolean {
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
        const leftValue = left in evalContext ? (evalContext as any)[left] : undefined;
        return leftValue == right;
      }

      return false;
    } catch (error) {
      console.error(`Error evaluating condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Execute a callback
   */
  private async executeCallback(
    callback: string,
    context: Record<string, any>,
    result: StepResult
  ): Promise<void> {
    console.log(`Executing callback: ${callback}`);
    // In a real implementation, this would execute the callback action
  }

  /**
   * Validate parameters against rules
   */
  private validateParameters(
    parameters: Record<string, any>,
    rules: Array<{ name: string; rule: string; message?: string }>
  ): string[] {
    const errors: string[] = [];

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
  private validateOutput(output: any, schema: Record<string, any>): string[] {
    const errors: string[] = [];
    
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
  private async waitForCondition(
    condition: string,
    checkInterval: number,
    timeout: number
  ): Promise<void> {
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
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute a step with retry logic
   */
  async executeStepWithRetry(
    step: ProcedureStep,
    context: Record<string, any>,
    previousResponses?: Map<string, any>
  ): Promise<StepResult> {
    let lastError: Error | undefined;
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

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (!step.retryable) {
          throw lastError;
        }
      }

      // Calculate and apply retry delay
      if (attempts < maxAttempts) {
        const delay = this.calculateRetryDelay(step.id, attempts);
        console.log(`Retrying step ${step.id} after ${delay}ms (attempt ${attempts + 1}/${maxAttempts})`);
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
  private calculateRetryDelay(stepId: string, attempt: number): number {
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
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Export singleton instance
export const stepExecutor = new StepExecutor();
