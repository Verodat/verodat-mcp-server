export class RateLimiter {
    tokens;
    lastRefill;
    maxTokens;
    refillInterval;
    constructor(maxTokens, refillInterval) {
        this.maxTokens = maxTokens;
        this.tokens = maxTokens;
        this.lastRefill = Date.now();
        this.refillInterval = refillInterval;
    }
    tryAcquire() {
        this.refill();
        if (this.tokens > 0) {
            this.tokens--;
            return true;
        }
        return false;
    }
    refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        if (elapsed >= this.refillInterval) {
            this.tokens = this.maxTokens;
            this.lastRefill = now;
        }
    }
}
