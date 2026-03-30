// Environment variable validation — fail fast if required vars are missing

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `   Copy .env.example to .env.local and fill in your values.`
    );
  }
  return value;
}

// Public (available in browser)
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requireEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Server-only (only accessible in API routes / server components)
export const serverEnv = {
  get SUPABASE_SERVICE_ROLE_KEY() {
    return requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  },
  get STRIPE_SECRET_KEY() {
    return requireEnv('STRIPE_SECRET_KEY');
  },
  get STRIPE_WEBHOOK_SECRET() {
    return process.env.STRIPE_WEBHOOK_SECRET || '';
  },
} as const;
