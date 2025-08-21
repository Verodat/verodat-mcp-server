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
  id: string;
  name: string;
  procedures_protocols: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
    console.log('ProcedureLoader initialized');
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
  private async refreshProcedures(): Promise<void> {
    try {
      console.log('Refreshing procedures from Verodat...');
      
      // Get workspace and account info from handler
      const workspaceId = this.verodatHandler.workspaceId || this.config.verodat.defaultWorkspaceId;
      const accountId = this.verodatHandler.accountId || this.config.verodat.defaultAccountId;
      
      // Query for AI_Agent_Procedures dataset
      const datasetsResult = await this.verodatHandler.handle({
        method: 'tools/call',
        params: {
          name: 'get-datasets',
          arguments: {
            workspaceId,
            accountId,
            filter: 'vscope=PUBLISHED and vstate=ACTIVE',
            max: 100
          }
        }
      });

      const datasets = datasetsResult?.content?.[0]?.data || [];
      const procedureDataset = datasets.find((ds: any) => 
        ds.name === this.config.verodat.datasetName || 
        ds.name === 'AI_Agent_Procedures'
      );

      if (!procedureDataset) {
        console.warn('AI_Agent_Procedures dataset not found');
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
            max: 1000
          }
        }
      });

      const rows = outputResult?.content?.[0]?.data || [];
      
      // Clear cache before loading new procedures
      this.cache.clear();
      
      // Parse and cache procedures
      for (const row of rows) {
        try {
          if (row.procedures_protocols) {
            const procedures = ProcedureParser.parseProceduresProtocol(row.procedures_protocols);
            
            for (const procedure of procedures) {
              // Only cache active procedures
              if (procedure.isActive) {
                this.cache.set(procedure.id, {
                  procedure,
                  timestamp: Date.now(),
                  accessCount: 0,
                  lastAccessed: Date.now()
                });
              }
            }
          }
        } catch (error) {
          console.error(`Failed to parse procedure from row ${row.id}:`, error);
        }
      }

      this.lastRefresh = Date.now();
      console.log(`Loaded ${this.cache.size} procedures from Verodat`);
      
      // Apply cache size limit
      this.enforceMaxCacheSize();
      
    } catch (error) {
      console.error('Failed to refresh procedures from Verodat:', error);
      // Fall back to default procedures
      this.loadDefaultProcedures();
    }
  }

  /**
   * Load default/test procedures
   */
  private loadDefaultProcedures(): void {
    const infoStep: InformationStep = {
      id: 'step-1',
      name: 'Verify Export Purpose',
      type: 'information',
      description: 'Review data export guidelines',
      required: true,
      retryable: false,
      maxRetries: 0,
      timeout: 60000,
      validation: {},
      metadata: {},
      conditions: {},
      skipConditions: [],
      content: 'You are about to export sensitive data. Please ensure you understand and comply with data protection regulations.',
      format: 'text',
      acknowledgmentRequired: true,
      displayDuration: undefined,
      links: [],
      attachments: []
    };

    const toolStep: ToolStep = {
      id: 'step-2',
      name: 'Execute Export',
      type: 'tool',
      description: 'Perform the actual data export',
      required: true,
      retryable: true,
      maxRetries: 3,
      timeout: 300000,
      validation: {},
      metadata: {},
      conditions: {},
      skipConditions: [],
      toolName: 'get-dataset-output',
      toolDescription: undefined,
      parameters: {},
      validationRules: [],
      outputValidation: undefined,
      sideEffects: [],
      compensatingAction: undefined
    };

    const defaultProcedures: Procedure[] = [
      {
        id: 'PROC-EXPORT-DATA-V1',
        name: 'Data Export Procedure',
        description: 'Standard procedure for exporting sensitive data',
        version: '1.0.0',
        purpose: 'Ensure secure and compliant data export',
        triggers: {
          tools: ['get-dataset-output'],
          operations: ['export', 'download'],
          conditions: []
        },
        requirements: {},
        steps: [infoStep, toolStep],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          tags: ['data-export', 'compliance'],
          category: 'data-governance',
          priority: 'high',
          estimatedDuration: 120,
          riskLevel: 'medium'
        },
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
        isActive: true,
        effectiveFrom: new Date().toISOString(),
        appliesTo: {
          roles: [],
          departments: [],
          operations: []
        }
      }
    ];

    // Cache default procedures
    for (const procedure of defaultProcedures) {
      this.cache.set(procedure.id, {
        procedure,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now()
      });
    }

    this.lastRefresh = Date.now();
    console.log(`Loaded ${this.cache.size} default procedures`);
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
    console.log('Procedure cache cleared');
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
   * Validate a procedure before execution
   */
  validateProcedure(procedure: Procedure): { valid: boolean; errors: string[] } {
    return ProcedureParser.validateProcedure(procedure);
  }
}

// Export singleton instance
export const procedureLoader = new ProcedureLoader();
