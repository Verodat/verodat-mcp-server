#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load bootstrap bundle
const bundlePath = path.join(__dirname, 'workspace_bootstrap_bundle.json');
const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));

// Extract procedures from bundle
const procedures = bundle.procedures;

// Format procedures for upload with ALL fields (lowercase)
const formatProceduresForUpload = () => {
  const header = [
    { name: "procedure_id", type: "string" },
    { name: "name", type: "string" },
    { name: "description", type: "string" },
    { name: "trigger_type", type: "string" },
    { name: "trigger_condition", type: "string" },
    { name: "steps", type: "string" },
    { name: "required_roles", type: "string" },
    { name: "output_format", type: "string" },
    { name: "notifications", type: "string" },
    { name: "version", type: "string" },
    { name: "status", type: "string" },
    { name: "created_by", type: "string" },
    { name: "created_date", type: "date" },
    { name: "modified_by", type: "string" },
    { name: "modified_date", type: "date" }
  ];

  const rows = procedures.map(proc => [
    proc.procedure_id,
    proc.title || proc.procedure_id,  // Use title as name
    proc.purpose || "",  // Use purpose as description
    "Manual",  // Default trigger_type
    proc.triggers || "",  // Use triggers as trigger_condition
    proc.steps || "",  // Steps as string (already a string)
    null,  // required_roles
    null,  // output_format
    null,  // notifications
    "1.0",  // Default version
    proc.procedure_status || "Active",  // Use procedure_status as status
    proc.procedure_owner || "verodat",  // Use procedure_owner as created_by
    new Date().toISOString(),  // Current date as created_date
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

// Display procedures summary
console.log('\n=== AI Agent Procedures to Load ===\n');
procedures.forEach(proc => {
  console.log(`${proc.procedure_id}: ${proc.title}`);
  console.log(`  Purpose: ${proc.purpose}`);
  console.log(`  Triggers: ${proc.triggers}`);
  console.log(`  Status: ${proc.procedure_status}\n`);
});

console.log(`Total procedures to load: ${procedures.length}`);

// Format data for upload
const uploadData = formatProceduresForUpload();

// Save formatted data for reference
const outputPath = path.join(__dirname, 'procedures-upload-data.json');
fs.writeFileSync(outputPath, JSON.stringify(uploadData, null, 2));

console.log('\n✅ Procedures data prepared and saved to procedures-upload-data.json');
console.log('\nNext step: Use verodat-manage upload-dataset-rows with:');
console.log('- accountId: 130');
console.log('- workspaceId: 240');
console.log('- datasetId: 5577 (AI_Agent_Procedures_Ops)');
console.log('- data: procedures-upload-data.json content');
