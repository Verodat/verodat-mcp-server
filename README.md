# Verodat MCP Server 
[![MCP](https://img.shields.io/badge/MCP-Server-blue.svg)](https://github.com/modelcontextprotocol)

![image](https://github.com/user-attachments/assets/ec26c3e1-077f-46bb-915d-690cfde0833e)


A Model Context Protocol (MCP) server implementation for [Verodat](https://verodat.io), enabling seamless integration of Verodat's data management capabilities with AI systems like Claude Desktop.

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
           "verodat": {
               "command": "node",
               "args": ["path/to/verodat-mcp-server/build/src/index.js"],
               "env": {
                   "VERODAT_AI_API_KEY": "your-verodat-ai-api-key"
               }
           }
       }
   }
   ```

## Getting Started with Verodat

1. Sign up for a Verodat account at [verodat.com](https://verodat.com)
2. Generate an AI API key from your Verodat dashboard
3. Add the API key to your Claude Desktop configuration

## Available Commands

The server provides the following MCP commands:

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

## Debugging

The MCP server communicates over stdio, which can make debugging challenging. We provide an MCP Inspector tool to help:

```bash
npm run inspector
```

This will provide a URL to access debugging tools in your browser.

## Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## License

[License Type] - see the [LICENSE](LICENSE) file for details

## Support

- Documentation: [Verodat Docs](https://verodat.io/docs)
- Issues: [GitHub Issues](https://github.com/Verodat/verodat-mcp-server/issues)
- Community: [Verodat Community](https://github.com/orgs/Verodat/discussions)

---
