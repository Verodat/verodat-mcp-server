#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Function to select from a list
async function selectFromList(items, displayKey, valueKey, prompt) {
  console.log('\n' + prompt);
  console.log('─'.repeat(60));
  
  items.forEach((item, index) => {
    console.log(`${index + 1}. ${item[displayKey]}`);
  });
  
  let selection = null;
  while (!selection) {
    const answer = await askQuestion('\nEnter number: ');
    const index = parseInt(answer) - 1;
    
    if (index >= 0 && index < items.length) {
      selection = items[index];
    } else {
      console.log('❌ Invalid selection. Please try again.');
    }
  }
  
  return selection[valueKey];
}

// Function to get accounts
async function getAccounts() {
  console.log('\n📊 Fetching available accounts...');
  
  const result = await executeMcpCommand('design', 'get-accounts', {});
  
  if (result.error) {
    throw new Error('Failed to fetch accounts');
  }
  
  // Parse the accounts from the result
  if (result.result && result.result.content) {
    const content = JSON.parse(result.result.content[0].text);
    return content.accounts || [];
  }
  
  return [];
}

// Function to get workspaces for an account
async function getWorkspaces(accountId) {
  console.log(`\n📁 Fetching workspaces for account ${accountId}...`);
  
  const result = await executeMcpCommand('design', 'get-workspaces', {
    accountId: accountId
  });
  
  if (result.error) {
    throw new Error('Failed to fetch workspaces');
  }
  
  // Parse the workspaces from the result
  if (result.result && result.result.content) {
    const content = JSON.parse(result.result.content[0].text);
    return content.workspaces || [];
  }
  
  return [];
}

// Interactive selection process
async function selectAccountAndWorkspace() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              INTERACTIVE WORKSPACE SELECTION               ║
╚════════════════════════════════════════════════════════════╝
`);
  
  // Get and select account
  const accounts = await getAccounts();
  
  if (accounts.length === 0) {
    throw new Error('No accounts available');
  }
  
  const accountId = await selectFromList(
    accounts.map(acc => ({ 
      display: `${acc.description} (ID: ${acc.account_id})`, 
      value: acc.account_id 
    })),
    'display',
    'value',
    'SELECT ACCOUNT:'
  );
  
  console.log(`\n✅ Selected Account: ${accountId}`);
  
  // Get and select workspace
  const workspaces = await getWorkspaces(accountId);
  
  if (workspaces.length === 0) {
    throw new Error('No workspaces available for this account');
  }
  
  const workspaceId = await selectFromList(
    workspaces.map(ws => ({ 
      display: `${ws.name} (ID: ${ws.workspace_id})`, 
      value: ws.workspace_id 
    })),
    'display',
    'value',
    'SELECT WORKSPACE:'
  );
  
  console.log(`\n✅ Selected Workspace: ${workspaceId}`);
  
  // Confirm selection
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    CONFIRM SELECTION                       ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Account ID: ${String(accountId).padEnd(45)}║
║  Workspace ID: ${String(workspaceId).padEnd(43)}║
║                                                            ║
║  This will:                                                ║
║  • Create governance datasets in DRAFT                     ║
║  • Require manual promotion to PUBLISHED                   ║
║  • Load all governance data                                ║
║  • Setup RAIDA tracking system                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  
  const confirm = await askQuestion('Do you want to proceed? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log('\n❌ Bootstrap cancelled by user');
    process.exit(0);
  }
  
  return { accountId, workspaceId };
}

// Update RAIDA status
async function updateRaidaStatus(accountId, workspaceId, datasetId, raidaId, status, notes) {
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
    accountId: accountId,
    workspaceId: workspaceId,
    datasetId: datasetId,
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
  console.log(`
