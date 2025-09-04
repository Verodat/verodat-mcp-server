import { z } from "zod";

export const FieldTypeEnum = z.enum(["string", "number", "integer", "date"]);
export type FieldType = z.infer<typeof FieldTypeEnum>;

export const MessageSchema = z.object({
    jsonrpc: z.literal("2.0"),
    id: z.union([z.number(), z.string()]).optional(),
    method: z.string().optional(),
    params: z.record(z.unknown()).optional(),
    result: z.unknown().optional(),
    error: z.object({
        code: z.number(),
        message: z.string(),
        data: z.unknown().optional()
    }).optional()
});

export const CreateDatasetArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    name: z.string(),
    description: z.string().optional(),
    targetFields: z
        .array(
            z.object({
                name: z.string(),
                type: FieldTypeEnum,
                mandatory: z.boolean(),
                isKeyComponent: z.boolean().optional(),
                description: z.string().optional(),
                validation_rules: z.array(z.object({
                    code: z.string(),
                    name: z.string(),
                    type: z.string(),
                    severity: z.enum(["CRITICAL", "WARNING"])
                })).optional()
            })
        )
        .nonempty(),
});

export const GetDatasetsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    offset: z.number().default(0),
    max: z.number().default(9999),
    filter: z.string()
});

export const GetDatasetOutputArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    offset: z.number().default(0),
    max: z.number().default(9999),
    filter: z.string()
});

export const GetWorkspacesArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
});

export const GetAIContextArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
});

export const ExecuteAIQueryArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    query: z.string()
});

export const GetDatasetTargetFieldsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    offset: z.number().default(0),
    max: z.number().default(1000),
    filter: z.string().optional(),
    sort: z.string().optional()
});

export const GetQueriesArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    offset: z.number().default(0),
    max: z.number().default(10),
    filter: z.string().optional(),
    sort: z.string().optional()
});

export const UploadDatasetRowsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    data: z.array(
        z.union([
            z.object({
                header: z.array(
                    z.object({
                        name: z.string(),
                        type: z.enum(["string", "numeric", "date"])
                    })
                )
            }),
            z.object({
                rows: z.array(z.array(z.union([z.string(), z.number(), z.null()])))
            })
        ])
    )
});

export const DeleteDatasetSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive()
});

export const PromoteConfigurationArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    scope: z.enum(["DRAFT", "STAGED", "PUBLISHED"]),
    keepUncommittedData: z.boolean().default(false).optional(),
    dataSetIds: z.array(z.number().int().positive()).default([]).optional(),
    promoteAll: z.boolean().default(true).optional()
});

const TargetFieldSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(["string", "number", "boolean", "date", "integer"]),
    mandatory: z.boolean(),
    isKeyComponent: z.boolean().optional(),
    isCompound: z.boolean().optional()
});

export const UpdateTargetFieldsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    targetFields: z.array(TargetFieldSchema)
});

export const AddMappingArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    name: z.string(),
    entries: z.array(
        z.object({
            expression: z.string(),
            target_field: z.string(),
            description: z.string().nullable().optional()
        })
    )
});

// File Management Schemas
export const UploadFileArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    filename: z.string(),
    filedata: z.string(), // base64 encoded
    metadata: z.string().optional(),
    assetId: z.number().int().positive().nullable().optional(),
    supplierGroupId: z.number().int().positive().nullable().optional(),
    bindAsset: z.boolean().default(false).optional(),
    dueDate: z.string().optional()
});

// Mapping Management Schemas (3 additional)
export const GetMappingsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    max: z.number().max(100).default(10),
    offset: z.number().default(0),
    filter: z.string().optional(),
    nameLike: z.string().optional()
});

export const GetMappingArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    mappingId: z.number().int().positive()
});

// export const UpdateMappingArgumentsSchema = z.object({
//     accountId: z.number().int().positive(),
//     workspaceId: z.number().int().positive(),
//     datasetId: z.number().int().positive(),
//     mappingId: z.number().int().positive(),
//     name: z.string().min(3).max(250),
//     filter_rule_name: z.string().optional(),
//     filter_rule_code: z.string().optional(),
//     entries: z.array(z.object({
//         expression: z.string(),
//         target_field: z.string(),
//         description: z.string().nullable().optional()
//     }))
// });

// Marketplace Schemas (2)
export const InstallRecipeArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    templateId: z.string().optional(),
    recipe: z.object({
        data_stores: z.array(z.object({
            name: z.string(),
            description: z.string(),
            target_fields: z.array(z.object({
                name: z.string(),
                description: z.string(),
                type: z.enum(["string", "integer", "number", "date", "boolean"]),
                mandatory: z.boolean(),
                isKeyComponent: z.boolean()
            })),
            files: z.array(z.object({
                filename: z.string(),
                metadata: z.object({
                    workSheet: z.string().optional(),
                    headerRows: z.array(z.number()).optional()
                }),
                filedata: z.string()
            })).optional(),
            mapping: z.object({
                name: z.string(),
                entries: z.array(z.object({
                    expression: z.string(),
                    target_field: z.string()
                }))
            }).optional()
        }))
    }).optional()
});

export const GetRecipeProgressArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    sequenceId: z.string()
});

// Code Evaluation Schemas (6)
export const CompileExpressionArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    expression: z.string().min(1)
});

