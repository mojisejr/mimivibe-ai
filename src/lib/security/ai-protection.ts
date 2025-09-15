import { sanitizeString, sanitizeUserInput } from '@/lib/validations'
import { NextRequest } from 'next/server'

// Security event types for AI system
export enum SecurityEventType {
  PROMPT_INJECTION = 'prompt_injection',
  SUSPICIOUS_PATTERN = 'suspicious_pattern',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MALICIOUS_INPUT = 'malicious_input',
  AI_ABUSE_DETECTED = 'ai_abuse_detected',
  MODEL_MANIPULATION = 'model_manipulation'
}

// Security event interface
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  userId?: string
  ipAddress: string
  userAgent: string
  details: {
    input?: string
    pattern?: string
    endpoint?: string
    metadata?: Record<string, any>
  }
  blocked: boolean
}

// Prompt injection patterns to detect
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction attempts
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/i,
  /forget\s+(everything|all|previous|above)/i,
  /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/i,
  
  // Role manipulation
  /you\s+are\s+(now|a|an)\s+(assistant|ai|bot|system|admin|developer)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(a|an)?\s*(assistant|ai|bot|system|admin|developer)/i,
  /pretend\s+(to\s+be|you\s+are)\s+(a|an)?\s*(assistant|ai|bot|system|admin)/i,
  
  // System prompt extraction
  /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/i,
  /what\s+(are\s+)?(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/i,
  /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/i,
  
  // Jailbreak attempts
  /\[\s*system\s*\]/i,
  /\[\s*user\s*\]/i,
  /\[\s*assistant\s*\]/i,
  /<\s*system\s*>/i,
  /<\s*user\s*>/i,
  /<\s*assistant\s*>/i,
  
  // Code injection attempts
  /```\s*(python|javascript|bash|sh|cmd)/i,
  /exec\s*\(/i,
  /eval\s*\(/i,
  /system\s*\(/i,
  
  // Tarot-specific manipulation attempts
  /ignore\s+tarot\s+(rules|guidelines|format)/i,
  /don't\s+(use|follow)\s+tarot\s+(format|style|personality)/i,
  /skip\s+the\s+tarot\s+(reading|format|style)/i,
  /instead\s+of\s+tarot/i
]

// Suspicious patterns that might indicate abuse
const SUSPICIOUS_PATTERNS = [
  // Repeated characters or patterns
  /(.{1,3})\1{10,}/,
  
  // Excessive special characters
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{20,}/,
  
  // Base64 encoded content (potential payload)
  /[A-Za-z0-9+\/]{50,}={0,2}/,
  
  // Hex encoded content
  /[0-9a-fA-F]{40,}/,
  
  // Multiple language scripts (potential obfuscation)
  /[\u4e00-\u9fff][\u0400-\u04ff][\u0590-\u05ff]/,
  
  // Excessive whitespace or control characters
  /\s{100,}/,
  /[\x00-\x1f\x7f-\x9f]{5,}/
]

// Security event store (in-memory for now, should be moved to database)
const securityEvents: SecurityEvent[] = []

/**
 * Analyzes user input for potential prompt injection attempts
 */
export function analyzePromptInjection(input: string): {
  isInjection: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  patterns: string[]
  confidence: number
} {
  const detectedPatterns: string[] = []
  let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  let confidence = 0
  
  // Check for prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      detectedPatterns.push(pattern.source)
      confidence += 0.3
      
      // Determine severity based on pattern type
      if (pattern.source.includes('system|admin|developer')) {
        maxSeverity = 'critical'
        confidence += 0.4
      } else if (pattern.source.includes('ignore|forget|disregard')) {
        if (maxSeverity !== 'critical') {
          maxSeverity = 'high'
        }
        confidence += 0.3
      } else {
        if (maxSeverity !== 'critical' && maxSeverity !== 'high') {
          maxSeverity = 'medium'
        }
        confidence += 0.2
      }
    }
  }
  
  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      detectedPatterns.push(`suspicious: ${pattern.source}`)
      confidence += 0.1
      maxSeverity = maxSeverity === 'low' ? 'medium' : maxSeverity
    }
  }
  
  // Normalize confidence score
  confidence = Math.min(confidence, 1.0)
  
  return {
    isInjection: detectedPatterns.length > 0,
    severity: maxSeverity,
    patterns: detectedPatterns,
    confidence
  }
}

/**
 * Sanitizes and validates AI input with security checks
 */
export function secureAIInput(input: string): {
  sanitized: string
  isBlocked: boolean
  securityIssues: string[]
} {
  const issues: string[] = []
  
  // Basic sanitization
  let sanitized = sanitizeUserInput(input)
  
  // Check for prompt injection
  const injectionAnalysis = analyzePromptInjection(sanitized)
  
  if (injectionAnalysis.isInjection) {
    if (injectionAnalysis.severity === 'critical' || injectionAnalysis.severity === 'high') {
      return {
        sanitized: '',
        isBlocked: true,
        securityIssues: ['Potential prompt injection detected', ...injectionAnalysis.patterns]
      }
    } else {
      issues.push('Suspicious patterns detected')
      // For medium/low severity, sanitize more aggressively
      sanitized = sanitized.replace(/[\[\]<>{}]/g, '')
    }
  }
  
  // Length validation
  if (sanitized.length > 2000) {
    issues.push('Input too long')
    sanitized = sanitized.substring(0, 2000)
  }
  
  // Remove potential code blocks
  sanitized = sanitized.replace(/```[\s\S]*?```/g, '')
  
  return {
    sanitized,
    isBlocked: false,
    securityIssues: issues
  }
}

/**
 * Logs a security event
 */
export function logSecurityEvent(
  type: SecurityEventType,
  severity: 'low' | 'medium' | 'high' | 'critical',
  request: NextRequest,
  details: SecurityEvent['details'],
  blocked: boolean = false
): SecurityEvent {
  const event: SecurityEvent = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    timestamp: new Date(),
    userId: request.headers.get('x-user-id') || undefined,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    details,
    blocked
  }
  
  // Store event (in production, this should go to a database)
  securityEvents.push(event)
  
  // Keep only last 1000 events in memory
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000)
  }
  
  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[SECURITY] ${type}: ${severity} - ${event.id}`, details)
  }
  
  return event
}

