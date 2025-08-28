import { ToolDefinition } from "./BaseToolHandler.js";

export const DesignToolDefinitions: Record<string, ToolDefinition> = {
    "get-datasets": {
        name: "get-datasets",
        description: `WHEN TO USE:
        - When planning the design of new companion datasets
        - When checking existing dataset structures for design reference
        - When reviewing dataset state (DRAFT/STAGE/PUBLISHED) during design process
        - When you need model dataset structures for new designs
        - Before creating new datasets to ensure unique naming
        - Use default filter = 'vscope=DRAFT and vstate=ACTIVE' for accessing designs in progress
        
        Tool Description:
        Retrieves datasets from a workspace for design reference and planning purposes.
        
        Required parameters:
        - workspaceId: Workspace ID to query
        - accountId: accountId where workspace is located
        - filter: vscope and vstate value
        
        Optional parameters:
        - max: Maximum records to return (default: 9999)
        - offset: Pagination offset (default: 0)
        
        Common filter patterns:
        - Draft & Active: "vscope=DRAFT and vstate=ACTIVE"
        - Published templates: "vscope=PUBLISHED and vstate=ACTIVE"
        
        Example usage:
        Getting draft datasets for design reference:
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
                    default: "vscope=DRAFT and vstate=ACTIVE"
                }
            },
            required: ["workspaceId", "accountId", "filter"],
        },
    },
    
    "get-dataset-output": {
        name: "get-dataset-output",
        description: `WHEN TO USE:
        - When examining sample data for designing new dataset structures
        - When validating data formats for field design decisions
        - When analyzing data patterns to inform schema design
        - When checking data distributions to optimize field types
        - When reviewing existing data structures to design improvements
        - Use default filter = 'vscope=DRAFT and vstate=ACTIVE' for design work
        
        Tool Description:
        Retrieves actual data records from a dataset to inform design decisions and validate schema design.
        
        Required parameters:
        - datasetId: dataset ID to get data output for
        - workspaceId: Workspace ID to query
        - accountId: where workspace is located
        - filter: vscope and vstate value
        
        Optional parameters:
        - max: Maximum records (default: 9999)
        - offset: Pagination offset (default: 0)
        
        Example usage:
        Getting sample data to inform field design:
        {
          "accountId": 123,
          "workspaceId": 123,
          "datasetId": 456,
          "filter": "vscope=DRAFT and vstate=ACTIVE",
          "max": 100
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
                    default: "vscope=DRAFT and vstate=ACTIVE"
                }
            },
            required: ["workspaceId", "datasetId", "filter", "accountId"],
        },
    },
    
    "get-accounts": {
        name: "get-accounts",
        description: `WHEN TO USE:
        - At the start of design operations to identify available accounts
        - When beginning the dataset design process
        - When planning which account to create new datasets in
        - When validating user access permissions for design operations
        - Before performing any design-related operations
        
        Tool Description:
        Retrieves available accounts for the authenticated user to select for dataset design.
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
        - After selecting an account to view available workspaces for dataset design
        - When deciding which workspace to create new datasets in
        - When validating workspace access permissions for design operations
        - When planning dataset organization across workspaces
        - Before performing dataset design operations
        
        Tool Description:
        Lists all workspaces within a specified account available for dataset design.
        
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
        - When examining existing dataset structures as templates for new designs
        - When reviewing field configurations to inform design decisions
        - When checking data types of fields in similar datasets
        - When planning field naming conventions for new datasets
        - When analyzing mandatory vs. optional field patterns
        
        Tool Description:
        Retrieves target fields configuration from existing datasets to inform new dataset designs.
        
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
          "filter": "name contains 'id'",
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
        - When reviewing existing queries to understand data usage patterns
        - When designing datasets that will support common query patterns
        - When planning field structures based on query requirements
        - When optimizing dataset design for analytical needs
        
        Tool Description:
        Retrieves existing AI queries to inform dataset design decisions and optimization.
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID to get queries from
        
        Optional parameters:
        - max: Maximum records to return (default: 10)
        - offset: Pagination offset (default: 0)
        - filter: Filter string for specific query patterns
        - sort: Sort criteria with direction
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 187,
          "max": 20,
          "sort": "usageCount desc",
          "filter": "question CONTAINS 'join'"
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
        - Before designing new datasets to understand existing data structures
        - When planning relationships between datasets
        - When designing complementary datasets that work with existing ones
        - When checking for recent updates to dataset structures
        - When understanding the broader data ecosystem for design decisions
        
        Tool Description:
        Retrieves comprehensive workspace context to inform dataset design decisions.
        
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
        - When generating administrative reports on data
        - When auditing data for compliance or quality issues
        - When validating data integrity across datasets
        - When checking for data inconsistencies or anomalies
        - When performing system-level data operations
        
        Tool Description:
        Executes AI-powered queries for administrative and management purposes.  

        IMPORTANT: 
        - Before using this tool, ALWAYS invoke the "get-ai-context" tool first with to etrieve the exact schema structure of the data model
        - When determining foreign key relationships between tables, 
            - use the LOOKUP_EXISTS validation rules. These act as constraints on the child dataset. 
            - For example, LOOKUP_EXISTS("Products","unique_id",row["Product Id"]) means that the column "Product Id" is in a child dataset and is referencing the Primary Key of the parent dataset called "Products", 
            - where the primary key in this table is called "Unique Id". 
            - The primary key of the parent table can be found from the "isKeyComponent": true. 
            - Note that the primary key can be a compound key (indicated by "isKeyComponent": true, "isCompound": true).
        
        Required parameters:
        - accountId: Account ID
        - workspaceId: Workspace ID
        - query: SQL query to execute (e.g. SELECT COUNT(*) FROM datasets GROUP BY status)
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "query": "SELECT dataset_name, COUNT(*) as record_count FROM all_datasets GROUP BY dataset_name ORDER BY record_count DESC"
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
    
    "create-dataset": {
        name: "create-dataset",
        description: `WHEN TO USE:
        - When creating administrative or system datasets
        - When setting up governance or tracking datasets
        - When creating a entity relationship data model
        - When implementing standardized dataset templates
        - When establishing reference datasets for management
        - When creating datasets with strict governance requirements
        
        Tool Description:
        Creates a new dataset with defined schema for administrative purposes.
        
        Required parameters:
        - accountId: Target account ID
        - workspaceId: Target workspace ID
        - name: Dataset name (must be unique)
        - targetFields: Array of field definitions
        
        Each targetField must have:
        - name: Field identifier (e.g., "audit_id")
        - type: One of ["string", "number", "integer", "date"]
        - mandatory: Boolean indicating if field is required
        - Optional: isKeyComponent (boolean), description (string), validation_rules

        Relationships between Datasets:
         When setting foreign key relationships between tables, use the LOOKUP_EXISTS validation rule. 
         This imposes a constraint on the created dataset. For example, LOOKUP_EXISTS("Products","Unique Id",row["Product Id"]) 
         means that the column "Product Id" is a target field in this dataset and is referencing the Primary Key of a parent 
         dataset called "Products", where the primary key in this dataset is called "Unique Id". The primary key of the parent 
         dataset can be found from the "isKeyComponent": true. Note that the primary key can be a compound key also
         (indicated by "isKeyComponent": true, "isCompound": true).
        
        ⚠️ IMPORTANT: Field names must NOT use SQL reserved words as they will be rejected by Verodat.
        
        Common SQL reserved words to avoid:
        SELECT, FROM, WHERE, ORDER, GROUP, BY, INSERT, UPDATE, DELETE, JOIN, CASE, 
        WHEN, THEN, ELSE, END, NULL, TRUE, FALSE, DATE, TIME, USER, COUNT, SUM, AVG
        
        If you need to use a term that is a SQL reserved word:
        - Use a different term: Instead of "order", use "order_details" or "purchase_order"
        - Add a prefix or suffix: Instead of "date", use "event_date" or "date_created"
        - Use underscores: Instead of "select", use "user_select" or "selection"
        
        Example usage:
        Creating an audit log dataset:
        {
          "accountId": 123,
          "workspaceId": 123,
          "name": "System Audit Log",
          "description": "Tracks administrative actions and changes",
          "targetFields": [
            {
              "name": "Audit Id",
              "type": "string",
              "mandatory": true,
              "isKeyComponent": true,
              "description": "Unique audit entry identifier"
            },
            {
              "name": "Action Type",
              "type": "string",
              "mandatory": true,
              "description": "Type of administrative action performed",
              "validation_rules": [
                {
                  "name": "Must be a valid type",
                  "code": "LOOKUP_EXISTS(\"Action Types\",\"Type Name\", row[\"Action Type\"])", // Good: Imposing a referential check with a lookup to the parent dataset
                  "severity": "CRITICAL",
                  "type": "ROW"
                }
              ]
            },
            {
              "name": "User Id",  // Good: Not using "user" (SQL reserved word)
              "type": "string",
              "mandatory": true
            },
            {
              "name": "Event Timestamp",  // Good: Not using "timestamp" (SQL reserved word)
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
                            validation_rules: { 
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        code: { type: "string" },
                                        severity: { 
                                            type: "string",
                                            enum: ["CRITICAL", "WARNING"],
                                            description: "Severity of the validation rule"
                                        },
                                        type: { type: "string" }
                                    }
                                }
                            },
                        },
                        required: ["name", "type", "mandatory"],
                    },
                },
            },
            required: ["workspaceId", "name", "targetFields", "accountId"],
        },
    },

    "upload-dataset-rows": {
        name: "upload-dataset-rows",
        description: `WHEN TO USE:
        - When bootstrapping workspace with initial governance data
        - When loading procedures into AI_Agent_Procedures datasets
        - When populating policies in Business_Policies datasets
        - When configuring agents in AI_Agent_Identity datasets
        - When initializing Core_RAIDA with bootstrap entries
        - When setting up reference data for new workspaces
        
        Tool Description:
        Uploads rows of data to a specified dataset - critical for workspace bootstrap operations.
        
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
        - Field names are CASE-SENSITIVE and must match exactly
        
        Example usage for bootstrap:
        {
          "accountId": 123,
          "workspaceId": 456,
          "datasetId": 789,
          "data": [
            {
              "header": [
                { "name": "procedure_id", "type": "string" },
                { "name": "title", "type": "string" },
                { "name": "purpose", "type": "string" },
                { "name": "steps", "type": "string" }
              ]
            },
            {
              "rows": [
                ["PROC-BOOTSTRAP-WORKSPACE", "Bootstrap Workspace", "Initialize governance", "1. Create datasets..."]
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
