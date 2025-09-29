/**
 * Background job processor for async reading generation
 * Part of Task #243: Async Reading System Implementation
 */

import { prisma } from '@/lib/prisma';
import { generateTarotReading } from '@/lib/langgraph/workflow-with-db';
import { 
  getPendingReadings, 
  markReadingAsProcessing, 
  markReadingAsCompleted, 
  markReadingAsFailed 
} from '@/lib/database/reading-status';
import { ReadingStatus } from '@/types/reading';
import { getReferralRewards, toLegacyRewardFormat } from '@/lib/utils/rewards';

/**
 * Process a single pending reading
 */
export async function processReading(readingId: string): Promise<boolean> {
  try {
    console.log(`🔄 [PROCESSOR] Starting processing for reading: ${readingId}`);
    
    // Mark as processing
    const reading = await markReadingAsProcessing(readingId);
    console.log(`📝 [PROCESSOR] Reading marked as processing:`, reading ? reading.id : "FAILED");
    
    if (!reading) {
      console.error(`❌ [PROCESSOR] Reading not found: ${readingId}`);
      return false;
    }

    console.log(`📋 [PROCESSOR] Reading details:`, {
      id: reading.id,
      question: reading.question,
      userId: reading.userId,
      status: reading.status
    });

    try {
      // Generate reading using LangGraph workflow
      console.log(`🤖 [PROCESSOR] Starting AI workflow for reading: ${readingId}`);
      const workflowResult = await generateTarotReading(reading.question, reading.userId);
      console.log(`🎯 [PROCESSOR] AI workflow completed:`, workflowResult ? "SUCCESS" : "FAILED");

      // Check if question validation failed
      if (workflowResult.isValid === false) {
        await markReadingAsFailed(
          readingId, 
          workflowResult.validationReason || "คำถามไม่เหมาะสมสำหรับการทำนาย"
        );
        console.log(`⚠️ Reading failed validation: ${readingId}`);
        return false;
      }

      // Check if workflow returned an error
      if (workflowResult.error) {
        await markReadingAsFailed(readingId, workflowResult.error);
        console.error(`❌ Reading generation error: ${readingId} - ${workflowResult.error}`);
        return false;
      }

      // Validate that we have the required reading data
      if (!workflowResult.reading) {
        await markReadingAsFailed(readingId, "คำขอใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง");
        console.error(`❌ Reading timeout: ${readingId}`);
        return false;
      }

      console.log(`✨ [PROCESSOR] Generated reading content:`, {
        readingId,
        hasReading: !!workflowResult.reading,
        hasCards: !!workflowResult.selectedCards,
        cardsCount: workflowResult.selectedCards?.length || 0
      });

      // Prepare reading data for storage
      const readingData = {
        questionAnalysis: workflowResult.questionAnalysis,
        cards: workflowResult.reading.cards_reading,
        reading: workflowResult.reading,
        selectedCards: workflowResult.selectedCards,
        createdAt: new Date().toISOString(),
      };

      // Mark as completed with the reading data
      await markReadingAsCompleted(readingId, readingData);

      // Handle referral rewards for first reading (async, don't block)
      handleReferralRewards(reading.userId, readingId).catch(error => {
        console.error(`⚠️ Referral reward error for reading ${readingId}:`, error);
      });

      console.log(`✅ Reading completed successfully: ${readingId}`);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      await markReadingAsFailed(readingId, errorMessage);
      console.error(`❌ Reading processing failed: ${readingId} - ${errorMessage}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Critical error processing reading ${readingId}:`, error);
    return false;
  }
}

/**
 * Handle referral rewards for first reading completion
 */
async function handleReferralRewards(userId: string, readingId: string): Promise<void> {
  try {
    // Check if this is the user's first completed reading
    const userReadingCount = await prisma.reading.count({
      where: { 
        userId, 
        isDeleted: false,
        // Note: status field will be available after migration
      },
    });

    if (userReadingCount === 1) {
      // This is the first completed reading, try to claim referral reward
      const referralCode = await prisma.referralCode.findFirst({
        where: {
          userId,
          referredBy: { not: null },
          isUsed: true,
        },
      });

      if (referralCode?.referredBy) {
        // Fetch dynamic referral rewards from RewardConfiguration
        const rewardConfig = await getReferralRewards();
        const referrerReward = toLegacyRewardFormat(rewardConfig.inviter);

        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: referralCode.referredBy! },
            data: {
              exp: { increment: referrerReward.exp },
              coins: { increment: referrerReward.coins },
              stars: { increment: referrerReward.stars },
              freePoint: { increment: referrerReward.freePoint || 0 },
            },
          });

          await tx.pointTransaction.create({
            data: {
              id: `referral_first_reading_${referralCode.referredBy!}_${Date.now()}`,
              userId: referralCode.referredBy!,
              eventType: "REFERRAL_FIRST_READING",
              deltaPoint: referrerReward.stars,
              deltaCoins: referrerReward.coins,
              deltaExp: referrerReward.exp,
              metadata: {
                referredUserId: userId,
                readingId: readingId,
                rewardType: "first_reading_completion",
                freePointAwarded: referrerReward.freePoint || 0,
              },
            },
          });
        });

        console.log(`🎁 Referral reward granted for first reading: ${readingId}`);
      }
    }
  } catch (error) {
    console.error(`⚠️ Referral reward processing failed:`, error);
    // Don't throw - this is non-critical
  }
}

/**
 * Process multiple pending readings in batch
 */
export async function processPendingReadings(batchSize: number = 5): Promise<{
  processed: number;
  successful: number;
  failed: number;
}> {
  console.log(`🚀 Starting batch processing of pending readings (batch size: ${batchSize})`);
  
  const pendingReadings = await getPendingReadings(batchSize);
  
  if (pendingReadings.length === 0) {
    console.log(`📭 No pending readings to process`);
    return { processed: 0, successful: 0, failed: 0 };
  }

  console.log(`📋 Found ${pendingReadings.length} pending readings to process`);

  let successful = 0;
  let failed = 0;

  // Process readings sequentially to avoid overwhelming the AI service
  for (const reading of pendingReadings) {
    const success = await processReading(reading.id);
    if (success) {
      successful++;
    } else {
      failed++;
    }
    
    // Small delay between readings to be respectful to AI services
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const processed = successful + failed;
  console.log(`📊 Batch processing completed: ${processed} processed, ${successful} successful, ${failed} failed`);

  return { processed, successful, failed };
}

/**
 * Continuous processing loop for background job
 */
export async function startReadingProcessor(options: {
  batchSize?: number;
  intervalMs?: number;
  maxRetries?: number;
} = {}): Promise<void> {
  const {
    batchSize = 5,
    intervalMs = 30000, // 30 seconds
    maxRetries = 3,
  } = options;

  console.log(`🎯 Starting reading processor with batch size: ${batchSize}, interval: ${intervalMs}ms`);

  let retryCount = 0;

  while (true) {
    try {
      await processPendingReadings(batchSize);
      retryCount = 0; // Reset retry count on success
      
      // Wait before next batch
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`❌ Reading processor error (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount >= maxRetries) {
        console.error(`💥 Reading processor failed after ${maxRetries} retries. Stopping.`);
        break;
      }
      
      // Exponential backoff
      const backoffMs = Math.min(intervalMs * Math.pow(2, retryCount), 300000); // Max 5 minutes
      console.log(`⏳ Retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
}