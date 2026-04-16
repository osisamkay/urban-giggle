'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!token) {
      router.push('/forgot-password');
    }
  }, [token, router]);

  const validateForm = () => {
    const newErrors = {
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { authApi } = await import('@/lib/api');
      await authApi.updatePassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setErrors({ ...errors, password: err?.message || 'Failed to reset password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: 'password' | 'confirmPassword', value: string) => {
    if (field === 'password') {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (isSuccess) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
            Password Reset Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-display font-bold text-meat-600 mb-2">
            ShareSteak
          </h1>
        </Link>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter your new password"
              autoFocus
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-sm text-gray-600">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-meat-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Password Requirements:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>At least 8 characters long</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-meat-600 text-white py-3 rounded-lg font-semibold hover:bg-meat-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-meat-600 hover:text-meat-700 font-medium text-sm inline-flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-meat-50 to-white flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
