import { ToolDefinition } from "./BaseToolHandler.js";

export const ToolDefinitions: Record<string, ToolDefinition> = {
    "get-datasets": {
        name: "get-datasets",
        description: `WHEN TO USE:
        - When you need to list all available datasets in a workspace
        - When checking if a specific dataset exists
        - When displaying dataset metadata to users
        - When finding datasets by state (DRAFT/STAGE/PUBLISHED)
        - When you need to know the last update time of datasets
        - Before performing operations that require dataset IDs
        - Use default filter = 'vscope=PUBLISHED and vstate=ACTIVE' when filter is not available from request
        - Use other tools like get-accounts and get-workspaces to retrieve the account and workspace IDs when they are not provided in the request.
        
        Tool Description:
        Retrieves datasets from a workspace with filtering capabilities.
        
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
        Getting draft datasets:
        {
          "accountId": 123,
          "workspaceId": 123,
          "filter": "vscope=DRAFT and vstate=ACTIVE"
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
        - When you need to read actual data stored in a dataset
        - When analyzing data for reporting or visualization
        - When validating data quality or completeness
        - When exporting data for external use
        - When searching for specific records within a dataset
        - When paginating through large datasets
        - When filtering data based on specific criteria
        - Use default filter = 'vscope=PUBLISHED and vstate=ACTIVE' when filter is not available from request
        - Use other tools like get-accounts and get-workspaces to retrieve the account and workspace IDs when they are not provided in the request.
        
        Tool Description:
        Retrieves actual data records from a dataset with filtering and pagination.
        
        Required parameters:
        - datasetId: dataset ID to get data output for
        - workspaceId: Workspace ID to query
        - accountId: where workspace is located
        - filter: vscope and vstate value
        
        Optional parameters:
        - max: Maximum records (default: 9999)
        - offset: Pagination offset (default: 0)
        
        Example usage:
        Getting recent customer records:
        {
          "accountId": 123,
          "workspaceId": 123,
          "datasetId": 456,
          "filter": "vscope=DRAFT and vstate=ACTIVE",
          "max": 9999
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
        - At the start of operations to identify available accounts
        - When switching between different accounts
        - When validating user access permissions
        - When displaying account selection options to users
        - When needing the account ID for other operations
        - Before performing any workspace-related operations
        - When mapping account IDs to account names
        
        Tool Description:
        Retrieves available accounts for the authenticated user.
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
        - After selecting an account to view available workspaces
        - When switching between different workspaces
        - When validating workspace access permissions
        - Before performing dataset operations that require workspace ID
        - When displaying workspace selection options to users
        - When needing to map workspace IDs to workspace names
        
        Tool Description:
        Lists all workspaces within a specified account.
        
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
                - When you need to retrieve and inspect all target fields/columns defined in a dataset
                - When you need to understand the complete schema structure of a dataset
                - When validating field configurations and their data types (string, number, etc.)
                - When checking which fields are mandatory versus optional in the dataset
                - When reviewing field descriptions and metadata
                - When needing to check field properties like isKeyComponent and isCompound
                - When reviewing field naming conventions and SQL names
                
                Tool Description:
                Retrieves target fields configuration for a specific dataset with filtering and sorting capabilities.
                
                Required parameters:
                - accountId: Account ID where the workspace belongs
                - workspaceId: Workspace ID containing the dataset
                - datasetId: Dataset ID to fetch target fields from
                
                Optional parameters:
                - max: Maximum records to return (default: 1000)
                - offset: Pagination offset (default: 0)
                - filter: Filter string with prefix 'name contains ' for target fields (e.g., "name contains 'count'", "name contains 'first'", "name contains 'last'")
                - sort: Sort criteria with optional direction (e.g., "name,asc", "datatype,desc", "description,asc", "mandatory,asc", "isKeyComponent,desc", "isCompound,asc")
                
                Example usage:
                {
                  "accountId": 123,
                  "workspaceId": 178,
                  "datasetId": 3328,
                  "filter": "name contains 'count'",
                  "sort": "name,desc"
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
                - When you need to retrieve existing AI queries for a workspace
                - When searching for specific query patterns or questions
                - When analyzing query usage statistics
                - When reviewing query history
                - When sorting queries by different criteria
                - When filtering queries based on question content
                
                Tool Description:
                Retrieves AI queries with filtering, sorting and pagination capabilities.
                
                Required parameters:
                - accountId: Account ID where the workspace belongs
                - workspaceId: Workspace ID to get queries from
                
                Optional parameters:
                - max: Maximum records to return (default: 10)
                - offset: Pagination offset (default: 0)
                - filter: Filter string (e.g., "question CONTAINS 'batting'")
                - sort: Sort criteria with direction. Available sort:
                        "orderNumber asc" or "orderNumber desc" (sort by question number)
                        "question asc" or "question desc" (sort by question text)
                        "query asc" or "query desc" (sort by SQL query)
                        "params asc" or "params desc" (sort by parameters)
                        "usageCount asc" or "usageCount desc" (sort by usage count)
                
                Available sort fields:
                - orderNumber: Sort by question number
                - question: Sort by question text
                - query: Sort by SQL query
                - params: Sort by parameters
                - usageCount: Sort by usage count
                
                Example usage:
                {
                  "accountId": 123,
                  "workspaceId": 187,
                  "max": 10,
                  "offset": 0,
                  "sort": "orderNumber asc",
                  "filter": "question CONTAINS 'batting'"
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
        - When needing to know the schema of datasets in a workspace
        - When mapping dataset fields for query construction
        - When validating data relationships
        - When building context-aware AI operations
        - When needing metadata about workspace configuration
        - When checking for recent updates to dataset structures
        
        Tool Description:
        Retrieves comprehensive workspace context including dataset configurations and metadata.
        
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
    "create-dataset": {
        name: "create-dataset",
        description: `WHEN TO USE:
        - When setting up a new data structure from scratch
        - When you need to store a new type of data with specific validation rules
        - When creating companion datasets
        - When separating data into different logical collections
        - When you need to enforce specific data types and mandatory fields
        
        Tool Description:
        Creates a new dataset with defined schema and validation rules in a specified workspace.
        
        Required parameters:
        - accountId: Target account ID
        - workspaceId: Target workspace ID
        - name: Dataset name (must be unique)
        - targetFields: Array of field definitions
        
        Each targetField must have:
        - name: Field identifier (e.g., "customer_id")
        - type: One of ["string", "number", "integer", "date"]
        - mandatory: Boolean indicating if field is required
        - Optional: isKeyComponent (boolean), description (string)
        
        Example usage:
        Creating a customer dataset:
        {
          "accountId": 123,
          "workspaceId": 123,
          "name": "Customer_Database",
          "description": "Customer information tracking system",
          "targetFields": [
            {
              "name": "customer_id",
              "type": "string",
              "mandatory": true,
              "isKeyComponent": true,
              "description": "Unique customer identifier"
            },
            {
              "name": "join_date",
              "type": "date",
              "mandatory": true
            }
          ]
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
                    description: "Workspace ID where the dataset will be created",
                },
                name: {
                    type: "string",
                    description: "Name of the dataset",
                },
                description: {
                    type: "string",
                    description: "Description of the dataset",
                },
                targetFields: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            type: {
                                type: "string",
                                enum: ["string", "number", "integer", "date"],
                                description: "Field data type"
                            },
                            mandatory: { type: "boolean" },
                            isKeyComponent: { type: "boolean" },
                            description: { type: "string" },
                        },
                        required: ["name", "type", "mandatory"],
                    },
                },
            },
            required: ["workspaceId", "name", "targetFields", "accountId"],
        },
    },

    "execute-ai-query": {
        name: "execute-ai-query",
        description: `WHEN TO USE:
        - When performing queries on data
        - When analyzing data
        - When generating reports from complex data relationships
        - When users need to query data without knowing SQL
        - When performing ad-hoc data analysis
        - When filtering and aggregating data based on specific criteria
        - When transforming data for visualization or export
        
        Tool Description:
        Executes AI-powered queries on dataset data, get structured queries and give data by executing that queries.
        Model have to transform natural language into queries and pass that generated queries in request.
        e.g.
        Retrieve the name of the product which has the highest rate.
        Now Model will convert above input of user into query and that query will used as input in this tool to get data.
        
        Required parameters:
        - accountId: Account ID
        - workspaceId: Workspace ID
        - query: queries that can be executable (e.g. SELECT product_name FROM products ORDER BY rate DESC LIMIT 1)
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "query": "SELECT product_name FROM products ORDER BY rate DESC LIMIT 1"
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
    },
    "upload-dataset-rows": {
        name: "upload-dataset-rows",
        description: `WHEN TO USE:
        - When you need to add new data rows to an existing dataset
        - When importing data from external sources into a dataset
        - When updating a dataset with new records
        - When populating a newly created dataset with initial data
        
        Tool Description:
        Uploads rows of data to a specified dataset. The data must match the target fields structure of the dataset.
        
        IMPORTANT: Before using this tool, ALWAYS invoke the "get-dataset-targetfields" tool first with the same datasetId to:
        - Retrieve the exact schema structure of the dataset
        - Understand the required data types for each field
        - Identify which fields are mandatory vs optional
        - Ensure your data matches the expected format and constraints
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID containing the dataset
        - datasetId: Dataset ID to upload data to
        - data: Array containing header and rows objects
        
        Data format:
        - Header must define column names and types (string, numeric, date) that match the dataset's target fields
        - Rows must contain arrays of values matching the header structure
        - Dates must be in ISO format: "yyyy-MM-ddTHH:mm:ssZ"
        - Ensure all mandatory fields from the dataset schema are included
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "datasetId": 789,
          "data": [
            {
              "header": [
                { "name": "product_id", "type": "string" },
                { "name": "price", "type": "numeric" },
                { "name": "expiry_date", "type": "date" }
              ]
            },
            {
              "rows": [
                ["A001", 99.99, "2023-12-31T00:00:00Z"],
                ["A002", 149.99, "2024-06-30T00:00:00Z"]
              ]
            }
          ]
        }`,
        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs"
                },
                workspaceId: {
                    type: "number",
                    description: "Workspace ID containing the dataset"
                },
                datasetId: {
                    type: "number",
                    description: "Dataset ID to upload data to"
                },
                data: {
                    type: "array",
                    description: "Array containing header and rows objects",
                    items: {
                        type: "object",
                        properties: {
                            header: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: {
                                            type: "string",
                                            description: "Field name"
                                        },
                                        type: {
                                            type: "string",
                                            enum: ["string", "numeric", "date"],
                                            description: "Field data type"
                                        }
                                    },
                                    required: ["name", "type"]
                                }
                            },
                            rows: {
                                type: "array",
                                items: {
                                    type: "array",
                                    items: {}
                                },
                                description: "Array of data rows"
                            }
                        }
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "data"]
        }
    }
};