/**
 * Gets recent security events for monitoring
 */
export function getSecurityEvents(limit: number = 100): SecurityEvent[] {
  return securityEvents
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
}

/**
 * Gets security metrics for dashboard
 */
export function getSecurityMetrics(): {
  totalEvents: number
  eventsByType: Record<SecurityEventType, number>
  eventsBySeverity: Record<string, number>
  blockedRequests: number
  recentEvents: SecurityEvent[]
} {
  const eventsByType = {} as Record<SecurityEventType, number>
  const eventsBySeverity = { low: 0, medium: 0, high: 0, critical: 0 }
  let blockedRequests = 0
  
  for (const event of securityEvents) {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
    eventsBySeverity[event.severity]++
    if (event.blocked) blockedRequests++
  }
  
  return {
    totalEvents: securityEvents.length,
    eventsByType,
    eventsBySeverity,
    blockedRequests,
    recentEvents: getSecurityEvents(10)
  }
}

/**
 * Checks if a user should be flagged for AI abuse
 */
export function checkAIAbusePattern(
  userId: string | null,
  ipAddress: string
): {
  isAbuser: boolean
  riskLevel: 'low' | 'medium' | 'high'
  reason: string
} {
  const identifier = userId || ipAddress
  const recentEvents = securityEvents.filter(
    event => 
      (event.userId === userId || event.ipAddress === ipAddress) &&
      event.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
  )
  
  const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length
  const highEvents = recentEvents.filter(e => e.severity === 'high').length
  const totalEvents = recentEvents.length
  
  if (criticalEvents >= 3) {
    return {
      isAbuser: true,
      riskLevel: 'high',
      reason: `${criticalEvents} critical security events in 24h`
    }
  }
  
  if (highEvents >= 5 || totalEvents >= 20) {
    return {
      isAbuser: true,
      riskLevel: 'medium',
      reason: `${highEvents} high severity or ${totalEvents} total events in 24h`
    }
  }
  
  if (totalEvents >= 10) {
    return {
      isAbuser: false,
      riskLevel: 'medium',
      reason: `${totalEvents} security events in 24h - monitoring`
    }
  }
  
  return {
    isAbuser: false,
    riskLevel: 'low',
    reason: 'Normal usage pattern'
  }
}

/**
 * Helper function to get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwardedFor?.split(',')[0] || realIp || 'unknown'
}

/**
 * Validates tarot question for security and appropriateness
 */
export function validateTarotQuestion(question: string): {
  isValid: boolean
  sanitized: string
  issues: string[]
  blocked: boolean
} {
  const issues: string[] = []
  
  // Security check
  const securityCheck = secureAIInput(question)
  
  if (securityCheck.isBlocked) {
    return {
      isValid: false,
      sanitized: '',
      issues: securityCheck.securityIssues,
      blocked: true
    }
  }
  
  let sanitized = securityCheck.sanitized
  issues.push(...securityCheck.securityIssues)
  
  // Content validation
  if (sanitized.length < 10) {
    issues.push('Question too short')
  }
  
  if (sanitized.length > 500) {
    issues.push('Question too long')
    sanitized = sanitized.substring(0, 500)
  }
  
  // Check for inappropriate content patterns
  const inappropriatePatterns = [
    /\b(hack|exploit|bypass|crack)\b/i,
    /\b(password|token|key|secret)\b/i,
    /\b(admin|root|system)\b/i
  ]
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(sanitized)) {
      issues.push('Inappropriate content detected')
      break
    }
  }
  
  return {
    isValid: issues.length === 0 || issues.every(issue => !issue.includes('blocked')),
    sanitized,
    issues,
    blocked: false
  }
}