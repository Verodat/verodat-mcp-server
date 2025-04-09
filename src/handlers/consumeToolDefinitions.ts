import { ToolDefinition } from "./BaseToolHandler.js";

export const ConsumeToolDefinitions: Record<string, ToolDefinition> = {
    "get-datasets": {
        name: "get-datasets",
        description: `WHEN TO USE:
        - When viewing all available datasets in a workspace for data consumption
        - When checking if specific datasets exist for analysis
        - When you need to know the last update time of datasets before consuming data
        - For identifying published datasets that are ready for consumption
        - Before performing queries or data analysis operations
        - Use default filter = 'vscope=PUBLISHED and vstate=ACTIVE' when filter is not available from request
        
        Tool Description:
        Retrieves available datasets from a workspace for data consumption purposes.
        
        Required parameters:
        - workspaceId: Workspace ID to query
        - accountId: accountId where workspace is located
        - filter: vscope and vstate value
        
        Optional parameters:
        - max: Maximum records to return (default: 9999)
        - offset: Pagination offset (default: 0)
        
        Common filter patterns:
        - Published & Active: "vscope=PUBLISHED and vstate=ACTIVE"
        
        Example usage:
        Getting active published datasets:
        {
          "accountId": 123,
          "workspaceId": 123,
          "filter": "vscope=PUBLISHED and vstate=ACTIVE"
        }`,
        inputSchema: {
            type: "object",
            properties: {
                workspaceId: {
                    type: "number",
                    description: "Workspace ID to get datasets from",
                },
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs",
                },
                offset: {
                    type: "number",
                    description: "Offset for pagination",
                    default: 0
                },
                max: {
                    type: "number",
                    description: "Maximum number of datasets to return",
                    default: 9999
                },
                filter: {
                    type: "string",
                    description: "Filter string for datasets",
                    default: "vscope=PUBLISHED and vstate=ACTIVE"
                }
            },
            required: ["workspaceId", "accountId", "filter"],
        },
    },
    
    "get-dataset-output": {
        name: "get-dataset-output",
        description: `WHEN TO USE:
        - When analyzing data for reporting or visualization
        - When you need to read and consume actual data stored in a dataset
        - When validating data quality or completeness before analysis
        - When searching for specific records within a dataset for consumption
        - When filtering data for specific analysis needs
        - Use default filter = 'vscope=PUBLISHED and vstate=ACTIVE' for consumption operations
        
        Tool Description:
        Retrieves actual data records from a dataset for consumption and analysis purposes.
        
        Required parameters:
        - datasetId: dataset ID to get data output for
        - workspaceId: Workspace ID to query
        - accountId: where workspace is located
        - filter: vscope and vstate value
        
        Optional parameters:
        - max: Maximum records (default: 9999)
        - offset: Pagination offset (default: 0)
        
        Example usage:
        Getting customer data for analysis:
        {
          "accountId": 123,
          "workspaceId": 123,
          "datasetId": 456,
          "filter": "vscope=PUBLISHED and vstate=ACTIVE",
          "max": 1000
        }`,
        inputSchema: {
            type: "object",
            properties: {
                workspaceId: {
                    type: "number",
                    description: "Workspace ID",
                },
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs",
                },
                datasetId: {
                    type: "number",
                    description: "Dataset ID to fetch output from",
                },
                offset: {
                    type: "number",
                    description: "Offset for pagination",
                    default: 0
                },
                max: {
                    type: "number",
                    description: "Maximum number of records to return",
                    default: 9999
                },
                filter: {
                    type: "string",
                    description: "Filter string for output data",
                    default: "vscope=PUBLISHED and vstate=ACTIVE"
                }
            },
            required: ["workspaceId", "datasetId", "filter", "accountId"],
        },
    },
    
    "get-accounts": {
        name: "get-accounts",
        description: `WHEN TO USE:
        - At the start of consumption operations to identify available accounts
        - When needing to select an account for data analysis
        - When validating user access permissions for data consumption
        - When displaying account selection options to users before data analysis
        - When needing the account ID for other consumption operations
        
        Tool Description:
        Retrieves available accounts for the authenticated user to select for data consumption activities.
        `,
        inputSchema: {
            type: "object",
            properties: {
            },
            required: [""],
        },
    },
    
    "get-workspaces": {
        name: "get-workspaces",
        description: `WHEN TO USE:
        - After selecting an account to view available workspaces for consumption
        - When switching between different workspaces for data analysis
        - When validating workspace access permissions for data consumption
        - Before performing dataset operations that require workspace ID
        - When displaying workspace selection options to users
        
        Tool Description:
        Lists all workspaces within a specified account available for data consumption.
        
        Required parameters:
        - accountId: Target account ID
        
        Example usage:
        {
          "accountId": 123
        }`,
        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "Account ID to get workspaces from",
                }
            },
            required: ["accountId"],
        },
    },
    
    "get-dataset-targetfields": {
        name: "get-dataset-targetfields",
        description: `WHEN TO USE:
        - When you need to understand the structure of a dataset before consumption
        - When validating field types before running analysis
        - When planning queries and need to know available fields
        - When you need to understand which fields are required for analysis
        - When reviewing field descriptions to properly interpret data
        
        Tool Description:
        Retrieves target fields configuration for a specific dataset to understand its structure for consumption.
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID containing the dataset
        - datasetId: Dataset ID to fetch target fields from
        
        Optional parameters:
        - max: Maximum records to return (default: 1000)
        - offset: Pagination offset (default: 0)
        - filter: Filter string with prefix 'name contains ' for target fields
        - sort: Sort criteria with optional direction
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 178,
          "datasetId": 3328,
          "filter": "name contains 'count'",
          "sort": "name,asc"
        }`,
        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs",
                },
                workspaceId: {
                    type: "number",
                    description: "Workspace ID containing the dataset",
                },
                datasetId: {
                    type: "number",
                    description: "Dataset ID to fetch target fields from",
                },
                offset: {
                    type: "number",
                    description: "Offset for pagination",
                    default: 0
                },
                max: {
                    type: "number",
                    description: "Maximum number of records to return",
                    default: 1000
                },
                filter: {
                    type: "string",
                    description: "Filter string for target fields"
                },
                sort: {
                    type: "string",
                    description: "Sort criteria with optional direction"
                }
            },
            required: ["workspaceId", "datasetId", "accountId"],
        },
    },
    
    "get-queries": {
        name: "get-queries",
        description: `WHEN TO USE:
        - When looking for existing queries to re-use for data analysis
        - When checking common analysis patterns used in the workspace
        - When reviewing historical queries for data consumption
        - When you need ideas for new analyses based on existing queries
        
        Tool Description:
        Retrieves existing AI queries that can be used for data consumption and analysis.
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID to get queries from
        
        Optional parameters:
        - max: Maximum records to return (default: 10)
        - offset: Pagination offset (default: 0)
        - filter: Filter string for specific query content
        - sort: Sort criteria with direction
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 187,
          "max": 10,
          "sort": "usageCount desc",
          "filter": "question CONTAINS 'sales'"
        }`,
        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs",
                },
                workspaceId: {
                    type: "number",
                    description: "Workspace ID to get queries from"
                },
                offset: {
                    type: "number",
                    description: "Offset for pagination",
                    default: 0
                },
                max: {
                    type: "number",
                    description: "Maximum number of queries to return",
                    default: 10
                },
                filter: {
                    type: "string",
                    description: "Filter string for queries"
                },
                sort: {
                    type: "string",
                    description: "Sort criteria with direction"
                }
            },
            required: ["accountId", "workspaceId"]
        }
    },

    "get-ai-context": {
        name: "get-ai-context",
        description: `WHEN TO USE:
        - Before executing AI queries to understand available data structure
        - When needing to know the schema of datasets for consumption
        - When planning complex queries across multiple datasets
        - When validating data relationships before analysis
        - When you need comprehensive metadata about workspace structure
        
        Tool Description:
        Retrieves comprehensive workspace context to facilitate effective data consumption and analysis.
        
        Required parameters:
        - workspaceId: Target workspace ID
        - accountId: Account ID
        
        Example usage:
        {
          "workspaceId": 123,
          "accountId": 456
        }`,
        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs",
                },
                workspaceId: {
                    type: "number",
                    description: "Workspace ID to get context from",
                }
            },
            required: ["workspaceId", "accountId"],
        },
    },
    
    "execute-ai-query": {
        name: "execute-ai-query",
        description: `WHEN TO USE:
        - When performing ad-hoc data analysis and exploration
        - When generating reports from complex data relationships
        - When you need quick insights without writing complex SQL
        - When analyzing trends across datasets
        - When filtering and aggregating data for specific insights
        
        Tool Description:
        Executes AI-powered queries on datasets for data consumption and analysis.
        
        Required parameters:
        - accountId: Account ID
        - workspaceId: Workspace ID
        - query: SQL query to execute (e.g. SELECT product_name FROM products ORDER BY price DESC LIMIT 10)
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "query": "SELECT customer_name, SUM(order_value) FROM orders GROUP BY customer_name ORDER BY SUM(order_value) DESC LIMIT 5"
        }`,
        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs",
                },
                workspaceId: {
                    type: "number",
                    description: "Workspace ID where to execute the query",
                },
                query: {
                    type: "string",
                    description: "The AI query to execute",
                }
            },
            required: ["accountId", "workspaceId", "query"],
        },
    }
};