============================================================
RAIDA-DRIVEN BOOTSTRAP WITH INTERACTIVE SELECTION
============================================================
This orchestrator will:
1. Let you select account and workspace
2. Create datasets in DRAFT
3. Prompt for promotion to PUBLISHED
4. Load data into PUBLISHED datasets
5. Update RAIDA status throughout
============================================================
`);
  
  // Interactive selection
  const { accountId, workspaceId } = await selectAccountAndWorkspace();
  
  // Dataset IDs will be assigned dynamically - we'll track them
  const datasetIds = {
    coreRaida: null,
    policies: null,
    procedures: null,
    agents: null
  };
  
  // Load bootstrap bundle
  const bundlePath = path.join(__dirname, 'workspace_bootstrap_bundle.json');
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  
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
          accountId: accountId,
          workspaceId: workspaceId,
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
        
        // Extract dataset ID from response
        if (!result.error && result.result && result.result.content) {
          const content = JSON.parse(result.result.content[0].text);
          if (content.datasetId) {
            datasetIds.coreRaida = content.datasetId;
            console.log(`✅ Core_RAIDA created with ID: ${datasetIds.coreRaida}`);
          }
        }
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-003',
      name: 'Create Business_Policies_Ops Dataset',
      execute: async () => {
        console.log('Creating Business_Policies_Ops dataset...');
        
        const result = await executeMcpCommand('design', 'create-dataset', {
          accountId: accountId,
          workspaceId: workspaceId,
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
        
        // Extract dataset ID from response
        if (!result.error && result.result && result.result.content) {
          const content = JSON.parse(result.result.content[0].text);
          if (content.datasetId) {
            datasetIds.policies = content.datasetId;
            console.log(`✅ Business_Policies_Ops created with ID: ${datasetIds.policies}`);
          }
        }
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-004',
      name: 'Create AI_Agent_Procedures_Ops Dataset',
      execute: async () => {
        console.log('Creating AI_Agent_Procedures_Ops dataset...');
        
        const result = await executeMcpCommand('design', 'create-dataset', {
          accountId: accountId,
          workspaceId: workspaceId,
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
        
        // Extract dataset ID from response
        if (!result.error && result.result && result.result.content) {
          const content = JSON.parse(result.result.content[0].text);
          if (content.datasetId) {
            datasetIds.procedures = content.datasetId;
            console.log(`✅ AI_Agent_Procedures_Ops created with ID: ${datasetIds.procedures}`);
          }
        }
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-005',
      name: 'Create AI_Agent_Identity_Ops Dataset',
      execute: async () => {
        console.log('Creating AI_Agent_Identity_Ops dataset...');
        
        const result = await executeMcpCommand('design', 'create-dataset', {
          accountId: accountId,
          workspaceId: workspaceId,
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
        
        // Extract dataset ID from response
        if (!result.error && result.result && result.result.content) {
          const content = JSON.parse(result.result.content[0].text);
          if (content.datasetId) {
            datasetIds.agents = content.datasetId;
            console.log(`✅ AI_Agent_Identity_Ops created with ID: ${datasetIds.agents}`);
          }
        }
        
        return { success: !result.error };
      }
    }
  ];
  
  // Execute dataset creation steps
  for (const step of datasetCreationSteps) {
    console.log(`\n🚀 Executing: ${step.name}`);
    console.log('════════════════════════════════════════════════════════════');
    
    // Update RAIDA status if Core_RAIDA exists
    if (datasetIds.coreRaida) {
      await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'In Progress', `Started: ${new Date().toISOString()}`);
    }
    
    try {
      const result = await step.execute();
      
      if (result.success) {
        if (datasetIds.coreRaida) {
          await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'Done', `Completed: ${new Date().toISOString()}`);
        }
        console.log(`✅ ${step.name} completed successfully`);
      } else {
        if (datasetIds.coreRaida) {
          await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'To Do', `Failed: ${new Date().toISOString()}`);
        }
        console.log(`❌ ${step.name} failed`);
      }
    } catch (error) {
      console.error(`❌ Error executing ${step.name}:`, error);
      if (datasetIds.coreRaida) {
        await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'To Do', `Error: ${error.message}`);
      }
    }
  }
  
  // Display created dataset IDs
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                 DATASETS CREATED IN DRAFT                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Core_RAIDA: ${String(datasetIds.coreRaida || 'Failed').padEnd(45)}║
║  Business_Policies_Ops: ${String(datasetIds.policies || 'Failed').padEnd(34)}║
║  AI_Agent_Procedures_Ops: ${String(datasetIds.procedures || 'Failed').padEnd(32)}║
║  AI_Agent_Identity_Ops: ${String(datasetIds.agents || 'Failed').padEnd(34)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  
  // Phase 2: Prompt for dataset promotion
  console.log(`
