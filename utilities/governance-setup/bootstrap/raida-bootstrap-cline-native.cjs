#!/usr/bin/env node

/**
 * Cline-Native Bootstrap for Verodat Governance Framework
 * 
 * This script is specifically designed to be executed within Cline using MCP tools.
 * It provides structured instructions for Cline to execute the bootstrap process
 * step by step using the use_mcp_tool calls.
 * 
 * Usage: Execute within Cline - this script provides the roadmap
 */

const fs = require('fs');
const path = require('path');

class ClineNativeBootstrap {
  constructor() {
    this.bundlePath = path.join(__dirname, 'workspace_bootstrap_bundle.json');
    this.bundle = null;
    this.datasetIds = {};
  }

  /**
   * Load the bootstrap bundle
   */
  loadBundle() {
    try {
      this.bundle = JSON.parse(fs.readFileSync(this.bundlePath, 'utf8'));
      return true;
    } catch (error) {
      console.error('❌ Failed to load bootstrap bundle:', error.message);
      return false;
    }
  }

  /**
   * Get the execution plan for Cline
   */
  getExecutionPlan() {
    if (!this.loadBundle()) {
      return null;
    }

    return {
      title: "🚀 CLINE-NATIVE VERODAT GOVERNANCE BOOTSTRAP",
      description: "Complete bootstrap process designed for Cline execution using MCP tools",
      phases: [
        {
          name: "Phase 1: Account & Workspace Selection",
          description: "Interactive selection of target account and workspace",
          steps: [
            {
              step: 1,
              name: "Get Available Accounts",
              mcpCall: {
                server: "verodat-design",
                tool: "get-accounts",
                arguments: {}
              },
              description: "Retrieve list of available accounts for selection"
            },
            {
              step: 2,
              name: "Present Account Selection",
              type: "ask_followup_question",
              description: "Present account options to user for selection"
            },
            {
              step: 3,
              name: "Get Available Workspaces",
              mcpCall: {
                server: "verodat-design",
                tool: "get-workspaces",
                arguments: {
                  accountId: "{selected_account_id}"
                }
              },
              description: "Retrieve workspaces for selected account"
            },
            {
              step: 4,
              name: "Present Workspace Selection",
              type: "ask_followup_question",
              description: "Present workspace options to user for selection"
            },
            {
              step: 5,
              name: "Confirm Selection",
              type: "ask_followup_question",
              description: "Confirm account and workspace selection before proceeding"
            }
          ]
        },
        {
          name: "Phase 2: Dataset Creation",
          description: "Create all 6 governance datasets in DRAFT scope",
          steps: this.getDatasetCreationSteps()
        },
        {
          name: "Phase 3: Manual Dataset Promotion",
          description: "CRITICAL: Promote all datasets to PUBLISHED before data loading",
          steps: [
            {
              step: 1,
              name: "Display DRAFT Dataset IDs",
              type: "display_info",
              description: "Show user all DRAFT dataset IDs that must be promoted to PUBLISHED"
            },
            {
              step: 2,
              name: "Manual Promotion Required",
              type: "manual_action",
              description: "User must manually promote ALL 6 datasets from DRAFT → STAGE → PUBLISHED via Verodat UI (NEW IDs will be created)"
            },
            {
              step: 3,
              name: "Confirm All Datasets Published",
              type: "ask_followup_question",
              description: "Wait for user confirmation that ALL datasets are promoted to PUBLISHED scope"
            }
          ]
        },
        {
          name: "Phase 4: Get PUBLISHED Dataset IDs",
          description: "CRITICAL: Get NEW dataset IDs after promotion (promotion creates new IDs)",
          steps: [
            {
              step: 1,
              name: "Get PUBLISHED Datasets",
              mcpCall: {
                server: "verodat-design",
                tool: "get-datasets",
                arguments: {
                  accountId: "{selected_account_id}",
                  workspaceId: "{selected_workspace_id}",
                  filter: "vscope=PUBLISHED and vstate=ACTIVE"
                }
              },
              description: "Retrieve NEW dataset IDs for PUBLISHED datasets (different from DRAFT IDs)"
            },
            {
              step: 2,
              name: "Map PUBLISHED Dataset IDs",
              type: "map_dataset_ids",
              description: "Map dataset names to their NEW PUBLISHED IDs for data loading"
            }
          ]
        },
        {
          name: "Phase 5: Data Loading",
          description: "Load all governance data into PUBLISHED datasets using design server",
          steps: this.getDataLoadingSteps()
        },
        {
          name: "Phase 6: Validation & Documentation",
          description: "Validate bootstrap success and generate documentation",
          steps: [
            {
              step: 1,
              name: "Test Procedure Access",
              mcpCall: {
                server: "verodat-manage",
                tool: "list-procedures",
                arguments: {}
              },
              description: "Validate that all procedures are accessible"
            },
            {
              step: 2,
              name: "Test Specific Procedure",
              mcpCall: {
                server: "verodat-manage",
                tool: "start-procedure",
                arguments: {
                  procedureId: "PROC-BOOTSTRAP-WORKSPACE"
                }
              },
              description: "Test that individual procedures can be started"
            },
            {
              step: 3,
              name: "Generate Claude Instructions",
              type: "generate_file",
              description: "Create Claude project instructions with workspace-specific IDs"
            },
            {
              step: 4,
              name: "Display Final Summary",
              type: "display_summary",
              description: "Present complete bootstrap results and next steps"
            }
          ]
        }
      ],
      dataToLoad: {
        policies: this.bundle.policies.length,
        procedures: this.bundle.procedures.length,
        agents: this.bundle.agents.length,
        raidaEntries: 12
      },
      expectedOutcome: {
        datasetsCreated: 6,
        totalGovernanceItems: this.bundle.policies.length + this.bundle.procedures.length + this.bundle.agents.length + 12,
        proceduresAccessible: this.bundle.procedures.length,
        policiesLoaded: this.bundle.policies.length,
        agentsConfigured: this.bundle.agents.length
      }
    };
  }

