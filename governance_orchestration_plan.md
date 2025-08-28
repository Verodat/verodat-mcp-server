# Implementation Plan

## Overview
Implement agent-orchestrated collaborative governance creation system for automatic policy and procedure generation when missing.

The current system has a hardcoded PROC-EXPORT-DATA-V1 procedure that serves as a fallback when procedures can't be loaded from Verodat. This implementation removes that default procedure and replaces it with an intelligent orchestration system where specialist AI agents (Vera, AGENT-POLICIES-OPS, AGENT-PROCEDURES-OPS) collaborate with users to create governance on-demand. When a WRITE operation lacks a procedure, instead of blocking or using inappropriate procedures, the system will engage the user in a guided process to create the necessary policies and procedures, ensuring all WRITE operations are properly governed while avoiding governance bloat through intelligent deduplication and optimization.

## Types
Define new types for agent orchestration, communication protocols, and governance creation workflows.

### New Type Definitions

```typescript
// src/types/orchestrationTypes.ts
export interface AgentMessage {
  from: string;           // Agent ID sending message
  to: string;             // Agent ID receiving message  
  action: string;         // Action to perform
  context: any;           // Operation context
  priority: 'urgent' | 'normal' | 'low';
  sessionId: string;      // Track conversation thread
  timestamp: string;
}

export interface OrchestrationSession {
  sessionId: string;
  initiator: string;      // Tool that triggered orchestration
  operation: string;      // Operation type (READ/WRITE)
  status: 'active' | 'completed' | 'failed';
  agents: string[];       // Participating agents
  messages: AgentMessage[];
  createdGovernance: {
    policyId?: string;
    procedureId?: string;
  };
  startTime: string;
  endTime?: string;
}

export interface GovernanceAnalysis {
  needsNewPolicy: boolean;
  needsNewProcedure: boolean;
  similarPolicies: Array<{
    id: string;
    similarity: number;
    canExtend: boolean;
  }>;
  similarProcedures: Array<{
    id: string;
    similarity: number;
    canReuse: boolean;
  }>;
  recommendation: 'create' | 'extend' | 'reuse';
}

export interface AgentCapability {
  agentId: string;
  actions: string[];      // Actions this agent can perform
  datasets: string[];     // Datasets this agent manages
  canCreatePolicy: boolean;
  canCreateProcedure: boolean;
  canAnalyze: boolean;
}

export interface GovernanceCreationRequest {
  toolName: string;
  operation: 'READ' | 'WRITE';
  requester: string;      // User or system
  context: Record<string, any>;
  urgency: 'immediate' | 'deferred';
}

export interface PolicyDraft {
  policy_id: string;
  title: string;
  purpose: string;
  rules: string[];
  owner: string;
  status: 'draft' | 'review' | 'active';
  basedOn?: string;       // If extending existing policy
}

export interface ProcedureDraft {
  procedure_id: string;
  title: string;
  purpose: string;
  steps: Array<{
    type: string;
    description: string;
    required: boolean;
  }>;
  triggers: {
    tools: string[];
    operations: string[];
  };
  policyId: string;       // Related policy
  owner: string;
  status: 'draft' | 'review' | 'active';
}
```

### Modified Existing Types

```typescript
// Update src/types/procedureTypes.ts
export interface ProcedureConfig {
  // ... existing fields ...
  verodat: {
    datasetName: string;
    alternateDatasetNames?: string[];  // Support multiple dataset names
    defaultWorkspaceId?: number;
    defaultAccountId?: number;
    refreshOnStart: boolean;
    fallbackBehavior: 'block' | 'orchestrate';  // What to do when no procedures
  };
}
```

## Files
Create orchestration services and modify existing files to support agent-based governance creation.

### New Files to Create

