import { PrismaClient } from "@prisma/client";
export interface PromptTestResult {
    templateId: number;
    version: number;
    testQuestion: string;
    resultData: any;
    executionTimeMs?: number;
    tokenUsage?: number;
    aiProvider?: string;
}
export interface PromptPerformanceMetrics {
    averageExecutionTime: number;
    averageTokenUsage: number;
    successRate: number;
    totalTests: number;
}
export interface PromptVersionInfo {
    id: number;
    version: number;
    isActive: boolean;
    description?: string;
    performanceMetrics?: PromptPerformanceMetrics;
    createdAt: Date;
}
export interface PromptTemplateInfo {
    id: number;
    name: string;
    version: number;
    isActive: boolean;
    description?: string;
    performanceNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    versions: PromptVersionInfo[];
}
/**
 * PromptManager - Manages encrypted prompts with version control
 */
export declare class PromptManager {
    private prisma;
    constructor(prisma?: PrismaClient);
    /**
     * Initialize prompts from existing prompts.ts file
     */
    initializePrompts(): Promise<void>;
    /**
     * Get active prompt by name with optional locale support
     */
    getPrompt(name: string, userId?: string, locale?: string): Promise<string>;
    /**
     * Get specific version of prompt
     */
    getPromptVersion(name: string, version: number): Promise<string>;
    /**
     * Update prompt content (creates new version)
     */
    updatePrompt(name: string, content: string, description?: string): Promise<number>;
    /**
     * Activate specific version
     */
    activateVersion(name: string, version: number): Promise<void>;
    /**
     * Deactivate prompt
     */
    deactivatePrompt(name: string): Promise<void>;
    /**
     * List all prompts with versions
     */
    listPrompts(includeInactive?: boolean): Promise<PromptTemplateInfo[]>;
    /**
     * Save test result
     */
    saveTestResult(result: PromptTestResult): Promise<void>;
    /**
     * Get performance analytics for a prompt
     */
    getPerformanceAnalytics(name: string, days?: number): Promise<{
        versions: Array<{
            version: number;
            metrics: PromptPerformanceMetrics;
            testResults: any[];
        }>;
        bestPerforming: {
            version: number;
            successRate: number;
        };
        recommendations: string[];
    }>;
    /**
     * Generate performance recommendations
     */
    private generateRecommendations;
    /**
     * Cleanup - close Prisma connection
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=prompt-manager.d.ts.map