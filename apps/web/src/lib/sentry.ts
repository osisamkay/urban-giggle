// Sentry error tracking setup
// Install: pnpm add @sentry/nextjs
// Then run: npx @sentry/wizard@latest -i nextjs

// For now, this is a lightweight error reporter that logs to console
// and can be swapped for Sentry when ready

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: { id: string; email: string };
}

export function captureException(error: Error, context?: ErrorContext) {
  // If Sentry is configured, send there
  // if (SENTRY_DSN) { Sentry.captureException(error, context); return; }

  // Fallback: structured console error
  console.error('[ShareSteak Error]', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[ShareSteak ${level.toUpperCase()}]`, message);
}

export function setUser(user: { id: string; email: string } | null) {
  // When Sentry is configured: Sentry.setUser(user);
  if (user) {
    console.log('[ShareSteak] User context set:', user.id);
  }
}
