# Verodat MCP Server Utilities

This directory contains utilities for managing Verodat workspaces with MCP servers.

## Directory Structure

### governance-setup/
Utilities for setting up and managing workspace governance:

- **bootstrap/** - Interactive bootstrap scripts for setting up governance frameworks
  - `raida-bootstrap-interactive.cjs` - Interactive workspace bootstrap
  - `run-interactive-bootstrap.sh` - Shell script to run the bootstrap
  - `workspace_bootstrap_bundle_v2.json` - Governance data bundle

- **data-loaders/** - Scripts for loading governance data
  - `load-agents.cjs` - Load agent configurations
  - `load-policies.js` - Load business policies
  - `load-procedures.cjs` - Load operational procedures
  - `complete-workspace-setup.cjs` - Complete workspace setup script

- **docs/** - Documentation for governance setup
  - `INTERACTIVE_BOOTSTRAP_README.md` - Interactive bootstrap guide
  - `WORKSPACE_BOOTSTRAP_GUIDE.md` - Complete bootstrap guide
  - `CLAUDE_PROJECT_SETUP_WORKSPACE_240.md` - Claude project setup instructions
  - `THREE_TIER_ARCHITECTURE.md` - Three-tier architecture documentation
  - Additional setup and operational guides

### testing/
Test scripts for validating governance and POP implementation:
- `test-mcp-json-protocol.js` - Test MCP JSON protocol
- `test-pop-audit.js` - Test Proof of Procedure auditing
- `test-three-tier-pop.js` - Test three-tier architecture
- `test-procedure-step-types.cjs` - Test procedure step types

## Usage

### Setting up Governance
```bash
cd utilities/governance-setup/bootstrap
./run-interactive-bootstrap.sh
```

### Running Tests
```bash
node utilities/testing/test-three-tier-pop.js
```

## Key Features

1. **Interactive Bootstrap**: Complete governance framework setup with policies, procedures, and agents
2. **Three-Tier Architecture**: Design, Manage, and Consume servers with trust indicators
3. **POP (Proof of Procedure)**: Governance enforcement for write operations
4. **Claude/Cline Integration**: POL-CLAUDE-CONFIG for dynamic AI assistant configuration

## Documentation

See the docs folder for comprehensive guides on:
- Setting up workspaces
- Configuring Claude projects
- Understanding the three-tier architecture
- Bootstrap procedures

## Trust Indicators

- 🟢 **Governed**: Operation executed with proper procedure
- 🔴 **Ungoverned**: Operation without procedure (design tier only)
- ❌ **Blocked**: Write operation missing required procedure
