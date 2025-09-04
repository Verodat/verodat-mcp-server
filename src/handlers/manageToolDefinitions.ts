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
    },

    "delete-dataset": {
        name: "delete-dataset",
        description: `WHEN TO USE:
	       - When a specific version of a dataset needs to be deleted
	       - When removing obsolete, test, or invalid dataset versions
	       - When managing dataset hygiene and version control within a workspace

	       Tool Description:
	       Deletes the current or latest version of a dataset from a workspace. Used by administrators or automated systems to maintain clean and accurate datasets.`,

        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "Account ID where the workspace belongs"
                },
                workspaceId: {
                    type: "number",
                    description: "The ID of the workspace containing the dataset"
                },
                datasetId: {
                    type: "number",
                    description: "The ID of the dataset should be deleted"
                }
            },
            required: ["accountId", "workspaceId", "datasetId"]
        }
    },

    "dataset-promote-configuration": {
        name: "dataset-promote-configuration",
        description: `WHEN TO USE:
	       - When promoting dataset configurations between scopes
	       - When moving datasets from one scope to another (e.g., from DRAFT to STAGED or PUBLISHED)
	       - When finalizing changes for production use
	       - When completing a development cycle
	       - When preparing configurations for deployment

	       Tool Description:
	       Promotes workspace dataset configurations **from a source scope** (DRAFT, STAGED, or PUBLISHED) to a **target scope**, typically moving forward in the workflow (e.g., DRAFT → STAGED → PUBLISHED).

	       Required parameters:
	       - accountId: Account ID where the workspace belongs
	       - workspaceId: Workspace ID containing the configuration
	       - scope: The **current scope** (source) of the datasets (DRAFT, STAGED, or PUBLISHED)

	       Optional parameters:
	       - keepUncommittedData: Boolean flag to keep uncommitted data (default: false)
	       - dataSetIds: Array of dataset IDs to promote (default: [])
	       - promoteAll: Boolean flag to promote all configurations (default: true)

	       Example usage:
	       Promoting configuration from DRAFT to STAGED:
	       {
	       "accountId": 123,
	       "workspaceId": 456,
	       "scope": "DRAFT"
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
                    description: "Workspace ID containing the configuration"
                },
                scope: {
                    type: "string",
                    enum: ["DRAFT", "STAGED", "PUBLISHED"],
                    description: "The **source (current)** scope of the datasets to promote"
                },
                keepUncommittedData: {
                    type: "boolean",
                    description: "Flag to keep uncommitted data",
                    default: false
                },
                dataSetIds: {
                    type: "array",
                    items: {
                        type: "number"
                    },
                    description: "Array of dataset IDs to promote",
                    default: []
                },
                promoteAll: {
                    type: "boolean",
                    description: "Flag to promote all configurations",
                    default: true
                }
            },
            required: ["accountId", "workspaceId", "scope"]
        }
    },

    "update-dataset-targetfields": {
        name: "update-dataset-targetfields",
        description: `WHEN TO USE:
	       - When updating the structure (schema) of a specific existing dataset
	       - When redefining or replacing all target fields in a dataset
	       - When enforcing new governance, validation, or modeling rules
	       - When realigning dataset definitions after business or schema changes

	       Tool Description:
	       Updates a single dataset by replacing its existing target fields with a newly provided set. This action will override the current field definitions, so the full list of desired fields must be included.

	       WARNING:
	       - This action replaces the current schema entirely.
	       - Missing fields in the payload will be removed.
	       - Existing data may be deleted or invalidated if it no longer matches the updated schema.

	       Required parameters:
	       - accountId: ID of the account owning the dataset
	       - workspaceId: ID of the workspace containing the dataset
	       - datasetId: ID of the dataset being updated
	       - targetFields: Complete array of new field definitions

	       Each targetField must include:
	       - name: Field name (must avoid SQL reserved words)
	       - type: One of ["string", "number", "integer", "date"]
	       - mandatory: Whether this field is required
	       - Optional: isKeyComponent, isCompound, description

	       Example usage:
	       {
	           "accountId": 123,
	           "workspaceId": 456,
	           "datasetId": 789,
	           "targetFields": [
	           {
	               "name": "Invoice Number",
	               "type": "string",
	               "mandatory": true,
	               "description": "Unique invoice identifier",
	               "isKeyComponent": true,
	               "isCompound": false
	           },
	           {
	               "name": "Invoice Date",
	               "type": "date",
	               "mandatory": true,
	               "description": "Date the invoice was issued",
	               "isKeyComponent": true,
	               "isCompound": false
	           },
	           {
	               "name": "Tax Amount",
	               "type": "number",
	               "mandatory": false,
	               "isKeyComponent": true,
	               "isCompound": false
	           }
	           ]
	       }`,
        inputSchema: {
            type: "object",
            properties: {
                accountId: {
                    type: "number",
                    description: "ID of the account owning the dataset"
                },
                workspaceId: {
                    type: "number",
                    description: "ID of the workspace containing the dataset"
                },
                datasetId: {
                    type: "number",
                    description: "ID of the dataset to update"
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
                            isCompound: { type: "boolean" },
                            description: { type: "string" }
                        },
                        required: ["name", "type", "mandatory", "isKeyComponent", "isCompound", "description"]
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "targetFields"]
        }
    },
    "add-mapping": {
        name: "add-mapping",
        description: `WHEN TO USE:
        - When creating field mappings between file columns and dataset target fields
        - When defining how incoming data should map to existing dataset schema
        - When configuring automated data mapping for regular imports
        
        Tool Description:
        Creates a new mapping configuration that defines how file columns should map to dataset target fields.
        
        A mapping contains:
        - Name: Identifier for the mapping configuration
        - Entries: Array of mapping rules that specify:
          - expression: Source field identifier (e.g., "{Player}", "{Team}")
          - target_field: Target field name in the dataset (e.g., "player_name")
          - description: Optional description of the mapping rule
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID containing the dataset
        - datasetId: Dataset ID to create mapping for
        - name: Name for the mapping configuration
        - entries: Array of mapping entry objects
        
        Example usage:
        Creating a sports data mapping:
        {
          "accountId": 91,
          "workspaceId": 161,
          "datasetId": 4203,
          "name": "Player Statistics Mapping",
          "entries": [
            {
              "expression": "{Player}",
              "target_field": "player_name",
              "description": "Maps player name from source"
            },
            {
              "expression": "{Team}",
              "target_field": "team_name", 
              "description": null
            },
            {
              "expression": "",
              "target_field": "G360_VERSION_KEY"
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
                    description: "Dataset ID to create mapping for"
                },
                name: {
                    type: "string",
                    description: "Name for the mapping configuration"
                },
                entries: {
                    type: "array",
                    description: "Array of mapping entry objects",
                    items: {
                        type: "object",
                        properties: {
                            expression: {
                                type: "string",
                                description: "Source field expression (e.g., '{Player}')"
                            },
                            target_field: {
                                type: "string",
                                description: "Target field name in dataset"
                            },
                            description: {
                                type: "string",
                                description: "Optional description of mapping rule"
                            }
                        },
                        required: ["expression", "target_field"]
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "name", "entries"]
        }
    },
    "upload-file": {
        name: "upload-file",
        description: `WHEN TO USE:
    - When uploading data files to datasets for processing
    - When importing CSV, XLSX, JSON, or PDF files into a dataset
    - When adding new data sources to existing datasets
    - When creating assets bound to uploaded files for data processing
    - When establishing file-based data pipelines
    - When uploading files with specific metadata requirements
    
    Tool Description:
    Uploads files to a specified dataset with comprehensive configuration options.
    
    Supported file types: CSV, XLSX, JSON, PDF
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the target dataset
    - datasetId: Dataset ID to upload the file to
    - filename: Name of the file being uploaded
    - filedata: Base64 encoded file content
    
    Optional parameters:
    - metadata: Additional file metadata (JSON string)
    - assetId: ID of existing asset to associate with file
    - supplierGroupId: ID of supplier group for file organization
    - bindAsset: Create new asset and bind file to it (default: false)
    - dueDate: Due date for processing (required when bindAsset is true)
    
    Example usage:
    Basic file upload:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "filename": "sales_data.csv",
      "filedata": "base64encodedcontent...",
      "bindAsset": true,
      "dueDate": "2025-12-31T23:59:59Z"
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
                    description: "Workspace ID containing the target dataset"
                },
                datasetId: {
                    type: "number",
                    description: "Dataset ID to upload the file to"
                },
                filename: {
                    type: "string",
                    description: "Name of the file being uploaded"
                },
                filedata: {
                    type: "string",
                    description: "Base64 encoded file content"
                },
                metadata: {
                    type: "string",
                    description: "Additional file metadata as JSON string"
                },
                assetId: {
                    type: "number",
                    description: "ID of existing asset to associate with file"
                },
                supplierGroupId: {
                    type: "number",
                    description: "ID of supplier group for file organization"
                },
                bindAsset: {
                    type: "boolean",
                    description: "Create new asset and bind file to it",
                    default: false
                },
                dueDate: {
                    type: "string",
                    format: "date-time",
                    description: "Due date for processing (ISO format: yyyy-MM-ddTHH:mm:ssZ, required when bindAsset is true)"
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "filename", "filedata"]
        }
    },
    "get-mappings": {
        name: "get-mappings",
        description: `WHEN TO USE:
    - When listing all mappings available in a dataset
    - When searching for specific mappings by name or criteria
    - When auditing mapping configurations across datasets
    - When preparing to select a mapping for data processing
    - When reviewing mapping history and usage patterns
    - When managing multiple mappings within a dataset
    
    Tool Description:
    Retrieves a list of all mappings configured for a specific dataset with filtering and pagination support.
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID to get mappings from
    
    Optional parameters:
    - max: Maximum records to return (default: 10)
    - offset: Pagination offset (default: 0)
    - filter: Filter string for searching mappings
    - nameLike: Filter mappings by name pattern
    
    Example usage:
    Basic mapping list:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789
    }
    
    Filtered search:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "nameLike": "Player",
      "max": 50
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
                    description: "Dataset ID to get mappings from"
                },
                max: {
                    type: "number",
                    description: "Maximum number of results to return",
                    default: 10
                },
                offset: {
                    type: "number",
                    description: "Offset for pagination",
                    default: 0
                },
                filter: {
                    type: "string",
                    description: "Filter string for searching mappings"
                },
                nameLike: {
                    type: "string",
                    description: "Filter mappings by name pattern"
                }
            },
            required: ["accountId", "workspaceId", "datasetId"]
        }
    },

    "get-mapping": {
        name: "get-mapping",
        description: `WHEN TO USE:
    - When retrieving details of a specific mapping configuration
    - When examining mapping entries and field relationships
    - When debugging mapping issues or validating configurations
    - When preparing to update or modify an existing mapping
    - When analyzing mapping logic and filter rules
    - When documenting mapping configurations for audit purposes
    
    Tool Description:
    Retrieves detailed information about a specific mapping including all its entries, filter rules, and metadata.
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID containing the mapping
    - mappingId: Specific mapping ID to retrieve
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "mappingId": 101
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
                    description: "Dataset ID containing the mapping"
                },
                mappingId: {
                    type: "number",
                    description: "Specific mapping ID to retrieve"
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "mappingId"]
        }
    },
    "install-recipe": {
        name: "install-recipe",
        description: `WHEN TO USE:
    - When deploying pre-built data models and configurations from templates
    - When setting up standardized datasets with predefined schemas
    - When implementing best-practice data structures from the marketplace
    - When rapidly deploying common business scenarios (CRM, inventory, etc.)
    - When creating complex multi-dataset configurations automatically
    - When establishing data relationships and validation rules from templates
    
    Tool Description:
    Installs a recipe from the marketplace into a workspace, automatically creating datasets, mappings, and configurations.
    
    A recipe can include:
    - Multiple datasets with predefined schemas
    - Target fields with validation rules and relationships
    - File uploads with sample data
    - Mapping configurations for data processing
    - Complete data models with foreign key relationships
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Target workspace ID for installation
    
    Installation options (one required):
    - templateId: ID of marketplace template to install
    - recipe: Complete custom recipe definition object
    
    Recipe structure (if providing custom recipe):
    - data_stores: Array of datasets to create
    - Each dataset includes: name, description, target_fields, files, mappings
    
    Example usage:
    Install from marketplace template:
    {
      "accountId": 123,
      "workspaceId": 456,
      "templateId": "crm-basic-v1.2"
    }
    
    Install custom recipe:
    {
      "accountId": 123,
      "workspaceId": 456,
      "recipe": {
        "data_stores": [
          {
            "name": "Customer Data",
            "description": "Customer information and contacts",
            "target_fields": [
              {
                "name": "Customer ID",
                "type": "string",
                "mandatory": true,
                "isKeyComponent": true
              }
            ],
            "mapping": {
              "name": "Customer Import Mapping",
              "entries": [
                {
                  "expression": "{customer_id}",
                  "target_field": "Customer ID"
                }
              ]
            }
          }
        ]
      }
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
                    description: "Target workspace ID for installation"
                },
                templateId: {
                    type: "string",
                    description: "ID of marketplace template to install (either templateId or recipe required)"
                },
                recipe: {
                    type: "object",
                    description: "Complete custom recipe definition (either templateId or recipe required)",
                    properties: {
                        data_stores: {
                            type: "array",
                            description: "Array of datasets to create",
                            items: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                        description: "Name of the dataset"
                                    },
                                    description: {
                                        type: "string",
                                        description: "Description of the dataset"
                                    },
                                    target_fields: {
                                        type: "array",
                                        description: "Target fields for the dataset",
                                        items: {
                                            type: "object",
                                            properties: {
                                                name: { type: "string" },
                                                type: {
                                                    type: "string",
                                                    enum: ["string", "integer", "number", "date", "boolean"]
                                                },
                                                mandatory: { type: "boolean" },
                                                isKeyComponent: { type: "boolean" },
                                                description: { type: "string" }
                                            }
                                        }
                                    },
                                    files: {
                                        type: "array",
                                        description: "Files to include with dataset",
                                        items: {
                                            type: "object",
                                            properties: {
                                                filename: { type: "string" },
                                                filedata: { type: "string", description: "Base64 encoded file data" },
                                                metadata: { type: "object" }
                                            }
                                        }
                                    },
                                    mapping: {
                                        type: "object",
                                        description: "Mapping configuration",
                                        properties: {
                                            name: { type: "string" },
                                            entries: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        expression: { type: "string" },
                                                        target_field: { type: "string" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            required: ["accountId", "workspaceId"]
        }
    },

    "get-recipe-progress": {
        name: "get-recipe-progress",
        description: `WHEN TO USE:
    - When monitoring the installation progress of a marketplace recipe
    - When checking if recipe installation has completed successfully
    - When troubleshooting failed recipe installations
    - When waiting for complex multi-dataset recipes to finish deploying
    - When providing status updates during automated deployment processes
    - When verifying recipe installation before proceeding with data operations
    
    Tool Description:
    Retrieves the current installation status and progress of a marketplace recipe.
    
    Recipe installation goes through several stages:
    - PENDING: Installation request received and queued
    - IN_PROGRESS: Datasets, fields, and mappings being created
    - COMPLETED: All components successfully installed
    - FAILED: Installation encountered errors
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID where recipe is being installed
    - sequenceId: Installation sequence ID returned from install-recipe
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "sequenceId": "recipe_install_789_20250827_143022"
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
                    description: "Workspace ID where recipe is being installed"
                },
                sequenceId: {
                    type: "string",
                    description: "Installation sequence ID returned from install-recipe"
                }
            },
            required: ["accountId", "workspaceId", "sequenceId"]
        }
    },

    // ===== CODE EVALUATION =====

    "compile-expression": {
        name: "compile-expression",
        description: `WHEN TO USE:
    - When validating syntax of data transformation expressions before execution
    - When testing expression logic during development or debugging
    - When verifying field references and function calls in expressions
    - When preparing expressions for use in validation or transformation rules
    - When checking compatibility of expressions with dataset schemas
    - When providing syntax validation feedback to users creating expressions
    
    Tool Description:
    Compiles a data transformation or validation expression for syntax checking without executing it against actual data.
    
    Expression syntax supports:
    - Field references: row["field_name"]
    - Functions: UPPER(), LOWER(), TRIM(), etc.
    - Arithmetic operations: +, -, *, /
    - Comparison operations: =, !=, <, >, <=, >=
    - Logical operations: AND, OR, NOT
    - Conditional logic: CASE WHEN...THEN...ELSE...END
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID for context and field validation
    - expression: The expression to compile for syntax checking
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "expression": "UPPER(row[\"customer_name\"]) + ' - ' + row[\"order_id\"]"
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
                    description: "Dataset ID for context and field validation"
                },
                expression: {
                    type: "string",
                    description: "The expression to compile for syntax checking",
                    minLength: 1
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "expression"]
        }
    },

    "evaluate-filter-rule": {
        name: "evaluate-filter-rule",
        description: `WHEN TO USE:
    - When testing filter conditions against sample data before applying to datasets
    - When debugging filter rules that are not producing expected results
    - When validating filter logic with specific data scenarios
    - When developing complex filtering criteria for data processing
    - When verifying filter expressions work correctly with different data types
    - When testing edge cases and boundary conditions for filters
    
    Tool Description:
    Evaluates a filter rule expression against provided sample data to determine if it passes or fails the filter condition.
    
    Filter expressions use field placeholders like {field_name} and support:
    - Comparison operators: >, <, =, !=, >=, <=
    - Logical operators: AND, OR, NOT
    - String functions: CONTAINS, STARTS_WITH, ENDS_WITH
    - Numeric functions: ROUND, ABS, CEIL, FLOOR
    - Date functions: YEAR, MONTH, DAY
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID for context
    - expression: Filter rule expression to evaluate
    - source_fields: Array of field data with names, values, and types
    
    Optional parameters:
    - metadata: Additional variables available to the expression
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "expression": "{age} > 18 AND {status} = 'ACTIVE'",
      "source_fields": [
        {
          "name": "age",
          "value": "25",
          "type": "number"
        },
        {
          "name": "status",
          "value": "ACTIVE",
          "type": "string"
        }
      ],
      "metadata": [
        {
          "name": "current_year",
          "value": "2025"
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
                    description: "Dataset ID for context"
                },
                expression: {
                    type: "string",
                    description: "Filter rule expression to evaluate",
                    minLength: 3
                },
                source_fields: {
                    type: "array",
                    description: "Array of field data with names, values, and types",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the source field",
                                minLength: 1
                            },
                            value: {
                                type: "string",
                                description: "Value of the source field"
                            },
                            type: {
                                type: "string",
                                description: "Data type of the source field",
                                enum: ["number", "integer", "string", "boolean", "date"]
                            }
                        },
                        required: ["name", "value", "type"]
                    }
                },
                metadata: {
                    type: "array",
                    description: "Additional metadata variables",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the metadata variable",
                                minLength: 1
                            },
                            value: {
                                type: "string",
                                description: "Value of the metadata variable"
                            }
                        },
                        required: ["name", "value"]
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "expression", "source_fields"]
        }
    },

    "compile-filter-rule": {
        name: "compile-filter-rule",
        description: `WHEN TO USE:
    - When validating filter rule syntax before saving or applying to datasets
    - When checking filter expressions for compilation errors during development
    - When verifying field references exist and are properly formatted
    - When testing filter rule syntax without executing against actual data
    - When providing immediate syntax feedback during filter creation
    - When ensuring filter expressions conform to supported syntax patterns
    
    Tool Description:
    Compiles a filter rule expression for syntax checking without full evaluation against data.
    
    Validates:
    - Proper use of field placeholders: {field_name}
    - Correct operator syntax and precedence
    - Function calls and parameter counts
    - Parentheses matching and nesting
    - Data type compatibility in comparisons
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID for context and field validation
    - expression: Filter rule expression to compile
    - source_fields: Array of field data with names, values, and types
    - expressionTarget: Target type for the expression (typically "FILTER")
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "expression": "{order_amount} >= 100 AND {customer_type} = 'PREMIUM'",
      "source_fields": [
        {
          "name": "order_amount",
          "value": "150",
          "type": "number"
        },
        {
          "name": "customer_type", 
          "value": "PREMIUM",
          "type": "string"
        }
      ],
      "expressionTarget": "FILTER"
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
                    description: "Dataset ID for context and field validation"
                },
                expression: {
                    type: "string",
                    description: "Filter rule expression to compile",
                    minLength: 1
                },
                source_fields: {
                    type: "array",
                    description: "Array of field data with names, values, and types",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the source field",
                                minLength: 1
                            },
                            value: {
                                type: "string",
                                description: "Value of the source field"
                            },
                            type: {
                                type: "string",
                                description: "Data type of the source field",
                                enum: ["number", "integer", "string", "boolean", "date"]
                            }
                        },
                        required: ["name", "value", "type"]
                    }
                },
                expressionTarget: {
                    type: "string",
                    description: "Target type for the expression",
                    enum: ["FILTER"],
                    default: "FILTER"
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "expression", "source_fields"]
        }
    },
    "evaluate-validation-rule": {
        name: "evaluate-validation-rule",
        description: `WHEN TO USE:
    - When testing data validation rules against sample records before deployment
    - When debugging validation failures and understanding why data is rejected
    - When verifying validation logic works correctly with different data scenarios
    - When developing complex validation criteria for data quality enforcement
    - When testing multiple validation rules together for comprehensive checks
    - When validating business rules and data integrity constraints
    
    Tool Description:
    Evaluates validation rule expressions against target field data to determine if the data passes validation checks.
    
    Validation rules support:
    - Data presence checks: row["field"] != null
    - Range validations: row["age"] BETWEEN 18 AND 65
    - Format validations: REGEX_MATCH(row["email"], "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    - Cross-field validations: row["end_date"] > row["start_date"]
    - Lookup validations: LOOKUP_EXISTS("RefTable", "key", row["foreign_key"])
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID for context
    - validation_rules: Array of validation rules to evaluate
    - target_fields: Array of target field data with names, values, and types
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "validation_rules": [
        {
          "name": "Email Required",
          "code": "row[\"email\"] != null AND row[\"email\"] != ''",
          "severity": "CRITICAL"
        },
        {
          "name": "Valid Age Range",
          "code": "row[\"age\"] >= 18 AND row[\"age\"] <= 120",
          "severity": "WARNING"
        }
      ],
      "target_fields": [
        {
          "name": "email",
          "value": "user@example.com",
          "type": "string"
        },
        {
          "name": "age",
          "value": "25",
          "type": "number"
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
                    description: "Dataset ID for context"
                },
                validation_rules: {
                    type: "array",
                    description: "Array of validation rules to evaluate",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the validation rule",
                                minLength: 1
                            },
                            code: {
                                type: "string",
                                description: "Validation rule code/expression",
                                minLength: 1
                            },
                            severity: {
                                type: "string",
                                description: "Severity of the validation rule",
                                enum: ["CRITICAL", "WARNING"]
                            }
                        },
                        required: ["name", "code"]
                    }
                },
                target_fields: {
                    type: "array",
                    description: "Array of target field data with names, values, and types",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the target field",
                                minLength: 1
                            },
                            value: {
                                type: "string",
                                description: "Value of the target field"
                            },
                            type: {
                                type: "string",
                                description: "Data type of the target field",
                                enum: ["number", "integer", "string", "boolean", "date"]
                            }
                        },
                        required: ["name", "value", "type"]
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "validation_rules", "target_fields"]
        }
    },

    "evaluate-transformation-rule": {
        name: "evaluate-transformation-rule",
        description: `WHEN TO USE:
    - When testing data transformation logic before applying to production datasets
    - When debugging transformation rules that produce unexpected results
    - When developing complex data transformation expressions
    - When verifying transformations work correctly with different input data types
    - When testing transformation performance and output formatting
    - When validating business logic implemented in transformation rules
    
    Tool Description:
    Evaluates a transformation rule expression to transform input data and return the transformed result.
    
    Transformation rules support:
    - String manipulations: UPPER(), LOWER(), TRIM(), SUBSTRING()
    - Date formatting: FORMAT_DATE(row["date"], "YYYY-MM-DD")
    - Mathematical operations: ROUND(), ABS(), CEIL(), FLOOR()
    - Conditional logic: CASE WHEN...THEN...ELSE...END
    - Data type conversions: TO_STRING(), TO_NUMBER(), TO_DATE()
    - Concatenation and string building
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID for context
    - trulename: Name/identifier for the transformation rule
    - trulecode: Transformation rule expression/code
    - target_fields: Array of field data to transform
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "trulename": "Format Customer Name",
      "trulecode": "UPPER(TRIM(row[\"first_name\"])) + ', ' + UPPER(TRIM(row[\"last_name\"]))",
      "target_fields": [
        {
          "name": "first_name",
          "value": " john ",
          "type": "string"
        },
        {
          "name": "last_name",
          "value": " doe ",
          "type": "string"
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
                    description: "Dataset ID for context"
                },
                trulename: {
                    type: "string",
                    description: "Name/identifier for the transformation rule",
                    minLength: 1
                },
                trulecode: {
                    type: "string",
                    description: "Transformation rule expression/code",
                    minLength: 1
                },
                target_fields: {
                    type: "array",
                    description: "Array of field data to transform",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the target field",
                                minLength: 1
                            },
                            value: {
                                type: "string",
                                description: "Value of the target field"
                            },
                            type: {
                                type: "string",
                                description: "Data type of the target field",
                                enum: ["number", "integer", "string", "boolean", "date"]
                            }
                        },
                        required: ["name", "value", "type"]
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "trulename", "trulecode", "target_fields"]
        }
    },

    "evaluate-expression": {
        name: "evaluate-expression",
        description: `WHEN TO USE:
    - When testing multiple expressions simultaneously against the same dataset
    - When evaluating complex expression combinations for data processing
    - When batch testing expressions with different target data types
    - When developing expression libraries for reuse across datasets
    - When comparing expression results for optimization and accuracy
    - When validating expression behavior across different data scenarios
    
    Tool Description:
    Evaluates multiple general expressions against provided data and returns results for each expression.
    
    Each expression specifies:
    - Expression logic and operations
    - Target data type for result formatting
    - Expected output format and validation
    
    Supports all standard expression features:
    - Field references and operations
    - Function calls and transformations
    - Conditional logic and branching
    - Data type conversions and formatting
    - Mathematical and string operations
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID for context
    - expressions: Array of expressions with their target types
    - source_fields: Array of source field data
    
    Optional parameters:
    - metadata: Additional variables available to expressions
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "expressions": [
        {
          "expression": "row[\"first_name\"] + ' ' + row[\"last_name\"]",
          "target_type": "string"
        },
        {
          "expression": "row[\"price\"] * 1.1",
          "target_type": "number"
        },
        {
          "expression": "row[\"age\"] >= 18",
          "target_type": "boolean"
        }
      ],
      "source_fields": [
        {
          "name": "first_name",
          "value": "John",
          "type": "string"
        },
        {
          "name": "last_name",
          "value": "Doe",
          "type": "string"
        },
        {
          "name": "price",
          "value": "100",
          "type": "number"
        },
        {
          "name": "age",
          "value": "25",
          "type": "number"
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
                    description: "Dataset ID for context"
                },
                expressions: {
                    type: "array",
                    description: "Array of expressions with their target types",
                    items: {
                        type: "object",
                        properties: {
                            expression: {
                                type: "string",
                                description: "The expression to evaluate"
                            },
                            target_type: {
                                type: "string",
                                description: "Target data type for the expression result",
                                enum: ["number", "integer", "string", "boolean", "date"]
                            }
                        },
                        required: ["expression", "target_type"]
                    }
                },
                source_fields: {
                    type: "array",
                    description: "Array of source field data",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the source field",
                                minLength: 1
                            },
                            value: {
                                type: "string",
                                description: "Value of the source field"
                            },
                            type: {
                                type: "string",
                                description: "Data type of the source field",
                                enum: ["number", "integer", "string", "boolean", "date"]
                            }
                        },
                        required: ["name", "value", "type"]
                    }
                },
                metadata: {
                    type: "array",
                    description: "Additional metadata variables",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Name of the metadata variable",
                                minLength: 1
                            },
                            value: {
                                type: "string",
                                description: "Value of the metadata variable"
                            }
                        },
                        required: ["name", "value"]
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "expressions", "source_fields"]
        }
    },

    // ===== TARGET FIELD VALIDATION RULES =====

    "save-validation-rule": {
        name: "save-validation-rule",
        description: `WHEN TO USE:
    - When creating new validation rules for target fields in datasets
    - When implementing data quality checks and business rule enforcement
    - When establishing validation criteria for data integrity
    - When setting up CRITICAL or WARNING level validations
    - When defining ROW-level or DATASET-level validation logic
    - When creating reusable validation patterns across fields
    
    Tool Description:
    Creates a new validation rule for a specific target field in a dataset.
    
    Validation rules can be:
    - ROW-level: Applied to individual data records
    - DATASET-level: Applied across multiple records or aggregations
    - CRITICAL severity: Blocks data processing if failed
    - WARNING severity: Allows processing but flags issues
    
    Rule types and examples:
    - Null checks: row["field"] != null
    - Range validations: row["age"] >= 18 AND row["age"] <= 120
    - Format validations: LENGTH(row["phone"]) = 10
    - Business rules: row["end_date"] >= row["start_date"]
    - Lookup validations: LOOKUP_EXISTS("RefTable", "key", row["ref_id"])
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID containing the target field
    - targetFieldId: Target field ID to attach the validation rule to
    - name: Descriptive name for the validation rule
    - code: Validation expression/logic code
    
    Optional parameters:
    - critical: Whether rule is CRITICAL (true) or WARNING (false) - default: false
    - type: Rule type - ROW or DATASET - default: ROW
    - keepUncommittedData: Preserve uncommitted data when saving rule - default: false
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "targetFieldId": 101,
      "name": "Email Format Validation",
      "code": "row[\"email\"] != null AND CONTAINS(row[\"email\"], '@')",
      "critical": true,
      "type": "ROW",
      "keepUncommittedData": false
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
                    description: "Dataset ID containing the target field"
                },
                targetFieldId: {
                    type: "number",
                    description: "Target field ID to attach the validation rule to"
                },
                name: {
                    type: "string",
                    description: "Descriptive name for the validation rule"
                },
                code: {
                    type: "string",
                    description: "Validation expression/logic code"
                },
                critical: {
                    type: "boolean",
                    description: "Whether rule is CRITICAL (true) or WARNING (false)",
                    default: false
                },
                type: {
                    type: "string",
                    description: "Rule type - ROW or DATASET",
                    enum: ["ROW", "DATASET"],
                    default: "ROW"
                },
                keepUncommittedData: {
                    type: "boolean",
                    description: "Preserve uncommitted data when saving rule",
                    default: false
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "targetFieldId", "name", "code"]
        }
    },

    "update-validation-rule": {
        name: "update-validation-rule",
        description: `WHEN TO USE:
    - When modifying existing validation rules for target fields
    - When updating validation logic due to changing business requirements
    - When correcting validation rule errors or improving performance
    - When adjusting severity levels (CRITICAL vs WARNING) for validation rules
    - When changing rule types between ROW and DATASET level validations
    - When maintaining and evolving data quality standards
    
    Tool Description:
    Updates an existing validation rule for a target field in a dataset.
    
    Updates can include:
    - Changing validation logic and expressions
    - Modifying severity levels (CRITICAL/WARNING)
    - Switching between ROW and DATASET rule types
    - Updating rule names and descriptions
    - Adjusting data preservation settings
    
    All validation rule features supported:
    - Complex business logic expressions
    - Cross-field validation checks
    - Data format and range validations
    - Lookup table validations
    - Custom validation patterns
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID containing the target field
    - targetFieldId: Target field ID containing the validation rule
    - ruleId: ID of the validation rule to update
    - name: Updated name for the validation rule
    - code: Updated validation expression/logic code
    
    Optional parameters:
    - critical: Whether rule is CRITICAL (true) or WARNING (false) - default: false
    - type: Rule type - ROW or DATASET - default: ROW
    - keepUncommittedData: Preserve uncommitted data when updating rule - default: false
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "targetFieldId": 101,
      "ruleId": 202,
      "name": "Enhanced Email Validation",
      "code": "row[\"email\"] != null AND REGEX_MATCH(row[\"email\"], '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')",
      "critical": true,
      "type": "ROW",
      "keepUncommittedData": true
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
                    description: "Dataset ID containing the target field"
                },
                targetFieldId: {
                    type: "number",
                    description: "Target field ID containing the validation rule"
                },
                ruleId: {
                    type: "number",
                    description: "ID of the validation rule to update"
                },
                name: {
                    type: "string",
                    description: "Updated name for the validation rule"
                },
                code: {
                    type: "string",
                    description: "Updated validation expression/logic code"
                },
                critical: {
                    type: "boolean",
                    description: "Whether rule is CRITICAL (true) or WARNING (false)",
                    default: false
                },
                type: {
                    type: "string",
                    description: "Rule type - ROW or DATASET",
                    enum: ["ROW", "DATASET"],
                    default: "ROW"
                },
                keepUncommittedData: {
                    type: "boolean",
                    description: "Preserve uncommitted data when updating rule",
                    default: false
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "targetFieldId", "ruleId", "name", "code"]
        }
    },

    // ===== ADDITIONAL DATASET MANAGEMENT =====

    "update-dataset": {
        name: "update-dataset",
        description: `WHEN TO USE:
    - When updating dataset metadata such as name and description
    - When uploading configuration files to modify dataset structure
    - When applying dataset schema changes from external configuration files
    - When maintaining dataset documentation and descriptions
    - When synchronizing datasets with external configuration management
    - When performing administrative updates to dataset properties
    
    Tool Description:
    Updates an existing dataset's properties including name, description, and configuration files.
    
    Supports updating:
    - Dataset name and description
    - Configuration files (uploaded as base64 encoded data)
    - Dataset metadata and properties
    - Administrative settings and attributes
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: ID of the dataset to update
    
    Optional parameters:
    - name: Updated name for the dataset
    - description: Updated description for the dataset
    - filename: Name of configuration file to upload
    - filedata: Base64 encoded configuration file data
    
    Example usage:
    Update dataset metadata:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "name": "Updated Customer Dataset",
      "description": "Enhanced customer information with additional validation rules"
    }
    
    Upload configuration file:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "filename": "customer_config.json",
      "filedata": "base64encodedconfigdata..."
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
                    description: "ID of the dataset to update"
                },
                name: {
                    type: "string",
                    description: "Updated name for the dataset"
                },
                description: {
                    type: "string",
                    description: "Updated description for the dataset"
                },
                filename: {
                    type: "string",
                    description: "Name of configuration file to upload"
                },
                filedata: {
                    type: "string",
                    description: "Base64 encoded configuration file data"
                }
            },
            required: ["accountId", "workspaceId", "datasetId"]
        }
    },

    "archive-dataset": {
        name: "archive-dataset",
        description: `WHEN TO USE:
    - When archiving datasets for long-term storage and compliance
    - When removing datasets from active use while preserving data
    - When implementing data lifecycle management policies
    - When preparing datasets for backup or regulatory compliance
    - When cleaning up workspaces by archiving obsolete datasets
    - When transitioning datasets to read-only archived state
    
    Tool Description:
    Archives a dataset version, moving it from active use to archived state while preserving data and relationships.
    
    Archiving preserves:
    - All dataset data and records
    - Schema and field definitions
    - Validation rules and constraints
    - Mapping configurations (optionally specified)
    - Audit trail and metadata
    
    Archive operations:
    - Moves dataset to archived state
    - Preserves data integrity and relationships
    - Maintains compliance and audit requirements
    - Can include specific mapping configurations
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: ID of the dataset to archive
    
    Optional parameters:
    - mappings: Array of mapping IDs to include in the archive
    
    Example usage:
    Basic dataset archive:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789
    }
    
    Archive with specific mappings:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "mappings": [101, 102, 103]
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
                    description: "ID of the dataset to archive"
                },
                mappings: {
                    type: "array",
                    description: "Array of mapping IDs to include in the archive",
                    items: {
                        type: "number"
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId"]
        }
    },

    // ===== ASSET MANAGEMENT =====

    // Commented as URL not found
    // "get-task-status": {
    //     name: "get-task-status",
    //     description: `WHEN TO USE:
    // - When monitoring the progress of data processing tasks
    // - When checking if background data operations have completed
    // - When tracking the status of file uploads, transformations, or validations
    // - When debugging failed data processing operations
    // - When implementing automated workflows that depend on task completion
    // - When providing status updates to users during long-running operations
    
    // Tool Description:
    // Returns the current status and progress information for a specific data processing task.
    
    // Task statuses include:
    // - PENDING: Task queued for processing
    // - IN_PROGRESS: Task currently being executed
    // - COMPLETED: Task finished successfully
    // - FAILED: Task encountered errors and stopped
    // - CANCELLED: Task was cancelled by user or system
    
    // Required parameters:
    // - accountId: Account ID where the workspace belongs
    // - workspaceId: Workspace ID containing the dataset
    // - datasetId: Dataset ID associated with the task
    // - taskId: ID of the task to check status for
    
    // Example usage:
    // {
    //   "accountId": 123,
    //   "workspaceId": 456,
    //   "datasetId": 789,
    //   "taskId": 101112
    // }`,
    //     inputSchema: {
    //         type: "object",
    //         properties: {
    //             accountId: {
    //                 type: "number",
    //                 description: "Account ID where the workspace belongs"
    //             },
    //             workspaceId: {
    //                 type: "number",
    //                 description: "Workspace ID containing the dataset"
    //             },
    //             datasetId: {
    //                 type: "number",
    //                 description: "Dataset ID associated with the task"
    //             },
    //             taskId: {
    //                 type: "number",
    //                 description: "ID of the task to check status for"
    //             }
    //         },
    //         required: ["accountId", "workspaceId", "datasetId", "taskId"]
    //     }
    // },

    "get-asset": {
        name: "get-asset",
        description: `WHEN TO USE:
    - When retrieving details about a specific data asset
    - When checking asset metadata, state, and processing information
    - When auditing asset properties and configuration
    - When debugging asset-related issues or data processing problems
    - When reviewing asset creation dates and processing history
    - When preparing asset information for reporting or analysis
    
    Tool Description:
    Returns detailed information about a specific asset including its current state, metadata, and processing details.
    
    Asset information includes:
    - Asset ID and name
    - Current processing state
    - Creation and update timestamps
    - Associated dataset and workspace information
    - Processing status and progress
    - Error information (if applicable)
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID containing the asset
    - assetId: ID of the asset to retrieve
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "assetId": 101112
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
                    description: "Dataset ID containing the asset"
                },
                assetId: {
                    type: "number",
                    description: "ID of the asset to retrieve"
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "assetId"]
        }
    },

    "update-asset": {
        name: "update-asset",
        description: `WHEN TO USE:
    - When updating asset properties such as name and metadata
    - When modifying field mapping configurations for data processing
    - When correcting asset information or processing parameters
    - When updating asset metadata for better organization and tracking
    - When adjusting asset configurations for improved data processing
    - When maintaining asset information and documentation
    
    Tool Description:
    Updates an existing asset's properties including name, mapping configuration, and metadata.
    
    Asset updates can include:
    - Asset name and identification
    - Field mapping configurations for data transformation
    - Additional metadata and processing parameters
    - Administrative properties and settings
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID containing the asset
    - assetId: ID of the asset to update
    
    Optional parameters:
    - name: Updated name for the asset
    - mapping: Updated field mapping configuration object
    - metadata: Updated metadata as a string
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "assetId": 101112,
      "name": "Updated Customer Data Asset",
      "mapping": {
        "customer_id": "Customer ID",
        "customer_name": "Full Name",
        "email_address": "Email"
      },
      "metadata": "Updated processing parameters and validation rules"
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
                    description: "Dataset ID containing the asset"
                },
                assetId: {
                    type: "number",
                    description: "ID of the asset to update"
                },
                name: {
                    type: "string",
                    description: "Updated name for the asset"
                },
                mapping: {
                    type: "object",
                    description: "Updated field mapping configuration object"
                },
                metadata: {
                    type: "string",
                    description: "Updated metadata as a string"
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "assetId"]
        }
    },

    "get-asset-progress": {
        name: "get-asset-progress",
        description: `WHEN TO USE:
    - When monitoring the processing progress of data assets
    - When tracking the completion percentage of asset operations
    - When implementing progress bars or status indicators for data processing
    - When checking if asset processing has completed or encountered issues
    - When providing real-time feedback during long-running asset operations
    - When debugging asset processing performance or bottlenecks
    
    Tool Description:
    Returns the current processing progress and state information for a specific asset.
    
    Progress information includes:
    - Current asset processing state
    - Progress percentage (0-100)
    - Processing stage information
    - Related links and metadata
    - Asset ID and identification
    - Time-based progress indicators
    
    Asset processing states:
    - CREATED: Asset created but not yet processed
    - PROCESSING: Asset currently being processed
    - VERIFIED: Asset processed and verified successfully
    - FAILED: Asset processing failed with errors
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID containing the asset
    - assetId: ID of the asset to check progress for
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "assetId": 101112
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
                    description: "Dataset ID containing the asset"
                },
                assetId: {
                    type: "number",
                    description: "ID of the asset to check progress for"
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "assetId"]
        }
    },

    "get-asset-state": {
        name: "get-asset-state",
        description: `WHEN TO USE:
    - When checking the current state of an asset in the processing pipeline
    - When determining if an asset is ready for the next processing step
    - When troubleshooting asset processing issues or errors
    - When validating asset state before committing or archiving
    - When implementing conditional logic based on asset processing state
    - When auditing asset processing workflow and state transitions
    
    Tool Description:
    Returns the current processing state of an asset with detailed state information and error details if applicable.
    
    Asset states include:
    - CREATED: Asset created but processing not started
    - PROCESSING: Asset currently being processed or transformed
    - VERIFIED: Asset processed successfully and verified
    - FAILED: Asset processing failed with errors
    - COMMITTED: Asset processing completed and committed
    
    State information includes:
    - Current state identifier
    - Error messages (for CREATED state with errors)
    - Data transfer indicators (for verified assets)
    - Processing completion status
    - State transition information
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID containing the asset
    - assetId: ID of the asset to check state for
    
    Example usage:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "assetId": 101112
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
                    description: "Dataset ID containing the asset"
                },
                assetId: {
                    type: "number",
                    description: "ID of the asset to check state for"
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "assetId"]
        }
    },
    "commit-asset": {
        name: "commit-asset",
        description: `WHEN TO USE:
        - When finalizing data processing and committing verified assets
        - When completing the asset processing workflow after verification
        - When moving assets from verified state to committed state
        - When confirming data quality and applying changes permanently
        - When executing the final step of data ingestion pipelines
        - When transitioning from staging to production data state
        
        Tool Description:
        Commits changes in a verified asset, finalizing the data processing workflow.
        
        Asset must be in VERIFIED state before committing. Once committed, the asset
        data becomes part of the active dataset and cannot be easily rolled back.
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID containing the dataset
        - datasetId: Dataset ID containing the asset
        - assetId: Asset ID to commit
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "datasetId": 789,
          "assetId": 101112
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
                    description: "Dataset ID containing the asset",
                },
                assetId: {
                    type: "number",
                    description: "Asset ID to commit",
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "assetId"],
        },
    },

    "get-asset-error-summary": {
        name: "get-asset-error-summary",
        description: `WHEN TO USE:
        - When debugging asset processing failures and data validation errors
        - When reviewing data quality issues before committing assets
        - When generating error reports for data processing operations
        - When identifying patterns in validation failures across datasets
        - When troubleshooting data import issues and correction needs
        - When auditing data quality metrics and error statistics
        
        Tool Description:
        Returns a comprehensive summary of errors, warnings, and validation issues 
        within an asset, including detailed statistics and failed lookup information.
        
        Error summary includes:
        - Error counts by severity (critical, warnings, info, ignored)
        - Detailed error descriptions and affected fields
        - Failed lookup validations and missing reference data
        - Row-level error counts and correction statistics
        - Error categorization for targeted remediation
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID containing the dataset
        - datasetId: Dataset ID containing the asset
        - assetId: Asset ID to get error summary for
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "datasetId": 789,
          "assetId": 101112
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
                    description: "Dataset ID containing the asset",
                },
                assetId: {
                    type: "number",
                    description: "Asset ID to get error summary for",
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "assetId"],
        },
    },

    // Commented code as URL not found
    // "get-asset-editor-rows": {
    //     name: "get-asset-editor-rows",
    //     description: `WHEN TO USE:
    //     - When reviewing and editing individual data rows within an asset
    //     - When performing manual data corrections and validation reviews
    //     - When implementing data editing interfaces for asset management
    //     - When debugging specific row-level data issues or transformations
    //     - When providing paginated access to asset data for large datasets
    //     - When building asset data viewers and editing tools
        
    //     Tool Description:
    //     Retrieves paginated rows from an asset for editing and review purposes,
    //     including column order information and error indicators.
        
    //     Returns detailed row data with:
    //     - Individual row records with all field values
    //     - Column ordering for consistent display
    //     - Error indicators for problematic rows
    //     - Pagination support for large datasets
    //     - Editor-optimized data format
        
    //     Required parameters:
    //     - accountId: Account ID where the workspace belongs
    //     - workspaceId: Workspace ID containing the dataset
    //     - datasetId: Dataset ID containing the asset
    //     - assetId: Asset ID to get editor rows from
        
    //     Optional parameters:
    //     - max: Maximum records to return (default: 1000, max: 1000)
    //     - offset: Pagination offset (default: 0)
        
    //     Example usage:
    //     {
    //       "accountId": 123,
    //       "workspaceId": 456,
    //       "datasetId": 789,
    //       "assetId": 101112,
    //       "max": 500,
    //       "offset": 0
    //     }`,
    //     inputSchema: {
    //         type: "object",
    //         properties: {
    //             accountId: {
    //                 type: "number",
    //                 description: "Account ID where the workspace belongs",
    //             },
    //             workspaceId: {
    //                 type: "number",
    //                 description: "Workspace ID containing the dataset",
    //             },
    //             datasetId: {
    //                 type: "number",
    //                 description: "Dataset ID containing the asset",
    //             },
    //             assetId: {
    //                 type: "number",
    //                 description: "Asset ID to get editor rows from",
    //             },
    //             max: {
    //                 type: "number",
    //                 description: "Maximum number of records to return",
    //                 default: 1000,
    //             },
    //             offset: {
    //                 type: "number",
    //                 description: "Offset for pagination",
    //                 default: 0,
    //             }
    //         },
    //         required: ["accountId", "workspaceId", "datasetId", "assetId"],
    //     },
    // },

    // ===== SUPPLIER GROUPS - 1 Missing Tool =====

    "get-supplier-groups": {
        name: "get-supplier-groups",
        description: `WHEN TO USE:
        - When managing and organizing data suppliers within workspaces
        - When reviewing supplier group configurations and memberships
        - When auditing supplier access permissions and data sources
        - When preparing supplier-based data processing and routing
        - When generating reports on data supplier activity and usage
        - When implementing supplier-specific data governance rules
        
        Tool Description:
        Retrieves a list of supplier groups within a workspace for administrative
        management and organization of data sources and suppliers.
        
        Supplier groups help organize:
        - Data source providers and suppliers
        - Access permissions and data routing
        - Supplier-specific processing rules
        - Data quality and governance policies
        - Organizational data management structures
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID to get supplier groups from
        
        Optional parameters:
        - max: Maximum records to return (default: 10, max: 100)
        - offset: Pagination offset (default: 0)
        - filterBy: Filter criteria for searching supplier groups
        - name: Filter by supplier group name pattern
        - sort: Sort field and direction
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "max": 50,
          "filterBy": "active",
          "sort": "name asc"
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
                    description: "Workspace ID to get supplier groups from",
                },
                max: {
                    type: "number",
                    description: "Maximum number of records to return",
                    default: 10,
                },
                offset: {
                    type: "number",
                    description: "Offset for pagination",
                    default: 0,
                },
                filterBy: {
                    type: "string",
                    description: "Filter criteria for searching supplier groups",
                },
                name: {
                    type: "string",
                    description: "Filter by supplier group name pattern",
                },
                sort: {
                    type: "string",
                    description: "Sort field and direction",
                }
            },
            required: ["accountId", "workspaceId"],
        },
    },

    // ===== WORKSPACE VERSIONING - 5 Missing Tools =====

    "get-promotion-progress": {
        name: "get-promotion-progress",
        description: `WHEN TO USE:
        - When monitoring the progress of workspace configuration promotions
        - When tracking deployment status between environments (DRAFT → STAGED → PUBLISHED)
        - When implementing deployment dashboards and status indicators
        - When debugging failed or slow promotion operations
        - When providing real-time feedback during configuration deployments
        - When ensuring promotion completion before proceeding with dependent operations
        
        Tool Description:
        Returns the current status and progress of workspace configuration promotion
        operations between different scopes (environments).
        
        Promotion statuses include:
        - PENDING: Promotion queued for processing
        - IN_PROGRESS: Configuration actively being promoted
        - COMPLETED: Promotion finished successfully
        - FAILED: Promotion encountered errors
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID to check promotion progress for
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456
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
                    description: "Workspace ID to check promotion progress for",
                }
            },
            required: ["accountId", "workspaceId"],
        },
    },

    "compare-dataset-version": {
        name: "compare-dataset-version",
        description: `WHEN TO USE:
        - When reviewing changes between different versions of a dataset
        - When auditing dataset modifications before promotion or deployment
        - When implementing change review workflows and approval processes
        - When troubleshooting dataset configuration differences across environments
        - When generating change reports for dataset governance and compliance
        - When validating dataset changes match expected modifications
        
        Tool Description:
        Compares different versions of a dataset to identify changes in schema,
        validation rules, and configuration between environments or versions.
        
        Comparison includes:
        - Schema differences (added/removed/modified fields)
        - Validation rule changes
        - Configuration parameter modifications
        - Version-specific metadata changes
        - Source and target version identification
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID containing the dataset
        - datasetId: Dataset ID to compare versions for
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "datasetId": 789
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
                    description: "Dataset ID to compare versions for",
                }
            },
            required: ["accountId", "workspaceId", "datasetId"],
        },
    },

    // Commented As URL is not present
    // "get-configuration-changes": {
    //     name: "get-configuration-changes",
    //     description: `WHEN TO USE:
    //     - When auditing configuration changes between workspace environments
    //     - When reviewing pending changes before promotion to STAGED or PUBLISHED
    //     - When implementing change approval workflows and governance processes
    //     - When tracking configuration drift between environments
    //     - When generating change reports for compliance and documentation
    //     - When identifying datasets that require attention before deployment

    //     Tool Description:
    //     Returns a list of configuration changes between different workspace versions,
    //     showing which datasets have been modified and need review or promotion.

    //     Change tracking includes:
    //     - Dataset modification status and timestamps
    //     - Change types (schema, data, validation rules)
    //     - Source and target environment comparisons
    //     - Dataset names and identifiers
    //     - Change urgency and impact assessment

    //     Required parameters:
    //     - accountId: Account ID where the workspace belongs
    //     - workspaceId: Workspace ID to get changes for
    //     - target: Target environment to compare against (STAGED or PUBLISHED)

    //     Optional parameters:
    //     - max: Maximum records to return (default: 10, max: 100)
    //     - offset: Pagination offset (default: 0)
    //     - sort: Sort field and direction (default: "lastUpdated desc")
    //     - filter: Filter string for searching changes

    //     Example usage:
    //     {
    //       "accountId": 123,
    //       "workspaceId": 456,
    //       "target": "PUBLISHED",
    //       "max": 50,
    //       "sort": "lastUpdated desc"
    //     }`,
    //     inputSchema: {
    //         type: "object",
    //         properties: {
    //             accountId: {
    //                 type: "number",
    //                 description: "Account ID where the workspace belongs",
    //             },
    //             workspaceId: {
    //                 type: "number",
    //                 description: "Workspace ID to get changes for",
    //             },
    //             target: {
    //                 type: "string",
    //                 enum: ["STAGED", "PUBLISHED"],
    //                 description: "Target environment to compare against",
    //             },
    //             max: {
    //                 type: "number",
    //                 description: "Maximum number of records to return",
    //                 default: 10,
    //             },
    //             offset: {
    //                 type: "number",
    //                 description: "Offset for pagination",
    //                 default: 0,
    //             },
    //             sort: {
    //                 type: "string",
    //                 description: "Sort field and direction",
    //                 default: "lastUpdated desc",
    //             },
    //             filter: {
    //                 type: "string",
    //                 description: "Filter string for searching changes",
    //             }
    //         },
    //         required: ["accountId", "workspaceId", "target"],
    //     },
    // },

    "get-promotable-ids": {
        name: "get-promotable-ids",
        description: `WHEN TO USE:
        - When identifying which datasets can be promoted between environments
        - When preparing selective promotion operations for specific datasets
        - When implementing approval workflows that target specific configurations
        - When building promotion interfaces that allow dataset selection
        - When auditing dataset readiness for environment promotion
        - When filtering promotable content based on specific criteria
        
        Tool Description:
        Lists IDs of configuration items (primarily datasets) that are eligible
        for promotion between workspace environments.
        
        Helps identify:
        - Datasets ready for promotion from DRAFT to STAGED
        - Datasets ready for promotion from STAGED to PUBLISHED
        - Configuration items that meet promotion criteria
        - Filtered lists based on specific requirements
        - Promotion-eligible dataset collections
        
        Required parameters:
        - accountId: Account ID where the workspace belongs
        - workspaceId: Workspace ID to get promotable IDs from
        
        Optional parameters:
        - filter: Filter string for searching specific promotable items
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "filter": "name contains Customer"
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
                    description: "Workspace ID to get promotable IDs from",
                },
                filter: {
                    type: "string",
                    description: "Filter string for searching specific promotable items",
                }
            },
            required: ["accountId", "workspaceId"],
        },
    },

    // Coomented as URL is not present
    // "get-workspace-state": {
    //     name: "get-workspace-state",
    //     description: `WHEN TO USE:
    //     - When auditing the current state of all workspace environments
    //     - When checking version numbers and creation dates across DRAFT/STAGED/PUBLISHED
    //     - When determining if promotions are in progress or disabled
    //     - When implementing workspace status dashboards and monitoring
    //     - When validating workspace configuration before performing operations
    //     - When troubleshooting deployment issues and environment synchronization

    //     Tool Description:
    //     Returns the current state of a workspace across all environments,
    //     including version information, creation dates, and promotion status.

    //     Workspace state includes:
    //     - DRAFT environment: version, status, creation date, promotion status
    //     - STAGED environment: version, status, promotion capabilities and restrictions
    //     - PUBLISHED environment: version, status, deployment information
    //     - Promotion progress indicators and blocking conditions
    //     - Environment readiness and operational status

    //     Required parameters:
    //     - accountId: Account ID where the workspace belongs
    //     - workspaceId: Workspace ID to get state information for

    //     Example usage:
    //     {
    //       "accountId": 123,
    //       "workspaceId": 456
    //     }`,
    //     inputSchema: {
    //         type: "object",
    //         properties: {
    //             accountId: {
    //                 type: "number",
    //                 description: "Account ID where the workspace belongs",
    //             },
    //             workspaceId: {
    //                 type: "number",
    //                 description: "Workspace ID to get state information for",
    //             }
    //         },
    //         required: ["accountId", "workspaceId"],
    //     },
    // },

    // Note: This tool actually appears to already be implemented in your ManageToolDefinitions,
    // Since API of documetation is not available commented for now
    // "update-mapping": {
    //     name: "update-mapping",
    //     description: `WHEN TO USE:
    //     - When modifying existing mapping configurations
    //     - When updating field mappings due to source schema changes
    //     - When adding or removing mapping entries
    //     - When updating filter rules for data processing
    //     - When correcting mapping errors or optimizing performance
    //     - When adapting mappings for new data source formats

    //     Tool Description:
    //     Updates an existing mapping configuration with new entries, filter rules, or metadata.

    //     Required parameters:
    //     - accountId: Account ID where the workspace belongs
    //     - workspaceId: Workspace ID containing the dataset
    //     - datasetId: Dataset ID containing the mapping
    //     - mappingId: ID of the mapping to update
    //     - name: Updated name for the mapping configuration
    //     - entries: Updated array of mapping entry objects

    //     Optional parameters:
    //     - filter_rule_name: Name of the filter rule
    //     - filter_rule_code: Code for the filter rule

    //     Example usage:
    //     {
    //       "accountId": 123,
    //       "workspaceId": 456,
    //       "datasetId": 789,
    //       "mappingId": 101,
    //       "name": "Updated Player Statistics Mapping",
    //       "filter_rule_name": "Active Players Only",
    //       "filter_rule_code": "{status} == 'ACTIVE'",
    //       "entries": [
    //         {
    //           "expression": "{Player}",
    //           "target_field": "player_name",
    //           "description": "Maps player name from source"
    //         }
    //       ]
    //     }`,
    //     inputSchema: {
    //         type: "object",
    //         properties: {
    //             accountId: {
    //                 type: "number",
    //                 description: "Account ID where the workspace belongs",
    //             },
    //             workspaceId: {
    //                 type: "number",
    //                 description: "Workspace ID containing the dataset",
    //             },
    //             datasetId: {
    //                 type: "number",
    //                 description: "Dataset ID containing the mapping",
    //             },
    //             mappingId: {
    //                 type: "number",
    //                 description: "ID of the mapping to update",
    //             },
    //             name: {
    //                 type: "string",
    //                 description: "Updated name for the mapping configuration",
    //             },
    //             filter_rule_name: {
    //                 type: "string",
    //                 description: "Name of the filter rule",
    //             },
    //             filter_rule_code: {
    //                 type: "string",
    //                 description: "Code for the filter rule",
    //             },
    //             entries: {
    //                 type: "array",
    //                 description: "Updated array of mapping entry objects",
    //                 items: {
    //                     type: "object",
    //                     properties: {
    //                         expression: {
    //                             type: "string",
    //                             description: "Source field expression (e.g., '{Player}')",
    //                         },
    //                         target_field: {
    //                             type: "string",
    //                             description: "Target field name in dataset",
    //                         },
    //                         description: {
    //                             type: "string",
    //                             description: "Optional description of mapping rule",
    //                         }
    //                     },
    //                     required: ["expression", "target_field"],
    //                 }
    //             }
    //         },
    //         required: ["accountId", "workspaceId", "datasetId", "mappingId", "name", "entries"],
    //     },
    // },
    "create-target-fields": {
        name: "create-target-fields",
        description: `WHEN TO USE:
    - When creating initial target fields for a newly created dataset
    - When adding new field definitions to an existing dataset schema
    - When establishing the data structure for datasets that will receive data
    - When defining field properties, data types, and constraints for data validation
    - When setting up key components and mandatory field requirements
    - When building dataset schemas from scratch or expanding existing ones
    
    Tool Description:
    Creates new target fields for a dataset, defining the schema structure and field properties.
    
    This is different from update-dataset-targetfields which replaces the entire field set.
    This operation adds new fields to the existing dataset schema.
    
    Required parameters:
    - accountId: Account ID where the workspace belongs
    - workspaceId: Workspace ID containing the dataset
    - datasetId: Dataset ID to create target fields for
    - target_fields: Array of field definitions to create
    
    Each target field must include:
    - name: Field identifier (must avoid SQL reserved words)
    - type: One of ["string", "number", "integer", "date"]
    - mandatory: Boolean indicating if field is required
    - Optional: isKeyComponent (boolean), isCompound (boolean), description (string), sortOrder (number)
    
    IMPORTANT: Field names must NOT use SQL reserved words as they will be rejected by Verodat.
    
    Common SQL reserved words to avoid:
    SELECT, FROM, WHERE, ORDER, GROUP, BY, INSERT, UPDATE, DELETE, JOIN, CASE, 
    WHEN, THEN, ELSE, END, NULL, TRUE, FALSE, DATE, TIME, USER, COUNT, SUM, AVG
    
    Example usage:
    Creating target fields for a customer dataset:
    {
      "accountId": 123,
      "workspaceId": 456,
      "datasetId": 789,
      "target_fields": [
        {
          "name": "Customer ID",
          "type": "string",
          "mandatory": true,
          "isKeyComponent": true,
          "description": "Unique customer identifier"
        },
        {
          "name": "Customer Name",
          "type": "string",
          "mandatory": true,
          "description": "Full customer name"
        },
        {
          "name": "Registration Date",
          "type": "date",
          "mandatory": false,
          "description": "Date when customer registered"
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
                    description: "Dataset ID to create target fields for"
                },
                target_fields: {
                    type: "array",
                    description: "Array of field definitions to create",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Field name (must avoid SQL reserved words)"
                            },
                            type: {
                                type: "string",
                                enum: ["string", "number", "integer", "date"],
                                description: "Field data type"
                            },
                            mandatory: {
                                type: "boolean",
                                description: "Whether the field is required"
                            },
                            isKeyComponent: {
                                type: "boolean",
                                description: "Whether the field is a key component"
                            },
                            isCompound: {
                                type: "boolean",
                                description: "Whether the field is a compound field"
                            },
                            description: {
                                type: "string",
                                description: "Description of the field"
                            },
                            sortOrder: {
                                type: "number",
                                description: "Sort order of the field"
                            }
                        },
                        required: ["name", "type", "mandatory"]
                    }
                }
            },
            required: ["accountId", "workspaceId", "datasetId", "target_fields"]
        }
    }
};
