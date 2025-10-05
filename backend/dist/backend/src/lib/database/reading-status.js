"use strict";
/**
 * Database operations for reading status management
 * Part of Task #243: Async Reading System Implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingReadings = getPendingReadings;
exports.markReadingAsProcessing = markReadingAsProcessing;
exports.markReadingAsCompleted = markReadingAsCompleted;
exports.markReadingAsFailed = markReadingAsFailed;
exports.deductCreditsForReading = deductCreditsForReading;
exports.refundCreditsForReading = refundCreditsForReading;
const prisma_1 = require("@/lib/prisma");
const reading_1 = require("@/types/reading");
/**
 * Get pending readings from the database
 */
async function getPendingReadings(limit = 10) {
    return await prisma_1.prisma.reading.findMany({
        where: {
            status: reading_1.ReadingStatus.PENDING,
            isDeleted: false,
        },
        orderBy: {
            createdAt: 'asc', // Process oldest first
        },
        take: limit,
    });
}
/**
 * Mark a reading as processing
 */
async function markReadingAsProcessing(readingId) {
    try {
        return await prisma_1.prisma.reading.update({
            where: { id: readingId },
            data: {
                status: reading_1.ReadingStatus.PROCESSING,
                updatedAt: new Date(),
            },
        });
    }
    catch (error) {
        console.error(`Failed to mark reading as processing: ${readingId}`, error);
        return null;
    }
}
/**
 * Mark a reading as completed with the reading data
 */
async function markReadingAsCompleted(readingId, readingData) {
    try {
        return await prisma_1.prisma.reading.update({
            where: { id: readingId },
            data: {
                status: reading_1.ReadingStatus.COMPLETED,
                readingData: readingData,
                completedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    catch (error) {
        console.error(`Failed to mark reading as completed: ${readingId}`, error);
        throw error;
    }
}
/**
 * Mark a reading as failed with error message
 */
async function markReadingAsFailed(readingId, errorMessage) {
    try {
        return await prisma_1.prisma.reading.update({
            where: { id: readingId },
            data: {
                status: reading_1.ReadingStatus.FAILED,
                errorMessage: errorMessage,
                updatedAt: new Date(),
            },
        });
    }
    catch (error) {
        console.error(`Failed to mark reading as failed: ${readingId}`, error);
        throw error;
    }
}
/**
 * Deduct credits for a reading
 */
async function deductCreditsForReading(userId, readingId, questionLength, questionAnalysis) {
    return await prisma_1.prisma.$transaction(async (tx) => {
        // Get user's current credits
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { freePoint: true, stars: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const totalCredits = (user.freePoint || 0) + (user.stars || 0);
        if (totalCredits < 1) {
            throw new Error('Insufficient credits');
        }
        // Deduct 1 credit (prefer free points first)
        let deltaFreePoint = 0;
        let deltaStars = 0;
        if (user.freePoint && user.freePoint > 0) {
            deltaFreePoint = -1;
        }
        else {
            deltaStars = -1;
        }
        // Update user credits
        await tx.user.update({
            where: { id: userId },
            data: {
                freePoint: { increment: deltaFreePoint },
                stars: { increment: deltaStars },
            },
        });
        // Create point transaction record
        await tx.pointTransaction.create({
            data: {
                id: `reading_${readingId}_${Date.now()}`,
                userId: userId,
                eventType: 'READING_DEDUCTION',
                deltaPoint: deltaStars,
                deltaFreePoint: deltaFreePoint,
                deltaCoins: 0,
                deltaExp: 0,
                metadata: {
                    readingId: readingId,
                    questionLength: questionLength,
                    questionAnalysis: questionAnalysis,
                    deductionType: deltaFreePoint < 0 ? 'free_point' : 'star',
                },
            },
        });
        return { deltaFreePoint, deltaStars };
    });
}
/**
 * Refund credits for a failed reading
 */
async function refundCreditsForReading(userId, readingId, reason) {
    return await prisma_1.prisma.$transaction(async (tx) => {
        // Find the original deduction transaction
        const originalTransaction = await tx.pointTransaction.findFirst({
            where: {
                userId: userId,
                eventType: 'READING_DEDUCTION',
                metadata: {
                    path: ['readingId'],
                    equals: readingId,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!originalTransaction) {
            console.log(`No deduction transaction found for reading: ${readingId}`);
            return null;
        }
        // Refund the credits (reverse the deduction)
        const refundFreePoint = -(originalTransaction.deltaFreePoint || 0);
        const refundStars = -(originalTransaction.deltaPoint || 0);
        await tx.user.update({
            where: { id: userId },
            data: {
                freePoint: { increment: refundFreePoint },
                stars: { increment: refundStars },
            },
        });
        // Create refund transaction record
        const refundTransaction = await tx.pointTransaction.create({
            data: {
                id: `refund_${readingId}_${Date.now()}`,
                userId: userId,
                eventType: 'READING_REFUND',
                deltaPoint: refundStars,
                deltaFreePoint: refundFreePoint,
                deltaCoins: 0,
                deltaExp: 0,
                metadata: {
                    readingId: readingId,
                    originalTransactionId: originalTransaction.id,
                    reason: reason,
                    refundType: refundFreePoint > 0 ? 'free_point' : 'star',
                },
            },
        });
        return {
            refundFreePoint,
            refundStars,
            transactionId: refundTransaction.id,
        };
    });
}
//# sourceMappingURL=reading-status.js.map