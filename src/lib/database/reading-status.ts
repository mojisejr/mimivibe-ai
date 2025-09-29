import { prisma } from '@/lib/prisma';
import { ReadingStatus } from '@/types/reading';
import type { Reading } from '@prisma/client';

export async function createPendingReading(
  userId: string,
  question: string,
  type: string = 'tarot'
) {
  try {
    console.log(`📝 [DB] Creating pending reading for user: ${userId}`);
    const reading = await prisma.reading.create({
      data: {
        userId,
        question,
        type,
        status: ReadingStatus.PENDING,
        isDeleted: false,
        isReviewed: false,
      },
    });
    
    console.log(`✅ [DB] Pending reading created successfully:`, {
      id: reading.id,
      userId: reading.userId,
      status: reading.status
    });
    return reading;
  } catch (error) {
    console.error('❌ [DB] Error creating pending reading:', error);
    return null;
  }
}

export async function markReadingAsProcessing(readingId: string): Promise<Reading | null> {
  try {
    console.log(`🔄 [DB] Marking reading as processing: ${readingId}`);
    const reading = await prisma.reading.update({
      where: { id: readingId },
      data: {
        status: ReadingStatus.PROCESSING,
        updatedAt: new Date()
      }
    });

    console.log(`✅ [DB] Reading marked as processing:`, {
      id: reading.id,
      status: reading.status
    });
    return reading;
  } catch (error) {
    console.error('❌ [DB] Error marking reading as processing:', error);
    return null;
  }
}

export async function markReadingAsCompleted(
  readingId: string,
  readingData?: any,
  processingCompletedAt?: Date
) {
  console.log(`✅ [DB] Marking reading as completed: ${readingId}`);
  console.log(`📊 [DB] Reading data size:`, readingData ? JSON.stringify(readingData).length : 0, 'characters');
  
  const updateData: any = {
    status: ReadingStatus.COMPLETED,
    processingCompletedAt: processingCompletedAt || new Date(),
    errorMessage: null, // Clear any previous error
  };

  // Add reading data if provided
  if (readingData) {
    updateData.answer = JSON.stringify(readingData);
  }

  const result = await prisma.reading.update({
    where: { id: readingId },
    data: updateData,
  });
  
  console.log(`🎉 [DB] Reading completed successfully:`, {
    id: result.id,
    status: result.status,
    hasData: !!result.answer
  });
  
  return result;
}

export async function markReadingAsFailed(
  readingId: string,
  errorMessage: string,
  processingCompletedAt?: Date
) {
  return await prisma.reading.update({
    where: { id: readingId },
    data: {
      status: ReadingStatus.FAILED,
      errorMessage,
      processingCompletedAt: processingCompletedAt || new Date(),
    },
  });
}

export async function getReadingsByStatus(status: ReadingStatus) {
  return await prisma.reading.findMany({
    where: {
      status: status,
      isDeleted: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getPendingReadings(batchSize?: number) {
  return await prisma.reading.findMany({
    where: {
      status: ReadingStatus.PENDING,
      isDeleted: false,
    },
    orderBy: {
      createdAt: 'asc', // Process oldest first
    },
    ...(batchSize && { take: batchSize }),
  });
}

export async function getUserReadings(
  userId: string,
  status?: ReadingStatus
) {
  const where: any = {
    userId,
    isDeleted: false,
  };

  if (status) {
    where.status = status;
  }

  return await prisma.reading.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getProcessingStats() {
  // Use count instead of groupBy for simpler query
  const [pending, processing, completed, failed] = await Promise.all([
    prisma.reading.count({
      where: { status: ReadingStatus.PENDING, isDeleted: false }
    }),
    prisma.reading.count({
      where: { status: ReadingStatus.PROCESSING, isDeleted: false }
    }),
    prisma.reading.count({
      where: { status: ReadingStatus.COMPLETED, isDeleted: false }
    }),
    prisma.reading.count({
      where: { status: ReadingStatus.FAILED, isDeleted: false }
    })
  ]);

  return {
    pending,
    processing,
    completed,
    failed,
    total: pending + processing + completed + failed
  };
}

export async function cleanupOldFailedReadings(olderThanDays: number = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return await prisma.reading.deleteMany({
    where: {
      status: ReadingStatus.FAILED,
      processingCompletedAt: {
        lt: cutoffDate,
      },
    },
  });
}

export async function getEstimatedProcessingTime(): Promise<Date> {
  // Get current queue size to estimate processing time
  const pendingCount = await prisma.reading.count({
    where: { 
      status: ReadingStatus.PENDING,
      isDeleted: false 
    }
  });

  // Base processing time: 60 seconds per reading
  // Add queue delay: 30 seconds per pending reading
  const baseProcessingTime = 60 * 1000; // 60 seconds in milliseconds
  const queueDelay = pendingCount * 30 * 1000; // 30 seconds per pending reading
  
  const estimatedTime = new Date(Date.now() + baseProcessingTime + queueDelay);
  return estimatedTime;
}

export async function getReadingById(readingId: string) {
  return await prisma.reading.findUnique({
    where: {
      id: readingId,
      isDeleted: false
    }
  });
}