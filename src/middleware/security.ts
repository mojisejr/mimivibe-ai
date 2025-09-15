// Security middleware for API routes
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeString, sanitizeUserInput, sanitizeHTML } from '@/lib/validations'

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// XSS Protection middleware
export function withXSSProtection(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      // Add security headers
      const response = await handler(req, ...args)
      
      if (response instanceof NextResponse) {
        Object.entries(securityHeaders).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      }
      
      return response
    } catch (error) {
      console.error('XSS Protection middleware error:', error)
      return NextResponse.json(
        { error: 'Security validation failed' },
        { status: 400 }
      )
    }
  }
}

// Body validation middleware
export function withBodyValidation(options?: {
  maxSize?: number
  allowedContentTypes?: string[]
  sanitizeFields?: string[]
}) {
  const {
    maxSize = 1024 * 1024, // 1MB default
    allowedContentTypes = ['application/json', 'text/plain'],
    sanitizeFields = []
  } = options || {}

  return function(handler: Function) {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        // Check content type
        const contentType = req.headers.get('content-type')
        if (contentType && !allowedContentTypes.some(type => contentType.includes(type))) {
          return NextResponse.json(
            { error: 'Invalid content type' },
            { status: 400 }
          )
        }

        // Check content length
        const contentLength = req.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > maxSize) {
          return NextResponse.json(
            { error: 'Request body too large' },
            { status: 413 }
          )
        }

        // Parse and sanitize body if JSON
        if (contentType?.includes('application/json')) {
          try {
            const body = await req.json()
            
            // Sanitize specified fields
            if (sanitizeFields.length > 0) {
              sanitizeFields.forEach(field => {
                if (body[field] && typeof body[field] === 'string') {
                  body[field] = sanitizeUserInput(body[field])
                }
              })
            }
            
            // Create new request with sanitized body
            const sanitizedReq = new NextRequest(req.url, {
              method: req.method,
              headers: req.headers,
              body: JSON.stringify(body)
            })
            
            return handler(sanitizedReq, ...args)
          } catch (error) {
            return NextResponse.json(
              { error: 'Invalid JSON body' },
              { status: 400 }
            )
          }
        }

        return handler(req, ...args)
      } catch (error) {
        console.error('Body validation middleware error:', error)
        return NextResponse.json(
          { error: 'Request validation failed' },
          { status: 400 }
        )
      }
    }
  }
}

// Input sanitization helpers
export function sanitizeRequestBody(body: any, options?: {
  allowHTML?: boolean
  maxFieldLength?: number
  requiredFields?: string[]
}): { sanitized: any; errors: string[] } {
  const { allowHTML = false, maxFieldLength = 1000, requiredFields = [] } = options || {}
  const errors: string[] = []
  const sanitized: any = {}

  // Check required fields
  requiredFields.forEach(field => {
    if (!body[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })

  // Sanitize all string fields
  Object.keys(body).forEach(key => {
    const value = body[key]
    
    if (typeof value === 'string') {
      if (value.length > maxFieldLength) {
        errors.push(`Field ${key} exceeds maximum length of ${maxFieldLength}`)
        return
      }
      
      sanitized[key] = sanitizeUserInput(value, {
        allowHTML,
        maxLength: maxFieldLength
      })
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' 
          ? sanitizeUserInput(item, { allowHTML, maxLength: maxFieldLength })
          : item
      )
    } else if (value && typeof value === 'object') {
      // Recursively sanitize nested objects
      const nested = sanitizeRequestBody(value, { allowHTML, maxFieldLength })
      sanitized[key] = nested.sanitized
      errors.push(...nested.errors)
    } else {
      sanitized[key] = value
    }
  })

  return { sanitized, errors }
}

// Rate limiting helper for security events
export function logSecurityEvent(event: {
  type: 'XSS_ATTEMPT' | 'INJECTION_ATTEMPT' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_INPUT'
  ip?: string
  userAgent?: string
  endpoint?: string
  details?: any
}) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    ...event,
    severity: getSeverityLevel(event.type)
  }
  
  // Log to console (in production, this should go to a proper logging service)
  console.warn('Security Event:', JSON.stringify(logEntry))
  
  // TODO: In production, send to monitoring service
  // await sendToMonitoringService(logEntry)
}

function getSeverityLevel(eventType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  switch (eventType) {
    case 'XSS_ATTEMPT':
    case 'INJECTION_ATTEMPT':
      return 'HIGH'
    case 'RATE_LIMIT_EXCEEDED':
      return 'MEDIUM'
    case 'INVALID_INPUT':
      return 'LOW'
    default:
      return 'MEDIUM'
  }
}

// Security validation for common patterns
export function validateSecureInput(input: string, type: 'email' | 'username' | 'text' | 'html'): {
  isValid: boolean
  sanitized: string
  errors: string[]
} {
  const errors: string[] = []
  let sanitized = input
  let isValid = true

  if (!input || typeof input !== 'string') {
    return { isValid: false, sanitized: '', errors: ['Input is required and must be a string'] }
  }

  switch (type) {
    case 'email':
      sanitized = sanitizeString(input, 254) // RFC 5321 limit
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(sanitized)) {
        isValid = false
        errors.push('Invalid email format')
      }
      break
      
    case 'username':
      sanitized = sanitizeString(input, 50)
      const usernameRegex = /^[a-zA-Z0-9_-]+$/
      if (!usernameRegex.test(sanitized)) {
        isValid = false
        errors.push('Username can only contain letters, numbers, underscores, and hyphens')
      }
      break
      
    case 'text':
      sanitized = sanitizeUserInput(input, { allowHTML: false, maxLength: 1000 })
      break
      
    case 'html':
      sanitized = sanitizeHTML(input, {
        allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
        maxLength: 2000
      })
      break
      
    default:
      sanitized = sanitizeString(input)
  }

  return { isValid, sanitized, errors }
}