export const EvaluateFilterRuleArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    expression: z.string().min(3),
    source_fields: z.array(z.object({
        name: z.string().min(1),
        value: z.string(),
        type: z.enum(["number", "integer", "string", "boolean", "date"])
    })),
    metadata: z.array(z.object({
        name: z.string().min(1),
        value: z.string()
    })).optional()
});

export const CompileFilterRuleArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(), 
    datasetId: z.number().int().positive(),
    expression: z.string().min(1),
    source_fields: z.array(z.object({
        name: z.string().min(1),
        value: z.string(),
        type: z.enum(["number", "integer", "string", "boolean", "date"])
    })),
    expressionTarget: z.enum(["FILTER"]).default("FILTER").optional()
});

export const EvaluateValidationRuleArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    validation_rules: z.array(z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        severity: z.enum(["CRITICAL", "WARNING"]).optional()
    })),
    target_fields: z.array(z.object({
        name: z.string().min(1),
        value: z.string(),
        type: z.enum(["number", "integer", "string", "boolean", "date"])
    }))
});

export const EvaluateTransformationRuleArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    trulename: z.string().min(1),
    trulecode: z.string().min(1),
    target_fields: z.array(z.object({
        name: z.string().min(1),
        value: z.string(),
        type: z.enum(["number", "integer", "string", "boolean", "date"])
    }))
});

export const EvaluateExpressionArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    expressions: z.array(z.object({
        expression: z.string(),
        target_type: z.enum(["number", "integer", "string", "boolean", "date"])
    })),
    source_fields: z.array(z.object({
        name: z.string().min(1),
        value: z.string(),
        type: z.enum(["number", "integer", "string", "boolean", "date"])
    })),
    metadata: z.array(z.object({
        name: z.string().min(1),
        value: z.string()
    })).optional()
});

// Target Field Validation Rules (2)
export const SaveValidationRuleArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    targetFieldId: z.number().int().positive(),
    name: z.string(),
    code: z.string(),
    critical: z.boolean().default(false),
    type: z.enum(["ROW", "DATASET"]).default("ROW"),
    keepUncommittedData: z.boolean().default(false)
});

export const UpdateValidationRuleArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    targetFieldId: z.number().int().positive(),
    ruleId: z.number().int().positive(),
    name: z.string(),
    code: z.string(),
    critical: z.boolean().default(false),
    type: z.enum(["ROW", "DATASET"]).default("ROW"),
    keepUncommittedData: z.boolean().default(false)
});

// Asset Management Schemas (8)
// export const GetTaskStatusArgumentsSchema = z.object({
//     accountId: z.number().int().positive(),
//     workspaceId: z.number().int().positive(),
//     datasetId: z.number().int().positive(),
//     taskId: z.number().int().positive()
// });

export const GetAssetArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    assetId: z.number().int().positive()
});

export const UpdateAssetArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    assetId: z.number().int().positive(),
    name: z.string().optional(),
    mapping: z.object({}).optional(),
    metadata: z.string().optional()
});

export const GetAssetProgressArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    assetId: z.number().int().positive()
});

export const GetAssetStateArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    assetId: z.number().int().positive()
});

export const CommitAssetArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    assetId: z.number().int().positive()
});

export const GetAssetErrorSummaryArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    assetId: z.number().int().positive()
});

// export const GetAssetEditorRowsArgumentsSchema = z.object({
//     accountId: z.number().int().positive(),
//     workspaceId: z.number().int().positive(),
//     datasetId: z.number().int().positive(),
//     assetId: z.number().int().positive(),
//     offset: z.number().default(0),
//     max: z.number().max(1000).default(1000)
// });

// Dataset Management Schemas (2)
export const UpdateDatasetArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    name: z.string().optional(),
    description: z.string().optional(),
    filename: z.string().optional(),
    filedata: z.string().optional()
});

// Supplier Group Schema (1)
export const GetSupplierGroupsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    max: z.number().max(100).default(10),
    offset: z.number().default(0),
    filterBy: z.string().optional(),
    name: z.string().optional(),
    sort: z.string().optional()
});

// Workspace Versioning Schemas (5)
export const GetPromotionProgressArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive()
});

export const CompareDatasetVersionArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive()
});

// export const GetConfigurationChangesArgumentsSchema = z.object({
//     accountId: z.number().int().positive(),
//     workspaceId: z.number().int().positive(),
//     target: z.enum(["STAGED", "PUBLISHED"]),
//     max: z.number().max(100).default(10),
//     offset: z.number().default(0),
//     sort: z.string().default("lastUpdated desc"),
//     filter: z.string().optional()
// });

export const GetPromotableIdsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    filter: z.string().optional()
});

// export const GetWorkspaceStateArgumentsSchema = z.object({
//     accountId: z.number().int().positive(),
//     workspaceId: z.number().int().positive()
// });

// Archive Dataset Schema (from DataSetVersioning)
export const ArchiveDatasetArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    mappings: z.array(z.number().int().positive()).optional()
});

// Target Field Creation Schema
export const CreateTargetFieldsArgumentsSchema = z.object({
    accountId: z.number().int().positive(),
    workspaceId: z.number().int().positive(),
    datasetId: z.number().int().positive(),
    target_fields: z.array(
        z.object({
            name: z.string(),
            type: z.enum(["string", "number", "integer", "date"]),
            description: z.string().optional(),
            mandatory: z.boolean(),
            isKeyComponent: z.boolean().optional(),
            isCompound: z.boolean().optional(),
            sortOrder: z.number().int().optional()
        })
    )
});