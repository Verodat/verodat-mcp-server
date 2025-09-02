/**
 * Procedure Loader Service
 * Loads procedures from Verodat AI_Agent_Procedures dataset with caching
 */

import { 
  Procedure, 
  ProcedureConfig,
  InformationStep,
  ToolStep 
} from '../types/procedureTypes.js';
import { ProcedureParser } from './procedureParser.js';
import { defaultProcedureConfig } from '../config/procedureConfig.js';

interface CacheEntry {
  procedure: Procedure;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface ProcedureDatasetRow {
  procedure_id: string;
  title: string;
  purpose: string;
  steps: string;
  triggers: string;
  procedure_owner: string;
  procedure_status: string;
}

export class ProcedureLoader {
  private cache: Map<string, CacheEntry> = new Map();
  private config: ProcedureConfig;
  private initialized: boolean = false;
  private lastRefresh: number = 0;
  private refreshPromise: Promise<void> | null = null;
  private verodatHandler: any; // Will be injected

  constructor(config?: Partial<ProcedureConfig>) {
    this.config = { ...defaultProcedureConfig, ...config };
  }

  /**
   * Initialize the loader with Verodat handler
   */
  initialize(verodatHandler: any): void {
    this.verodatHandler = verodatHandler;
    this.initialized = true;
    if (process.argv[2] === 'call') {
      console.log('ProcedureLoader initialized');
    }
  }

  /**
   * Load all procedures from Verodat dataset
   */
  async loadProcedures(force: boolean = false): Promise<Procedure[]> {
    if (!this.initialized || !this.verodatHandler) {
      throw new Error('ProcedureLoader not initialized. Call initialize() first.');
    }

    // Check if refresh is needed
    const now = Date.now();
    const refreshInterval = this.config.cache.refreshInterval;
    
    if (!force && this.cache.size > 0 && (now - this.lastRefresh) < refreshInterval) {
      return Array.from(this.cache.values()).map(entry => entry.procedure);
    }

    // Prevent concurrent refreshes
    if (this.refreshPromise) {
      await this.refreshPromise;
      return Array.from(this.cache.values()).map(entry => entry.procedure);
    }

    this.refreshPromise = this.refreshProcedures();
    await this.refreshPromise;
    this.refreshPromise = null;

    return Array.from(this.cache.values()).map(entry => entry.procedure);
  }

