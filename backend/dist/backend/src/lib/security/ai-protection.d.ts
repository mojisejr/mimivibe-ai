export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface SecurityAnalysis {
    riskLevel: RiskLevel;
    isBlocked: boolean;
    detectedPatterns: string[];
    sanitizedContent: string;
    confidence: number;
    reasons: string[];
}
export declare function analyzeUserInput(input: string, userAgent?: string, ip?: string): SecurityAnalysis;
export declare function validateTarotQuestion(question: string): {
    isValid: boolean;
    sanitizedQuestion: string;
    issues: string[];
};
export declare function calculateUserSuspicionLevel(recentQuestions: string[], timeWindow?: number): RiskLevel;
export declare function comprehensiveSecurityCheck(input: string, userAgent?: string, ip?: string, recentQuestions?: string[]): SecurityAnalysis;
//# sourceMappingURL=ai-protection.d.ts.map