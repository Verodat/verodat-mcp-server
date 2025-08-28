import fs from 'fs';

// Load bootstrap bundle
const bundle = JSON.parse(fs.readFileSync('workspace_bootstrap_bundle.json', 'utf8'));

// Extract policies with lowercase field names for proper mapping
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
    rows: bundle.policies.map(policy => [
      policy.policy_id,
      policy.title,
      policy.purpose,
      policy.applies_to,
      policy.rules,
      policy.policy_owner,
      policy.policy_status
    ])
  }
];

console.log(JSON.stringify(policyData, null, 2));
