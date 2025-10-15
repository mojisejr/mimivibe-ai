/**
 * Just-In-Time (JIT) User Provisioning Utility
 *
 * This utility eliminates webhook dependency by creating User records on-demand
 * when first API call is made, solving timing issues between Clerk authentication
 * and database synchronization.
 */
export interface JITUserResult {
    user: any;
    wasCreated: boolean;
}
/**
 * Ensure user exists in database, creating via Clerk API if needed
 * This eliminates timing issues with webhook-based user creation
 */
export declare function ensureUserExists(userId: string): Promise<JITUserResult>;
/**
 * Get user with JIT provisioning - simplified interface
 * Returns user record, creating it if needed
 */
export declare function getOrCreateUser(userId: string): Promise<any>;
//# sourceMappingURL=jit-user.d.ts.map