  /**
   * Get dataset creation steps
   */
  getDatasetCreationSteps() {
    const datasets = [
      {
        id: 'coreRaida',
        name: 'Core_RAIDA',
        description: 'RAIDA tracking system for governance and task management',
        fields: [
          { name: "Task_Id", type: "string", mandatory: true, isKeyComponent: true, description: "Unique task identifier using RAIDA-[TYPE]-[NUMBER] format" },
          { name: "Task_Type", type: "string", mandatory: true, description: "Type of task (Action, Issue, Risk, Decision)" },
          { name: "Task_Description", type: "string", mandatory: true, description: "Detailed description of the task or item" },
          { name: "Task_Assignee", type: "string", mandatory: true, description: "Individual or agent responsible for the task" },
          { name: "Task_Priority", type: "string", mandatory: true, description: "Task priority level" },
          { name: "Task_Notes", type: "string", mandatory: false, description: "Additional notes and context" },
          { name: "Source_Type", type: "string", mandatory: false, description: "Type of source that created this RAIDA" },
          { name: "Source_Id", type: "string", mandatory: false, description: "Identifier of the source that created this RAIDA" },
          { name: "Review_Status", type: "string", mandatory: true, description: "Current status of the RAIDA item" }
        ]
      },
      {
        id: 'policies',
        name: 'Business_Policies_Ops',
        description: 'Operational policies for the Operations workspace',
        fields: [
          { name: "policy_id", type: "string", mandatory: true, isKeyComponent: true, description: "Unique policy identifier using POL-[DOMAIN]-[NAME] format" },
          { name: "title", type: "string", mandatory: true, description: "Policy title for display and reference" },
          { name: "purpose", type: "string", mandatory: true, description: "Clear statement of policy purpose and objective" },
          { name: "applies_to", type: "string", mandatory: true, description: "Scope and applicability of the policy" },
          { name: "rules", type: "string", mandatory: true, description: "Policy rules and requirements" },
          { name: "policy_owner", type: "string", mandatory: true, description: "Individual responsible for policy maintenance" },
          { name: "policy_status", type: "string", mandatory: true, description: "Policy lifecycle status" }
        ]
      },
      {
        id: 'procedures',
        name: 'AI_Agent_Procedures_Ops',
        description: 'Operational procedures for the Operations workspace',
        fields: [
          { name: "procedure_id", type: "string", mandatory: true, isKeyComponent: true, description: "Unique procedure identifier using PROC-[ACTION]-[TARGET] format" },
          { name: "title", type: "string", mandatory: true, description: "Procedure title for display and reference" },
          { name: "purpose", type: "string", mandatory: true, description: "Clear statement of procedure purpose and objective" },
          { name: "steps", type: "string", mandatory: true, description: "Detailed procedure steps for execution" },
          { name: "triggers", type: "string", mandatory: true, description: "Conditions that trigger procedure execution" },
          { name: "procedure_owner", type: "string", mandatory: true, description: "Agent or individual responsible for procedure maintenance" },
          { name: "procedure_status", type: "string", mandatory: true, description: "Procedure lifecycle status" }
        ]
      },
      {
        id: 'agents',
        name: 'AI_Agent_Identity_Ops',
        description: 'Agent configurations for governance',
        fields: [
          { name: "agent_id", type: "string", mandatory: true, isKeyComponent: true, description: "Unique agent identifier using AGENT-[ROLE]-[DOMAIN] format" },
          { name: "agent_name", type: "string", mandatory: true, description: "Human-readable agent name" },
          { name: "specialization", type: "string", mandatory: true, description: "Agent's area of expertise and capabilities" },
          { name: "primary_dataset", type: "string", mandatory: true, description: "Primary dataset(s) the agent manages" },
          { name: "tool_permissions", type: "string", mandatory: true, description: "JSON array of permitted MCP tools" },
          { name: "coordination_role", type: "string", mandatory: true, description: "How the agent coordinates with other agents" },
          { name: "agent_status", type: "string", mandatory: true, description: "Agent lifecycle status" },
          { name: "created_by", type: "string", mandatory: true, description: "Creator of the agent configuration" },
          { name: "created_date", type: "date", mandatory: false, description: "Creation timestamp" },
          { name: "modified_by", type: "string", mandatory: false, description: "Last modifier" },
          { name: "modified_date", type: "date", mandatory: false, description: "Last modification timestamp" }
        ]
      },
      {
        id: 'modelRegistry',
        name: 'AI_Data_Model_Registry',
        description: 'Central registry of all datasets and their relationships',
        fields: [
          { name: "dataset_id", type: "string", mandatory: true, isKeyComponent: true, description: "Unique dataset identifier" },
          { name: "dataset_name", type: "string", mandatory: true, description: "Human-readable dataset name" },
          { name: "workspace_id", type: "integer", mandatory: true, description: "Workspace containing the dataset" },
          { name: "dataset_type", type: "string", mandatory: true, description: "Type or category of the dataset" },
          { name: "relationships", type: "string", mandatory: false, description: "JSON array of related datasets" },
          { name: "specialist_agent", type: "string", mandatory: true, description: "Agent responsible for this dataset" },
          { name: "last_modified", type: "date", mandatory: true, description: "Last modification timestamp" }
        ]
      },
      {
        id: 'changeLog',
        name: 'AI_Model_Change_Log',
        description: 'Track all data model changes and their impacts',
        fields: [
          { name: "change_id", type: "string", mandatory: true, isKeyComponent: true, description: "Unique change identifier" },
          { name: "dataset_affected", type: "string", mandatory: true, description: "Dataset that was modified" },
          { name: "change_type", type: "string", mandatory: true, description: "Type of change made" },
          { name: "change_description", type: "string", mandatory: true, description: "Detailed description of the change" },
          { name: "impact_analysis", type: "string", mandatory: false, description: "Analysis of change impact" },
          { name: "changed_by", type: "string", mandatory: true, description: "Agent or user who made the change" },
          { name: "change_timestamp", type: "date", mandatory: true, description: "When the change was made" }
        ]
      }
    ];

    return datasets.map((dataset, index) => ({
      step: index + 1,
      name: `Create ${dataset.name} Dataset`,
      mcpCall: {
        server: "verodat-design",
        tool: "create-dataset",
        arguments: {
          accountId: "{selected_account_id}",
          workspaceId: "{selected_workspace_id}",
          name: dataset.name,
          description: dataset.description,
          targetFields: dataset.fields
        }
      },
      description: `Create ${dataset.name} dataset with proper schema and validation rules`,
      trackDatasetId: dataset.id
    }));
  }

