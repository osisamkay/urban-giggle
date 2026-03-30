import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isRequired,
  minLength,
  maxLength,
  validateSignup,
  validateCheckout,
  validateSellerOnboarding,
  getFieldError,
} from '@/lib/validation';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.ca')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid phone numbers', () => {
    expect(isValidPhone('4031234567')).toBe(true);
    expect(isValidPhone('(403) 123-4567')).toBe(true);
    // +1 prefix with 10 digits = 11 chars, regex expects 10 digit format
    expect(isValidPhone('403-123-4567')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abc')).toBe(false);
  });
});

describe('isRequired', () => {
  it('passes for non-empty strings', () => {
    expect(isRequired('hello')).toBe(true);
  });

  it('fails for empty/null/undefined', () => {
    expect(isRequired('')).toBe(false);
    expect(isRequired('   ')).toBe(false);
    expect(isRequired(null)).toBe(false);
    expect(isRequired(undefined)).toBe(false);
  });
});

describe('minLength / maxLength', () => {
  it('validates minimum length', () => {
    expect(minLength('ab', 2)).toBe(true);
    expect(minLength('a', 2)).toBe(false);
  });

  it('validates maximum length', () => {
    expect(maxLength('abc', 5)).toBe(true);
    expect(maxLength('abcdef', 5)).toBe(false);
  });
});

describe('validateSignup', () => {
  it('passes with valid data', () => {
    const result = validateSignup({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails with missing email', () => {
    const result = validateSignup({
      email: '',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.isValid).toBe(false);
    expect(getFieldError(result.errors, 'email')).toBeDefined();
  });

  it('fails with short password', () => {
    const result = validateSignup({
      email: 'test@example.com',
      password: '123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.isValid).toBe(false);
    expect(getFieldError(result.errors, 'password')).toContain('8 characters');
  });
});

describe('validateCheckout', () => {
  it('passes with shipping address', () => {
    const result = validateCheckout({ shippingAddressId: 'addr-123' });
    expect(result.isValid).toBe(true);
  });

  it('fails without shipping address', () => {
    const result = validateCheckout({ shippingAddressId: null });
    expect(result.isValid).toBe(false);
  });
});

describe('validateSellerOnboarding', () => {
  it('passes with valid data', () => {
    const result = validateSellerOnboarding({
      businessName: 'Alberta Meats',
      description: 'Premium Alberta beef direct to your door',
      location: 'Calgary, AB',
      phoneNumber: '4031234567',
    });
    expect(result.isValid).toBe(true);
  });

  it('fails with missing business name', () => {
    const result = validateSellerOnboarding({
      businessName: '',
      description: '',
      location: '',
      phoneNumber: '',
    });
    expect(result.isValid).toBe(false);
    expect(getFieldError(result.errors, 'businessName')).toBeDefined();
  });
});
