import { describe, it, expect } from 'vitest';
import { calculateTax } from '@/lib/tax';

describe('calculateTax', () => {
  it('calculates Alberta GST (5%)', () => {
    const result = calculateTax(100, 'AB');
    expect(result.rate).toBe(0.05);
    expect(result.amount).toBe(5);
    expect(result.label).toBe('GST (5%)');
  });

  it('calculates Ontario HST (13%)', () => {
    const result = calculateTax(100, 'ON');
    expect(result.rate).toBe(0.13);
    expect(result.amount).toBe(13);
    expect(result.label).toBe('HST (13%)');
  });

  it('calculates BC GST+PST (12%)', () => {
    const result = calculateTax(100, 'BC');
    expect(result.rate).toBe(0.12);
    expect(result.amount).toBe(12);
  });

  it('defaults to Alberta rates', () => {
    const result = calculateTax(100);
    expect(result.rate).toBe(0.05);
    expect(result.amount).toBe(5);
  });

  it('rounds to 2 decimal places', () => {
    const result = calculateTax(33.33, 'AB');
    expect(result.amount).toBe(1.67); // 33.33 * 0.05 = 1.6665 → 1.67
  });

  it('handles zero subtotal', () => {
    const result = calculateTax(0, 'AB');
    expect(result.amount).toBe(0);
  });
});
