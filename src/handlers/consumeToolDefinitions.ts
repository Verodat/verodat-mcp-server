import { ToolDefinition } from "./BaseToolHandler.js";

/**
 * VERODAT CONSUME TOOLS — Data Analyst Role
 * 
 * Purpose: Reading, querying, and analysing PUBLISHED data. This is the "read-only" interface.
 * Use for: Reports, dashboards, SQL queries, data exploration, and analytical work.
 * Do NOT use for: Uploading data, creating datasets, modifying schemas, or promoting environments.
 * 
 * When all three Verodat servers are available (consume, design, manage):
 *   - verodat-consume: Data analyst work — querying and reading published data
 *   - verodat-design:  Data architect work — creating datasets, designing schemas, building data models
 *   - verodat-manage:  Data engineer work — uploading data, committing assets, promoting schemas, managing environments
 * 
 * ENVIRONMENT MODEL:
 *   DRAFT (Design)    → For building/testing schema. Only test data should exist here.
 *   STAGED (Staging)   → For validating schema changes against sample production data.
 *   PUBLISHED (Prod)   → Live production environment. Consume tools query this scope by default.
 *   NOTE: Promotion (DRAFT→STAGED→PUBLISHED) moves SCHEMA ONLY. Data is always live regardless of scope.
 */
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
        
        ⚠️ CRITICAL - NULL FIELD HANDLING:
        When datasets contain null/empty values in fields, the returned data columns can SHIFT, 
        causing data misalignment. When processing returned data:
        - ALWAYS use the returned header row to map column positions to field names
        - Do NOT assume column positions are fixed — null fields may cause columns to shift
        - When using this data in downstream SQL queries (via execute-ai-query), wrap nullable 
          fields with COALESCE(field_name, '') to prevent column shifting in results
        - Validate row lengths match the header count before processing
        
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
        
        SERVER ROLE: This is a verodat-consume tool (Data Analyst role).
        Use consume tools for: reading published data, running SQL queries, reports, analysis.
        Use verodat-design for: creating datasets, designing schemas.
        Use verodat-manage for: uploading data, committing assets, promoting schemas.
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
        - ALWAYS call this BEFORE using execute-ai-query — it provides the schema needed to write correct SQL
        - Before executing AI queries to understand available data structure
        - When needing to know the schema of datasets for consumption
        - When planning complex queries across multiple datasets
        - When validating data relationships before analysis
        - When you need comprehensive metadata about workspace structure
        
        Tool Description:
        Retrieves comprehensive workspace context to facilitate effective data consumption and analysis.
        This returns dataset schemas, field definitions, validation rules, and relationships 
        that are ESSENTIAL for writing correct SQL queries via execute-ai-query.
        
        WORKFLOW: Always call get-ai-context FIRST, then use the schema information 
        it returns to construct your SQL query for execute-ai-query.
        
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
        - When generating reports on data using SQL queries
        - When auditing data for compliance or quality issues
        - When validating data integrity across datasets
        - When checking for data inconsistencies or anomalies
        - When performing cross-dataset joins and aggregations
        
        Tool Description:
        Executes SQL queries against Snowflake views of published datasets.

        ⚠️ MANDATORY PREREQUISITE:
        Before using this tool, ALWAYS invoke "get-ai-context" first to retrieve the exact 
        schema structure. Do NOT guess table or column names.

        ⚠️ CRITICAL — SNOWFLAKE SQL SYNTAX RULES:
        These queries run on Snowflake. You MUST follow these syntax rules:
        
        1. DATE FUNCTIONS: Use CURRENT_DATE (no parentheses), NOT CURRENT_DATE()
        2. STRING CONCATENATION: Use CONCAT(a, b, c), NOT a || b || c
        3. NULL HANDLING: ALWAYS wrap nullable fields with COALESCE(field_name, '') or 
           COALESCE(field_name, 0) to prevent column shifting in results. This is CRITICAL —
           without COALESCE, null values cause columns to shift and data becomes misaligned.
        4. TABLE NAMES: Use the Snowflake view names from get-ai-context. Dataset names are 
           converted to snake_case for Snowflake (e.g., "Company Facts" becomes "company_facts").
           Only PUBLISHED scope datasets have Snowflake views available for querying.
        5. COLUMN NAMES: Use snake_case versions of target field names 
           (e.g., "Company Name" becomes "company_name")
        6. STRING COMPARISONS: Snowflake is case-sensitive by default. Use UPPER() or LOWER() 
           for case-insensitive comparisons, or use ILIKE instead of LIKE.
        7. FIRST_VALUE/LAST_VALUE: These window functions work in Snowflake. Use them with 
           OVER (PARTITION BY ... ORDER BY ...) syntax.
        8. SPLIT_TO_TABLE: Use TABLE(SPLIT_TO_TABLE(column, ',')) for splitting comma-separated values.
        9. DATES: Use TO_DATE() or TRY_TO_DATE() for date conversions. Date literals use 'YYYY-MM-DD' format.

        FOREIGN KEY RELATIONSHIPS:
        - Use the LOOKUP_EXISTS validation rules from get-ai-context to determine foreign key relationships.
        - LOOKUP_EXISTS("Products","unique_id",row["Product Id"]) means "Product Id" in the child 
          dataset references the "Unique Id" primary key in the parent "Products" dataset.
        - Primary keys are identified by "isKeyComponent": true (can be compound with "isCompound": true).
        
        Required parameters:
        - accountId: Account ID
        - workspaceId: Workspace ID
        - query: SQL query to execute
        
        Example usage:
        {
          "accountId": 123,
          "workspaceId": 456,
          "query": "SELECT COALESCE(company_name, '') as company_name, COALESCE(industry, '') as industry, COUNT(*) as contact_count FROM contacts c JOIN companies co ON c.company_domain = co.company_domain WHERE c.company_domain IS NOT NULL GROUP BY company_name, industry ORDER BY contact_count DESC"
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


