// SECURITY ENHANCEMENT: Rate limiting implementation for payment APIs
import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class InMemoryRateLimit {
  private store: RateLimitStore = {}
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      Object.keys(this.store).forEach(key => {
        if (this.store[key].resetTime < now) {
          delete this.store[key]
        }
      })
    }, 60000)
  }

  async isAllowed(
    identifier: string,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    maxRequests: number = 5
  ): Promise<{ allowed: boolean; resetTime: number; remaining: number }> {
    const now = Date.now()
    const resetTime = now + windowMs

    if (!this.store[identifier] || this.store[identifier].resetTime < now) {
      // First request or window expired
      this.store[identifier] = {
        count: 1,
        resetTime
      }
      return {
        allowed: true,
        resetTime,
        remaining: maxRequests - 1
      }
    }

    const current = this.store[identifier]
    if (current.count >= maxRequests) {
      return {
        allowed: false,
        resetTime: current.resetTime,
        remaining: 0
      }
    }

    current.count++
    return {
      allowed: true,
      resetTime: current.resetTime,
      remaining: maxRequests - current.count
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

const rateLimiter = new InMemoryRateLimit()

export interface RateLimitConfig {
  windowMs?: number
  maxRequests?: number
  keyGenerator?: (request: NextRequest) => string
  skipIf?: (request: NextRequest) => boolean
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): Promise<NextResponse | null> {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 5,
    keyGenerator = (req) => getClientIdentifier(req),
    skipIf = () => false
  } = config

  // Skip rate limiting if condition is met
  if (skipIf(request)) {
    return null
  }

  const identifier = keyGenerator(request)
  const result = await rateLimiter.isAllowed(identifier, windowMs, maxRequests)

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }

  return null // Allow request to proceed
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from headers (set by auth middleware)
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }

  // Fallback to IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

// Payment-specific rate limiting configurations
export const paymentRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // Max 5 payment attempts per 15 minutes
  keyGenerator: (req) => getClientIdentifier(req)
}

export const webhookRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // Max 100 webhooks per minute (generous for Stripe)
  keyGenerator: (req) => 'stripe:webhook'
}

export const historyRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute  
  maxRequests: 30, // Max 30 history requests per minute
  keyGenerator: (req) => getClientIdentifier(req)
}

export const apiRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // Max 60 API requests per minute
  keyGenerator: (req) => getClientIdentifier(req)
}

export const adminRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // Max 10 admin requests per minute
  keyGenerator: (req) => getClientIdentifier(req)
}