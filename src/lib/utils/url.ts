/**
 * Get the current base URL dynamically based on environment
 */
export function getBaseUrl(): string {
  // In the browser, use window.location
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // On server side, try to get from environment variables first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Try to construct from Vercel environment variables (production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Try to get from common hosting environment variables
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Production fallback - this should be overridden by environment variables
  return 'https://your-domain.com';
}

/**
 * Build a full URL with the given path
 */
export function buildUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Add trailing slash to baseUrl if not present and we have a path
  const separator = cleanPath && !baseUrl.endsWith('/') ? '/' : '';
  
  return `${baseUrl}${separator}${cleanPath}`;
}