/**
 * Basic Audit Service
 * 
 * Provides audit logging for authorization decisions, security violations,
 * and procedure-related events.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { storageConfig } from '../config/procedureConfig.js';

export interface AuditEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  toolName?: string;
  procedureId?: string;
  runId?: string;
  userId?: string;
  workspaceId?: number;
  accountId?: number;
  action: string;
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  reason?: string;
  metadata?: Record<string, any>;
}

export enum AuditEventType {
  // Authorization events
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_BLOCKED = 'AUTH_BLOCKED',
  
  // Security violations
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  RUNID_HIJACK_ATTEMPT = 'RUNID_HIJACK_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  
  // Procedure events
  PROCEDURE_START = 'PROCEDURE_START',
  PROCEDURE_COMPLETE = 'PROCEDURE_COMPLETE',
  PROCEDURE_FAIL = 'PROCEDURE_FAIL',
  PROCEDURE_EXPIRE = 'PROCEDURE_EXPIRE',
  
  // Tool execution
  TOOL_EXECUTION = 'TOOL_EXECUTION',
  TOOL_BLOCKED = 'TOOL_BLOCKED',
  TOOL_ERROR = 'TOOL_ERROR',
  
  // System events
  SYSTEM_OPERATION = 'SYSTEM_OPERATION',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export class AuditService {
  private static instance: AuditService;
  private auditLog: AuditEntry[] = [];
  private auditDir: string;
  private currentLogFile: string;
  private maxMemoryEntries: number = 1000;
  private flushTimer: NodeJS.Timeout | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.auditDir = path.join(storageConfig.stateDirectory, 'audit');
    this.currentLogFile = this.getLogFileName();
  }

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Initialize audit directory - ensures it's only done once and properly awaited
   */
  private async initializeAuditDir(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  /**
   * Actually perform the initialization
   */
  private async doInitialize(): Promise<void> {
    try {
      // First ensure the parent state directory exists
      await fs.mkdir(storageConfig.stateDirectory, { recursive: true });
      
      // Then create the audit subdirectory
      await fs.mkdir(this.auditDir, { recursive: true });
      
      this.initialized = true;
      
      if (process.argv[2] === 'call') {
        console.log(`[AuditService] Initialized audit directory: ${this.auditDir}`);
      }
    } catch (error) {
      console.error('[AuditService] Failed to create audit directory:', error);
      // Don't mark as initialized so it can retry later
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Generate log file name based on current date
   */
  private getLogFileName(): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return path.join(this.auditDir, `audit-${dateStr}.jsonl`);
  }

  /**
   * Log an authorization success
   */
  async logAuthSuccess(params: {
    toolName: string;
    runId?: string;
    procedureId?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.logEntry({
      eventType: AuditEventType.AUTH_SUCCESS,
      severity: 'INFO',
      action: `Authorized tool: ${params.toolName}`,
      result: 'SUCCESS',
      ...params
    });
  }

  /**
   * Log an authorization failure
   */
  async logAuthFailure(params: {
    toolName: string;
    runId?: string;
    procedureId?: string;
    reason: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.logEntry({
      eventType: AuditEventType.AUTH_FAILURE,
      severity: 'WARNING',
      action: `Authorization failed for tool: ${params.toolName}`,
      result: 'FAILURE',
      ...params
    });
  }

  /**
   * Log a security violation
   */
  async logSecurityViolation(params: {
    violationType: string;
    toolName: string;
    runId?: string;
    procedureId?: string;
    reason: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const eventType = params.violationType === 'RUNID_HIJACK' 
      ? AuditEventType.RUNID_HIJACK_ATTEMPT 
      : AuditEventType.SECURITY_VIOLATION;

    await this.logEntry({
      eventType,
      severity: 'CRITICAL',
      action: `Security violation: ${params.violationType}`,
      result: 'BLOCKED',
      ...params
    });

    // Also log to console immediately for security violations
    console.error('[SECURITY VIOLATION]', {
      type: params.violationType,
      tool: params.toolName,
      runId: params.runId,
      reason: params.reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log a procedure event
   */
  async logProcedureEvent(params: {
    eventType: AuditEventType;
    procedureId: string;
    runId: string;
    action: string;
    result?: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.logEntry({
      severity: params.result === 'FAILURE' ? 'ERROR' : 'INFO',
      result: params.result || 'SUCCESS',
      ...params
    });
  }

  /**
   * Log a tool execution
   */
  async logToolExecution(params: {
    toolName: string;
    runId?: string;
    procedureId?: string;
    result: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    reason?: string;
    executionTime?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const eventType = params.result === 'BLOCKED' 
      ? AuditEventType.TOOL_BLOCKED 
      : params.result === 'FAILURE' 
      ? AuditEventType.TOOL_ERROR 
      : AuditEventType.TOOL_EXECUTION;

    await this.logEntry({
      eventType,
      severity: params.result === 'FAILURE' ? 'ERROR' : params.result === 'BLOCKED' ? 'WARNING' : 'INFO',
      action: `Tool execution: ${params.toolName}`,
      ...params
    });
  }

  /**
   * Core logging function
   */
  private async logEntry(params: Partial<AuditEntry>): Promise<void> {
    // Ensure audit directory is initialized before logging
    try {
      await this.initializeAuditDir();
    } catch (error) {
      // If initialization fails, just log to console and memory
      console.error('[AuditService] Directory initialization failed, logging to memory only');
    }

    const entry: AuditEntry = {
      id: this.generateEntryId(),
      timestamp: new Date().toISOString(),
      severity: 'INFO',
      action: 'Unknown action',
      result: 'SUCCESS',
      eventType: AuditEventType.SYSTEM_OPERATION,
      ...params
    };

    // Add to memory log
    this.auditLog.push(entry);

    // Trim memory log if too large
    if (this.auditLog.length > this.maxMemoryEntries) {
      this.auditLog = this.auditLog.slice(-this.maxMemoryEntries);
    }

    // Only schedule flush if initialized successfully
    if (this.initialized) {
      this.scheduleFlush();
    }

    // Log to console in test mode
    if (process.argv[2] === 'call') {
      const logLevel = entry.severity === 'CRITICAL' ? 'error' : 
                       entry.severity === 'ERROR' ? 'error' :
                       entry.severity === 'WARNING' ? 'warn' : 'log';
      console[logLevel](`[AUDIT] ${entry.eventType}: ${entry.action}`, {
        result: entry.result,
        tool: entry.toolName,
        runId: entry.runId,
        reason: entry.reason
      });
    }
  }

  /**
   * Schedule a flush to disk
   */
  private scheduleFlush(): void {
    if (this.flushTimer) {
      return; // Already scheduled
    }

    this.flushTimer = setTimeout(async () => {
      await this.flushToDisk();
      this.flushTimer = null;
    }, 5000); // Flush after 5 seconds
  }

  /**
   * Flush audit entries to disk
   */
  private async flushToDisk(): Promise<void> {
    if (this.auditLog.length === 0 || !this.initialized) {
      return;
    }

    // Get entries to flush (declare outside try-catch for error handling)
    const entriesToFlush = [...this.auditLog];

    try {
      // Clear memory log
      this.auditLog = [];

      // Update log file name if date changed
      this.currentLogFile = this.getLogFileName();

      // Append to log file (JSONL format)
      const lines = entriesToFlush.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await fs.appendFile(this.currentLogFile, lines, 'utf-8');

      if (process.argv[2] === 'call') {
        console.log(`[AuditService] Flushed ${entriesToFlush.length} entries to disk`);
      }
    } catch (error) {
      console.error('[AuditService] Failed to flush audit log to disk:', error);
      // Re-add entries to memory log on failure
      this.auditLog.unshift(...entriesToFlush);
    }
  }

  /**
   * Force flush to disk immediately
   */
  async forceFlush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flushToDisk();
  }

  /**
   * Get recent audit entries from memory
   */
  getRecentEntries(limit: number = 100, filter?: {
    eventType?: AuditEventType;
    severity?: string;
    toolName?: string;
    runId?: string;
  }): AuditEntry[] {
    let entries = [...this.auditLog];

    if (filter) {
      entries = entries.filter(entry => {
        if (filter.eventType && entry.eventType !== filter.eventType) return false;
        if (filter.severity && entry.severity !== filter.severity) return false;
        if (filter.toolName && entry.toolName !== filter.toolName) return false;
        if (filter.runId && entry.runId !== filter.runId) return false;
        return true;
      });
    }

    return entries.slice(-limit);
  }

  /**
   * Get security violations
   */
  getSecurityViolations(limit: number = 100): AuditEntry[] {
    return this.getRecentEntries(limit, {
      severity: 'CRITICAL'
    }).filter(entry => 
      entry.eventType === AuditEventType.SECURITY_VIOLATION ||
      entry.eventType === AuditEventType.RUNID_HIJACK_ATTEMPT ||
      entry.eventType === AuditEventType.UNAUTHORIZED_ACCESS
    );
  }

  /**
   * Generate unique entry ID
   */
  private generateEntryId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get audit statistics
   */
  async getStatistics(): Promise<{
    totalEntries: number;
    securityViolations: number;
    authFailures: number;
    toolExecutions: number;
    procedureRuns: number;
  }> {
    const entries = this.auditLog;
    
    return {
      totalEntries: entries.length,
      securityViolations: entries.filter(e => 
        e.eventType === AuditEventType.SECURITY_VIOLATION ||
        e.eventType === AuditEventType.RUNID_HIJACK_ATTEMPT
      ).length,
      authFailures: entries.filter(e => e.eventType === AuditEventType.AUTH_FAILURE).length,
      toolExecutions: entries.filter(e => e.eventType === AuditEventType.TOOL_EXECUTION).length,
      procedureRuns: entries.filter(e => e.eventType === AuditEventType.PROCEDURE_START).length
    };
  }

  /**
   * Clear audit log (for testing)
   */
  clearLog(): void {
    this.auditLog = [];
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();
