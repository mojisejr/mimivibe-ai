/**
 * Get the current base URL dynamically based on environment
 * Supports localhost, Vercel deployments, and custom domains
 */
export declare function getBaseUrl(req?: Request): string;
/**
 * Build a full URL with the given path
 * Supports dynamic URL detection from request context
 */
export declare function buildUrl(path?: string, req?: Request): string;
/**
 * Generate a referral link with dynamic URL detection
 * @param referralCode The referral code to include in the link
 * @param req Optional request object for server-side URL detection
 * @returns Complete referral URL
 */
export declare function buildReferralUrl(referralCode: string, req?: Request): string;
//# sourceMappingURL=url.d.ts.map