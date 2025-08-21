/**
 * Procedure Support Handler
 * Handles non-tool procedure steps (quiz, approval, wait, information)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { procedureService } from '../services/procedureService.js';
import { procedureLoader } from '../services/procedureLoader.js';
import { stepExecutor } from '../services/stepExecutor.js';
import {
  ProcedureStep,
  QuizStep,
  ApprovalStep,
  InformationStep,
  WaitStep
} from '../types/procedureTypes.js';

/**
 * Quiz answer schema
 */
const QuizAnswerSchema = z.object({
  __runId: z.string().describe('The procedure run ID'),
  answer: z.union([
    z.string(),
    z.array(z.string())
  ]).describe('The answer to the quiz question')
});

/**
 * Approval check schema
 */
const ApprovalCheckSchema = z.object({
  __runId: z.string().describe('The procedure run ID')
});

/**
 * Information acknowledgment schema
 */
const InformationAckSchema = z.object({
  __runId: z.string().describe('The procedure run ID'),
  acknowledged: z.boolean().describe('Whether the information was acknowledged')
});

/**
 * Wait continuation schema
 */
const WaitContinueSchema = z.object({
  __runId: z.string().describe('The procedure run ID')
});

export class ProcedureSupportHandler {

  /**
   * Handle quiz answer submission
   */
  static async handleQuizAnswer(args: any) {
    try {
      const { __runId, answer } = QuizAnswerSchema.parse(args);
      
      // Get the current step
      const currentStep = await procedureService.getCurrentStep(__runId);
      if (!currentStep || currentStep.type !== 'quiz') {
        throw new Error('Current step is not a quiz');
      }

      const quizStep = currentStep as QuizStep;
      
      // Check the answer
      let isCorrect = false;
      if (Array.isArray(quizStep.correctAnswer)) {
        isCorrect = Array.isArray(answer) 
          ? JSON.stringify(answer.sort()) === JSON.stringify(quizStep.correctAnswer.sort())
          : quizStep.correctAnswer.includes(answer as string);
      } else {
        isCorrect = answer === quizStep.correctAnswer;
      }

      // Create step result
      const stepResult = {
        stepId: quizStep.id,
        status: isCorrect ? 'success' as const : 'failure' as const,
        response: {
          answer,
          isCorrect,
          explanation: quizStep.explanation
        },
        timestamp: new Date().toISOString()
      };

      // Advance step if correct
      if (isCorrect) {
        await procedureService.advanceStep(__runId, stepResult);
      }

      return {
        content: [{
          type: 'text',
          text: isCorrect 
            ? `✅ Correct! ${quizStep.explanation || ''}`
            : `❌ Incorrect. ${quizStep.explanation || 'Please try again.'}`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error processing quiz answer: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Handle approval check
   */
  static async handleApprovalCheck(args: any) {
    try {
      const { __runId } = ApprovalCheckSchema.parse(args);
      
      // Get the current step
      const currentStep = await procedureService.getCurrentStep(__runId);
      if (!currentStep || currentStep.type !== 'approval') {
        throw new Error('Current step is not an approval');
      }

      const approvalStep = currentStep as ApprovalStep;
      
      // In a real implementation, this would check with an external approval system
      // For now, we'll simulate approval
      const approved = true;
      const approver = approvalStep.approvers[0] || 'system';
      
      // Create step result
      const stepResult = {
        stepId: approvalStep.id,
        status: approved ? 'success' as const : 'failure' as const,
        response: {
          approved,
          approver,
          comments: 'Approved via procedure support',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      // Advance step if approved
      if (approved) {
        await procedureService.advanceStep(__runId, stepResult);
      }

      return {
        content: [{
          type: 'text',
          text: approved 
            ? `✅ Approved by ${approver}`
            : `⏳ Waiting for approval from ${approvalStep.approvers.join(', ')}`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error checking approval: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Handle information acknowledgment
   */
  static async handleInformationAck(args: any) {
    try {
      const { __runId, acknowledged } = InformationAckSchema.parse(args);
      
      // Get the current step
      const currentStep = await procedureService.getCurrentStep(__runId);
      if (!currentStep || currentStep.type !== 'information') {
        throw new Error('Current step is not an information step');
      }

      const infoStep = currentStep as InformationStep;
      
      if (infoStep.acknowledgmentRequired && !acknowledged) {
        return {
          content: [{
            type: 'text',
            text: '⚠️ Acknowledgment is required to proceed'
          }]
        };
      }

      // Create step result
      const stepResult = {
        stepId: infoStep.id,
        status: 'success' as const,
        response: {
          acknowledged,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      // Advance step
      await procedureService.advanceStep(__runId, stepResult);

      return {
        content: [{
          type: 'text',
          text: '✅ Information acknowledged. Proceeding to next step.'
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error acknowledging information: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Handle wait continuation
   */
  static async handleWaitContinue(args: any) {
    try {
      const { __runId } = WaitContinueSchema.parse(args);
      
      // Get the current step
      const currentStep = await procedureService.getCurrentStep(__runId);
      if (!currentStep || currentStep.type !== 'wait') {
        throw new Error('Current step is not a wait step');
      }

      const waitStep = currentStep as WaitStep;
      
      // Check wait condition
      let canContinue = true;
      let message = 'Wait completed';

      switch (waitStep.waitType) {
        case 'time':
          // Time-based waits are handled automatically
          message = `Waited for ${waitStep.duration}ms`;
          break;
        
        case 'external':
          // In a real implementation, check external condition
          message = 'External condition met';
          break;
        
        case 'confirmation':
          // User confirmation
          message = 'User confirmed continuation';
          break;
      }

      if (!canContinue) {
        return {
          content: [{
            type: 'text',
            text: `⏳ Still waiting: ${waitStep.message}`
          }]
        };
      }

      // Create step result
      const stepResult = {
        stepId: waitStep.id,
        status: 'success' as const,
        response: {
          waitType: waitStep.waitType,
          message
        },
        timestamp: new Date().toISOString()
      };

      // Advance step
      await procedureService.advanceStep(__runId, stepResult);

      return {
        content: [{
          type: 'text',
          text: `✅ ${message}. Proceeding to next step.`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error continuing from wait: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Get the appropriate tool for a procedure step type
   */
  static getToolForStepType(stepType: string): string | null {
    switch (stepType) {
      case 'quiz':
        return 'procedure-quiz-answer';
      case 'approval':
        return 'procedure-approval-check';
      case 'information':
        return 'procedure-info-ack';
      case 'wait':
        return 'procedure-wait-continue';
      default:
        return null;
    }
  }

  /**
   * Format step for display
   */
  static formatStep(step: ProcedureStep): string {
    let formatted = `📋 **${step.name}**\n${step.description}\n\n`;

    switch (step.type) {
      case 'quiz':
        const quiz = step as QuizStep;
        formatted += `**Question:** ${quiz.question}\n`;
        if (quiz.options && quiz.options.length > 0) {
          formatted += '**Options:**\n';
          quiz.options.forEach((opt, i) => {
            formatted += `  ${i + 1}. ${opt}\n`;
          });
        }
        if (quiz.hints && quiz.hints.length > 0) {
          formatted += `\n💡 **Hint:** ${quiz.hints[0]}`;
        }
        break;

      case 'approval':
        const approval = step as ApprovalStep;
        formatted += `**Requires approval from:** ${approval.approvers.join(', ')}\n`;
        formatted += `**Approval type:** ${approval.approvalType}\n`;
        if (approval.minimumApprovals > 1) {
          formatted += `**Minimum approvals needed:** ${approval.minimumApprovals}`;
        }
        break;

      case 'information':
        const info = step as InformationStep;
        formatted += `**Content:**\n${info.content}\n`;
        if (info.links && info.links.length > 0) {
          formatted += '\n**Related Links:**\n';
          info.links.forEach(link => {
            formatted += `  - [${link.label}](${link.url})\n`;
          });
        }
        if (info.acknowledgmentRequired) {
          formatted += '\n⚠️ **Acknowledgment required to proceed**';
        }
        break;

      case 'wait':
        const wait = step as WaitStep;
        formatted += `**Wait type:** ${wait.waitType}\n`;
        formatted += `**Message:** ${wait.message}\n`;
        if (wait.duration) {
          formatted += `**Duration:** ${wait.duration}ms`;
        }
        break;
    }

    return formatted;
  }
}