    /**
     * Refresh procedures from Verodat
     */
    async refreshProcedures() {
        try {
            if (process.argv[2] === 'call') {
                console.log('Refreshing procedures from Verodat...');
            }

            // Get workspace and account info from handler
            const workspaceId = this.verodatHandler.workspaceId || this.config.verodat.defaultWorkspaceId;
            const accountId = this.verodatHandler.accountId || this.config.verodat.defaultAccountId;

            // Check if we have the required IDs
            if (!workspaceId || !accountId) {
                if (process.argv[2] === 'call') {
                    console.log('No workspace or account ID available. Skipping procedure loading.');
                }
                this.loadDefaultProcedures();
                return;
            }

            // Query for AI_Agent_Procedures dataset - support both regular and _Ops variants
            const datasetsResult = await this.verodatHandler.handle({
                method: 'tools/call',
                params: {
                    name: 'get-datasets',
                    arguments: {
                        workspaceId,
                        accountId,
                        filter: 'vscope=PUBLISHED and vstate=ACTIVE',
                        max: 100,
                        __systemOperation: 'procedure-loading' // System flag for loading procedures
                    }
                }
            });

      const datasets = datasetsResult?.content?.[0]?.data || [];
      
      // Check primary dataset name and all alternates
      const datasetNames = [this.config.verodat.datasetName];
      if (this.config.verodat.alternateDatasetNames) {
        datasetNames.push(...this.config.verodat.alternateDatasetNames);
      }
      
      const procedureDataset = datasets.find((ds: any) => 
        datasetNames.includes(ds.name)
      );

      if (!procedureDataset) {
        if (process.argv[2] === 'call') {
          console.warn('AI_Agent_Procedures dataset not found. Governance orchestration will be triggered for WRITE operations.');
        }
        // No longer loading default procedures - orchestration will handle missing governance
        this.loadDefaultProcedures();
        return;
      }

      // Get dataset output
      const outputResult = await this.verodatHandler.handle({
        method: 'tools/call',
        params: {
          name: 'get-dataset-output',
          arguments: {
            workspaceId,
            accountId,
            datasetId: procedureDataset.id,
            filter: 'vscope=PUBLISHED and vstate=ACTIVE',
            max: 1000,
            __systemOperation: 'procedure-loading'  // System flag for loading procedures
          }
        }
      });

      const rows = outputResult?.content?.[0]?.data || [];
      
      // Clear cache before loading new procedures
      this.cache.clear();
      
      // Parse and cache procedures from bootstrap format
      for (const row of rows) {
        try {
          if (row.procedure_id && row.procedure_status === 'Active') {
            // Convert bootstrap format to procedure format
            const procedureData = {
              id: row.procedure_id,
              name: row.title,
              description: row.purpose,
              purpose: row.purpose,
              steps: this.parseStepsFromBootstrapFormat(row.steps),
              triggers: this.parseTriggersFromBootstrapFormat(row.triggers),
              metadata: {
                createdBy: row.procedure_owner,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tags: [],
                category: 'governance',
                priority: 'normal',
                estimatedDuration: 300,
                riskLevel: 'low'
              },
              requirements: {},
              validation: {
                preConditions: [],
                postConditions: [],
                invariants: []
              },
              audit: {
                required: true,
                level: 'full',
                retention: 90
              },
              isActive: row.procedure_status === 'Active',
              effectiveFrom: new Date().toISOString(),
              appliesTo: { roles: [], departments: [], operations: [] }
            };

            // Create and validate the procedure using the public method
            const procedure = this.convertBootstrapToProcedure(procedureData);
            
            // Cache the procedure
            this.cache.set(procedure.id, {
              procedure,
              timestamp: Date.now(),
              accessCount: 0,
              lastAccessed: Date.now()
            });
          }
        } catch (error) {
          if (process.argv[2] === 'call') {
            console.error(`Failed to parse procedure from row ${row.procedure_id}:`, error);
          }
        }
      }

      this.lastRefresh = Date.now();
      if (process.argv[2] === 'call') {
        console.log(`Loaded ${this.cache.size} procedures from Verodat`);
      }
      
      // Apply cache size limit
      this.enforceMaxCacheSize();
      
    } catch (error) {
      if (process.argv[2] === 'call') {
        console.error('Failed to refresh procedures from Verodat:', error);
      }
      // Fall back to default procedures
      this.loadDefaultProcedures();
    }
  }

  /**
   * Load default/test procedures
   * IMPORTANT: This function has been intentionally emptied as part of the governance orchestration implementation.
   * When procedures are not found in Verodat, the system will now trigger an orchestration workflow
   * to collaboratively create appropriate governance with the user, rather than using hardcoded defaults.
   */
  private loadDefaultProcedures(): void {
    // No default procedures are loaded anymore
    // The orchestration system will handle missing governance by:
    // 1. Analyzing if new governance is needed
    // 2. Checking for similar existing governance
    // 3. Guiding the user to create appropriate policies and procedures
    // 4. Storing the new governance in Verodat datasets
    
    this.lastRefresh = Date.now();
    if (process.argv[2] === 'call') {
      console.log('No default procedures loaded. Governance orchestration will be triggered for WRITE operations without procedures.');
    }
  }

  /**
   * Get a specific procedure by ID
   */
  async getProcedure(procedureId: string): Promise<Procedure | null> {
    // Check cache first
    const cached = this.cache.get(procedureId);
    if (cached) {
      // Update access metrics
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      
      // Check if cache entry is still valid
      const age = Date.now() - cached.timestamp;
      if (age < this.config.cache.ttl) {
        return cached.procedure;
      }
    }

    // Refresh if needed
    await this.loadProcedures();
    
    const entry = this.cache.get(procedureId);
    return entry ? entry.procedure : null;
  }

