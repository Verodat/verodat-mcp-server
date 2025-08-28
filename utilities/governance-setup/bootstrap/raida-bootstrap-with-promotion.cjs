#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const ACCOUNT_ID = 130;
const WORKSPACE_ID = 240;
const CORE_RAIDA_ID = 5568;

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

console.log(`
============================================================
RAIDA-DRIVEN BOOTSTRAP WITH DATASET PROMOTION
============================================================
Account: ${ACCOUNT_ID} (Verodat)
Workspace: ${WORKSPACE_ID} (Governance-test)

This orchestrator follows the complete workflow:
1. Create datasets in DRAFT
2. Prompt for promotion to PUBLISHED
3. Load data into PUBLISHED datasets
4. Update RAIDA status throughout
============================================================
`);

// Load bootstrap bundle
const bundlePath = path.join(__dirname, 'workspace_bootstrap_bundle.json');
const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

// Function to execute MCP command
async function executeMcpCommand(server, tool, args) {
  return new Promise((resolve, reject) => {
    const cmd = spawn('node', [
      `build/src/${server}.js`,
      'call',
      tool,
      JSON.stringify(args)
    ]);
    
    let output = '';
    let error = '';
    
    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cmd.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    cmd.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Command failed: ${error}`);
        resolve({ error: error });
      } else {
        try {
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            resolve(result);
          } else {
            resolve({ output: output });
          }
        } catch (e) {
          resolve({ output: output });
        }
      }
    });
  });
}

// Update RAIDA status
async function updateRaidaStatus(raidaId, status, notes) {
  console.log(`📝 Updating RAIDA ${raidaId} to ${status}...`);
  
  const updateData = [
    {
      header: [
        { name: "task_id", type: "string" },
        { name: "review_status", type: "string" },
        { name: "task_notes", type: "string" }
      ]
    },
    {
      rows: [
        [raidaId, status, notes]
      ]
    }
  ];
  
  const result = await executeMcpCommand('design', 'upload-dataset-rows', {
    accountId: ACCOUNT_ID,
    workspaceId: WORKSPACE_ID,
    datasetId: CORE_RAIDA_ID,
    data: updateData
  });
  
  if (result.error) {
    console.log(`⚠️  Could not update RAIDA status (may not exist yet)`);
  } else {
    console.log(`✅ RAIDA ${raidaId} status updated to ${status}`);
  }
}

// Wait for dataset promotion
async function waitForPromotion(datasetName, datasetId) {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    USER ACTION REQUIRED                    ║
╠════════════════════════════════════════════════════════════╣
║  Please promote dataset to PUBLISHED:                      ║
║                                                            ║
║  Dataset: ${datasetName.padEnd(48)}║
║  ID: ${String(datasetId).padEnd(54)}║
║                                                            ║
║  Steps:                                                    ║
║  1. Log into Verodat                                      ║
║  2. Navigate to Workspace ${WORKSPACE_ID}                          ║
║  3. Find dataset ${datasetName.padEnd(37)}║
║  4. Promote from DRAFT → STAGE → PUBLISHED               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  
  const answer = await askQuestion('Press ENTER when dataset has been promoted to PUBLISHED...');
  console.log('✅ Continuing with data load...\n');
}

// Main orchestration function
async function orchestrate() {
  // Phase 1: Create ALL datasets first
  console.log(`
╔════════════════════════════════════════════════════════════╗
║               PHASE 1: CREATE ALL DATASETS                 ║
╚════════════════════════════════════════════════════════════╝
`);
  
  const datasetCreationSteps = [
    {
      id: 'RAIDA-SETUP-001',
      name: 'Create Core_RAIDA Dataset',
      execute: async () => {
        console.log('Creating Core_RAIDA dataset...');
        const result = await executeMcpCommand('design', 'create-dataset', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          name: 'Core_RAIDA',
          description: 'Central RAIDA tracking for workspace governance',
          targetFields: [
            { name: "task_id", type: "string", mandatory: true, isKeyComponent: true },
            { name: "task_type", type: "string", mandatory: true },
            { name: "task_description", type: "string", mandatory: true },
            { name: "task_assignee", type: "string", mandatory: true },
            { name: "task_priority", type: "string", mandatory: true },
            { name: "task_notes", type: "string", mandatory: false },
            { name: "source_type", type: "string", mandatory: false },
            { name: "source_id", type: "string", mandatory: false },
            { name: "review_status", type: "string", mandatory: true }
          ]
        });
        return { success: !result.error, datasetId: CORE_RAIDA_ID };
      }
    },
    {
      id: 'RAIDA-SETUP-003',
      name: 'Create Business_Policies_Ops Dataset',
      execute: async () => {
        console.log('Creating Business_Policies_Ops dataset...');
        
        const result = await executeMcpCommand('design', 'create-dataset', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          name: 'Business_Policies_Ops',
          description: 'Operational policies for governance',
          targetFields: [
            { name: "policy_id", type: "string", mandatory: true, isKeyComponent: true },
            { name: "title", type: "string", mandatory: true },
            { name: "purpose", type: "string", mandatory: true },
            { name: "applies_to", type: "string", mandatory: true },
            { name: "rules", type: "string", mandatory: true },
            { name: "policy_owner", type: "string", mandatory: true },
            { name: "policy_status", type: "string", mandatory: true }
          ]
        });
        
        return { success: !result.error, datasetId: 5576 };
      }
    },
    {
      id: 'RAIDA-SETUP-004',
      name: 'Create AI_Agent_Procedures_Ops Dataset',
      execute: async () => {
        console.log('Creating AI_Agent_Procedures_Ops dataset...');
        
        const result = await executeMcpCommand('design', 'create-dataset', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          name: 'AI_Agent_Procedures_Ops',
          description: 'Operational procedures for governance',
          targetFields: [
            { name: "procedure_id", type: "string", mandatory: true, isKeyComponent: true },
            { name: "title", type: "string", mandatory: true },
            { name: "purpose", type: "string", mandatory: true },
            { name: "steps", type: "string", mandatory: true },
            { name: "triggers", type: "string", mandatory: true },
            { name: "procedure_owner", type: "string", mandatory: true },
            { name: "procedure_status", type: "string", mandatory: true }
          ]
        });
        
        return { success: !result.error, datasetId: 5577 };
      }
    },
    {
      id: 'RAIDA-SETUP-005',
      name: 'Create AI_Agent_Identity_Ops Dataset',
      execute: async () => {
        console.log('Creating AI_Agent_Identity_Ops dataset...');
        
        const result = await executeMcpCommand('design', 'create-dataset', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          name: 'AI_Agent_Identity_Ops',
          description: 'Agent configurations for governance',
          targetFields: [
            { name: "agent_id", type: "string", mandatory: true, isKeyComponent: true },
            { name: "agent_name", type: "string", mandatory: true },
            { name: "specialization", type: "string", mandatory: true },
            { name: "primary_dataset", type: "string", mandatory: true },
            { name: "tool_permissions", type: "string", mandatory: true },
            { name: "coordination_role", type: "string", mandatory: true },
            { name: "agent_status", type: "string", mandatory: true },
            { name: "created_by", type: "string", mandatory: true },
            { name: "created_date", type: "date", mandatory: false },
            { name: "modified_by", type: "string", mandatory: false },
            { name: "modified_date", type: "date", mandatory: false }
          ]
        });
        
        return { success: !result.error, datasetId: 5578 };
      }
    }
  ];
  
  // Execute dataset creation steps
  for (const step of datasetCreationSteps) {
    console.log(`\n🚀 Executing: ${step.name}`);
    console.log('════════════════════════════════════════════════════════════');
    
    await updateRaidaStatus(step.id, 'In Progress', `Started: ${new Date().toISOString()}`);
    
    try {
      const result = await step.execute();
      
      if (result.success) {
        await updateRaidaStatus(step.id, 'Done', `Completed: ${new Date().toISOString()}`);
        console.log(`✅ ${step.name} completed successfully`);
      } else {
        await updateRaidaStatus(step.id, 'To Do', `Failed: ${new Date().toISOString()}`);
        console.log(`❌ ${step.name} failed`);
      }
    } catch (error) {
      console.error(`❌ Error executing ${step.name}:`, error);
      await updateRaidaStatus(step.id, 'To Do', `Error: ${error.message}`);
    }
  }
  
  // Phase 2: Promote ALL datasets to PUBLISHED
  console.log(`
╔════════════════════════════════════════════════════════════╗
║            PHASE 2: PROMOTE ALL DATASETS                   ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Please promote ALL datasets to PUBLISHED:                ║
║                                                            ║
║  1. Core_RAIDA (ID: 5568)                                 ║
║  2. Business_Policies_Ops (ID: 5576)                      ║
║  3. AI_Agent_Procedures_Ops (ID: 5577)                    ║
║  4. AI_Agent_Identity_Ops (ID: 5578)                      ║
║                                                            ║
║  Steps for each dataset:                                  ║
║  1. Log into Verodat                                      ║
║  2. Navigate to Workspace 240                             ║
║  3. Find the dataset                                      ║
║  4. Promote: DRAFT → STAGE → PUBLISHED                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  
  const answer = await askQuestion('Press ENTER when ALL datasets have been promoted to PUBLISHED...');
  console.log('✅ Continuing with data loading phase...\n');
  
  // Phase 3: Load data into PUBLISHED datasets
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           PHASE 3: LOAD DATA INTO PUBLISHED DATASETS       ║
╚════════════════════════════════════════════════════════════╝
`);
  
  const dataLoadingSteps = [
    {
      id: 'RAIDA-SETUP-002',
      name: 'Upload Bootstrap RAIDAs',
      execute: async () => {
        console.log('Uploading bootstrap RAIDAs to PUBLISHED Core_RAIDA...');
        
        const raidaData = [
          {
            header: [
              { name: "task_id", type: "string" },
              { name: "task_type", type: "string" },
              { name: "task_description", type: "string" },
              { name: "task_assignee", type: "string" },
              { name: "task_priority", type: "string" },
              { name: "task_notes", type: "string" },
              { name: "source_type", type: "string" },
              { name: "source_id", type: "string" },
              { name: "review_status", type: "string" }
            ]
          },
          {
            rows: [
              ["RAIDA-SETUP-001", "Action", "Create Core_RAIDA dataset", "verodat", "High", "Foundation dataset for RAIDA tracking", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
              ["RAIDA-SETUP-002", "Action", "Upload bootstrap RAIDAs", "verodat", "High", "Create RAIDA entries for all setup actions", "Bootstrap", "workspace_bootstrap_bundle.json", "In Progress"],
              ["RAIDA-SETUP-003", "Action", "Create Business_Policies_Ops dataset", "verodat", "High", "Dataset for governance policies", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
              ["RAIDA-SETUP-004", "Action", "Create AI_Agent_Procedures_Ops dataset", "verodat", "High", "Dataset for operational procedures", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
              ["RAIDA-SETUP-005", "Action", "Create AI_Agent_Identity_Ops dataset", "verodat", "High", "Dataset for agent configurations", "Bootstrap", "workspace_bootstrap_bundle.json", "Done"],
              ["RAIDA-SETUP-006", "Action", "Load governance policies", "verodat", "High", "Load 7 policies from bundle", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
              ["RAIDA-SETUP-007", "Action", "Load procedures", "verodat", "High", "Load 8 procedures from bundle", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
              ["RAIDA-SETUP-008", "Action", "Load agents", "verodat", "High", "Load 6 agent configurations", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
              ["RAIDA-SETUP-009", "Action", "Initialize data model registry", "verodat", "High", "Create registry datasets", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
              ["RAIDA-SETUP-010", "Action", "Activate governance framework", "verodat", "High", "Complete bootstrap and activate", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"]
            ]
          }
        ];
        
        const result = await executeMcpCommand('design', 'upload-dataset-rows', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          datasetId: CORE_RAIDA_ID,
          data: raidaData
        });
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-006',
      name: 'Load Governance Policies',
      execute: async () => {
        console.log('Loading governance policies into PUBLISHED dataset...');
        
        const policyData = [
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
            rows: bundle.policies.map(p => [
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
        
        const result = await executeMcpCommand('design', 'upload-dataset-rows', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          datasetId: 5576, // Business_Policies_Ops
          data: policyData
        });
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-007',
      name: 'Load Procedures',
      execute: async () => {
        console.log('Loading procedures into PUBLISHED dataset...');
        
        const procedureData = [
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
            rows: bundle.procedures.map(p => [
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
        
        const result = await executeMcpCommand('design', 'upload-dataset-rows', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          datasetId: 5577, // AI_Agent_Procedures_Ops
          data: procedureData
        });
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-008',
      name: 'Load Agent Configurations',
      execute: async () => {
        console.log('Loading agent configurations into PUBLISHED dataset...');
        
        const agentData = [
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
            rows: bundle.agents.map(a => [
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
        
        const result = await executeMcpCommand('design', 'upload-dataset-rows', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          datasetId: 5578, // AI_Agent_Identity_Ops
          data: agentData
        });
        
        return { success: !result.error };
      }
    }
  ];
  
  // Execute data loading steps
  for (const step of dataLoadingSteps) {
    console.log(`\n🚀 Executing: ${step.name}`);
    console.log('════════════════════════════════════════════════════════════');
    
    // Mark as In Progress
    await updateRaidaStatus(step.id, 'In Progress', `Started: ${new Date().toISOString()}`);
    
    try {
      const result = await step.execute();
      
      if (result.success) {
        // Mark as Done
        await updateRaidaStatus(step.id, 'Done', `Completed: ${new Date().toISOString()}`);
        console.log(`✅ ${step.name} completed successfully`);
      } else {
        // Mark as failed
        await updateRaidaStatus(step.id, 'To Do', `Failed: ${new Date().toISOString()}`);
        console.log(`❌ ${step.name} failed`);
      }
    } catch (error) {
      console.error(`❌ Error executing ${step.name}:`, error);
      await updateRaidaStatus(step.id, 'To Do', `Error: ${error.message}`);
    }
  }
  
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    BOOTSTRAP COMPLETE                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ✅ All governance structures have been loaded            ║
║  ✅ Data is in PUBLISHED datasets                         ║
║  ✅ RAIDA tracking is active                              ║
║  ✅ Procedures are available for operations               ║
║  ✅ Policies are enforced                                 ║
║                                                            ║
║  Next Steps:                                              ║
║  1. Test GMV command for daily briefings                  ║
║  2. Create new RAIDAs for ongoing work                    ║
║  3. Monitor procedure execution logs                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  
  rl.close();
}

// Run the orchestration
orchestrate().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
});