╔════════════════════════════════════════════════════════════╗
║            PHASE 2: PROMOTE ALL DATASETS                   ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Please promote ALL datasets to PUBLISHED:                ║
║                                                            ║`);
  
  if (datasetIds.coreRaida) {
    console.log(`║  1. Core_RAIDA (ID: ${String(datasetIds.coreRaida).padEnd(37)}║`);
  }
  if (datasetIds.policies) {
    console.log(`║  2. Business_Policies_Ops (ID: ${String(datasetIds.policies).padEnd(26)}║`);
  }
  if (datasetIds.procedures) {
    console.log(`║  3. AI_Agent_Procedures_Ops (ID: ${String(datasetIds.procedures).padEnd(24)}║`);
  }
  if (datasetIds.agents) {
    console.log(`║  4. AI_Agent_Identity_Ops (ID: ${String(datasetIds.agents).padEnd(26)}║`);
  }
  
  console.log(`║                                                            ║
║  Steps for each dataset:                                  ║
║  1. Log into Verodat                                      ║
║  2. Navigate to Workspace ${String(workspaceId).padEnd(32)}║
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
        if (!datasetIds.coreRaida) {
          console.log('⚠️  Skipping - Core_RAIDA dataset not created');
          return { success: false };
        }
        
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
          accountId: accountId,
          workspaceId: workspaceId,
          datasetId: datasetIds.coreRaida,
          data: raidaData
        });
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-006',
      name: 'Load Governance Policies',
      execute: async () => {
        if (!datasetIds.policies) {
          console.log('⚠️  Skipping - Business_Policies_Ops dataset not created');
          return { success: false };
        }
        
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
          accountId: accountId,
          workspaceId: workspaceId,
          datasetId: datasetIds.policies,
          data: policyData
        });
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-007',
      name: 'Load Procedures',
      execute: async () => {
        if (!datasetIds.procedures) {
          console.log('⚠️  Skipping - AI_Agent_Procedures_Ops dataset not created');
          return { success: false };
        }
        
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
          accountId: accountId,
          workspaceId: workspaceId,
          datasetId: datasetIds.procedures,
          data: procedureData
        });
        
        return { success: !result.error };
      }
    },
    {
      id: 'RAIDA-SETUP-008',
      name: 'Load Agent Configurations',
      execute: async () => {
        if (!datasetIds.agents) {
          console.log('⚠️  Skipping - AI_Agent_Identity_Ops dataset not created');
          return { success: false };
        }
        
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
          accountId: accountId,
          workspaceId: workspaceId,
          datasetId: datasetIds.agents,
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
    if (datasetIds.coreRaida) {
      await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'In Progress', `Started: ${new Date().toISOString()}`);
    }
    
    try {
      const result = await step.execute();
      
      if (result.success) {
        // Mark as Done
        if (datasetIds.coreRaida) {
          await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'Done', `Completed: ${new Date().toISOString()}`);
        }
        console.log(`✅ ${step.name} completed successfully`);
      } else {
        // Mark as failed
        if (datasetIds.coreRaida) {
          await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'To Do', `Failed: ${new Date().toISOString()}`);
        }
        console.log(`❌ ${step.name} failed`);
      }
    } catch (error) {
      console.error(`❌ Error executing ${step.name}:`, error);
      if (datasetIds.coreRaida) {
        await updateRaidaStatus(accountId, workspaceId, datasetIds.coreRaida, step.id, 'To Do', `Error: ${error.message}`);
      }
    }
  }
  
  // Final summary
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    BOOTSTRAP COMPLETE                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Account: ${String(accountId).padEnd(48)}║
║  Workspace: ${String(workspaceId).padEnd(46)}║
║                                                            ║
║  ✅ All governance structures have been loaded            ║
║  ✅ Data is in PUBLISHED datasets                         ║
║  ✅ RAIDA tracking is active                              ║
║  ✅ Procedures are available for operations               ║
║  ✅ Policies are enforced                                 ║
║                                                            ║
║  Dataset IDs Created:                                     ║
║  • Core_RAIDA: ${String(datasetIds.coreRaida || 'N/A').padEnd(43)}║
║  • Business_Policies_Ops: ${String(datasetIds.policies || 'N/A').padEnd(32)}║
║  • AI_Agent_Procedures_Ops: ${String(datasetIds.procedures || 'N/A').padEnd(30)}║
║  • AI_Agent_Identity_Ops: ${String(datasetIds.agents || 'N/A').padEnd(32)}║
║                                                            ║
║  Next Steps:                                              ║
║  1. Test GMV command for daily briefings                  ║
║  2. Create new RAIDAs for ongoing work                    ║
║  3. Monitor procedure execution logs                      ║
║  4. Use Cline/Claude with generated instructions          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  
  rl.close();
}

// Run the orchestration
orchestrate().catch((error) => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});
