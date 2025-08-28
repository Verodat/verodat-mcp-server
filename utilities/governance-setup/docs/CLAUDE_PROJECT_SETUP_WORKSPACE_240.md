# Claude Project Setup - Workspace 240

## Quick Setup Instructions

### 1. Add to Claude Project Settings

```json
{
  "mcpServers": {
    "verodat-design": {
      "command": "node",
      "args": ["/Users/thomas/github/verodat/verodat-mcp-server/build/src/design.js"]
    },
    "verodat-manage": {
      "command": "node",
      "args": ["/Users/thomas/github/verodat/verodat-mcp-server/build/src/manage.js"]
    },
    "verodat-consume": {
      "command": "node",
      "args": ["/Users/thomas/github/verodat/verodat-mcp-server/build/src/consume.js"]
    }
  }
}
```

### 2. Project Instructions

Add this to your Claude project instructions:

```
Account: 130
Workspace: 240

Dataset IDs (PUBLISHED):
- Core_RAIDA: 5593
- Business_Policies_Ops: 5594
- AI_Agent_Procedures_Ops: 5595
- AI_Agent_Identity_Ops: 5596
- AI_Data_Model_Registry: 5597
- AI_Model_Change_Log: 5598

Configuration Policy: POL-CLAUDE-CONFIG

First action: Read POL-CLAUDE-CONFIG from Business_Policies_Ops (dataset 5594)
This policy contains all operating instructions.
```

## Testing Your Setup

### Step 1: Verify MCP Connection
**Ask Claude:** "List available MCP servers"

**Expected Response:**
```
Available MCP servers:
- verodat-design
- verodat-manage
- verodat-consume
```

### Step 2: Read Configuration Policy
**Ask Claude:** "Read POL-CLAUDE-CONFIG from Business_Policies_Ops in workspace 240"

**Expected Response:**
- Policy with trust indicators, procedures, and operating instructions
- Shows 🟢 or 🔴 trust indicator

### Step 3: Test Read Operation
**Ask Claude:** "Show me all procedures in workspace 240"

**Expected Response:**
- List of 8 procedures including:
  - PROC-GMV-DAILY-BRIEFING
  - PROC-CREATE-DATASET
  - PROC-UPDATE-RAIDA-STATUS
  - PROC-EXPORT-DATA-V1
  - And others...

### Step 4: Test GMV Command
**Ask Claude:** "GMV"

**Expected Response:**
```
Good Morning Verodat! 🌅

📋 Pending RAIDAs:
  • RAIDA-BOOTSTRAP-001: Bootstrap complete [Done]
  
📊 Dataset Status:
  • Core_RAIDA: 1 entry
  • Business_Policies_Ops: 8 policies
  • AI_Agent_Procedures_Ops: 8 procedures
  • AI_Agent_Identity_Ops: 6 agents
  
🟢 Governance Status: Active
```

### Step 5: Test Trust Indicators
**Ask Claude:** "Create a test RAIDA entry 'Test Claude integration'"

**Expected Response:**
- Should attempt to create RAIDA
- Shows trust indicator (🟢 if using procedure, 🔴 if using design tier)
- Returns created RAIDA details

## Success Checklist

✅ **MCP Servers Connected**
- All three servers respond to queries

✅ **Policy Readable**
- POL-CLAUDE-CONFIG successfully retrieved
- Contains configuration instructions

✅ **Data Access Working**
- Can query all datasets
- Returns actual data

✅ **Trust Indicators Active**
- 🟢 shows for governed operations
- 🔴 shows for ungoverned operations
- ❌ shows for blocked operations

✅ **Commands Working**
- GMV command produces briefing
- RAIDA commands create/update entries

## Troubleshooting

### "Not connected" Error
1. Restart Claude
2. Check MCP server paths are correct
3. Ensure `npm run build` was executed in verodat-mcp-server directory

### "PROCEDURE_REQUIRED" Error
- Use verodat-design server for bootstrap operations
- Or start a procedure first with verodat-manage

### Cannot Find Policy
- Ensure you're querying dataset 5594 (Business_Policies_Ops)
- Use filter: "vscope=PUBLISHED and vstate=ACTIVE"

### No Data Returned
- Check you're using PUBLISHED dataset IDs (5593-5598)
- Not the DRAFT IDs (5581-5586)

## What POL-CLAUDE-CONFIG Contains

The policy provides:
1. **Trust Indicators** - How to interpret 🟢 🔴 ❌
2. **Server Tiers** - When to use design/manage/consume
3. **Available Procedures** - List of all procedures
4. **Commands** - GMV, RAIDA management
5. **Write Operations** - How to use procedures
6. **Error Handling** - Common issues and solutions

## Complete Test Script

Run these commands in sequence to verify everything works:

```
1. "Check MCP servers"
2. "Read POL-CLAUDE-CONFIG from dataset 5594 in workspace 240"  
3. "List all procedures in workspace 240"
4. "GMV"
5. "Show me the agents in workspace 240"
6. "Create a RAIDA: Test integration complete"
```

If all 6 commands work, your setup is complete!

## Important Notes

- **Always use PUBLISHED dataset IDs** (5593-5598)
- **Read operations are always free** - no procedures needed
- **Write operations need procedures** (except on design tier)
- **POL-CLAUDE-CONFIG is your source of truth** - it contains the latest configuration

## Support

- Policy Owner: Thomas Russell
- Technical Owner: Sally O'Brien
- Workspace: 240 (Governance-test)
- Account: 130 (Verodat)
