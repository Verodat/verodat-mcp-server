import { z } from "zod";
export declare const FieldTypeEnum: z.ZodEnum<["string", "number", "integer", "date"]>;
export type FieldType = z.infer<typeof FieldTypeEnum>;
export declare const MessageSchema: z.ZodObject<{
    jsonrpc: z.ZodLiteral<"2.0">;
    id: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodString]>>;
    method: z.ZodOptional<z.ZodString>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    result: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodNumber;
        message: z.ZodString;
        data: z.ZodOptional<z.ZodUnknown>;
    }, "strip", z.ZodTypeAny, {
        code: number;
        message: string;
        data?: unknown;
    }, {
        code: number;
        message: string;
        data?: unknown;
    }>>;
}, "strip", z.ZodTypeAny, {
    jsonrpc: "2.0";
    params?: Record<string, unknown> | undefined;
    id?: string | number | undefined;
    method?: string | undefined;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    } | undefined;
}, {
    jsonrpc: "2.0";
    params?: Record<string, unknown> | undefined;
    id?: string | number | undefined;
    method?: string | undefined;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    } | undefined;
}>;
export declare const CreateDatasetArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    targetFields: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["string", "number", "integer", "date"]>;
        mandatory: z.ZodBoolean;
        isKeyComponent: z.ZodOptional<z.ZodBoolean>;
        description: z.ZodOptional<z.ZodString>;
        validation_rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            name: z.ZodString;
            type: z.ZodString;
            severity: z.ZodEnum<["CRITICAL", "WARNING"]>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }, {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "string" | "number" | "integer" | "date";
        name: string;
        mandatory: boolean;
        description?: string | undefined;
        isKeyComponent?: boolean | undefined;
        validation_rules?: {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }[] | undefined;
    }, {
        type: "string" | "number" | "integer" | "date";
        name: string;
        mandatory: boolean;
        description?: string | undefined;
        isKeyComponent?: boolean | undefined;
        validation_rules?: {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }[] | undefined;
    }>, "atleastone">;
}, "strip", z.ZodTypeAny, {
    accountId: number;
    workspaceId: number;
    name: string;
    targetFields: [{
        type: "string" | "number" | "integer" | "date";
        name: string;
        mandatory: boolean;
        description?: string | undefined;
        isKeyComponent?: boolean | undefined;
        validation_rules?: {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }[] | undefined;
    }, ...{
        type: "string" | "number" | "integer" | "date";
        name: string;
        mandatory: boolean;
        description?: string | undefined;
        isKeyComponent?: boolean | undefined;
        validation_rules?: {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }[] | undefined;
    }[]];
    description?: string | undefined;
}, {
    accountId: number;
    workspaceId: number;
    name: string;
    targetFields: [{
        type: "string" | "number" | "integer" | "date";
        name: string;
        mandatory: boolean;
        description?: string | undefined;
        isKeyComponent?: boolean | undefined;
        validation_rules?: {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }[] | undefined;
    }, ...{
        type: "string" | "number" | "integer" | "date";
        name: string;
        mandatory: boolean;
        description?: string | undefined;
        isKeyComponent?: boolean | undefined;
        validation_rules?: {
            code: string;
            type: string;
            name: string;
            severity: "CRITICAL" | "WARNING";
        }[] | undefined;
    }[]];
    description?: string | undefined;
}>;
export declare const GetDatasetsArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
    offset: z.ZodDefault<z.ZodNumber>;
    max: z.ZodDefault<z.ZodNumber>;
    filter: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filter: string;
    accountId: number;
    workspaceId: number;
    offset: number;
    max: number;
}, {
    filter: string;
    accountId: number;
    workspaceId: number;
    offset?: number | undefined;
    max?: number | undefined;
}>;
export declare const GetDatasetOutputArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
    datasetId: z.ZodNumber;
    offset: z.ZodDefault<z.ZodNumber>;
    max: z.ZodDefault<z.ZodNumber>;
    filter: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filter: string;
    accountId: number;
    workspaceId: number;
    offset: number;
    max: number;
    datasetId: number;
}, {
    filter: string;
    accountId: number;
    workspaceId: number;
    datasetId: number;
    offset?: number | undefined;
    max?: number | undefined;
}>;
export declare const GetWorkspacesArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    accountId: number;
}, {
    accountId: number;
}>;
export declare const GetAIContextArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    accountId: number;
    workspaceId: number;
}, {
    accountId: number;
    workspaceId: number;
}>;
export declare const ExecuteAIQueryArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    accountId: number;
    workspaceId: number;
    query: string;
}, {
    accountId: number;
    workspaceId: number;
    query: string;
}>;
export declare const GetDatasetTargetFieldsArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
    datasetId: z.ZodNumber;
    offset: z.ZodDefault<z.ZodNumber>;
    max: z.ZodDefault<z.ZodNumber>;
    filter: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountId: number;
    workspaceId: number;
    offset: number;
    max: number;
    datasetId: number;
    sort?: string | undefined;
    filter?: string | undefined;
}, {
    accountId: number;
    workspaceId: number;
    datasetId: number;
    sort?: string | undefined;
    filter?: string | undefined;
    offset?: number | undefined;
    max?: number | undefined;
}>;
export declare const GetQueriesArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
    offset: z.ZodDefault<z.ZodNumber>;
    max: z.ZodDefault<z.ZodNumber>;
    filter: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountId: number;
    workspaceId: number;
    offset: number;
    max: number;
    sort?: string | undefined;
    filter?: string | undefined;
}, {
    accountId: number;
    workspaceId: number;
    sort?: string | undefined;
    filter?: string | undefined;
    offset?: number | undefined;
    max?: number | undefined;
}>;
export declare const UploadDatasetRowsArgumentsSchema: z.ZodObject<{
    accountId: z.ZodNumber;
    workspaceId: z.ZodNumber;
    datasetId: z.ZodNumber;
    data: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        header: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["string", "numeric", "date"]>;
        }, "strip", z.ZodTypeAny, {
            type: "string" | "date" | "numeric";
            name: string;
        }, {
            type: "string" | "date" | "numeric";
            name: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        header: {
            type: "string" | "date" | "numeric";
            name: string;
        }[];
    }, {
        header: {
            type: "string" | "date" | "numeric";
            name: string;
        }[];
    }>, z.ZodObject<{
        rows: z.ZodArray<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]>, "many">, "many">;
    }, "strip", z.ZodTypeAny, {
        rows: (string | number | null)[][];
    }, {
        rows: (string | number | null)[][];
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    data: ({
        header: {
            type: "string" | "date" | "numeric";
            name: string;
        }[];
    } | {
        rows: (string | number | null)[][];
    })[];
    accountId: number;
    workspaceId: number;
    datasetId: number;
}, {
    data: ({
        header: {
            type: "string" | "date" | "numeric";
            name: string;
        }[];
    } | {
        rows: (string | number | null)[][];
    })[];
    accountId: number;
    workspaceId: number;
    datasetId: number;
}>;
export declare const StartProcedureSchema: z.ZodObject<{
    procedureId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    procedureId: string;
}, {
    procedureId: string;
}>;
export declare const ListProceduresSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ResumeProcedureSchema: z.ZodObject<{
    runId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    runId: string;
}, {
    runId: string;
}>;
export declare const QuizAnswerSchema: z.ZodObject<{
    __runId: z.ZodString;
    answer: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
}, "strip", z.ZodTypeAny, {
    __runId: string;
    answer: string | string[];
}, {
    __runId: string;
    answer: string | string[];
}>;
export declare const ApprovalCheckSchema: z.ZodObject<{
    __runId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    __runId: string;
}, {
    __runId: string;
}>;
export declare const InformationAckSchema: z.ZodObject<{
    __runId: z.ZodString;
    acknowledged: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    __runId: string;
    acknowledged: boolean;
}, {
    __runId: string;
    acknowledged: boolean;
}>;
export declare const WaitContinueSchema: z.ZodObject<{
    __runId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    __runId: string;
}, {
    __runId: string;
}>;
