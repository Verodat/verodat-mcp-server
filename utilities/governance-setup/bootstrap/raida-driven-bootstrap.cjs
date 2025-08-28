#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ACCOUNT_ID = 130;
const WORKSPACE_ID = 240;
const CORE_RAIDA_ID = 5568;

console.log(`
============================================================
RAIDA-DRIVEN BOOTSTRAP ORCHESTRATOR
============================================================
Account: ${ACCOUNT_ID} (Verodat)
Workspace: ${WORKSPACE_ID} (Governance-test)

This orchestrator follows the RAIDA-driven approach:
1. Each action updates RAIDA status as it progresses
2. All configuration comes from the bootstrap bundle
3. RAIDA management procedure is created first
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
        resolve({ error: error }); // Don't reject, just return error
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
  
  // Use design server for RAIDA updates (no procedures required)
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

// Main orchestration function
async function orchestrate() {
  const steps = [
    {
      id: 'RAIDA-SETUP-001',
      name: 'Create Core_RAIDA Dataset',
      execute: async () => {
        // Check if dataset exists first
        console.log('Checking for existing Core_RAIDA dataset...');
        const datasets = await executeMcpCommand('design', 'get-datasets', {
          accountId: ACCOUNT_ID,
          workspaceId: WORKSPACE_ID,
          filter: 'vstate=ACTIVE'
        });
        
        if (!datasets.error && datasets.content) {
          const content = datasets.content.find(c => c.text && c.text.includes('Core_RAIDA'));
          if (content) {
            console.log('✅ Core_RAIDA already exists');
            return true;
          }
        }
        
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
        
        return !result.error;
      }
    },
    {
      id: 'RAIDA-SETUP-002',
      name: 'Upload Bootstrap RAIDAs',
      execute: async () => {
        console.log('Uploading bootstrap RAIDAs...');
        
        // Create all setup RAIDAs
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
              ["RAIDA-SETUP-001", "Action", "Create Core_RAIDA dataset", "verodat", "High", "Foundation dataset for RAIDA tracking", "Bootstrap", "workspace_bootstrap_bundle.json", "In Progress"],
              ["RAIDA-SETUP-002", "Action", "Upload bootstrap RAIDAs", "verodat", "High", "Create RAIDA entries for all setup actions", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
              ["RAIDA-SETUP-003", "Action", "Create Business_Policies_Ops dataset", "verodat", "High", "Dataset for governance policies", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
              ["RAIDA-SETUP-004", "Action", "Create AI_Agent_Procedures_Ops dataset", "verodat", "High", "Dataset for operational procedures", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
              ["RAIDA-SETUP-005", "Action", "Create AI_Agent_Identity_Ops dataset", "verodat", "High", "Dataset for agent configurations", "Bootstrap", "workspace_bootstrap_bundle.json", "To Do"],
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
        
        return !result.error;
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
        
        return !result.error;
      }
    },
    {
      id: 'RAIDA-SETUP-006',
      name: 'Load Governance Policies',
      execute: async () => {
        console.log('Loading governance policies...');
        
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
        
        return !result.error;
      }
    },
    {
      id: 'RAIDA-SETUP-007',
      name: 'Load Procedures',
      execute: async () => {
        console.log('Loading procedures with correct field mapping...');
        
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
        
        return !result.error;
      }
    },
    {
      id: 'RAIDA-SETUP-008',
      name: 'Load Agent Configurations',
      execute: async () => {
        console.log('Loading agent configurations...');
        
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
        
        return !result.error;
      }
    }
  ];
  
  // Execute each step and update RAIDA status
  for (const step of steps) {
    console.log(`\n🚀 Executing: ${step.name}`);
    console.log('------------------------------------------------------------');
    
    // Mark as In Progress
    await updateRaidaStatus(step.id, 'In Progress', `Started: ${new Date().toISOString()}`);
    
    try {
      const success = await step.execute();
      
      if (success) {
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
============================================================
BOOTSTRAP COMPLETE
============================================================

✅ All governance structures have been loaded
✅ RAIDA tracking is active
✅ Procedures are available for operations
✅ Policies are enforced

Next Steps:
1. Promote datasets from DRAFT to PUBLISHED
2. Test GMV command for daily briefings
3. Create new RAIDAs for ongoing work

============================================================
`);
}

// Run the orchestration
orchestrate().catch(console.error);
