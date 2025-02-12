# Verodat MCP Server 
[![MCP](https://img.shields.io/badge/MCP-Server-blue.svg)](https://github.com/modelcontextprotocol)

## Overview
A Model Context Protocol (MCP) server implementation for [Verodat](https://verodat.io), enabling seamless integration of Verodat's data management capabilities with AI systems like Claude Desktop.

![image](https://github.com/user-attachments/assets/ec26c3e1-077f-46bb-915d-690cfde0833e)

## Features

- **Account & Workspace Management**
  - List accessible accounts
  - Browse workspaces within accounts
  
- **Dataset Operations**
  - Create datasets with custom schemas and validation
  - Query and filter datasets
  - Retrieve dataset records
  
- **AI Integration**
  - Fetch workspace context for AI processing
  - Execute AI-powered queries on datasets

## Prerequisites

- Node.js (v18 or higher)
- Git
- Claude Desktop (for Claude integration)
- Verodat account and AI API key

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/Verodat/verodat-mcp-server.git
   cd verodat-mcp-server
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Configure Claude Desktop:

   Create or modify the config file:
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`

   Add the following configuration:
   ```json
          {
            "mcpServers": {
              "verodat-consumer": {
                "command": "node",
                "args": ["addlocalpath\\verodat-mcp-server\\build\\src\\consume.js"],
                "env": {
                  "VERODAT_AI_API_KEY": "API-KEY",
                  "NODE_ENV": "development"
                }
              },
              "verodat-design": {
                "command": "node",
                "args": ["addlocalpath\\verodat-mcp-server\\build\\src\\design.js"],
                "env": {
                  "VERODAT_AI_API_KEY": "API-KEY",
                  "NODE_ENV": "development"
                }
              },
              "verodat-manage": {
                "command": "node",
                "args": ["addlocalpath\\verodat-mcp-server\\build\\src\\manage.js"],
                "env": {
                  "VERODAT_AI_API_KEY": "API-KEY",
                  "NODE_ENV": "development"
                }
              }
            }
          }
   ```

## Getting Started with Verodat

1. Sign up for a Verodat account at [verodat.com](https://verodat.com)
2. Generate an AI API key from your Verodat dashboard
3. Add the API key to your Claude Desktop configuration
4. Subject to your verodat license you will have access to the specific MCP commands grouped below.

## Available Commands

Commands are scoped into three groups:
* Consume - Enables you to consume verodat data and its properties
* Design - Enabels you to design and manage your verodat DWH
* Manage - Enables you to setup and manage the data supply to your verodat data layer.

The server provides the following MCP commands:
### Consume
#### Overview: 
Enables the consumption of Verodat data (including third-party datasets vended through Verodat). Provides context on supply status and provenance.
```typescript
// Account & Workspace Management
get-accounts        // List accessible accounts
get-workspaces     // List workspaces in an account

// Dataset Operations
create-dataset     // Create a new dataset
get-datasets      // List datasets in a workspace
get-dataset-output // Retrieve dataset records

// AI Operations
get-ai-context     // Get workspace AI context
execute-ai-query   // Run AI queries on datasets
```
### Design
#### Overview: 
Enables a user to design and create/update their Verodat data model.


// Account & Workspace Management
get-accounts        // List accessible accounts
get-workspaces     // List workspaces in an account

// Dataset Operations
get-datasets      // List datasets in a workspace
get-dataset-output // Retrieve dataset records

// AI Operations
get-ai-context     // Get workspace AI context
execute-ai-query   // Run AI queries on datasets

### Manage
#### Overview: 
Enables a user to set up and manage a data supply chain feeding a target data model.

// Account & Workspace Management
get-accounts        // List accessible accounts
get-workspaces     // List workspaces in an account

// Dataset Operations
get-datasets      // List datasets in a workspace
get-dataset-output // Retrieve dataset records

// AI Operations
get-ai-context     // Get workspace AI context
execute-ai-query   // Run AI queries on datasets

Account/User Management APIs:
GET /api/account/me - Get current user details

Asset Management APIs:
GET /api/assets - List all assets
POST /api/assets - Create new asset
GET /api/assets/{id} - Get asset details
PUT /api/assets/{id} - Update asset
DELETE /api/assets/{id} - Delete asset
GET /api/assets/{id}/audit - Get asset audit trail

Workspace Management APIs:
GET /api/workspaces - List workspaces
POST /api/workspaces - Create workspace
GET /api/workspaces/{id} - Get workspace details
PUT /api/workspaces/{id} - Update workspace
GET /api/workspaces/{id}/secrets - Get workspace secrets

Data Management APIs:
GET /api/datasets - List datasets
POST /api/datasets - Create dataset
GET /api/datasets/{id} - Get dataset details
PUT /api/datasets/{id} - Update dataset
DELETE /api/datasets/{id} - Delete dataset
GET /api/datasets/{id}/versions - List dataset versions

File Operations APIs:
POST /api/files/upload - Upload file
GET /api/files/{id} - Download file
DELETE /api/files/{id} - Delete file
GET /api/files/{id}/config - Get file configuration

Mapping & Transformation APIs:
GET /api/mappings - List mappings
POST /api/mappings - Create mapping
GET /api/mappings/{id} - Get mapping details
PUT /api/mappings/{id} - Update mapping
POST /api/mappings/validate - Validate mapping

Connector APIs:
GET /api/connectors - List available connectors
POST /api/connections - Create connection
GET /api/connections/{id} - Get connection details
PUT /api/connections/{id} - Update connection
DELETE /api/connections/{id} - Delete connection

Schedule & Automation APIs:
GET /api/schedules - List schedules
POST /api/schedules - Create schedule
GET /api/schedules/{id} - Get schedule details
PUT /api/schedules/{id} - Update schedule
DELETE /api/schedules/{id} - Delete schedule

AI Context APIs:
POST /api/ai/query - Execute AI query
POST /api/ai/models - Create AI model
GET /api/ai/models/{id} - Get model details
PUT /api/ai/models/{id} - Update model
POST /api/ai/instructions - Create AI instruction

Validation APIs:
GET /api/validations - List validation rules
POST /api/validations - Create validation rule
GET /api/validations/{id} - Get validation details
POST /api/validations/execute - Execute validation

Audit & Monitoring APIs:
GET /api/audit/events - List audit events
GET /api/audit/assets/{id} - Get asset audit events
GET /api/audit/users/{id} - Get user audit events

KPI & Metrics APIs:
GET /api/kpi/dashboard - Get overdue data requests

Supplier Group APIs:
GET /api/supplier-groups - List supplier groups
POST /api/supplier-groups - Create supplier group
GET /api/supplier-groups/{id} - Get supplier group details
PUT /api/supplier-groups/{id} - Update supplier group




## Debugging

The MCP server communicates over stdio, which can make debugging challenging. We provide an MCP Inspector tool to help:

```bash
npm run inspector
```

This will provide a URL to access debugging tools in your browser.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

[LICENSE](LICENSE) file for details

## Support

- Documentation: [Verodat Docs](https://verodat.io/docs)
- Issues: [GitHub Issues](https://github.com/Verodat/verodat-mcp-server/issues)
- Community: [Verodat Community](https://github.com/orgs/Verodat/discussions)

---
