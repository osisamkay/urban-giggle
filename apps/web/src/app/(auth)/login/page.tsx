'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const RESEND_COOLDOWN_SECONDS = 30;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/products';

  const { signIn, signInWithGoogle, signInWithMagicLink, verifyOtp, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [resendCooldown]);

  const startCooldown = () => setResendCooldown(RESEND_COOLDOWN_SECONDS);

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError('');
    setResending(true);
    try {
      await signInWithMagicLink(email);
      startCooldown();
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isMagicLink) {
        await signInWithMagicLink(email);
        setMagicLinkSent(true);
        startCooldown();
      } else {
        await signIn(email, password);

        // Redirect based on role
        const user = useAuthStore.getState().user;
        if (user?.role === 'ADMIN') {
          router.push('/admin');
        } else if (user?.role === 'SELLER') {
          router.push('/dashboard/seller');
        } else {
          router.push(redirect);
        }
      }
    } catch (err: any) {
      setError(err?.message || (isMagicLink ? 'Failed to send magic link' : 'Invalid email or password'));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp(email, otpCode);
      router.push(redirect);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired code');
    }
  };

  if (magicLinkSent) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6 text-center animate-blob">
        <div className="mx-auto h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50/50">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter verification code</h2>
          <p className="text-gray-500">
            We sent a 6-digit code to <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="block w-full text-center text-2xl tracking-[0.5em] font-mono py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-meat-500 focus:border-meat-500"
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={otpCode.length !== 6 || isLoading}
            className="w-full py-3 bg-meat-600 text-white font-semibold rounded-xl hover:bg-meat-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
        <p className="text-sm text-gray-400">
          Or click the magic link in the email.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || resending}
            className="text-sm font-semibold text-meat-600 hover:text-meat-700 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resending
              ? 'Resending...'
              : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Resend code'}
          </button>
          <button
            type="button"
            onClick={() => { setMagicLinkSent(false); setOtpCode(''); setError(''); setResendCooldown(0); }}
            className="text-sm font-semibold text-meat-600 hover:text-meat-700 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-gray-900 rounded-xl flex items-center justify-center mb-3">
          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-gray-500 text-sm">Sign in to continue to ShareSteak</p>
      </div>

      {error && (
        <div className="bg-red-50/90 backdrop-blur-sm border-l-4 border-red-500 p-3 rounded-r-xl animate-shake">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="group w-full flex items-center justify-center gap-3 px-4 py-2.5 border-2 border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meat-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Continue with Google</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/80 text-gray-500 font-medium">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-meat-500 focus:border-meat-500 transition-all hover:border-gray-300" placeholder="you@example.com" />
          </div>
        </div>

        {!isMagicLink && (
          <div className="space-y-1 animate-fadeIn">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required={!isMagicLink} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-11 pr-12 py-2.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-meat-500 focus:border-meat-500 transition-all hover:border-gray-300" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center">
            {!isMagicLink && (
              <>
                <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-meat-600 focus:ring-meat-500 border-gray-300 rounded cursor-pointer transition-all" />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer select-none">Remember me</label>
              </>
            )}
          </div>
          <div className="text-sm">
            <button type="button" onClick={() => { setIsMagicLink(!isMagicLink); setError(''); }} className="font-semibold text-meat-600 hover:text-meat-700 transition-colors hover:underline">
              {isMagicLink ? 'Use password' : 'Use magic link'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-meat-600 to-meat-700 hover:from-meat-700 hover:to-meat-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meat-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]">
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{isMagicLink ? 'Sending...' : 'Signing in...'}</span>
            </>
          ) : (
            <>
              <span>{isMagicLink ? 'Send Magic Link' : 'Sign in'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-4 border-t-2 border-gray-100">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-meat-600 hover:text-meat-700 transition-colors hover:underline">Create one now</Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-gray-600">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="font-semibold text-meat-600 hover:text-meat-700 hover:underline">Terms of Service</Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-semibold text-meat-600 hover:text-meat-700 hover:underline">Privacy Policy</Link>
      </p>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-meat-600"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
