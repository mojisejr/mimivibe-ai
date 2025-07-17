// Validation utilities for API requests

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
  return str.trim().slice(0, maxLength)
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