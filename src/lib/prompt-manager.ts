import { PrismaClient } from '@prisma/client';
import { PromptEncryption } from './prompt-encryption';
import { promptSecurityMonitor } from './security/prompt-security-monitor';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import ora from 'ora';

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
export class PromptManager {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Initialize prompts from existing prompts.ts file
   */
  public async initializePrompts(): Promise<void> {
    console.log(chalk.cyan(figlet.textSync('Prompt Init', { horizontalLayout: 'fitted' })));
    console.log(chalk.cyan('🚀 Initializing prompts from code...\n'));
    
    // Note: Hardcoded prompts have been archived for security
    // This init function is now primarily for reference - prompts are already encrypted in database
    console.log(chalk.yellow('⚠️  Hardcoded prompts have been archived for security.'));
    console.log(chalk.yellow('⚠️  Encrypted prompts are already active in production.'));
    console.log(chalk.green('✅ Current system uses encrypted database prompts.'));
    
    const promptEntries: Array<{ name: string; content: string }> = [
      // Prompts are now loaded from encrypted database storage
      // This initialization is no longer needed for security reasons
    ];

    let initialized = 0;
    let skipped = 0;

    for (const { name, content } of promptEntries) {
      if (!content) {
        console.log(chalk.yellow(`⚠️  Skipping ${name} (no content)`));
        continue;
      }

      const spinner = ora(`Processing ${name}...`).start();

      const existing = await this.prisma.promptTemplate.findUnique({
        where: { name }
      });

      if (!existing) {
        spinner.text = `Encrypting ${name}...`;
        const encryptedContent = await PromptEncryption.encrypt(content);
        
        spinner.text = `Saving ${name} to database...`;
        await this.prisma.promptTemplate.create({
          data: {
            name,
            encryptedContent,
            version: 1,
            isActive: true,
            description: `Initial version migrated from prompts.ts`,
            versions: {
              create: {
                version: 1,
                encryptedContent,
                isActive: true,
                description: 'Initial version'
              }
            }
          }
        });
        
        spinner.succeed(chalk.green(`✅ Initialized ${name} (${content.length} chars)`));
        initialized++;
      } else {
        spinner.succeed(chalk.yellow(`⏭️  Skipped ${name} (already exists)`));
        skipped++;
      }
    }
    
    console.log('\n' + boxen(
      chalk.green(`🎉 Initialization Complete!\n`) +
      chalk.white(`✅ Initialized: ${initialized}\n`) +
      chalk.gray(`⏭️  Skipped: ${skipped}`),
      { padding: 1, borderColor: 'green', borderStyle: 'round' }
    ));
  }

  /**
   * Get active prompt by name
   */
  public async getPrompt(name: string, userId?: string): Promise<string> {
    const startTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;

    try {
      const template = await this.prisma.promptTemplate.findUnique({
        where: { name, isActive: true }
      });

      if (!template) {
        errorMessage = `Active prompt template '${name}' not found`;
        throw new Error(errorMessage);
      }

      const decryptedContent = await PromptEncryption.decrypt(template.encryptedContent);
      success = true;

      // Log successful prompt access
      await promptSecurityMonitor.logPromptAccess({
        promptName: name,
        accessType: 'READ',
        userId,
        success: true,
        executionTimeMs: Date.now() - startTime,
      });

      return decryptedContent;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed prompt access
      await promptSecurityMonitor.logPromptAccess({
        promptName: name,
        accessType: 'READ',
        userId,
        success: false,
        executionTimeMs: Date.now() - startTime,
        errorMessage: errorMsg,
      });

      throw error;
    }
  }

  /**
   * Get specific version of prompt
   */
  public async getPromptVersion(name: string, version: number): Promise<string> {
    const template = await this.prisma.promptTemplate.findUnique({
      where: { name },
      include: {
        versions: {
          where: { version }
        }
      }
    });

    if (!template || template.versions.length === 0) {
      throw new Error(`Prompt template '${name}' version ${version} not found`);
    }

    return await PromptEncryption.decrypt(template.versions[0].encryptedContent);
  }

