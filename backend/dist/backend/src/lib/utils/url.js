"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseUrl = getBaseUrl;
exports.buildUrl = buildUrl;
exports.buildReferralUrl = buildReferralUrl;
/**
 * Get the current base URL dynamically based on environment
 * Supports localhost, Vercel deployments, and custom domains
 */
function getBaseUrl(req) {
    // In the browser, use window.location for client-side detection
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    // Server-side URL detection from request headers (most accurate for dynamic environments)
    if (req && req.headers) {
        const host = req.headers.get('host');
        if (host) {
            // Determine protocol based on forwarded headers or host
            const forwardedProto = req.headers.get('x-forwarded-proto');
            const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https');
            return `${protocol}://${host}`;
        }
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
    // Production fallback - updated to actual domain
    return 'https://mimivibe.com';
}
/**
 * Build a full URL with the given path
 * Supports dynamic URL detection from request context
 */
function buildUrl(path = '', req) {
    const baseUrl = getBaseUrl(req);
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Add trailing slash to baseUrl if not present and we have a path
    const separator = cleanPath && !baseUrl.endsWith('/') ? '/' : '';
    return `${baseUrl}${separator}${cleanPath}`;
}
/**
 * Generate a referral link with dynamic URL detection
 * @param referralCode The referral code to include in the link
 * @param req Optional request object for server-side URL detection
 * @returns Complete referral URL
 */
function buildReferralUrl(referralCode, req) {
    const baseUrl = getBaseUrl(req);
    return `${baseUrl}?ref=${referralCode}`;
}
//# sourceMappingURL=url.js.map