  /**
   * Find procedures applicable to a tool or operation
   */
  async findApplicableProcedures(context: {
    toolName?: string;
    operation?: string;
    purpose?: string;
    tags?: string[];
  }): Promise<Procedure[]> {
    await this.loadProcedures();
    
    const applicable: Procedure[] = [];
    
    for (const entry of this.cache.values()) {
      const procedure = entry.procedure;
      
      // Check if procedure is active and within effective dates
      if (!procedure.isActive) continue;
      
      const now = new Date();
      if (procedure.effectiveFrom && new Date(procedure.effectiveFrom) > now) continue;
      if (procedure.effectiveTo && new Date(procedure.effectiveTo) < now) continue;
      
      // Check triggers
      let matches = false;
      
      if (context.toolName && procedure.triggers.tools.includes(context.toolName)) {
        matches = true;
      }
      
      if (context.operation && procedure.triggers.operations.includes(context.operation)) {
        matches = true;
      }
      
      if (context.purpose && procedure.purpose === context.purpose) {
        matches = true;
      }
      
      if (context.tags && procedure.metadata.tags.some(tag => context.tags!.includes(tag))) {
        matches = true;
      }
      
      if (matches) {
        applicable.push(procedure);
        
        // Update access metrics
        entry.accessCount++;
        entry.lastAccessed = Date.now();
      }
    }
    
    // Sort by priority
    return applicable.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const aPriority = priorityOrder[a.metadata.priority] || 2;
      const bPriority = priorityOrder[b.metadata.priority] || 2;
      return aPriority - bPriority;
    });
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastRefresh = 0;
    if (process.argv[2] === 'call') {
      console.log('Procedure cache cleared');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    lastRefresh: number;
    procedures: Array<{ id: string; name: string; accessCount: number }>;
  } {
    return {
      size: this.cache.size,
      lastRefresh: this.lastRefresh,
      procedures: Array.from(this.cache.entries()).map(([id, entry]) => ({
        id,
        name: entry.procedure.name,
        accessCount: entry.accessCount
      }))
    };
  }

  /**
   * Enforce maximum cache size by removing least recently used entries
   */
  private enforceMaxCacheSize(): void {
    if (this.cache.size <= this.config.cache.maxSize) return;
    
    // Sort by last accessed time
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest entries
    const toRemove = this.cache.size - this.config.cache.maxSize;
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Parse steps from bootstrap format
   */
  private parseStepsFromBootstrapFormat(stepsString: string): any[] {
    try {
      // Parse the steps string - it might be numbered list format
      const lines = stepsString.split('\n').filter(line => line.trim());
      return lines.map((step, index) => ({
        id: `step-${index + 1}`,
        name: step.replace(/^\d+\.\s*/, ''), // Remove number prefix
        type: 'information',
        description: step.replace(/^\d+\.\s*/, ''),
        required: true,
        content: step.replace(/^\d+\.\s*/, ''),
        acknowledgmentRequired: true
      }));
    } catch (error) {
      // Fallback to simple step
      return [{
        id: 'step-1',
        name: 'Execute Procedure',
        type: 'information',
        description: stepsString,
        required: true,
        content: stepsString,
        acknowledgmentRequired: true
      }];
    }
  }

  /**
   * Parse triggers from bootstrap format
   */
  private parseTriggersFromBootstrapFormat(triggersString: string): { tools: string[]; operations: string[]; conditions: string[] } {
    return {
      tools: [],
      operations: [triggersString], // Use the trigger string as an operation
      conditions: []
    };
  }

  /**
   * Convert bootstrap data to procedure format
   */
  private convertBootstrapToProcedure(procedureData: any): Procedure {
    return {
      id: procedureData.id,
      name: procedureData.name,
      description: procedureData.description,
      version: '1.0.0',
      purpose: procedureData.purpose,
      triggers: procedureData.triggers,
      requirements: procedureData.requirements,
      steps: procedureData.steps,
      metadata: procedureData.metadata,
      validation: procedureData.validation,
      audit: procedureData.audit,
      isActive: procedureData.isActive,
      effectiveFrom: procedureData.effectiveFrom,
      effectiveTo: procedureData.effectiveTo,
      appliesTo: procedureData.appliesTo
    };
  }

  /**
   * Validate a procedure before execution
   */
  validateProcedure(procedure: Procedure): { valid: boolean; errors: string[] } {
    return ProcedureParser.validateProcedure(procedure);
  }
}

// Export singleton instance
export const procedureLoader = new ProcedureLoader();
