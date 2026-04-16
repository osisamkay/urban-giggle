'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    helpText?: string;
}

interface InputFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
    type?: 'text' | 'email' | 'password' | 'tel' | 'number';
}

interface TextareaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
    rows?: number;
}

// Input Field Component
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, error, required, helpText, type = 'text', ...props }, ref) => {
        return (
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                    ref={ref}
                    type={type}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors
                        focus:ring-2 focus:ring-meat-500 focus:border-meat-500 outline-none
                        ${error
                            ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${props.id}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p
                        id={`${props.id}-error`}
                        className="text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {helpText && !error && (
                    <p className="text-sm text-gray-500">{helpText}</p>
                )}
            </div>
        );
    }
);

InputField.displayName = 'InputField';

// Textarea Field Component
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
    ({ label, error, required, helpText, rows = 4, ...props }, ref) => {
        return (
            <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                    ref={ref}
                    rows={rows}
                    className={`
                        w-full px-4 py-3 rounded-lg border transition-colors resize-none
                        focus:ring-2 focus:ring-meat-500 focus:border-meat-500 outline-none
                        ${error
                            ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }
                    `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${props.id}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p
                        id={`${props.id}-error`}
                        className="text-sm text-red-600 flex items-center gap-1"
                        role="alert"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                {helpText && !error && (
                    <p className="text-sm text-gray-500">{helpText}</p>
                )}
            </div>
        );
    }
);

TextareaField.displayName = 'TextareaField';

// Select Field Component
interface SelectFieldProps extends BaseFieldProps {
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SelectField({
    label,
    error,
    required,
    helpText,
    options,
    value,
    onChange,
    placeholder
}: SelectFieldProps) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    w-full px-4 py-3 rounded-lg border transition-colors
                    focus:ring-2 focus:ring-meat-500 focus:border-meat-500 outline-none
                    ${error
                        ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                `}
                aria-invalid={!!error}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {helpText && !error && (
                <p className="text-sm text-gray-500">{helpText}</p>
            )}
        </div>
    );
}
