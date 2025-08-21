export declare class RateLimiter {
    private tokens;
    private lastRefill;
    private readonly maxTokens;
    private readonly refillInterval;
    constructor(maxTokens: number, refillInterval: number);
    tryAcquire(): boolean;
    private refill;
}
