// Fixed cookie / storage key for the Supabase auth session. We override the
// default (which is derived from the project URL) so the browser and server
// stay in sync even when they use different hostnames to reach Supabase
// (e.g. browser → http://127.0.0.1:54331, container → http://host.docker.internal:54331).
export const SUPABASE_STORAGE_KEY = 'sb-sharesteak-auth-token';

// Returns the Supabase URL appropriate for the current execution context.
// On the server we prefer SUPABASE_URL when set (Docker uses this to point at
// host.docker.internal). On the browser process.env.SUPABASE_URL is undefined
// — Next.js only inlines NEXT_PUBLIC_* — so the fallback kicks in.
export function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL');
  return url;
}
