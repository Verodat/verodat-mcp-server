/**
 * Procedure Audit Logger Service
 * Logs procedure execution events to a Verodat dataset for compliance and auditing
 */

import { ToolHandlers } from '../handlers/toolHandlers.js';
import { ProcedureRun, Procedure } from '../types/procedureTypes.js';

export interface ProcedureAuditEvent {
  procedure_id: string;
  run_id: string;
  event_type: 'start' | 'complete' | 'fail' | 'expire' | 'step_complete' | 'step_fail' | 'tool_authorized';
  event_timestamp: string;
  user_id?: string;
  procedure_name: string;
  step_id?: string;
  step_name?: string;
  tool_name?: string;
  status?: string;
  error_message?: string;
  metadata?: string;
}

export class ProcedureAuditLogger {
  private toolHandlers?: ToolHandlers;
  private auditDatasetId?: number;
  private workspaceId?: number;
  private accountId?: number;
  private batchQueue: ProcedureAuditEvent[] = [];
  private batchTimer?: NodeJS.Timeout;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds
  private procedureCache: Map<string, Procedure> = new Map();

  /**
   * Initialize the audit logger with tool handlers
   */
  initialize(toolHandlers: ToolHandlers, workspaceId?: number, accountId?: number): void {
    this.toolHandlers = toolHandlers;
    this.workspaceId = workspaceId;
    this.accountId = accountId;
    if (process.argv[2] === 'call') {
      console.log('[ProcedureAuditLogger] Initialized');
    }
  }

  /**
   * Cache a procedure for logging purposes
   */
  cacheProcedure(procedure: Procedure): void {
    this.procedureCache.set(procedure.id, procedure);
  }

  /**
   * Get procedure name from cache or return Unknown
   */
  private getProcedureName(procedureId: string): string {
    const procedure = this.procedureCache.get(procedureId);
    return procedure?.name || 'Unknown';
  }

  /**
   * Log procedure start event
   */
  async logProcedureStart(run: ProcedureRun, procedure?: Procedure): Promise<void> {
    if (procedure) {
      this.cacheProcedure(procedure);
    }
    
    await this.logEvent({
      procedure_id: run.procedureId,
      run_id: run.runId,
      event_type: 'start',
      event_timestamp: new Date().toISOString(),
      procedure_name: this.getProcedureName(run.procedureId),
      status: 'started',
      metadata: JSON.stringify({
        started_at: run.startedAt,
        current_step_index: run.currentStepIndex
      })
    });
  }

  /**
   * Log procedure completion event
   */
  async logProcedureComplete(run: ProcedureRun): Promise<void> {
    await this.logEvent({
      procedure_id: run.procedureId,
      run_id: run.runId,
      event_type: 'complete',
      event_timestamp: new Date().toISOString(),
      procedure_name: this.getProcedureName(run.procedureId),
      status: 'completed',
      metadata: JSON.stringify({
        completed_steps: run.completedSteps.length,
        duration_ms: Date.now() - new Date(run.startedAt).getTime()
      })
    });
  }

  /**
   * Log procedure failure event
   */
  async logProcedureFail(run: ProcedureRun, error: string): Promise<void> {
    await this.logEvent({
      procedure_id: run.procedureId,
      run_id: run.runId,
      event_type: 'fail',
      event_timestamp: new Date().toISOString(),
      procedure_name: this.getProcedureName(run.procedureId),
      status: 'failed',
      error_message: error,
      metadata: JSON.stringify({
        completed_steps: run.completedSteps.length,
        current_step_index: run.currentStepIndex
      })
    });
  }

  /**
   * Log procedure expiration event
   */
  async logProcedureExpire(run: ProcedureRun): Promise<void> {
    await this.logEvent({
      procedure_id: run.procedureId,
      run_id: run.runId,
      event_type: 'expire',
      event_timestamp: new Date().toISOString(),
      procedure_name: this.getProcedureName(run.procedureId),
      status: 'expired',
      metadata: JSON.stringify({
        completed_steps: run.completedSteps.length,
        expired_at: run.expiresAt
      })
    });
  }

  /**
   * Log step completion event
   */
  async logStepComplete(run: ProcedureRun, stepId: string, stepName: string): Promise<void> {
    await this.logEvent({
      procedure_id: run.procedureId,
      run_id: run.runId,
      event_type: 'step_complete',
      event_timestamp: new Date().toISOString(),
      procedure_name: this.getProcedureName(run.procedureId),
      step_id: stepId,
      step_name: stepName,
      status: 'step_completed',
      metadata: JSON.stringify({
        step_number: run.completedSteps.length,
        current_step_index: run.currentStepIndex
      })
    });
  }

  /**
   * Log step failure event
   */
  async logStepFail(run: ProcedureRun, stepId: string, stepName: string, error: string): Promise<void> {
    await this.logEvent({
      procedure_id: run.procedureId,
      run_id: run.runId,
      event_type: 'step_fail',
      event_timestamp: new Date().toISOString(),
      procedure_name: this.getProcedureName(run.procedureId),
      step_id: stepId,
      step_name: stepName,
      status: 'step_failed',
      error_message: error,
      metadata: JSON.stringify({
        step_number: run.completedSteps.length,
        current_step_index: run.currentStepIndex
      })
    });
  }

  /**
   * Log tool authorization event
   */
  async logToolAuthorized(runId: string, toolName: string, procedureId: string): Promise<void> {
    await this.logEvent({
      procedure_id: procedureId,
      run_id: runId,
      event_type: 'tool_authorized',
      event_timestamp: new Date().toISOString(),
      procedure_name: 'Unknown',
      tool_name: toolName,
      status: 'tool_authorized',
      metadata: JSON.stringify({
        authorized_at: new Date().toISOString()
      })
    });
  }

