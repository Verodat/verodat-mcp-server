export const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB
export const MAX_REQUESTS_PER_MINUTE = 100;
export const CONNECTION_TIMEOUT = 30000; // 30 seconds

export const API_CONFIG = {
    BASE_URL: "https://verodat.io/api/v3",
    VERSION: "v3",
    DEFAULT_HEADERS: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*"
    }
};