[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/verodat-verodat-mcp-server-badge.png)](https://mseep.ai/app/verodat-verodat-mcp-server)

# Verodat MCP Server 
[![MCP](https://img.shields.io/badge/MCP-Server-blue.svg)](https://github.com/modelcontextprotocol)
[![smithery badge](https://smithery.ai/badge/@Verodat/verodat-mcp-server)](https://smithery.ai/server/@Verodat/verodat-mcp-server)

## Overview
A Model Context Protocol (MCP) server implementation for [Verodat](https://verodat.io), enabling seamless integration of Verodat's data management capabilities with AI systems like Claude Desktop.

![image](https://github.com/user-attachments/assets/ec26c3e1-077f-46bb-915d-690cfde0833e)

# Verodat MCP Server

This repository contains a Model Context Protocol (MCP) server implementation for Verodat, allowing AI models to interact with Verodat's data management capabilities through well-defined tools.

## Overview

The Verodat MCP Server provides a standardized way for AI models to access and manipulate data in Verodat. It implements the Model Context Protocol specification, providing tools for data consumption, design, and management.

## Tool Categories

The server is organized into three main tool categories, each offering a progressive set of capabilities:

### 1. Consume (8 tools)

The base category focused on data retrieval operations:

* `get-accounts`: Retrieve available accounts
* `get-workspaces`: List workspaces within an account
* `get-datasets`: List datasets in a workspace
* `get-dataset-output`: Retrieve actual data from a dataset
* `get-dataset-targetfields`: Retrieve field definitions for a dataset
* `get-queries`: Retrieve existing AI queries
* `get-ai-context`: Get workspace context and data structure
* `execute-ai-query`: Execute AI-powered queries on datasets

### 2. Design (9 tools)

Includes all tools from Consume, plus:

* `create-dataset`: Create a new dataset with defined schema

### 3. Manage (10 tools)

Includes all tools from Design, plus:

* `upload-dataset-rows`: Upload data rows to existing datasets

## Prerequisites

* Node.js (v18 or higher)
* Git
* Claude Desktop (for Claude integration)
* Verodat account and AI API key

## Installation

### Quick Start

#### Installing via Smithery

To install Verodat MCP Server for Claude Desktop automatically via Smithery:

```
npx -y @smithery/cli install @Verodat/verodat-mcp-server --client claude
```

#### Manual Installation

1. Clone the repository:

```
git clone https://github.com/Verodat/verodat-mcp-server.git
cd verodat-mcp-server
```

2. Install dependencies and build:

```
npm install
npm run build
```

3. Configure Claude Desktop:
   Create or modify the config file:
   * MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   * Windows: `%APPDATA%/Claude/claude_desktop_config.json`
   
   Add the configuration which is mensioned below in configuration:


### Getting Started with Verodat

1. Sign up for a Verodat account at verodat.com
2. Generate an AI API key from your Verodat dashboard
3. Add the API key to your Claude Desktop configuration

## Configuration

The server requires configuration for authentication and API endpoints. Create a configuration file for your AI model to use:

```json
{
  "mcpServers": {
    "verodat-consume": {
      "command": "node",
      "args": [
        "path/to/verodat-mcp-server/build/src/consume.js"
      ],
      "env": {
        "VERODAT_AI_API_KEY": "your-api-key",
        "VERODAT_API_BASE_URL": "https://verodat.io/api/v3"
      }
    }
  }
}
```

### Configuration Options

You can configure any of the three tool categories by specifying the appropriate JS file one at a time in claude:

* **Consume only**: Use `consume.js` (8 tools for data retrieval)
* **Design capabilities**: Use `design.js` (9 tools, includes dataset creation)
* **Full management**: Use `manage.js` (10 tools, includes data upload)

Example for configuring all three categories simultaneously:

```json
{
  "mcpServers": {
    "verodat-consume": {
      "command": "node",
      "args": [
        "path/to/verodat-mcp-server/build/src/consume.js"
      ],
      "env": {
        "VERODAT_AI_API_KEY": "your-api-key",
        "VERODAT_API_BASE_URL": "https://verodat.io/api/v3"
      }
    },
    "verodat-design": {
      "command": "node",
      "args": [
        "path/to/verodat-mcp-server/build/src/design.js"
      ],
      "env": {
        "VERODAT_AI_API_KEY": "your-api-key",
        "VERODAT_API_BASE_URL": "https://verodat.io/api/v3"
      }
    },
    "verodat-manage": {
      "command": "node",
      "args": [
        "path/to/verodat-mcp-server/build/src/manage.js"
      ],
      "env": {
        "VERODAT_AI_API_KEY": "your-api-key",
        "VERODAT_API_BASE_URL": "https://verodat.io/api/v3"
      }
    }
  }
}
```

### Environment Variables

* `VERODAT_AI_API_KEY`: Your Verodat API key for authentication
* `VERODAT_API_BASE_URL`: The base URL for the Verodat API (defaults to "https://verodat.io/api/v3" if not specified)

## Tool Usage Guide

### Available Commands

The server provides the following MCP commands:

```
// Account & Workspace Management
get-accounts        // List accessible accounts
get-workspaces      // List workspaces in an account
get-queries         // Retrieve existing AI queries

// Dataset Operations
create-dataset      // Create a new dataset
get-datasets        // List datasets in a workspace
get-dataset-output  // Retrieve dataset records
get-dataset-targetfields // Retrieve dataset targetfields
upload-dataset-rows // Add new data rows to an existing dataset

// AI Operations
get-ai-context      // Get workspace AI context
execute-ai-query    // Run AI queries on datasets
```

### Selecting the Right Tool Category

* **For read-only operations**: Use the `consume.js` server configuration
* **For creating datasets**: Use the `design.js` server configuration
* **For uploading data**: Use the `manage.js` server configuration

## Security Considerations

* Authentication is required via API key
* Request validation ensures properly formatted data

## Development

The codebase is written in TypeScript and organized into:

* **Tool handlers**: Implementation of each tool's functionality
* **Transport layer**: Handles communication with the AI model
* **Validation**: Ensures proper data formats using Zod schemas

### Debugging

The MCP server communicates over stdio, which can make debugging challenging. We provide an MCP Inspector tool to help:

```
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
