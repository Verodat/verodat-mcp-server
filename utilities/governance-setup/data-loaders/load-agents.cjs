#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load bootstrap bundle
const bundlePath = path.join(__dirname, 'workspace_bootstrap_bundle.json');
const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

// Extract agents from bundle
const agents = bundle.agents;

// Format agents for upload with ALL fields (lowercase)
const formatAgentsForUpload = () => {
  const header = [
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
  ];

  const rows = agents.map(agent => [
    agent.agent_id,
    agent.agent_name,
    agent.specialization,
    agent.primary_dataset,
    agent.tool_permissions,  // Already a string
    agent.coordination_role,
    agent.agent_status,
    "verodat",  // created_by
    new Date().toISOString(),  // created_date
    null,  // modified_by
    null   // modified_date
  ]);

  return {
    data: [
      { header },
      { rows }
    ]
  };
};

// Display agents summary
console.log('\n=== AI Agent Identities to Load ===\n');
agents.forEach(agent => {
  console.log(`${agent.agent_id}: ${agent.agent_name}`);
  console.log(`  Specialization: ${agent.specialization}`);
  console.log(`  Primary Dataset: ${agent.primary_dataset}`);
  console.log(`  Status: ${agent.agent_status}\n`);
});

console.log(`Total agents to load: ${agents.length}`);

// Format data for upload
const uploadData = formatAgentsForUpload();

// Save formatted data for reference
const outputPath = path.join(__dirname, 'agents-upload-data.json');
fs.writeFileSync(outputPath, JSON.stringify(uploadData, null, 2));

console.log('\n✅ Agents data prepared and saved to agents-upload-data.json');
console.log('\nNext step: Use verodat-manage upload-dataset-rows with:');
console.log('- accountId: 130');
console.log('- workspaceId: 240');
console.log('- datasetId: 5578 (AI_Agent_Identity_Ops)');
console.log('- data: agents-upload-data.json content');
