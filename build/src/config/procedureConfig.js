/**
 * Configuration for the Procedure system
 */
export const defaultProcedureConfig = {
    cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        refreshInterval: 60 * 1000 // 1 minute
    },
    enforcement: {
        enabled: true,
        strict: false,
        runExpiry: 5 * 60 * 1000, // 5 minutes
        maxConcurrentRuns: 10,
        requireForWrite: true, // Always require procedures for WRITE operations
        requireForRead: false // Don't require procedures for READ operations by default
    },
    verodat: {
        datasetName: 'AI_Agent_Procedures',
        defaultWorkspaceId: undefined,
        defaultAccountId: undefined,
        refreshOnStart: true
    },
    logging: {
        level: 'info',
        auditEnabled: true,
        auditPath: '.procedure-audit'
    },
    retry: {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2
    }
};
/**
 * Storage configuration (separate from main config for backward compatibility)
 */
export const storageConfig = {
    stateDirectory: '.procedure-state',
    runFileName: 'procedure-runs.json'
};
/**
 * Merge user config with defaults
 */
export function mergeConfig(userConfig) {
    if (!userConfig) {
        return defaultProcedureConfig;
    }
    return {
        cache: {
            ...defaultProcedureConfig.cache,
            ...(userConfig.cache || {})
        },
        enforcement: {
            ...defaultProcedureConfig.enforcement,
            ...(userConfig.enforcement || {})
        },
        verodat: {
            ...defaultProcedureConfig.verodat,
            ...(userConfig.verodat || {})
        },
        logging: {
            ...defaultProcedureConfig.logging,
            ...(userConfig.logging || {})
        },
        retry: {
            ...defaultProcedureConfig.retry,
            ...(userConfig.retry || {})
        }
    };
}
/**
 * Get storage path for procedure runs
 */
export function getStoragePath() {
    return `${storageConfig.stateDirectory}/${storageConfig.runFileName}`;
}
/**
 * Get audit log path
 */
export function getAuditPath(procedureId) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    return `${defaultProcedureConfig.logging.auditPath}/${procedureId}-${timestamp}.log`;
}
