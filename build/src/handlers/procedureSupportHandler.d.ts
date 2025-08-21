/**
 * Procedure Support Handler
 * Handles non-tool procedure steps (quiz, approval, wait, information)
 */
import { ProcedureStep } from '../types/procedureTypes.js';
export declare class ProcedureSupportHandler {
    /**
     * Handle quiz answer submission
     */
    static handleQuizAnswer(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
    /**
     * Handle approval check
     */
    static handleApprovalCheck(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
    /**
     * Handle information acknowledgment
     */
    static handleInformationAck(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
    /**
     * Handle wait continuation
     */
    static handleWaitContinue(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
    /**
     * Get the appropriate tool for a procedure step type
     */
    static getToolForStepType(stepType: string): string | null;
    /**
     * Format step for display
     */
    static formatStep(step: ProcedureStep): string;
}
