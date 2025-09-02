# Bootstrap Verodat Governance Framework - Cline Instructions

## Quick Start Command (MCP-Native)

Execute the MCP-native bootstrap process directly within Cline:

**Method 1: Direct MCP Tool Execution**
- Use Cline's MCP tools directly for interactive bootstrap
- No terminal commands required
- Real-time RAIDA tracking

**Method 2: Enhanced Script (Future)**
```bash
cd utilities/governance-setup/bootstrap
node raida-bootstrap-mcp-native.cjs
```

## What Will Happen (MCP-Native Process)

1. **Interactive Selection via Cline**
   - Use `get-accounts` MCP tool to view available accounts
   - Use `get-workspaces` to select target workspace
   - Confirm selection within Cline interface

2. **Phase 1: Dataset Creation (DRAFT)**
   - Creates 6 governance datasets in DRAFT scope using `create-dataset`:
     - Core_RAIDA (tracking system)
     - AI_Data_Model_Registry (dataset relationships)
     - AI_Model_Change_Log (schema changes)
     - Business_Policies_Ops (policies)
     - AI_Agent_Procedures_Ops (procedures)
     - AI_Agent_Identity_Ops (agent configurations)

3. **Phase 2: Manual Promotion**
   - Cline displays dataset IDs from MCP responses
   - User manually promotes each dataset in Verodat UI:
     - DRAFT → STAGE → PUBLISHED
   - Confirmation via `ask_followup_question` in Cline

4. **Phase 3: Data Loading with Real-Time RAIDA Tracking**
   - Uses `upload-dataset-rows` MCP tool for all data:
     - 12 RAIDA tracking entries (with accurate status)
     - 9 governance policies (including POL-GOVERNANCE-OPTIMIZATION)
     - 11 procedures (including VERA orchestration procedures)
     - 7 agent configurations (including AGENT-VERA)
   - Updates RAIDA status in real-time as each step completes

5. **Phase 4: Validation & Claude Instructions Generation**
   - Validates data accessibility via `get-dataset-output`
   - Automatically generates Claude project instructions
   - Saves to: `CLAUDE_PROJECT_SETUP_WORKSPACE_[ID].md`
   - Tests GMV command functionality

## What's Being Installed

### New Orchestration Components
- **AGENT-VERA**: Governance Orchestrator that creates missing governance
- **PROC-ORCHESTRATE-GOVERNANCE**: Coordinates governance creation
- **PROC-BUILD-POLICY**: Creates new policies on-demand
- **PROC-BUILD-PROCEDURE**: Builds procedures from policies
- **POL-GOVERNANCE-OPTIMIZATION**: 75% similarity detection for deduplication

### Existing Core Components
- 6 specialist agents for workspace management
- 8 operational procedures (GMV, CREATE-DATASET, etc.)
- 8 governance policies

## Expected Output

After successful completion, you'll receive:

1. **Dataset IDs** for all created datasets
2. **Claude Project Instructions** containing:
   ```
   Verodat Account: [AccountID]
   Workspace: [WorkspaceID]
   
   Dataset IDs (PUBLISHED):
   - Core_RAIDA: [ID]
   - Business_Policies_Ops: [ID]
   - AI_Agent_Procedures_Ops: [ID]
   - AI_Agent_Identity_Ops: [ID]
   
   Configuration Policy: POL-CLAUDE-CONFIG
   
   First action: Read POL-CLAUDE-CONFIG from Business_Policies_Ops
   ```

## Verification Steps

After bootstrap completes:

1. **Verify all 6 datasets are PUBLISHED**
   - Use Cline MCP tool: `get-datasets` with filter "vstate=ACTIVE"

2. **Check Claude instructions file was created**
   - Look for `CLAUDE_PROJECT_SETUP_WORKSPACE_[ID].md` in docs directory

3. **Test GMV command functionality**
   - Copy Claude instructions to Claude project
   - Execute "GMV" command to test daily briefing

4. **Validate RAIDA tracking accuracy**
   - All bootstrap tasks should show "Done" status
   - No "To Do" or "In Progress" entries remaining

5. **Test VERA orchestration (Optional)**
   - Attempt WRITE operation without procedure to trigger governance creation

## Testing Orchestration

Once bootstrap is complete, test the orchestration system:

1. **Test Missing Procedure Handling**
   - Use Manage server to attempt a WRITE without a procedure
   - System should trigger VERA orchestration
   - New governance should be created automatically

2. **Test GMV Command** (if implementing Claude integration)
   - Add instructions to Claude project
   - Test "GMV" command for daily briefing

## Troubleshooting

- **Datasets not created**: Check account/workspace permissions
- **Data upload fails**: Ensure datasets are PUBLISHED, not DRAFT
- **Instructions not generated**: Check write permissions in docs directory

## Success Indicators

✅ All 6 datasets created with IDs  
✅ All datasets promoted to PUBLISHED  
✅ All governance data uploaded successfully  
✅ RAIDA tracking shows accurate completion status  
✅ Claude instructions file generated  
✅ GMV command operational  
✅ VERA orchestration agent is active  
✅ Data accessible via consume server  

## Key Improvements (MCP-Native Approach)

✅ **No Terminal Dependencies**: Runs entirely within Cline using MCP tools  
✅ **Real-Time RAIDA Tracking**: Status updates as each step completes  
✅ **Better Error Handling**: Proper governance framework validation  
✅ **Accurate Status Reporting**: RAIDA entries reflect actual completion  
✅ **Comprehensive Validation**: Data accessibility testing included  

## Next Steps After Bootstrap

1. Copy Claude instructions to your Claude project knowledge
2. Test orchestration by attempting WRITE operations without procedures
3. Verify VERA creates governance on-demand
4. Monitor Core_RAIDA for governance creation tracking
