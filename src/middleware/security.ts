// Security middleware for XSS protection and request sanitization
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeString } from '../lib/validations'

// Security headers for XSS protection
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://api.openai.com https://generativelanguage.googleapis.com;"
}

// Sanitize request body recursively
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value)
    }
    return sanitized
  }
  
  return obj
}

// Security middleware function
export async function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // For POST/PUT/PATCH requests, sanitize the body
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const contentType = request.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        const body = await request.json()
        const sanitizedBody = sanitizeObject(body)
        
        // Create new request with sanitized body
        const sanitizedRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(sanitizedBody)
        })
        
        return NextResponse.next({
          request: sanitizedRequest
        })
      }
    } catch (error) {
      // If body parsing fails, continue with original request
      console.warn('Security middleware: Failed to parse request body', error)
    }
  }
  
  return response
}

// Rate limiting configuration for security
export const SECURITY_RATE_LIMITS = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  },
  
  // AI endpoint specific rate limiting
  ai: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 AI requests per minute
    message: 'Too many AI requests, please wait before trying again.'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  }
}

// Security event logging
export interface SecurityEvent {
  type: 'XSS_ATTEMPT' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_REQUEST' | 'AI_ABUSE'
  ip: string
  userAgent: string
  url: string
  timestamp: Date
  details?: any
}

export function logSecurityEvent(event: SecurityEvent) {
  // In production, this would log to a security monitoring service
  console.warn('Security Event:', {
    ...event,
    timestamp: event.timestamp.toISOString()
  })
  
  // TODO: Integrate with external security monitoring service
  // TODO: Store in database for security metrics API
}