# Current Focus

**Date**: 2025-09-14 23:44:11
**Focus**: JIT User Provisioning Implementation - Eliminating Webhook Dependency for Referral System

## Session Context

### Issue Overview
Persistent timing issues between Clerk authentication and webhook-based User record creation causing referral system failures with `Foreign key constraint violated on the constraint: referral_codes_userId_fkey`. Previous debugging showed 10+ second gaps between authentication and User record availability.

### Root Cause Analysis
Webhook dependency creates timing race conditions where:
- Clerk authentication completes instantly
- User record creation via webhook takes 10+ seconds
- Referral processing fails due to missing User records

### Solution Strategy: Just-In-Time (JIT) User Provisioning
**Approach**: Create User records on-demand when first API call is made, eliminating webhook dependency

**Benefits**:
- ✅ Zero timing issues - User created when needed
- ✅ Eliminates webhook dependency entirely
- ✅ Immediate data consistency
- ✅ Simpler error handling

### Implementation Plan
1. Create `ensureUserExists()` utility function with Clerk API integration
2. Implement JIT pattern in referral processing API route
3. Update credits API to use JIT provisioning
4. Add comprehensive error handling and logging
5. Maintain webhook as fallback for batch operations

### Files to Modify
- `src/lib/utils/jit-user.ts` (NEW): JIT user provisioning utility
- `src/app/api/referrals/process/route.ts`: Replace user existence check with JIT provisioning
- `src/app/api/user/credits/route.ts`: Implement JIT pattern for user lookup

### Active Work
- **PR**: #164 - Enhanced referral system debugging
- **Issue**: #163 - Foreign key constraint error in referral system

### Goal
Eliminate webhook timing dependency and provide instant User record availability for referral system.

---

*Session started: 2025-09-14 23:44:11*