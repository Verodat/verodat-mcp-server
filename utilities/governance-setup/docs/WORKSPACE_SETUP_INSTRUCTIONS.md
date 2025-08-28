# Verodat Workspace Setup - Cline Instructions

## Trigger Phrases
When a user says any of these (or similar):
- "I want to set up a governed workspace"
- "Set up a Verodat workspace"
- "Bootstrap a new workspace"
- "Initialize workspace governance"
- "Create a governed Verodat workspace"

## Response Flow

### Step 1: Initial Recognition
Respond with:
```
I'll help you set up a governed Verodat workspace with complete bootstrap capabilities. This process will:
- Configure your workspace with governance policies
- Set up RAIDA tracking for all operations
- Install procedures for controlled access
- Configure AI agent permissions

Let me start by checking your available accounts...
```

### Step 2: Account Selection
1. Use MCP tool `get-accounts` from verodat-design server
2. Display accounts as numbered list
3. Ask user to select by number
4. Store selected accountId

### Step 3: Workspace Selection  
1. Use MCP tool `get-workspaces` from verodat-design server with accountId
2. Display workspaces as numbered list
3. Ask user to select by number
4. Store selected workspaceId

### Step 4: Confirmation
Show what will be created:
```
Ready to set up governance for:
- Account: [ID] - [Name]
- Workspace: [ID] - [Name]

This will create:
✓ Core_RAIDA dataset for operation tracking
✓ 7 vision-aligned governance policies
✓ 8 operational procedures (including GMV, RAIDA management)
✓ 6 specialized AI agent configurations

Proceed with setup? (yes/no)
```

### Step 5: Execute Bootstrap
If user confirms, run: `node workspace-onboarding-flow.js --accountId [ID] --workspaceId [ID]`

Show progress updates:
- ⏳ Creating Core_RAIDA dataset...
- ⏳ Loading governance policies...
- ⏳ Configuring procedures...
- ⏳ Setting up AI agents...
- ⏳ Executing bootstrap...
- ⏳ Generating instructions...

### Step 6: Success Message
```
✅ Workspace governance successfully configured!

Your workspace is now ready with:
- Core_RAIDA tracking active
- Governance policies enforced
- Procedures available for operations
- AI agents configured

Generated files:
- claude-cline-instructions.md (your operational guide)
- workspace-bootstrap-report.txt (setup details)

You can now use commands like:
- "GMV" - Get your daily briefing
- "RAIDA [description]" - Create a new RAIDA task
- "LIST RAIDA" - Show pending tasks

Would you like me to show you the available commands?
```

## Error Handling

### No Accounts Found
```
I couldn't find any Verodat accounts. Please ensure:
1. Your MCP servers are properly configured
2. You have valid API credentials
3. You have access to at least one account

Would you like help troubleshooting the connection?
```

### No Workspaces Found
```
No workspaces found in the selected account. 
Would you like to:
1. Try a different account
2. Create a new workspace first
3. Check your permissions
```

### Bootstrap Fails
```
The bootstrap process encountered an error: [error message]

This might be due to:
- Insufficient permissions
- Network connectivity issues
- Existing governance conflicts

Would you like me to:
1. Try again
2. Run in simulation mode
3. Show detailed error log
```

## MCP Tool Usage

### Required MCP Servers
- **verodat-design**: For bootstrap operations (no governance)
- **verodat-manage**: For governed management operations  
- **verodat-consume**: For governed data operations

### Tools to Use
1. `get-accounts` - List available accounts
2. `get-workspaces` - List workspaces in account
3. `get-datasets` - Check existing datasets
4. `create-dataset` - Create Core_RAIDA
5. `upload-dataset-rows` - Load governance data

## Important Notes

1. **Always use verodat-design server for bootstrap** - It's the only server that allows ungoverned operations
2. **Check for existing Core_RAIDA** - Don't create duplicates
3. **Show progress indicators** - The process takes time
4. **Save all outputs** - Generate report and instructions
5. **Offer next steps** - Guide user on what to do after setup

## Quick Test Command

For testing the setup without full interaction:
```
node workspace-onboarding-flow.js --test
```

This will run a simulated setup to verify everything works.
