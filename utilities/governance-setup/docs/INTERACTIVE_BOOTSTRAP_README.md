# Interactive Workspace Bootstrap Guide

## Overview

The `raida-bootstrap-interactive.cjs` script provides a fully interactive way to bootstrap Verodat workspaces with complete governance structures. Unlike the hardcoded version, this script:

- Dynamically fetches available accounts
- Lets you select the target workspace
- Guides you through the promotion process
- Tracks progress with RAIDA updates

## Prerequisites

1. **Build the project first:**
   ```bash
   npm run build
   ```

2. **Ensure you have access to at least one Verodat account**

## Running the Interactive Bootstrap

### Option 1: Using the Shell Script
```bash
./run-interactive-bootstrap.sh
```

### Option 2: Direct Node Execution
```bash
node raida-bootstrap-interactive.cjs
```

## The Interactive Process

### Phase 1: Selection
1. **Account Selection**
   - Script fetches all available accounts
   - You select from a numbered list
   - Example:
     ```
     SELECT ACCOUNT:
     ────────────────────────────────────────────────────────────
     1. Verodat (ID: 130)
     2. Test Account (ID: 131)
     
     Enter number: 1
     ```

2. **Workspace Selection**
   - Script fetches workspaces for selected account
   - You select target workspace
   - Example:
     ```
     SELECT WORKSPACE:
     ────────────────────────────────────────────────────────────
     1. Governance-test (ID: 240)
     2. Production (ID: 241)
     
     Enter number: 1
     ```

3. **Confirmation**
   - Review your selections
   - Confirm to proceed

### Phase 2: Dataset Creation
The script automatically creates all governance datasets in DRAFT:
- `Core_RAIDA` - RAIDA tracking system
- `Business_Policies_Ops` - Governance policies
- `AI_Agent_Procedures_Ops` - Operational procedures  
- `AI_Agent_Identity_Ops` - Agent configurations

Each dataset is created with appropriate fields and the script captures the dataset IDs dynamically.

### Phase 3: Manual Promotion
After dataset creation, you'll see:
```
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

Press ENTER when ALL datasets have been promoted to PUBLISHED...
```

**IMPORTANT:** You must manually promote all datasets in the Verodat UI before continuing.

### Phase 4: Data Loading
Once datasets are promoted, the script loads:
- Bootstrap RAIDAs for tracking
- 7 Governance policies
- 8 Operational procedures
- 6 Agent configurations

## Features

### Dynamic Dataset ID Tracking
The script automatically captures dataset IDs as they're created, eliminating the need for hardcoded values:
```javascript
const datasetIds = {
  coreRaida: null,    // Populated dynamically
  policies: null,     // Populated dynamically
  procedures: null,   // Populated dynamically
  agents: null        // Populated dynamically
};
```

### Real-time RAIDA Status Updates
Throughout the process, RAIDA entries are updated:
- `In Progress` when starting a task
- `Done` when completed successfully
- `To Do` if a task fails

### Error Handling
- Graceful handling of API failures
- Clear error messages
- Ability to continue despite individual failures

## Success Indicators

Upon successful completion, you'll see:
```
╔════════════════════════════════════════════════════════════╗
║                    BOOTSTRAP COMPLETE                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Account: 130                                              ║
║  Workspace: 240                                            ║
║                                                            ║
║  ✅ All governance structures have been loaded            ║
║  ✅ Data is in PUBLISHED datasets                         ║
║  ✅ RAIDA tracking is active                              ║
║  ✅ Procedures are available for operations               ║
║  ✅ Policies are enforced                                 ║
║                                                            ║
║  Dataset IDs Created:                                     ║
║  • Core_RAIDA: 5568                                       ║
║  • Business_Policies_Ops: 5576                            ║
║  • AI_Agent_Procedures_Ops: 5577                          ║
║  • AI_Agent_Identity_Ops: 5578                            ║
║                                                            ║
║  Next Steps:                                              ║
║  1. Test GMV command for daily briefings                  ║
║  2. Create new RAIDAs for ongoing work                    ║
║  3. Monitor procedure execution logs                      ║
║  4. Use Cline/Claude with generated instructions          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Testing After Bootstrap

1. **Test Three-Tier Architecture:**
   ```bash
   node test-three-tier-pop.js
   ```

2. **Verify MCP JSON Protocol:**
   ```bash
   node test-mcp-json-protocol.js
   ```

3. **Test in Cline/Claude:**
   - Connect the MCP servers
   - Try the GMV command
   - Create a test RAIDA

## Troubleshooting

### "No accounts available"
- Verify your Verodat credentials
- Check network connectivity
- Ensure MCP servers are built

### Dataset creation fails
- Check for duplicate dataset names
- Verify workspace permissions
- Review error messages for field mapping issues

### Promotion not working
- Ensure all datasets are promoted to PUBLISHED
- Check Verodat UI for any validation errors
- Datasets must go through: DRAFT → STAGE → PUBLISHED

### Data loading fails
- Verify datasets are in PUBLISHED state
- Check field mappings match dataset schema
- Review bundle data for formatting issues

## Advanced Usage

### Custom Bundle Data
To use a different governance bundle:
```javascript
// In raida-bootstrap-interactive.cjs
const bundlePath = path.join(__dirname, 'your-custom-bundle.json');
```

### Skipping Failed Steps
The script continues even if individual steps fail, allowing partial setup completion.

### Re-running the Bootstrap
You can re-run the script on an already bootstrapped workspace - it will update existing data.

## Related Scripts

- `raida-bootstrap-with-promotion.cjs` - Hardcoded version for specific workspace
- `workspace-onboarding-flow.js` - Alternative onboarding approach
- `test-three-tier-pop.js` - Validates governance enforcement
- `workspace_bootstrap_bundle.json` - Source governance data

## Support

For issues or questions:
1. Check the terminal output for specific error messages
2. Review the Verodat UI for dataset states
3. Verify MCP server connectivity
4. Consult the main README for architecture details
