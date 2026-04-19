// Form validation utilities

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// Email validation
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (US/Canadian format)
export function isValidPhone(phone: string): boolean {
    // Allow various North American phone formats including +1 prefix
    const cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
    const phoneRegex = /^(\+?1)?[0-9]{10}$/;
    return phoneRegex.test(cleaned);
}

// Required field validation
export function isRequired(value: string | undefined | null): boolean {
    return value !== undefined && value !== null && value.trim() !== '';
}

// Minimum length validation
export function minLength(value: string, min: number): boolean {
    return value.length >= min;
}

// Maximum length validation  
export function maxLength(value: string, max: number): boolean {
    return value.length <= max;
}

// Validate seller onboarding form
export function validateSellerOnboarding(data: {
    businessName: string;
    description: string;
    location: string;
    phoneNumber: string;
}): ValidationResult {
    const errors: ValidationError[] = [];

    // Business name validation
    if (!isRequired(data.businessName)) {
        errors.push({ field: 'businessName', message: 'Business name is required' });
    } else if (!minLength(data.businessName, 2)) {
        errors.push({ field: 'businessName', message: 'Business name must be at least 2 characters' });
    } else if (!maxLength(data.businessName, 100)) {
        errors.push({ field: 'businessName', message: 'Business name must be less than 100 characters' });
    }

    // Description validation (optional, but if provided must be 10+ chars)
    if (data.description && !minLength(data.description, 10)) {
        errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    } else if (data.description && !maxLength(data.description, 1000)) {
        errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
    }

    // Location validation (optional)

    // Phone validation (optional but must be valid if provided)
    if (data.phoneNumber && !isValidPhone(data.phoneNumber)) {
        errors.push({ field: 'phoneNumber', message: 'Please enter a valid phone number' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Validate checkout form
export function validateCheckout(data: {
    shippingAddressId: string | null;
}): ValidationResult {
    const errors: ValidationError[] = [];

    if (!data.shippingAddressId) {
        errors.push({ field: 'shippingAddressId', message: 'Please select a shipping address' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Validate signup form
export function validateSignup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}): ValidationResult {
    const errors: ValidationError[] = [];

    // Email validation
    if (!isRequired(data.email)) {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    // Password validation
    if (!isRequired(data.password)) {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (!minLength(data.password, 8)) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    // First name validation
    if (!isRequired(data.firstName)) {
        errors.push({ field: 'firstName', message: 'First name is required' });
    }

    // Last name validation
    if (!isRequired(data.lastName)) {
        errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Get error message for a specific field
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
    const error = errors.find(e => e.field === field);
    return error?.message;
}
