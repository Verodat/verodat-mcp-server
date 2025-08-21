interface ServerConfig {
    authToken?: string;
}
export declare const setServerConfig: (config: Partial<ServerConfig>) => void;
export declare const getAuthToken: (toolName: string) => string;
export declare const setApiBaseUrl: (url: string) => void;
export {};
