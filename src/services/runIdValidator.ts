/**
 * RunIdValidator Service
 * 
 * Provides secure validation of runIds to prevent procedure hijacking.
 * Ensures that runIds can only be used for operations that the associated
 * procedure actually governs.
 */

import { procedureService } from './procedureService.js';
import { procedureLoader } from './procedureLoader.js';
import { auditService } from './auditService.js';
import { getOperationType, isReadOperation, isWriteOperation } from '../config/operationTypes.js';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  procedureId?: string;
  allowedTools?: string[];
  violation?: SecurityViolation;
}

export interface SecurityViolation {
  type: 'RUNID_HIJACK' | 'UNAUTHORIZED_TOOL' | 'EXPIRED_RUN' | 'INVALID_STEP';
  attemptedTool: string;
  runId: string;
  procedureId: string;
  message: string;
  timestamp: string;
}

export class RunIdValidator {
  private static instance: RunIdValidator;
  private violationLog: SecurityViolation[] = [];

  private constructor() {}

  static getInstance(): RunIdValidator {
    if (!RunIdValidator.instance) {
      RunIdValidator.instance = new RunIdValidator();
    }
    return RunIdValidator.instance;
  }

  /**
   * Validate that a runId is authorized for a specific tool operation
   * 
   * This is the CRITICAL security check that prevents runId hijacking
   */
  async validateRunIdForTool(
    runId: string, 
    toolName: string,
    args?: any
  ): Promise<ValidationResult> {
    try {
      // 1. Check if the run exists and is active
      const activeRun = procedureService.getActiveRun(runId);
      if (!activeRun) {
        return {
          isValid: false,
          reason: `Invalid or expired runId: ${runId}`,
          violation: {
            type: 'EXPIRED_RUN',
            attemptedTool: toolName,
            runId,
            procedureId: 'unknown',
            message: `Attempted to use invalid/expired runId ${runId} for tool ${toolName}`,
            timestamp: new Date().toISOString()
          }
        };
      }

      // 2. Get the procedure definition
      const procedure = await procedureLoader.getProcedure(activeRun.procedureId);
      if (!procedure) {
        return {
          isValid: false,
          reason: `Procedure ${activeRun.procedureId} not found`,
          violation: {
            type: 'INVALID_STEP',
            attemptedTool: toolName,
            runId,
            procedureId: activeRun.procedureId,
            message: `Procedure definition not found for ${activeRun.procedureId}`,
            timestamp: new Date().toISOString()
          }
        };
      }

      // 3. Check if the procedure governs this tool
      const governedTools = this.extractGovernedTools(procedure);
      
      // Special handling for procedure management tools
      if (this.isProcedureManagementTool(toolName)) {
        // These tools are always allowed with a valid runId
        return {
          isValid: true,
          procedureId: activeRun.procedureId,
          allowedTools: governedTools
        };
      }

      // 4. Validate the tool is governed by this procedure
      if (!governedTools.includes(toolName)) {
        // SECURITY VIOLATION: Attempted runId hijacking
        const violation: SecurityViolation = {
          type: 'RUNID_HIJACK',
          attemptedTool: toolName,
          runId,
          procedureId: activeRun.procedureId,
          message: `SECURITY VIOLATION: Attempted to use runId from procedure ${activeRun.procedureId} ` +
                   `to execute unauthorized tool ${toolName}. This procedure only governs: ${governedTools.join(', ')}`,
          timestamp: new Date().toISOString()
        };
        
        this.logViolation(violation);
        
        return {
          isValid: false,
          reason: violation.message,
          procedureId: activeRun.procedureId,
          allowedTools: governedTools,
          violation
        };
      }

      // 5. Check if current step allows this tool
      const currentStep = activeRun.currentStepIndex;
      const stepAllowedTools = this.getStepAllowedTools(procedure, currentStep);
      
      if (stepAllowedTools.length > 0 && !stepAllowedTools.includes(toolName)) {
        const violation: SecurityViolation = {
          type: 'INVALID_STEP',
          attemptedTool: toolName,
          runId,
          procedureId: activeRun.procedureId,
          message: `Tool ${toolName} is not allowed in current step ${currentStep + 1}. ` +
                   `Current step allows: ${stepAllowedTools.join(', ')}`,
          timestamp: new Date().toISOString()
        };
        
        this.logViolation(violation);
        
        return {
          isValid: false,
          reason: violation.message,
          procedureId: activeRun.procedureId,
          allowedTools: stepAllowedTools,
          violation
        };
      }

      // 6. Additional validation for WRITE operations
      if (isWriteOperation(toolName)) {
        const writeValidation = await this.validateWriteOperation(
          toolName, 
          procedure, 
          activeRun,
          args
        );
        
        if (!writeValidation.isValid) {
          return writeValidation;
        }
      }

      // All validations passed
      return {
        isValid: true,
        procedureId: activeRun.procedureId,
        allowedTools: governedTools
      };

    } catch (error) {
      console.error('[RunIdValidator] Validation error:', error);
      return {
        isValid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extract all tools that a procedure governs
   */
  private extractGovernedTools(procedure: any): string[] {
    const tools = new Set<string>();
    
    // Add tools from triggers
    if (procedure.triggers?.tools) {
      procedure.triggers.tools.forEach((tool: string) => tools.add(tool));
    }
    
    // Add tools from all steps
    if (procedure.steps) {
      procedure.steps.forEach((step: any) => {
        if (step.tools) {
          step.tools.forEach((tool: string) => tools.add(tool));
        }
        // Handle tool patterns in validation
        if (step.validation?.allowedTools) {
          step.validation.allowedTools.forEach((tool: string) => tools.add(tool));
        }
      });
    }

    // Handle patterns like 'get-*' or '*-dataset'
    const expandedTools = this.expandToolPatterns(Array.from(tools));
    
    return expandedTools;
  }

  /**
   * Expand tool patterns to actual tool names
   */
  private expandToolPatterns(patterns: string[]): string[] {
    const allTools = [
      // READ operations
      'get-datasets', 'get-dataset-output', 'get-dataset-targetfields',
      'get-accounts', 'get-workspaces', 'get-queries', 'get-ai-context',
      'execute-ai-query',
      
      // WRITE operations  
      'create-dataset', 'update-dataset', 'delete-dataset',
      'upload-dataset-rows', 'update-dataset-rows', 'delete-dataset-rows',
      
      // Procedure tools
      'start-procedure', 'list-procedures', 'resume-procedure'
    ];

    const expandedTools = new Set<string>();
    
    patterns.forEach(pattern => {
      if (pattern.includes('*')) {
        // Handle wildcard patterns
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        allTools.forEach(tool => {
          if (regex.test(tool)) {
            expandedTools.add(tool);
          }
        });
      } else {
        // Direct tool name
        expandedTools.add(pattern);
      }
    });
    
    return Array.from(expandedTools);
  }

  /**
   * Get tools allowed in the current step
   */
  private getStepAllowedTools(procedure: any, stepIndex: number): string[] {
    if (!procedure.steps || stepIndex >= procedure.steps.length) {
      return [];
    }
    
    const step = procedure.steps[stepIndex];
    const tools: string[] = [];
    
    if (step.tools) {
      tools.push(...step.tools);
    }
    
    if (step.validation?.allowedTools) {
      tools.push(...step.validation.allowedTools);
    }
    
    return this.expandToolPatterns(tools);
  }

  /**
   * Additional validation for WRITE operations
   */
  private async validateWriteOperation(
    toolName: string,
    procedure: any,
    activeRun: any,
    args?: any
  ): Promise<ValidationResult> {
    // Check if procedure explicitly allows WRITE operations
    if (procedure.triggers?.operations) {
      const allowedOps = procedure.triggers.operations;
      if (!allowedOps.includes('WRITE') && !allowedOps.includes('ALL')) {
        return {
          isValid: false,
          reason: `Procedure ${procedure.id} does not allow WRITE operations`,
          violation: {
            type: 'UNAUTHORIZED_TOOL',
            attemptedTool: toolName,
            runId: activeRun.runId,
            procedureId: procedure.id,
            message: `WRITE operation ${toolName} not allowed by procedure ${procedure.id}`,
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    // Validate specific WRITE operation constraints
    if (toolName === 'create-dataset' && args?.name) {
      // Check if procedure allows creating this specific dataset
      if (procedure.constraints?.allowedDatasets) {
        const allowed = procedure.constraints.allowedDatasets;
        if (!allowed.includes(args.name) && !allowed.includes('*')) {
          return {
            isValid: false,
            reason: `Procedure does not allow creating dataset: ${args.name}`
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Check if tool is a procedure management tool
   */
  private isProcedureManagementTool(toolName: string): boolean {
    return [
      'start-procedure',
      'list-procedures', 
      'resume-procedure',
      'procedure-status',
      'procedure-complete'
    ].includes(toolName);
  }

  /**
   * Log security violation for audit
   */
  private logViolation(violation: SecurityViolation): void {
    this.violationLog.push(violation);
    
    // Log to console for immediate visibility
    console.error('[SECURITY VIOLATION]', {
      type: violation.type,
      tool: violation.attemptedTool,
      runId: violation.runId,
      procedure: violation.procedureId,
      message: violation.message,
      timestamp: violation.timestamp
    });

    // Send to audit service for persistent logging
    auditService.logSecurityViolation({
      violationType: violation.type,
      toolName: violation.attemptedTool,
      runId: violation.runId,
      procedureId: violation.procedureId,
      reason: violation.message,
      metadata: {
        timestamp: violation.timestamp,
        violationType: violation.type
      }
    });
  }

  /**
   * Get recent security violations
   */
  getViolations(limit: number = 100): SecurityViolation[] {
    return this.violationLog.slice(-limit);
  }

  /**
   * Clear violation log (for testing)
   */
  clearViolations(): void {
    this.violationLog = [];
  }
}

// Export singleton instance
export const runIdValidator = RunIdValidator.getInstance();
