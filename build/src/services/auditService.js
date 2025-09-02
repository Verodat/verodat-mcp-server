/**
 * Basic Audit Service
 *
 * Provides audit logging for authorization decisions, security violations,
 * and procedure-related events.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { storageConfig } from '../config/procedureConfig.js';
export var AuditEventType;
(function (AuditEventType) {
    // Authorization events
    AuditEventType["AUTH_SUCCESS"] = "AUTH_SUCCESS";
    AuditEventType["AUTH_FAILURE"] = "AUTH_FAILURE";
    AuditEventType["AUTH_BLOCKED"] = "AUTH_BLOCKED";
    // Security violations
    AuditEventType["SECURITY_VIOLATION"] = "SECURITY_VIOLATION";
    AuditEventType["RUNID_HIJACK_ATTEMPT"] = "RUNID_HIJACK_ATTEMPT";
    AuditEventType["UNAUTHORIZED_ACCESS"] = "UNAUTHORIZED_ACCESS";
    // Procedure events
    AuditEventType["PROCEDURE_START"] = "PROCEDURE_START";
    AuditEventType["PROCEDURE_COMPLETE"] = "PROCEDURE_COMPLETE";
    AuditEventType["PROCEDURE_FAIL"] = "PROCEDURE_FAIL";
    AuditEventType["PROCEDURE_EXPIRE"] = "PROCEDURE_EXPIRE";
    // Tool execution
    AuditEventType["TOOL_EXECUTION"] = "TOOL_EXECUTION";
    AuditEventType["TOOL_BLOCKED"] = "TOOL_BLOCKED";
    AuditEventType["TOOL_ERROR"] = "TOOL_ERROR";
    // System events
    AuditEventType["SYSTEM_OPERATION"] = "SYSTEM_OPERATION";
    AuditEventType["SYSTEM_ERROR"] = "SYSTEM_ERROR";
})(AuditEventType || (AuditEventType = {}));
export class AuditService {
    static instance;
    auditLog = [];
    auditDir;
    currentLogFile;
    maxMemoryEntries = 1000;
    flushTimer = null;
    initialized = false;
    initPromise = null;
    constructor() {
        this.auditDir = path.join(storageConfig.stateDirectory, 'audit');
        this.currentLogFile = this.getLogFileName();
    }
    static getInstance() {
        if (!AuditService.instance) {
            AuditService.instance = new AuditService();
        }
        return AuditService.instance;
    }
    /**
     * Initialize audit directory - ensures it's only done once and properly awaited
     */
    async initializeAuditDir() {
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
    async doInitialize() {
        try {
            // First ensure the parent state directory exists
            await fs.mkdir(storageConfig.stateDirectory, { recursive: true });
            // Then create the audit subdirectory
            await fs.mkdir(this.auditDir, { recursive: true });
            this.initialized = true;
            if (process.argv[2] === 'call') {
                console.log(`[AuditService] Initialized audit directory: ${this.auditDir}`);
            }
        }
        catch (error) {
            console.error('[AuditService] Failed to create audit directory:', error);
            // Don't mark as initialized so it can retry later
            this.initPromise = null;
            throw error;
        }
    }
    /**
     * Generate log file name based on current date
     */
    getLogFileName() {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return path.join(this.auditDir, `audit-${dateStr}.jsonl`);
    }
    /**
     * Log an authorization success
     */
    async logAuthSuccess(params) {
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
    async logAuthFailure(params) {
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
    async logSecurityViolation(params) {
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
    async logProcedureEvent(params) {
        await this.logEntry({
            severity: params.result === 'FAILURE' ? 'ERROR' : 'INFO',
            result: params.result || 'SUCCESS',
            ...params
        });
    }
    /**
     * Log a tool execution
     */
    async logToolExecution(params) {
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
    async logEntry(params) {
        // Ensure audit directory is initialized before logging
        try {
            await this.initializeAuditDir();
        }
        catch (error) {
            // If initialization fails, just log to console and memory
            console.error('[AuditService] Directory initialization failed, logging to memory only');
        }
        const entry = {
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
    scheduleFlush() {
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
    async flushToDisk() {
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
        }
        catch (error) {
            console.error('[AuditService] Failed to flush audit log to disk:', error);
            // Re-add entries to memory log on failure
            this.auditLog.unshift(...entriesToFlush);
        }
    }
    /**
     * Force flush to disk immediately
     */
    async forceFlush() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        await this.flushToDisk();
    }
    /**
     * Get recent audit entries from memory
     */
    getRecentEntries(limit = 100, filter) {
        let entries = [...this.auditLog];
        if (filter) {
            entries = entries.filter(entry => {
                if (filter.eventType && entry.eventType !== filter.eventType)
                    return false;
                if (filter.severity && entry.severity !== filter.severity)
                    return false;
                if (filter.toolName && entry.toolName !== filter.toolName)
                    return false;
                if (filter.runId && entry.runId !== filter.runId)
                    return false;
                return true;
            });
        }
        return entries.slice(-limit);
    }
    /**
     * Get security violations
     */
    getSecurityViolations(limit = 100) {
        return this.getRecentEntries(limit, {
            severity: 'CRITICAL'
        }).filter(entry => entry.eventType === AuditEventType.SECURITY_VIOLATION ||
            entry.eventType === AuditEventType.RUNID_HIJACK_ATTEMPT ||
            entry.eventType === AuditEventType.UNAUTHORIZED_ACCESS);
    }
    /**
     * Generate unique entry ID
     */
    generateEntryId() {
        return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get audit statistics
     */
    async getStatistics() {
        const entries = this.auditLog;
        return {
            totalEntries: entries.length,
            securityViolations: entries.filter(e => e.eventType === AuditEventType.SECURITY_VIOLATION ||
                e.eventType === AuditEventType.RUNID_HIJACK_ATTEMPT).length,
            authFailures: entries.filter(e => e.eventType === AuditEventType.AUTH_FAILURE).length,
            toolExecutions: entries.filter(e => e.eventType === AuditEventType.TOOL_EXECUTION).length,
            procedureRuns: entries.filter(e => e.eventType === AuditEventType.PROCEDURE_START).length
        };
    }
    /**
     * Clear audit log (for testing)
     */
    clearLog() {
        this.auditLog = [];
    }
}
// Export singleton instance
export const auditService = AuditService.getInstance();
