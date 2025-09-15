// Validation utilities for API requests
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// Initialize DOMPurify for server-side usage
const window = new JSDOM('').window
const purify = DOMPurify(window as any)

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidEventType(eventType: string): boolean {
  const validEventTypes = [
    'READING_SPEND', 
    'STRIPE_TOPUP', 
    'REWARD', 
    'COIN_TO_STAR', 
    'DAILY_LOGIN', 
    'REFERRAL'
  ]
  return validEventTypes.includes(eventType)
}

export function sanitizeString(str: string, maxLength: number = 255): string {
  if (!str || typeof str !== 'string') return ''
  
  // Basic sanitization: trim and limit length
  let sanitized = str.trim().slice(0, maxLength)
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>"'&]/g, '')
  
  return sanitized
}

export function sanitizeHTML(html: string, options?: {
  allowedTags?: string[]
  allowedAttributes?: string[]
  maxLength?: number
}): string {
  if (!html || typeof html !== 'string') return ''
  
  const { allowedTags = [], allowedAttributes = [], maxLength = 1000 } = options || {}
  
  // Limit length first
  const limitedHtml = html.slice(0, maxLength)
  
  // Configure DOMPurify
  const config: any = {
    ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: allowedAttributes.length > 0 ? allowedAttributes : [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  }
  
  return purify.sanitize(limitedHtml, config) as unknown as string
}

export function sanitizeUserInput(input: string, options?: {
  allowHTML?: boolean
  maxLength?: number
  stripScripts?: boolean
}): string {
  if (!input || typeof input !== 'string') return ''
  
  const { allowHTML = false, maxLength = 500, stripScripts = true } = options || {}
  
  // Limit length first
  let sanitized = input.slice(0, maxLength)
  
  if (allowHTML) {
    // Use HTML sanitization for rich content
    sanitized = sanitizeHTML(sanitized, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      allowedAttributes: []
    })
  } else {
    // Strip all HTML and dangerous characters
    sanitized = sanitized.replace(/<[^>]*>/g, '') // Remove HTML tags
    sanitized = sanitized.replace(/[<>"'&]/g, '') // Remove dangerous chars
  }
  
  if (stripScripts) {
    // Remove script-like content
    sanitized = sanitized.replace(/javascript:/gi, '')
    sanitized = sanitized.replace(/on\w+\s*=/gi, '')
    sanitized = sanitized.replace(/data:/gi, '')
  }
  
  return sanitized.trim()
}

export function validatePagination(page?: string, limit?: string) {
  const pageNum = Math.max(1, parseInt(page || '1'))
  const limitNum = Math.min(Math.max(1, parseInt(limit || '20')), 100)
  
  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  }
}

export interface ValidationError {
  field: string
  message: string
}

export function validateUserProfileUpdate(data: any): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (data.name && typeof data.name !== 'string') {
    errors.push({ field: 'name', message: 'Name must be a string' })
  }
  
  if (data.name && data.name.length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' })
  }
  
  if (data.email && typeof data.email !== 'string') {
    errors.push({ field: 'email', message: 'Email must be a string' })
  }
  
  if (data.email && !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }
  
  if (data.imageUrl && typeof data.imageUrl !== 'string') {
    errors.push({ field: 'imageUrl', message: 'Image URL must be a string' })
  }
  
  if (data.imageUrl && data.imageUrl.length > 500) {
    errors.push({ field: 'imageUrl', message: 'Image URL must be less than 500 characters' })
  }
  
  return errors
}