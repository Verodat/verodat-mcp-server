import { CONNECTION_TIMEOUT, MAX_MESSAGE_SIZE, MAX_REQUESTS_PER_MINUTE } from "../config/constants.js";
import { MessageSchema } from "../types/schemas.js";
import { RateLimiter } from "../utils/rateLimiter.js";
export class SecureStdioTransport {
    rateLimiter;
    connectionActive = false;
    messageQueue = [];
    lastHealthCheck = Date.now();
    constructor() {
        this.rateLimiter = new RateLimiter(MAX_REQUESTS_PER_MINUTE, 60000);
    }
    onmessage;
    onerror;
    onclose;
    async start() {
        try {
            this.connectionActive = true;
            this.startHealthCheck();
            process.stdin.on('data', async (data) => {
                try {
                    await this.handleIncomingMessage(data);
                }
                catch (error) {
                    this.handleError(error);
                }
            });
            process.stdin.on('end', () => this.close());
            process.stdin.on('error', (error) => this.handleError(error));
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    async handleIncomingMessage(data) {
        if (data.length > MAX_MESSAGE_SIZE) {
            throw new Error(`Message size exceeds limit of ${MAX_MESSAGE_SIZE} bytes`);
        }
        if (!this.rateLimiter.tryAcquire()) {
            throw new Error('Rate limit exceeded');
        }
        try {
            const message = JSON.parse(data.toString());
            const validatedMessage = MessageSchema.parse(message);
            this.messageQueue.push({
                message: validatedMessage,
                timestamp: Date.now()
            });
            if (this.onmessage) {
                await this.onmessage(validatedMessage);
            }
            this.cleanMessageQueue();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Invalid message format: ${error.message}`);
            }
            throw error;
        }
    }
    async send(message) {
        try {
            const validatedMessage = MessageSchema.parse(message);
            if (!this.connectionActive) {
                throw new Error('Transport is not connected');
            }
            const messageSize = Buffer.from(JSON.stringify(validatedMessage)).length;
            if (messageSize > MAX_MESSAGE_SIZE) {
                throw new Error(`Message size exceeds limit of ${MAX_MESSAGE_SIZE} bytes`);
            }
            process.stdout.write(JSON.stringify(validatedMessage) + '\n');
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    handleError(error) {
        if (this.onerror) {
            this.onerror(error);
        }
    }
    cleanMessageQueue() {
        const now = Date.now();
        const timeoutThreshold = now - CONNECTION_TIMEOUT;
        this.messageQueue = this.messageQueue.filter(item => item.timestamp > timeoutThreshold);
    }
    startHealthCheck() {
        setInterval(() => {
            const now = Date.now();
            if (now - this.lastHealthCheck > CONNECTION_TIMEOUT) {
                this.handleError(new Error('Health check failed - connection timeout'));
                this.close();
            }
            this.lastHealthCheck = now;
        }, 5000);
    }
    async close() {
        this.connectionActive = false;
        this.messageQueue = [];
        if (this.onclose) {
            this.onclose();
        }
    }
}
