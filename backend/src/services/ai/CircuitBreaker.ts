export class CircuitBreaker {
    private failureCount: number = 0;
    private failureThreshold: number;
    private resetTimeout: number;
    private nextAttempt: number = Date.now();
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
    constructor(threshold: number = 3, timeout: number = 30000) {
      this.failureThreshold = threshold;
      this.resetTimeout = timeout;
    }
  
    public async execute<T>(action: () => Promise<T>): Promise<T> {
      if (this.state === 'OPEN') {
        if (Date.now() > this.nextAttempt) {
          this.state = 'HALF_OPEN';
        } else {
          throw new Error('Circuit Breaker is OPEN: AI Service is temporarily unavailable.');
        }
      }
  
      try {
        const result = await action();
        this.onSuccess();
        return result;
      } catch (error) {
        this.onFailure();
        throw error;
      }
    }
  
    private onSuccess() {
      this.failureCount = 0;
      this.state = 'CLOSED';
    }
  
    private onFailure() {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.resetTimeout;
        console.warn(`[CircuitBreaker] Threshold reached. Circuit OPEN for ${this.resetTimeout}ms.`);
      }
    }
  }
