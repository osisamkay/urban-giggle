import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/rateLimit';

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const result = rateLimit('test-user-1', { maxRequests: 5, windowMs: 60000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks requests over the limit', () => {
    const id = 'test-user-block-' + Date.now();
    for (let i = 0; i < 3; i++) {
      rateLimit(id, { maxRequests: 3, windowMs: 60000 });
    }
    const result = rateLimit(id, { maxRequests: 3, windowMs: 60000 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks remaining requests', () => {
    const id = 'test-user-remaining-' + Date.now();
    const r1 = rateLimit(id, { maxRequests: 5, windowMs: 60000 });
    expect(r1.remaining).toBe(4);

    const r2 = rateLimit(id, { maxRequests: 5, windowMs: 60000 });
    expect(r2.remaining).toBe(3);
  });

  it('resets after window expires', () => {
    const id = 'test-user-expire-' + Date.now();
    // Use a very short window
    rateLimit(id, { maxRequests: 1, windowMs: 1 });

    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = rateLimit(id, { maxRequests: 1, windowMs: 1 });
        expect(result.success).toBe(true);
        resolve();
      }, 10);
    });
  });
});
