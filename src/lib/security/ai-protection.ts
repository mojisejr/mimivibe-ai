// AI Protection Module - Prompt injection detection and security measures
import { sanitizeString } from '../validations'
import { logSecurityEvent, SecurityEvent } from '../../middleware/security'

// Prompt injection patterns to detect malicious attempts
const PROMPT_INJECTION_PATTERNS = [
  // Direct instruction attempts
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi,
  /forget\s+(everything|all|previous|above)/gi,
  /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi,
  
  // Role manipulation attempts
  /you\s+are\s+(now|a|an)\s+(assistant|ai|bot|system|admin|developer)/gi,
  /act\s+as\s+(if\s+you\s+are\s+)?(a|an)?\s*(assistant|ai|bot|system|admin|developer)/gi,
  /pretend\s+(to\s+be\s+)?(a|an)?\s*(assistant|ai|bot|system|admin|developer)/gi,
  
  // System prompt extraction attempts
  /show\s+(me\s+)?(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/gi,
  /what\s+(are\s+)?(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/gi,
  /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions?|rules?)/gi,
  
  // Jailbreak attempts
  /\bdan\b.*mode/gi, // "Do Anything Now" mode
  /developer\s+mode/gi,
  /god\s+mode/gi,
  /unrestricted\s+mode/gi,
  
  // Code injection attempts
  /<script[^>]*>/gi,
  /javascript:/gi,
  /eval\s*\(/gi,
  /function\s*\(/gi,
  
  // SQL injection patterns
  /union\s+select/gi,
  /drop\s+table/gi,
  /delete\s+from/gi,
  /insert\s+into/gi,
  
  // Command injection
  /\$\([^)]+\)/g, // $(command)
  /`[^`]+`/g, // backtick commands
  /\|\s*(curl|wget|nc|netcat|bash|sh|cmd)/gi,
  
  // Tarot-specific manipulation attempts
  /ignore\s+tarot\s+(rules|guidelines|format)/gi,
  /don't\s+(use|follow)\s+tarot/gi,
  /skip\s+the\s+tarot/gi
]

// Suspicious content patterns that might indicate abuse
const SUSPICIOUS_PATTERNS = [
  // Excessive special characters
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{10,}/g,
  
  // Repeated characters (potential spam)
  /(..)\1{5,}/g,
  
  // Very long words (potential buffer overflow attempts)
  /\b\w{50,}\b/g,
  
  // Multiple consecutive newlines or spaces
  /\n{5,}/g,
  /\s{20,}/g
]

// Risk levels for different types of content
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecurityAnalysis {
  riskLevel: RiskLevel
  isBlocked: boolean
  detectedPatterns: string[]
  sanitizedContent: string
  confidence: number // 0-100
  reasons: string[]
}

// Analyze user input for prompt injection and security threats
export function analyzeUserInput(
  input: string,
  userAgent?: string,
  ip?: string
): SecurityAnalysis {
  const detectedPatterns: string[] = []
  const reasons: string[] = []
  let riskLevel: RiskLevel = RiskLevel.LOW
  let confidence = 0
  let hasHighRiskPattern = false
  
  // Check for prompt injection patterns
  PROMPT_INJECTION_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(input)) {
      detectedPatterns.push(`injection_${index}`)
      reasons.push('Potential prompt injection detected')
      hasHighRiskPattern = true
      confidence += 30
    }
  })
  
  // Check for suspicious patterns
  SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(input)) {
      detectedPatterns.push(`suspicious_${index}`)
      reasons.push('Suspicious content pattern detected')
      confidence += 15
    }
  })
  
  // Check input length (very long inputs might be attacks)
  if (input.length > 5000) {
    detectedPatterns.push('excessive_length')
    reasons.push('Input exceeds safe length limits')
    confidence += 20
  }
  
  // Check for excessive special characters ratio
  const specialCharCount = (input.match(/[^a-zA-Z0-9\s]/g) || []).length
  const specialCharRatio = specialCharCount / input.length
  if (specialCharRatio > 0.3) {
    detectedPatterns.push('high_special_char_ratio')
    reasons.push('High ratio of special characters')
    confidence += 10
  }
  
  // Determine final risk level based on all factors
  if (hasHighRiskPattern) {
    riskLevel = RiskLevel.HIGH
    // Escalate to CRITICAL for multiple high-risk indicators
    if (detectedPatterns.length >= 3) {
      riskLevel = RiskLevel.CRITICAL
      confidence += 20
    }
  } else if (detectedPatterns.length > 0) {
    riskLevel = RiskLevel.MEDIUM
  }
  
  // Sanitize the content
  const sanitizedContent = sanitizeString(input, 2000)
  
  // Determine if content should be blocked
  const isBlocked = riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL
  
  // Cap confidence at 100
  confidence = Math.min(confidence, 100)
  
  // Log security events for high-risk content
  if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.CRITICAL) {
    const securityEvent: SecurityEvent = {
      type: 'AI_ABUSE',
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
      url: '/api/readings/ask',
      timestamp: new Date(),
      details: {
        riskLevel,
        detectedPatterns,
        confidence,
        inputLength: input.length,
        reasons
      }
    }
    
    logSecurityEvent(securityEvent)
  }
  
  return {
    riskLevel,
    isBlocked,
    detectedPatterns,
    sanitizedContent,
    confidence,
    reasons
  }
}

// Validate tarot question format and content
export function validateTarotQuestion(question: string): {
  isValid: boolean
  sanitizedQuestion: string
  issues: string[]
} {
  const issues: string[] = []
  
  // Check minimum length
  if (question.trim().length < 10) {
    issues.push('Question is too short (minimum 10 characters)')
  }
  
  // Check maximum length
  if (question.length > 500) {
    issues.push('Question is too long (maximum 500 characters)')
  }
  
  // Check for question marks or question words (English and Thai)
  const hasQuestionIndicator = /\?|\b(what|how|when|where|why|will|should|can|could|would|is|are|am|do|does|did)\b/i.test(question) ||
    /\b(อะไร|ยังไง|เมื่อไหร่|ที่ไหน|ทำไม|จะ|ควร|สามารถ|น่าจะ|เป็น|คือ|มี|ได้|ไหม|มั้ย|รึ|หรือ|ดี|ไม่|จะเป็น|จะมี|จะได้)\b/i.test(question)
  if (!hasQuestionIndicator) {
    issues.push('Input should be formatted as a question')
  }
  
  // Check for inappropriate content
  const inappropriatePatterns = [
    /\b(kill|murder|suicide|death|harm|hurt|violence)\b/gi,
    /\b(illegal|crime|criminal|steal|rob|fraud)\b/gi,
    /\b(drug|cocaine|heroin|meth|marijuana)\b/gi
  ]
  
  inappropriatePatterns.forEach(pattern => {
    if (pattern.test(question)) {
      issues.push('Question contains inappropriate content')
    }
  })
  
  const sanitizedQuestion = sanitizeString(question, 500)
  const isValid = issues.length === 0
  
  return {
    isValid,
    sanitizedQuestion,
    issues
  }
}

// Rate limiting based on user behavior patterns
export function calculateUserSuspicionLevel(
  recentQuestions: string[],
  timeWindow: number = 3600000 // 1 hour in milliseconds
): RiskLevel {
  if (recentQuestions.length === 0) {
    return RiskLevel.LOW
  }
  
  // Check for repeated identical questions
  const uniqueQuestions = new Set(recentQuestions)
  const repetitionRatio = 1 - (uniqueQuestions.size / recentQuestions.length)
  
  if (repetitionRatio > 0.7) {
    return RiskLevel.HIGH
  }
  
  if (repetitionRatio > 0.5) {
    return RiskLevel.MEDIUM
  }
  
  // Check for rapid-fire questions (more than 20 in an hour)
  if (recentQuestions.length > 20) {
    return RiskLevel.HIGH
  }
  
  if (recentQuestions.length > 10) {
    return RiskLevel.MEDIUM
  }
  
  return RiskLevel.LOW
}

// Enhanced security check combining multiple factors
export function comprehensiveSecurityCheck(
  input: string,
  userAgent?: string,
  ip?: string,
  recentQuestions: string[] = []
): SecurityAnalysis {
  // Analyze the input content
  const inputAnalysis = analyzeUserInput(input, userAgent, ip)
  
  // Validate tarot question format
  const questionValidation = validateTarotQuestion(input)
  
  // Calculate user suspicion level
  const suspicionLevel = calculateUserSuspicionLevel(recentQuestions)
  
  // Combine all factors for final risk assessment
  let finalRiskLevel = inputAnalysis.riskLevel
  let finalConfidence = inputAnalysis.confidence
  const allReasons = [...inputAnalysis.reasons]
  
  // Escalate risk based on question validation issues
  if (!questionValidation.isValid) {
    allReasons.push(...questionValidation.issues)
    if (finalRiskLevel === RiskLevel.LOW) {
      finalRiskLevel = RiskLevel.MEDIUM
    }
    finalConfidence += 10
  }
  
  // Escalate risk based on user behavior
  if (suspicionLevel === RiskLevel.HIGH) {
    finalRiskLevel = RiskLevel.HIGH
    allReasons.push('Suspicious user behavior pattern detected')
    finalConfidence += 25
  } else if (suspicionLevel === RiskLevel.MEDIUM && finalRiskLevel === RiskLevel.LOW) {
    finalRiskLevel = RiskLevel.MEDIUM
    allReasons.push('Elevated user activity detected')
    finalConfidence += 15
  }
  
  return {
    riskLevel: finalRiskLevel,
    isBlocked: finalRiskLevel === RiskLevel.HIGH || finalRiskLevel === RiskLevel.CRITICAL,
    detectedPatterns: inputAnalysis.detectedPatterns,
    sanitizedContent: questionValidation.sanitizedQuestion,
    confidence: Math.min(finalConfidence, 100),
    reasons: allReasons
  }
}