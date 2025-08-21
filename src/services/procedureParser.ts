/**
 * Procedure Parser Service
 * Parses procedures_protocols JSON from Verodat dataset into structured procedures
 */

import { 
  Procedure, 
  ProcedureStep, 
  StepType,
  QuizStep,
  ApprovalStep,
  WaitStep,
  InformationStep,
  ToolStep
} from '../types/procedureTypes.js';

export class ProcedureParser {
  /**
   * Parse a procedures_protocols JSON string from Verodat
   */
  static parseProceduresProtocol(jsonString: string): Procedure[] {
    try {
      const data = JSON.parse(jsonString);
      
      // Handle both single procedure and array of procedures
      const proceduresArray = Array.isArray(data) ? data : [data];
      
      return proceduresArray.map(proc => this.parseProcedure(proc));
    } catch (error) {
      console.error('Failed to parse procedures protocol:', error);
      throw new Error(`Invalid procedures protocol format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse a single procedure object
   */
  private static parseProcedure(proc: any): Procedure {
    if (!proc.id || !proc.name || !proc.steps) {
      throw new Error('Procedure must have id, name, and steps');
    }

    return {
      id: proc.id,
      name: proc.name,
      description: proc.description || '',
      version: proc.version || '1.0.0',
      purpose: proc.purpose || proc.name,
      triggers: this.parseTriggers(proc.triggers || proc.applicableTools),
      requirements: proc.requirements || {},
      steps: proc.steps.map((step: any) => this.parseStep(step)),
      metadata: {
        createdAt: proc.metadata?.createdAt || new Date().toISOString(),
        updatedAt: proc.metadata?.updatedAt || new Date().toISOString(),
        createdBy: proc.metadata?.createdBy || 'system',
        tags: proc.metadata?.tags || [],
        category: proc.metadata?.category || 'general',
        priority: proc.metadata?.priority || 'normal',
        estimatedDuration: proc.metadata?.estimatedDuration || 300,
        riskLevel: proc.metadata?.riskLevel || 'low'
      },
      validation: proc.validation || {
        preConditions: [],
        postConditions: [],
        invariants: []
      },
      audit: proc.audit || {
        required: true,
        level: 'full',
        retention: 90
      },
      isActive: proc.isActive !== false,
      effectiveFrom: proc.effectiveFrom || new Date().toISOString(),
      effectiveTo: proc.effectiveTo,
      appliesTo: proc.appliesTo || { roles: [], departments: [], operations: [] }
    };
  }

  /**
   * Parse triggers (backward compatible with applicableTools)
   */
  private static parseTriggers(triggers: any): Procedure['triggers'] {
    if (!triggers) {
      return { tools: [], operations: [], conditions: [] };
    }

    // Handle legacy applicableTools format
    if (Array.isArray(triggers)) {
      return {
        tools: triggers.map(t => typeof t === 'string' ? t : t.name || t),
        operations: [],
        conditions: []
      };
    }

    return {
      tools: triggers.tools || [],
      operations: triggers.operations || [],
      conditions: triggers.conditions || []
    };
  }

  /**
   * Parse a single step
   */
  private static parseStep(step: any): ProcedureStep {
    const baseStep = {
      id: step.id || `step-${Date.now()}`,
      name: step.name || step.title || 'Unnamed Step',
      type: this.determineStepType(step),
      description: step.description || '',
      required: step.required !== false,
      retryable: step.retryable !== false,
      maxRetries: step.maxRetries || 3,
      timeout: step.timeout || 300000,
      validation: step.validation || {},
      metadata: step.metadata || {},
      conditions: step.conditions || {},
      onSuccess: step.onSuccess,
      onFailure: step.onFailure,
      onTimeout: step.onTimeout,
      skipConditions: step.skipConditions || []
    };

    // Add type-specific properties
    switch (baseStep.type) {
      case 'quiz':
        return {
          ...baseStep,
          type: 'quiz',
          question: step.question || step.quiz?.question || '',
          options: step.options || step.quiz?.options || [],
          correctAnswer: step.correctAnswer || step.quiz?.correctAnswer,
          multipleChoice: step.multipleChoice || step.quiz?.multipleChoice || false,
          explanation: step.explanation || step.quiz?.explanation,
          hints: step.hints || step.quiz?.hints || [],
          allowedAttempts: step.allowedAttempts || step.quiz?.allowedAttempts || 3,
          minimumScore: step.minimumScore || step.quiz?.minimumScore || 100
        } as QuizStep;

      case 'approval':
        return {
          ...baseStep,
          type: 'approval',
          approvers: step.approvers || step.approval?.approvers || [],
          approvalType: step.approvalType || step.approval?.approvalType || 'single',
          minimumApprovals: step.minimumApprovals || step.approval?.minimumApprovals || 1,
          escalation: step.escalation || step.approval?.escalation || {
            enabled: false,
            timeout: 86400000,
            escalateTo: []
          },
          delegationAllowed: step.delegationAllowed !== false,
          comments: step.comments || { required: false },
          evidenceRequired: step.evidenceRequired || []
        } as ApprovalStep;

      case 'wait':
        return {
          ...baseStep,
          type: 'wait',
          waitType: step.waitType || step.wait?.type || 'time',
          duration: step.duration || step.wait?.duration,
          condition: step.condition || step.wait?.condition,
          checkInterval: step.checkInterval || step.wait?.checkInterval || 5000,
          message: step.message || step.wait?.message || 'Waiting...'
        } as WaitStep;

      case 'information':
        return {
          ...baseStep,
          type: 'information',
          content: step.content || step.information?.content || '',
          format: step.format || step.information?.format || 'text',
          acknowledgmentRequired: step.acknowledgmentRequired !== false,
          displayDuration: step.displayDuration || step.information?.displayDuration,
          links: step.links || step.information?.links || [],
          attachments: step.attachments || step.information?.attachments || []
        } as InformationStep;

      case 'tool':
      default:
        return {
          ...baseStep,
          type: 'tool',
          toolName: step.toolName || step.tool?.name || step.name,
          toolDescription: step.toolDescription || step.tool?.description,
          parameters: step.parameters || step.tool?.parameters || {},
          validationRules: step.validationRules || step.tool?.validationRules || [],
          outputValidation: step.outputValidation || step.tool?.outputValidation,
          sideEffects: step.sideEffects || step.tool?.sideEffects || [],
          compensatingAction: step.compensatingAction || step.tool?.compensatingAction
        } as ToolStep;
    }
  }

  /**
   * Determine step type from step data
   */
  private static determineStepType(step: any): StepType {
    // Explicit type field
    if (step.type && ['tool', 'quiz', 'approval', 'wait', 'information'].includes(step.type)) {
      return step.type as StepType;
    }

    // Infer from nested objects
    if (step.quiz) return 'quiz';
    if (step.approval) return 'approval';
    if (step.wait) return 'wait';
    if (step.information) return 'information';
    if (step.tool || step.toolName) return 'tool';

    // Infer from properties
    if (step.question && step.options) return 'quiz';
    if (step.approvers) return 'approval';
    if (step.waitType || step.duration) return 'wait';
    if (step.content && step.acknowledgmentRequired !== undefined) return 'information';

    // Default to tool
    return 'tool';
  }

  /**
   * Validate a parsed procedure
   */
  static validateProcedure(procedure: Procedure): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!procedure.id) errors.push('Procedure must have an ID');
    if (!procedure.name) errors.push('Procedure must have a name');
    if (!procedure.steps || procedure.steps.length === 0) {
      errors.push('Procedure must have at least one step');
    }

    // Validate each step
    procedure.steps.forEach((step: ProcedureStep, index: number) => {
      if (!step.id) errors.push(`Step ${index + 1} must have an ID`);
      if (!step.name) errors.push(`Step ${index + 1} must have a name`);
      if (!step.type) errors.push(`Step ${index + 1} must have a type`);

      // Type-specific validation
      switch (step.type) {
        case 'quiz':
          const quizStep = step as QuizStep;
          if (!quizStep.question) errors.push(`Quiz step ${step.name} must have a question`);
          if (!quizStep.options || quizStep.options.length === 0) {
            errors.push(`Quiz step ${step.name} must have options`);
          }
          break;

        case 'approval':
          const approvalStep = step as ApprovalStep;
          if (!approvalStep.approvers || approvalStep.approvers.length === 0) {
            errors.push(`Approval step ${step.name} must have approvers`);
          }
          break;

        case 'tool':
          const toolStep = step as ToolStep;
          if (!toolStep.toolName) {
            errors.push(`Tool step ${step.name} must have a tool name`);
          }
          break;
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
