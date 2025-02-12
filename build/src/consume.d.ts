import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
export declare const MAX_MESSAGE_SIZE: number;
export declare const MAX_REQUESTS_PER_MINUTE = 100;
export declare const CONNECTION_TIMEOUT = 30000;
export declare class SecureStdioTransport implements Transport {
    private rateLimiter;
    private connectionActive;
    private messageQueue;
    private lastHealthCheck;
    constructor();
    onmessage?: (message: any) => void;
    onerror?: (error: Error) => void;
    onclose?: () => void;
    start(): Promise<void>;
    handleIncomingMessage(data: Buffer): Promise<void>;
    send(message: any): Promise<void>;
    private handleError;
    private cleanMessageQueue;
    private startHealthCheck;
    close(): Promise<void>;
}
