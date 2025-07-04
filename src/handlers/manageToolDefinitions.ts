import { ToolDefinition } from "./BaseToolHandler.js";

export const ManageToolDefinitions: Record<string, ToolDefinition> = {
    "get-datasets": {
        name: "get-datasets",
        description: `WHEN TO USE:
        - When managing and monitoring all datasets in a workspace
        - When performing administrative tasks on datasets
        - When checking dataset status and state transitions
        - When auditing dataset creation and update history
        - When finding datasets that need management attention
        - When preparing datasets for state transitions
        - Use filter = 'vstate=ACTIVE' to view all active datasets regardless of scope
        
        Tool Description:
        Retrieves datasets from a workspace for management and administrative purposes.
        
        Required parameters:
        - workspaceId: Workspace ID to query
        - accountId: accountId where workspace is located
        - filter: vscope and vstate value
        
        Optional parameters:
        - max: Maximum records to return (default: 9999)
        - offset: Pagination offset (default: 0)
        
        Common filter patterns:
        - All Active: "vstate=ACTIVE"
        - All Draft: "vscope=DRAFT and vstate=ACTIVE"
        - Published: "vscope=PUBLISHED and vstate=ACTIVE"
        - Staged: "vscope=STAGE and vstate=ACTIVE"
        
        Example usage:
        Getting all active datasets for management:
        {
          "accountId": 123,
          "workspaceId": 123,
          "filter": "vstate=ACTIVE"
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
                    default: "vstate=ACTIVE"
                }
            },
            required: ["workspaceId", "accountId", "filter"],
        },
    },
    
    "get-dataset-output": {
        name: "get-dataset-output",
        description: `WHEN TO USE:
        - When auditing data quality across datasets
        - When preparing to upload or update dataset rows
        - When validating dataset content after changes
        - When reviewing data before status transitions
        - When checking data completeness for management purposes
        - When exporting data for administrative review
        
        Tool Description:
        Retrieves actual data records from a dataset for management and administrative review.
        
        Required parameters:
        - datasetId: dataset ID to get data output for
        - workspaceId: Workspace ID to query
        - accountId: where workspace is located
        - filter: vscope and vstate value
        
        Optional parameters:
        - max: Maximum records (default: 9999)
        - offset: Pagination offset (default: 0)
        
        Example usage:
        Auditing dataset content before publication:
        {
          "accountId": 123,
          "workspaceId": 123,
          "datasetId": 456,
          "filter": "vscope=STAGE and vstate=ACTIVE",
          "max": 500
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
                    default: "vstate=ACTIVE"
                }
            },
            required: ["workspaceId", "datasetId", "filter", "accountId"],
        },
    },
    
    "get-accounts": {
        name: "get-accounts",
        description: `WHEN TO USE:
        - When managing access across multiple accounts
        - When performing administrative tasks across accounts
        - When validating user access permissions as an administrator
        - When overseeing account-level operations
        - When preparing administrative reports across accounts
        
        Tool Description:
        Retrieves available accounts for administrative management purposes.
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
        - When managing multiple workspaces within an account
        - When auditing workspace configurations
        - When checking workspace access permissions
        - When reviewing workspace usage and activity
        - When preparing administrative reports on workspaces
        
        Tool Description:
        Lists all workspaces within a specified account for administrative management.
        
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
        - When auditing dataset schema configurations
        - When validating field settings before data uploads
        - When reviewing field consistency across datasets
        - When checking for mandatory field compliance
        - When planning schema modifications or updates
        
        Tool Description:
        Retrieves target fields configuration for administrative review and management.
        
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
          "sort": "mandatory,desc"
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
        - When auditing query usage across the workspace
        - When monitoring popular or resource-intensive queries
        - When reviewing query patterns for optimization
        - When checking for compliance or security in queries
        - When generating usage reports on query patterns
        
        Tool Description:
        Retrieves AI queries for administrative monitoring and management.
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID to get queries from
        
        Optional parameters:
        - max: Maximum records to return (default: 10)
        - offset: Pagination offset (default: 0)
        - filter: Filter string for administrative filtering
        - sort: Sort criteria with direction
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 187,
          "max": 50,
          "sort": "usageCount desc"
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
        - When performing comprehensive workspace audits
        - When validating overall workspace configuration
        - When reviewing data relationships and dependencies
        - When conducting high-level workspace assessments
        - When generating administrative reports on data structure
        
        Tool Description:
        Retrieves comprehensive workspace context for administrative oversight and management.
        
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
    
    "upload-dataset-rows": {
        name: "upload-dataset-rows",
        description: `WHEN TO USE:
        - When bulk loading data into datasets for management purposes
        - When updating administrative datasets with new records
        - When performing data corrections or updates
        - When importing standardized data into reference datasets
        - When populating newly created management datasets
        
        Tool Description:
        Uploads rows of data to a specified dataset with administrative controls.
        
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
                { "name": "audit_id", "type": "string" },
                { "name": "action_type", "type": "string" },
                { "name": "user_id", "type": "string" },
                { "name": "timestamp", "type": "date" }
              ]
            },
            {
              "rows": [
                ["AUD001", "DATASET_CREATE", "USER123", "2025-04-05T10:30:00Z"],
                ["AUD002", "DATASET_UPDATE", "USER456", "2025-04-05T14:15:00Z"]
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
