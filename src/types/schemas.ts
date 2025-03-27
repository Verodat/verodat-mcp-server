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
