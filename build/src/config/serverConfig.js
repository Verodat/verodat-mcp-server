import { API_CONFIG } from "./constants.js";
let serverConfig = {};
export const setServerConfig = (config) => {
    serverConfig = { ...serverConfig, ...config };
};
export const getAuthToken = (toolName) => {
    if (serverConfig.authToken) {
        return serverConfig.authToken;
    }
    throw new Error(`${toolName} requires an authToken. Please provide it in the request or configure it in Claude settings.`);
};
export const setApiBaseUrl = (url) => {
    API_CONFIG.BASE_URL = url;
};