  /**
   * Get data loading steps
   */
  getDataLoadingSteps() {
    return [
      {
        step: 1,
        name: "Load Bootstrap RAIDA Entries",
        mcpCall: {
          server: "verodat-design",
          tool: "upload-dataset-rows",
          arguments: {
            accountId: "{selected_account_id}",
            workspaceId: "{selected_workspace_id}",
            datasetId: "{coreRaida_dataset_id}",
            data: this.formatBootstrapRaidaData()
          }
        },
        description: "Upload initial RAIDA tracking entries into PUBLISHED dataset"
      },
      {
        step: 2,
        name: "Load Governance Policies",
        mcpCall: {
          server: "verodat-design",
          tool: "upload-dataset-rows",
          arguments: {
            accountId: "{selected_account_id}",
            workspaceId: "{selected_workspace_id}",
            datasetId: "{policies_dataset_id}",
            data: this.formatPolicyData()
          }
        },
        description: `Upload ${this.bundle.policies.length} governance policies into PUBLISHED Business_Policies_Ops`
      },
      {
        step: 3,
        name: "Load Procedures",
        mcpCall: {
          server: "verodat-design",
          tool: "upload-dataset-rows",
          arguments: {
            accountId: "{selected_account_id}",
            workspaceId: "{selected_workspace_id}",
            datasetId: "{procedures_dataset_id}",
            data: this.formatProcedureData()
          }
        },
        description: `Upload ${this.bundle.procedures.length} procedures into PUBLISHED AI_Agent_Procedures_Ops`
      },
      {
        step: 4,
        name: "Load Agent Configurations",
        mcpCall: {
          server: "verodat-design",
          tool: "upload-dataset-rows",
          arguments: {
            accountId: "{selected_account_id}",
            workspaceId: "{selected_workspace_id}",
            datasetId: "{agents_dataset_id}",
            data: this.formatAgentData()
          }
        },
        description: `Upload ${this.bundle.agents.length} agent configurations into PUBLISHED AI_Agent_Identity_Ops`
      }
    ];
  }