  /**
   * Update prompt content (creates new version)
   */
  public async updatePrompt(
    name: string, 
    content: string, 
    description?: string
  ): Promise<number> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use transaction to ensure atomicity and prevent race conditions
        return await this.prisma.$transaction(async (tx) => {
          const template = await tx.promptTemplate.findUnique({
            where: { name },
            include: {
              versions: {
                orderBy: { version: 'desc' },
                take: 1
              }
            }
          });

          if (!template) {
            throw new Error(`Prompt template '${name}' not found`);
          }

          // Use database-level MAX() query for accurate version calculation
          const maxVersionResult = await tx.promptVersion.aggregate({
            where: { templateId: template.id },
            _max: { version: true }
          });

          const nextVersion = (maxVersionResult._max.version || 0) + 1;

          // Double-check for duplicate version to prevent unique constraint violation
          const existingVersion = await tx.promptVersion.findFirst({
            where: {
              templateId: template.id,
              version: nextVersion
            }
          });

          if (existingVersion) {
            throw new Error(`Version ${nextVersion} already exists for prompt '${name}'. This indicates a race condition.`);
          }

          const encryptedContent = await PromptEncryption.encrypt(content);

          // Create new version with duplicate protection
          await tx.promptVersion.create({
            data: {
              templateId: template.id,
              version: nextVersion,
              encryptedContent,
              isActive: false,
              description
            }
          });

          // Update main template
          await tx.promptTemplate.update({
            where: { id: template.id },
            data: {
              encryptedContent,
              version: nextVersion,
              updatedAt: new Date()
            }
          });

          return nextVersion;
        }, {
          // Transaction options for better error handling
          maxWait: 5000, // 5 seconds
          timeout: 10000, // 10 seconds
        });
      } catch (error) {
        lastError = error as Error;
        
        // Check if it's a retryable error (unique constraint, deadlock, etc.)
        const isRetryable = error instanceof Error && (
          error.message.includes('Unique constraint') ||
          error.message.includes('deadlock') ||
          error.message.includes('race condition') ||
          error.message.includes('timeout')
        );

        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff: wait 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`Attempt ${attempt} failed for updatePrompt('${name}'): ${error.message}. Retrying in ${delay}ms...`);
      }
    }

    throw lastError!;
  }

  /**
   * Activate specific version
   */
  public async activateVersion(name: string, version: number): Promise<void> {
    const template = await this.prisma.promptTemplate.findUnique({
      where: { name },
      include: {
        versions: {
          where: { version }
        }
      }
    });

    if (!template || template.versions.length === 0) {
      throw new Error(`Prompt template '${name}' version ${version} not found`);
    }

    const versionData = template.versions[0];

    // Update all versions to inactive
    await this.prisma.promptVersion.updateMany({
      where: { templateId: template.id },
      data: { isActive: false }
    });

    // Activate target version
    await this.prisma.promptVersion.update({
      where: { id: versionData.id },
      data: { isActive: true }
    });

    // Update main template
    await this.prisma.promptTemplate.update({
      where: { id: template.id },
      data: {
        encryptedContent: versionData.encryptedContent,
        version: version,
        updatedAt: new Date()
      }
    });

  }

  /**
   * Deactivate prompt
   */
  public async deactivatePrompt(name: string): Promise<void> {
    await this.prisma.promptTemplate.update({
      where: { name },
      data: { isActive: false }
    });

  }

  /**
   * List all prompts with versions
   */
  public async listPrompts(includeInactive = false): Promise<PromptTemplateInfo[]> {
    const templates = await this.prisma.promptTemplate.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      version: template.version,
      isActive: template.isActive,
      description: template.description || undefined,
      performanceNotes: template.performanceNotes || undefined,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      versions: template.versions.map(v => ({
        id: v.id,
        version: v.version,
        isActive: v.isActive,
        description: v.description || undefined,
        performanceMetrics: (v.performanceMetrics as unknown as PromptPerformanceMetrics) || undefined,
        createdAt: v.createdAt
      }))
    }));
  }

  /**
   * Save test result
   */
  public async saveTestResult(result: PromptTestResult): Promise<void> {
    await this.prisma.promptTestResult.create({
      data: {
        templateId: result.templateId,
        version: result.version,
        testQuestion: result.testQuestion,
        resultData: result.resultData,
        executionTimeMs: result.executionTimeMs,
        tokenUsage: result.tokenUsage,
        aiProvider: result.aiProvider
      }
    });
  }

  /**
   * Get performance analytics for a prompt
   */
  public async getPerformanceAnalytics(name: string, days = 7): Promise<{
    versions: Array<{
      version: number;
      metrics: PromptPerformanceMetrics;
      testResults: any[];
    }>;
    bestPerforming: { version: number; successRate: number };
    recommendations: string[];
  }> {
    const template = await this.prisma.promptTemplate.findUnique({
      where: { name },
      include: {
        testResults: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!template) {
      throw new Error(`Prompt template '${name}' not found`);
    }

    // Group results by version
    const versionGroups = template.testResults.reduce((acc, result) => {
      if (!acc[result.version]) acc[result.version] = [];
      acc[result.version].push(result);
      return acc;
    }, {} as Record<number, any[]>);

    const versions = Object.entries(versionGroups).map(([version, results]) => {
      const successful = results.filter(r => r.resultData && !r.resultData.error).length;
      const avgTime = results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0) / results.length;
      const avgTokens = results.reduce((sum, r) => sum + (r.tokenUsage || 0), 0) / results.length;

      return {
        version: parseInt(version),
        metrics: {
          averageExecutionTime: Math.round(avgTime),
          averageTokenUsage: Math.round(avgTokens),
          successRate: successful / results.length,
          totalTests: results.length
        },
        testResults: results
      };
    }).sort((a, b) => b.version - a.version);

    const bestPerforming = versions.reduce((best, current) => 
      current.metrics.successRate > best.successRate 
        ? { version: current.version, successRate: current.metrics.successRate }
        : best,
      { version: 0, successRate: 0 }
    );

    const recommendations = this.generateRecommendations(versions);

    return { versions, bestPerforming, recommendations };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(versions: any[]): string[] {
    const recommendations: string[] = [];
    
    if (versions.length === 0) {
      recommendations.push('No test data available. Run some tests to get recommendations.');
      return recommendations;
    }

    const latest = versions[0];
    const hasOlderVersions = versions.length > 1;

    if (latest.metrics.successRate < 0.9) {
      recommendations.push(`Current version has ${(latest.metrics.successRate * 100).toFixed(1)}% success rate. Consider reviewing failed tests.`);
    }

    if (hasOlderVersions) {
      const previous = versions[1];
      if (previous.metrics.successRate > latest.metrics.successRate) {
        recommendations.push(`Previous version (v${previous.version}) had better success rate. Consider rolling back.`);
      }
      
      if (latest.metrics.averageExecutionTime > previous.metrics.averageExecutionTime * 1.2) {
        recommendations.push(`Performance regression detected. Current version is 20% slower than previous.`);
      }
    }

    if (latest.metrics.averageExecutionTime > 2000) {
      recommendations.push('Consider optimizing prompt length to reduce execution time.');
    }

    if (latest.metrics.totalTests < 10) {
      recommendations.push('Run more tests to get better performance insights.');
    }

    return recommendations;
  }

  /**
   * Cleanup - close Prisma connection
   */
  public async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}