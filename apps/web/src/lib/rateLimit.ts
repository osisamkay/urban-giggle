// Simple in-memory rate limiter for API routes
// For production, use Redis or Upstash

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs?: number;  // Time window in ms (default: 60s)
  maxRequests?: number; // Max requests per window (default: 30)
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): { success: boolean; remaining: number; resetIn: number } {
  const { windowMs = 60_000, maxRequests = 30 } = config;
  const now = Date.now();

  const entry = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

// Helper for API route handlers
export function checkRateLimit(
  request: Request,
  config?: RateLimitConfig
): Response | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const result = rateLimit(ip, config);

  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(result.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return null; // No rate limit hit
}