  /**
   * Format bootstrap RAIDA data for upload
   */
  formatBootstrapRaidaData() {
    return [
      {
        header: [
          { name: "Task_Id", type: "string" },
          { name: "Task_Type", type: "string" },
          { name: "Task_Description", type: "string" },
          { name: "Task_Assignee", type: "string" },
          { name: "Task_Priority", type: "string" },
          { name: "Task_Notes", type: "string" },
          { name: "Source_Type", type: "string" },
          { name: "Source_Id", type: "string" },
          { name: "Review_Status", type: "string" }
        ]
      },
      {
        rows: [
          ["RAIDA-SETUP-001", "Action", "Create Core_RAIDA dataset", "verodat", "High", "Foundation dataset for RAIDA tracking", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-002", "Action", "Create Business_Policies_Ops dataset", "verodat", "High", "Dataset for governance policies", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-003", "Action", "Create AI_Agent_Procedures_Ops dataset", "verodat", "High", "Dataset for operational procedures", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-004", "Action", "Create AI_Agent_Identity_Ops dataset", "verodat", "High", "Dataset for agent configurations", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-005", "Action", "Create AI_Data_Model_Registry dataset", "verodat", "High", "Central registry for all datasets", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-006", "Action", "Create AI_Model_Change_Log dataset", "verodat", "High", "Track schema changes and impacts", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-007", "Action", "Load bootstrap RAIDA entries", "verodat", "High", "Create RAIDA entries for all setup actions", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-008", "Action", "Load governance policies", "verodat", "High", "Load 9 policies from bundle", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-009", "Action", "Load procedures", "verodat", "High", "Load 11 procedures from bundle", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-010", "Action", "Load agent configurations", "verodat", "High", "Load 7 agent configurations", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-SETUP-011", "Action", "Activate governance framework", "verodat", "High", "Complete bootstrap and activate", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
          ["RAIDA-BOOTSTRAP", "Action", "Execute PROC-BOOTSTRAP-WORKSPACE to create complete governance framework", "verodat", "High", "This single action initializes the entire governance framework from the bootstrap bundle", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"]
        ]
      }
    ];
  }

  /**
   * Format policy data for upload
   */
  formatPolicyData() {
    return [
      {
        header: [
          { name: "policy_id", type: "string" },
          { name: "title", type: "string" },
          { name: "purpose", type: "string" },
          { name: "applies_to", type: "string" },
          { name: "rules", type: "string" },
          { name: "policy_owner", type: "string" },
          { name: "policy_status", type: "string" }
        ]
      },
      {
        rows: this.bundle.policies.map(p => [
          p.policy_id,
          p.title,
          p.purpose,
          p.applies_to,
          p.rules,
          p.policy_owner,
          p.policy_status
        ])
      }
    ];
  }

  /**
   * Format procedure data for upload
   */
  formatProcedureData() {
    return [
      {
        header: [
          { name: "procedure_id", type: "string" },
          { name: "title", type: "string" },
          { name: "purpose", type: "string" },
          { name: "steps", type: "string" },
          { name: "triggers", type: "string" },
          { name: "procedure_owner", type: "string" },
          { name: "procedure_status", type: "string" }
        ]
      },
      {
        rows: this.bundle.procedures.map(p => [
          p.procedure_id,
          p.title,
          p.purpose,
          p.steps,
          p.triggers,
          p.procedure_owner,
          p.procedure_status
        ])
      }
    ];
  }

  /**
   * Format agent data for upload
   */
  formatAgentData() {
    return [
      {
        header: [
          { name: "agent_id", type: "string" },
          { name: "agent_name", type: "string" },
          { name: "specialization", type: "string" },
          { name: "primary_dataset", type: "string" },
          { name: "tool_permissions", type: "string" },
          { name: "coordination_role", type: "string" },
          { name: "agent_status", type: "string" },
          { name: "created_by", type: "string" },
          { name: "created_date", type: "date" },
          { name: "modified_by", type: "string" },
          { name: "modified_date", type: "date" }
        ]
      },
      {
        rows: this.bundle.agents.map(a => [
          a.agent_id,
          a.agent_name,
          a.specialization,
          a.primary_dataset,
          a.tool_permissions,
          a.coordination_role,
          a.agent_status,
          "verodat",
          new Date().toISOString(),
          null,
          null
        ])
      }
    ];
  }

  /**
   * Generate Claude project instructions template
   */
  generateClaudeInstructions(accountId, workspaceId, datasetIds) {
    return `# Verodat Governance Framework - Claude Project Instructions

## Workspace Configuration

**Verodat Account:** ${accountId}
**Workspace:** ${workspaceId}

## Dataset IDs (PUBLISHED)

- **Core_RAIDA:** ${datasetIds.coreRaida}
- **Business_Policies_Ops:** ${datasetIds.policies}
- **AI_Agent_Procedures_Ops:** ${datasetIds.procedures}
- **AI_Agent_Identity_Ops:** ${datasetIds.agents}
- **AI_Data_Model_Registry:** ${datasetIds.modelRegistry}
- **AI_Model_Change_Log:** ${datasetIds.changeLog}

## Configuration Policy

**Primary Configuration:** POL-CLAUDE-CONFIG

## Bootstrap Completion

**Date:** ${new Date().toISOString().split('T')[0]}
**Method:** Cline-Native Bootstrap
**Status:** ✅ Complete

## Available Commands

- **GMV**: Execute Good Morning Verodat daily briefing
- **RAIDA <text>**: Create new RAIDA task entry

## Trust Indicators

- 🟢 **Governed**: Operation has proper procedures
- 🔴 **Ungoverned**: Operation lacks procedures (triggers VERA orchestration)
- ❌ **Blocked**: Operation not permitted

## Next Steps

1. Test GMV command for daily briefings
2. Test VERA orchestration with missing procedures
3. Create new RAIDAs for ongoing work
4. Monitor procedure execution logs
`;
  }
}

// Main execution when run directly
if (require.main === module) {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║            CLINE-NATIVE BOOTSTRAP EXECUTION PLAN           ║
╚════════════════════════════════════════════════════════════╝

This script provides a structured execution plan for Cline to bootstrap
the Verodat governance framework using MCP tools.

To execute this bootstrap:
1. Run this script within Cline
2. Follow the execution plan step by step
3. Use the MCP tool calls provided for each step
4. Track dataset IDs as they are created

Execution Plan:
`);

  const bootstrap = new ClineNativeBootstrap();
  const plan = bootstrap.getExecutionPlan();
  
  if (plan) {
    console.log(JSON.stringify(plan, null, 2));
  } else {
    console.error('❌ Failed to generate execution plan');
    process.exit(1);
  }
}

module.exports = ClineNativeBootstrap;