1. **src/services/orchestrationService.ts**
   - Purpose: Central orchestration coordinator (Vera's brain)
   - Manages communication between agents
   - Tracks orchestration sessions
   - Coordinates governance creation workflow

2. **src/services/agentCommunicator.ts**
   - Purpose: Handle agent-to-agent messaging
   - Message routing and delivery
   - Session management
   - Priority handling

3. **src/services/governanceAnalyzer.ts**
   - Purpose: Analyze need for new governance
   - Find similar policies/procedures
   - Recommend create vs extend vs reuse
   - Prevent governance bloat

4. **src/services/policyBuilder.ts**
   - Purpose: Collaborative policy creation with user
   - Generate policy drafts
   - Validate policy structure
   - Store in Business_Policies_Ops

5. **src/services/procedureBuilder.ts**
   - Purpose: Collaborative procedure creation with user
   - Map policies to procedures
   - Generate procedure steps
   - Store in AI_Agent_Procedures_Ops

6. **src/agents/veraOrchestrator.ts**
   - Purpose: Vera's orchestration logic
   - Coordinate specialist agents
   - Manage governance creation flow
   - Handle user interactions

7. **src/agents/policyAgent.ts**
   - Purpose: AGENT-POLICIES-OPS capabilities
   - Policy analysis and optimization
   - Deduplication logic
   - Policy management

8. **src/agents/procedureAgent.ts**
   - Purpose: AGENT-PROCEDURES-OPS capabilities
   - Procedure generation from policies
   - Step optimization
   - Procedure management

9. **src/config/orchestrationConfig.ts**
   - Purpose: Configuration for orchestration system
   - Agent definitions
   - Communication settings
   - Governance creation rules

10. **tests/orchestration.test.ts**
    - Purpose: Test orchestration workflows
    - Test agent communication
    - Test governance creation
    - Test deduplication

### Files to Modify

1. **src/services/procedureLoader.ts**
   - Remove loadDefaultProcedures() implementation (make it empty)
   - Update dataset name search to include AI_Agent_Procedures_Ops
   - Add orchestration trigger when no procedures found
   - Support multiple dataset name patterns

2. **src/handlers/BaseToolHandler.ts**
   - Replace simple procedure blocking with orchestration trigger
   - Add orchestration session handling
   - Update error messages to guide users
   - Integrate with orchestrationService

3. **src/config/procedureConfig.ts**
   - Add alternateDatasetNames: ['AI_Agent_Procedures_Ops']
   - Set fallbackBehavior: 'orchestrate'
   - Add orchestration configuration section

4. **utilities/governance-setup/bootstrap/workspace_bootstrap_bundle_v2.json**
   - Add PROC-ORCHESTRATE-GOVERNANCE
   - Add PROC-BUILD-POLICY
   - Add PROC-BUILD-PROCEDURE
   - Add POL-GOVERNANCE-OPTIMIZATION

5. **src/types/schemas.ts**
   - Remove PROC-EXPORT-DATA-V1 references
   - Add orchestration-related schemas
   - Update procedure ID examples

## Functions
Create orchestration functions and modify existing ones to support collaborative governance creation.

### New Functions

1. **orchestrateGovernanceCreation(request: GovernanceCreationRequest): Promise<OrchestrationSession>**
   - Location: src/services/orchestrationService.ts
   - Initiates orchestration session
   - Coordinates agents for governance creation
   - Returns completed session with new governance IDs

2. **analyzeGovernanceNeed(toolName: string, operation: string): Promise<GovernanceAnalysis>**
   - Location: src/services/governanceAnalyzer.ts
   - Checks for existing similar governance
   - Calculates similarity scores
   - Recommends action (create/extend/reuse)

3. **buildPolicyWithUser(context: any): Promise<PolicyDraft>**
   - Location: src/services/policyBuilder.ts
   - Interactive policy creation dialog
   - Guides user through policy requirements
   - Generates policy draft for approval

4. **buildProcedureFromPolicy(policy: PolicyDraft): Promise<ProcedureDraft>**
   - Location: src/services/procedureBuilder.ts
   - Creates procedure based on policy
   - Determines required steps
   - Maps tools to procedure triggers

5. **sendAgentMessage(message: AgentMessage): Promise<void>**
   - Location: src/services/agentCommunicator.ts
   - Routes messages between agents
   - Maintains message history
   - Handles priority queuing

6. **handleMissingGovernance(toolName: string, operation: string): Promise<any>**
   - Location: src/services/orchestrationService.ts
   - Triggered when procedure not found
   - Initiates orchestration workflow
   - Returns orchestration session info

7. **consolidateGovernance(policies: string[]): Promise<string>**
   - Location: src/services/governanceAnalyzer.ts
   - Merges similar policies
   - Optimizes governance structure
   - Returns consolidated policy ID

### Modified Functions

1. **loadDefaultProcedures(): void**
   - Location: src/services/procedureLoader.ts
   - Remove all default procedure creation
   - Leave empty or trigger orchestration
   - Log that no defaults are loaded

2. **checkProcedureRequirement(toolName: string, args: any)**
   - Location: src/handlers/BaseToolHandler.ts
   - Add orchestration trigger for missing procedures
   - Return orchestration session instead of error
   - Guide user to governance creation

3. **refreshProcedures(): Promise<void>**
   - Location: src/services/procedureLoader.ts
   - Check both AI_Agent_Procedures and AI_Agent_Procedures_Ops
   - Handle empty procedure list gracefully
   - Don't fall back to defaults

## Classes
Create agent classes and orchestration coordinators.

### New Classes

1. **OrchestrationService**
   - Location: src/services/orchestrationService.ts
   - Properties:
     - activeSessions: Map<string, OrchestrationSession>
     - agentCommunicator: AgentCommunicator
     - governanceAnalyzer: GovernanceAnalyzer
   - Methods:
     - startOrchestration(request): Promise<OrchestrationSession>
     - completeOrchestration(sessionId): Promise<void>
     - getSessionStatus(sessionId): OrchestrationStatus

2. **AgentCommunicator**
   - Location: src/services/agentCommunicator.ts
   - Properties:
     - messageQueue: PriorityQueue<AgentMessage>
     - agents: Map<string, AgentCapability>
   - Methods:
     - sendMessage(message): Promise<void>
     - routeMessage(message): Promise<void>
     - getAgentCapabilities(agentId): AgentCapability

3. **GovernanceAnalyzer**
   - Location: src/services/governanceAnalyzer.ts
   - Properties:
     - similarityThreshold: number
     - consolidationRules: ConsolidationRule[]
   - Methods:
     - findSimilar(proposed): SimilarityResult[]
     - calculateSimilarity(a, b): number
     - recommendAction(analysis): string

4. **VeraOrchestrator**
   - Location: src/agents/veraOrchestrator.ts
   - Properties:
     - orchestrationService: OrchestrationService
     - agentRegistry: Map<string, Agent>
   - Methods:
     - orchestrate(request): Promise<GovernanceResult>
     - consultAgent(agentId, context): Promise<any>
     - coordinateCreation(analysis): Promise<void>

5. **PolicyAgent**
   - Location: src/agents/policyAgent.ts
   - Properties:
     - datasetId: string
     - verodatHandler: any
   - Methods:
     - analyzePolicy(context): Promise<PolicyAnalysis>
     - createPolicy(draft): Promise<string>
     - optimizePolicies(): Promise<OptimizationResult>

6. **ProcedureAgent**
   - Location: src/agents/procedureAgent.ts
   - Properties:
     - datasetId: string
     - verodatHandler: any
   - Methods:
     - createProcedure(policy): Promise<string>
     - optimizeSteps(procedure): Promise<void>
     - validateProcedure(draft): ValidationResult

### Modified Classes

1. **ProcedureLoader**
   - Remove default procedure creation logic
   - Add support for multiple dataset names
   - Trigger orchestration on empty procedures

2. **BaseToolHandler**
   - Add orchestrationService dependency
   - Update checkProcedureRequirement for orchestration
   - Handle orchestration responses

## Dependencies
No new npm packages required; uses existing MCP and Verodat infrastructure.

### Service Dependencies
- OrchestrationService depends on AgentCommunicator, GovernanceAnalyzer
- VeraOrchestrator depends on OrchestrationService
- PolicyAgent and ProcedureAgent depend on Verodat handlers
- BaseToolHandler depends on OrchestrationService

### Configuration Dependencies
- Orchestration config must load before service initialization
- Agent definitions required before orchestration starts
- Procedure config needs orchestration settings

## Testing
Comprehensive tests for orchestration workflows and governance creation.

### Test Files

1. **tests/orchestration.test.ts**
   - Test orchestration workflow end-to-end
   - Test agent communication protocols
   - Test session management
   - Test error handling

2. **tests/governance-creation.test.ts**
   - Test policy creation flow
   - Test procedure generation
   - Test user interaction dialogs
   - Test validation logic

3. **tests/deduplication.test.ts**
   - Test similarity detection
   - Test consolidation recommendations
   - Test governance optimization
   - Test bloat prevention

4. **tests/no-defaults.test.ts**
   - Test system works without default procedures
   - Test orchestration triggers correctly
   - Test empty procedure handling
   - Test fallback behavior

### Test Scenarios

1. **Missing Governance Flow**
   - Attempt WRITE operation without procedure
   - Verify orchestration starts
   - Simulate user interaction
   - Verify governance created and stored

2. **Deduplication Test**
   - Attempt to create similar policy
   - Verify system suggests extension
   - Test consolidation workflow
   - Verify no duplicates created

3. **Agent Coordination**
   - Test Vera coordinates properly
   - Test agent handoffs work
   - Test message routing
   - Test priority handling

## Implementation Order
Phased implementation to ensure smooth transition from defaults to orchestration.

1. **Phase 1: Remove Defaults (Day 1)**
   - Modify procedureLoader to remove default procedures
   - Update dataset name search to include _Ops variants
   - Test system handles missing procedures gracefully
   - Update error messages

2. **Phase 2: Core Orchestration (Day 2-3)**
   - Create OrchestrationService
   - Create AgentCommunicator
   - Implement basic orchestration flow
   - Test message passing

3. **Phase 3: Governance Analysis (Day 4-5)**
   - Create GovernanceAnalyzer
   - Implement similarity detection
   - Add deduplication logic
   - Test optimization recommendations

4. **Phase 4: Agent Implementation (Day 6-7)**
   - Create VeraOrchestrator
   - Create PolicyAgent
   - Create ProcedureAgent
   - Test agent coordination

5. **Phase 5: Builders (Day 8-9)**
   - Create PolicyBuilder with user dialog
   - Create ProcedureBuilder
   - Implement interactive creation
   - Test user workflows

6. **Phase 6: Integration (Day 10-11)**
   - Integrate with BaseToolHandler
   - Connect all components
   - End-to-end testing
   - Fix integration issues

7. **Phase 7: Bootstrap Updates (Day 12)**
   - Update bootstrap bundle with new procedures
   - Add orchestration procedures
   - Add governance optimization policies
   - Test bootstrap process

8. **Phase 8: Documentation (Day 13-14)**
   - Document orchestration workflow
   - Create user guides
   - Update API documentation
   - Create troubleshooting guide

Each phase includes:
- Implementation
- Unit testing
- Integration testing
- Code review
- Documentation updates

The implementation ensures backward compatibility while transitioning from hardcoded defaults to intelligent orchestration. The system will guide users through governance creation rather than blocking operations, ensuring all WRITE operations are properly governed while maintaining efficiency through deduplication and optimization.