  /**
   * Internal method to log an event
   */
  private async logEvent(event: ProcedureAuditEvent): Promise<void> {
    if (!this.toolHandlers || !this.workspaceId || !this.accountId) {
      if (process.argv[2] === 'call') {
        console.warn('[ProcedureAuditLogger] Cannot log - not fully initialized');
      }
      return;
    }

    // Add to batch queue
    this.batchQueue.push(event);

    // If batch is full, flush immediately
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      await this.flushBatch();
    } else {
      // Schedule batch flush if not already scheduled
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.flushBatch(), this.BATCH_TIMEOUT);
      }
    }
  }

  /**
   * Flush the batch queue to Verodat
   */
  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    // Get events to flush
    const events = [...this.batchQueue];
    this.batchQueue = [];

    try {
      // Ensure audit dataset exists
      await this.ensureAuditDataset();

      if (!this.auditDatasetId) {
        if (process.argv[2] === 'call') {
          console.error('[ProcedureAuditLogger] Audit dataset not available');
        }
        return;
      }

      // Prepare data for upload
      const data = [
        {
          header: [
            { name: 'procedure_id', type: 'string' },
            { name: 'run_id', type: 'string' },
            { name: 'event_type', type: 'string' },
            { name: 'event_timestamp', type: 'date' },
            { name: 'user_id', type: 'string' },
            { name: 'procedure_name', type: 'string' },
            { name: 'step_id', type: 'string' },
            { name: 'step_name', type: 'string' },
            { name: 'tool_name', type: 'string' },
            { name: 'status', type: 'string' },
            { name: 'error_message', type: 'string' },
            { name: 'metadata', type: 'string' }
          ]
        },
        {
          rows: events.map(event => [
            event.procedure_id,
            event.run_id,
            event.event_type,
            event.event_timestamp,
            event.user_id || '',
            event.procedure_name,
            event.step_id || '',
            event.step_name || '',
            event.tool_name || '',
            event.status || '',
            event.error_message || '',
            event.metadata || ''
          ])
        }
      ];

      // Upload to Verodat using manage tool with system flag
      await this.toolHandlers!.handleUploadDatasetRows({
        accountId: this.accountId,
        workspaceId: this.workspaceId,
        datasetId: this.auditDatasetId,
        data,
        __systemOperation: 'procedure-logging'
      });

      if (process.argv[2] === 'call') {
        console.log(`[ProcedureAuditLogger] Flushed ${events.length} audit events`);
      }
    } catch (error) {
      if (process.argv[2] === 'call') {
        console.error('[ProcedureAuditLogger] Failed to flush audit events:', error);
      }
      // Re-add events to queue for retry
      this.batchQueue.unshift(...events);
    }
  }

  /**
   * Ensure the audit dataset exists
   */
  private async ensureAuditDataset(): Promise<void> {
    if (this.auditDatasetId) return;

    try {
      // Check if dataset exists
      const datasetsResult = await this.toolHandlers!.handleGetDatasets({
        accountId: this.accountId,
        workspaceId: this.workspaceId,
        filter: 'vscope=PUBLISHED and vstate=ACTIVE',
        max: 100,
        offset: 0,
        __systemOperation: 'procedure-logging'
      });

      const datasets = JSON.parse(datasetsResult.content[0].text);
      const auditDataset = datasets.find((ds: any) => 
        ds.name === 'Procedure Audit Log'
      );

      if (auditDataset) {
        this.auditDatasetId = auditDataset.id;
        if (process.argv[2] === 'call') {
          console.log(`[ProcedureAuditLogger] Using existing audit dataset: ${this.auditDatasetId}`);
        }
      } else {
        // Create the dataset if it doesn't exist
        const createResult = await this.toolHandlers!.handleCreateDataset({
          accountId: this.accountId,
          workspaceId: this.workspaceId,
          name: 'Procedure Audit Log',
          description: 'Audit log for procedure executions and governance compliance',
          targetFields: [
            { name: 'procedure_id', type: 'string', mandatory: true, isKeyComponent: true },
            { name: 'run_id', type: 'string', mandatory: true, isKeyComponent: true },
            { name: 'event_type', type: 'string', mandatory: true },
            { name: 'event_timestamp', type: 'date', mandatory: true },
            { name: 'user_id', type: 'string', mandatory: false },
            { name: 'procedure_name', type: 'string', mandatory: true },
            { name: 'step_id', type: 'string', mandatory: false },
            { name: 'step_name', type: 'string', mandatory: false },
            { name: 'tool_name', type: 'string', mandatory: false },
            { name: 'status', type: 'string', mandatory: false },
            { name: 'error_message', type: 'string', mandatory: false },
            { name: 'metadata', type: 'string', mandatory: false }
          ],
          __systemOperation: 'procedure-logging'
        });

        const created = JSON.parse(createResult.content[0].text);
        this.auditDatasetId = created.id;
        if (process.argv[2] === 'call') {
          console.log(`[ProcedureAuditLogger] Created audit dataset: ${this.auditDatasetId}`);
        }
      }
    } catch (error) {
      if (process.argv[2] === 'call') {
        console.error('[ProcedureAuditLogger] Failed to ensure audit dataset:', error);
      }
    }
  }

  /**
   * Force flush any pending events
   */
  async flush(): Promise<void> {
    await this.flushBatch();
  }
}

// Export singleton instance
export const procedureAuditLogger = new ProcedureAuditLogger();
