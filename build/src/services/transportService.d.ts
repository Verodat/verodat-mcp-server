import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
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
