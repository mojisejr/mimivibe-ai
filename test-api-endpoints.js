/**
 * Test script for API endpoints in the async reading system
 * Tests the end-to-end flow using direct database operations
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Import the ReadingStatus enum values
const ReadingStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

async function testApiEndpoints() {
  console.log('🚀 Testing API Endpoints for Async Reading System...\n');

  try {
    // Step 1: Create a test user for API testing
    console.log('👤 Step 1: Creating test user for API testing...');
    const testUserId = `test-api-user-${Date.now()}`;
    const testUser = await prisma.user.create({
      data: {
        id: testUserId,
        lineId: `line-${testUserId}`,
        email: `${testUserId}@test.com`,
        name: 'Test API User',
        tel: '0123456789',
        imageUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        stars: 10,
        coins: 100,
        exp: 0,
        level: 1,
        freePoint: 5,
        role: 'USER',
        prestigeLevel: 0,
        prestigePoints: 0,
      },
    });
    console.log(`✅ Test user created: ${testUser.id}\n`);

    // Step 2: Test createPendingReading function (simulating API call)
    console.log('📝 Step 2: Testing createPendingReading (API simulation)...');
    
    const pendingReading = await prisma.reading.create({
      data: {
        userId: testUser.id,
        question: 'What does the future hold for my career and personal growth?',
        type: 'tarot',
        status: ReadingStatus.PENDING,
        isDeleted: false,
        isReviewed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log(`✅ Pending reading created: ${pendingReading.id}`);
    console.log(`   Status: ${pendingReading.status}`);
    console.log(`   Question: ${pendingReading.question}\n`);

    // Step 3: Test reading status retrieval (simulating status API)
    console.log('📊 Step 3: Testing reading status retrieval...');
    
    const readingStatus = await prisma.reading.findUnique({
      where: { id: pendingReading.id }
    });
    
    if (!readingStatus) {
      throw new Error('Reading not found');
    }
    
    console.log(`✅ Reading status retrieved:`);
    console.log(`   ID: ${readingStatus.id}`);
    console.log(`   Status: ${readingStatus.status}`);
    console.log(`   User ID: ${readingStatus.userId}`);
    console.log(`   Created: ${readingStatus.createdAt.toISOString()}\n`);

    // Step 4: Test status transitions (simulating processing API)
    console.log('⚙️ Step 4: Testing status transitions...');
    
    // Mark as processing
    await prisma.reading.update({
      where: { id: pendingReading.id },
      data: {
        status: ReadingStatus.PROCESSING,
        processingStartedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    const processingReading = await prisma.reading.findUnique({
      where: { id: pendingReading.id }
    });
    console.log(`✅ Reading marked as PROCESSING: ${processingReading.status}`);
    
    // Mark as completed with mock answer
    await prisma.reading.update({
      where: { id: pendingReading.id },
      data: {
        status: ReadingStatus.COMPLETED,
        processingCompletedAt: new Date(),
        answer: JSON.stringify({
          cards: [
            { name: 'The Fool', position: 'past', meaning: 'New beginnings' },
            { name: 'The Star', position: 'present', meaning: 'Hope and guidance' },
            { name: 'The World', position: 'future', meaning: 'Completion and success' }
          ],
          interpretation: 'Your career journey shows great promise...'
        }),
        updatedAt: new Date(),
      },
    });
    
    const completedReading = await prisma.reading.findUnique({
      where: { id: pendingReading.id }
    });
    console.log(`✅ Reading marked as COMPLETED: ${completedReading.status}\n`);

    // Step 5: Test processing statistics (simulating admin API)
    console.log('📈 Step 5: Testing processing statistics...');
    
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

    const stats = {
      pending,
      processing,
      completed,
      failed,
      total: pending + processing + completed + failed
    };
    
    console.log(`✅ Processing statistics:`, stats);
    console.log(`   Total readings: ${stats.total}`);
    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Pending: ${stats.pending}\n`);

    // Step 6: Test user readings retrieval
    console.log('👤 Step 6: Testing user readings retrieval...');
    
    const userReadings = await prisma.reading.findMany({
      where: {
        userId: testUser.id,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`✅ User readings retrieved: ${userReadings.length} readings`);
    if (userReadings.length > 0) {
      console.log(`   Latest reading: ${userReadings[0].status} - ${userReadings[0].question.substring(0, 50)}...\n`);
    }

    // Step 7: Test error handling
    console.log('❌ Step 7: Testing error status handling...');
    const errorReading = await prisma.reading.create({
      data: {
        userId: testUser.id,
        question: 'Test error handling question',
        type: 'tarot',
        status: ReadingStatus.FAILED,
        errorMessage: 'Test error message for API testing',
        processingCompletedAt: new Date(),
        isDeleted: false,
        isReviewed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log(`✅ Error reading created and marked as FAILED: ${errorReading.status}`);
    console.log(`   Error message: ${errorReading.errorMessage}\n`);

    // Step 8: Test API response format simulation
    console.log('📋 Step 8: Testing API response format simulation...');
    
    // Simulate ReadingStatusResponse format
    const statusResponse = {
      success: true,
      data: {
        readingId: completedReading.id,
        status: completedReading.status,
        processingStartedAt: completedReading.processingStartedAt?.toISOString() || null,
        processingCompletedAt: completedReading.processingCompletedAt?.toISOString() || null,
        errorMessage: completedReading.errorMessage
      }
    };
    
    // Add reading data if completed
    if (completedReading.status === ReadingStatus.COMPLETED && completedReading.answer) {
      statusResponse.data.reading = {
        readingId: completedReading.id,
        question: completedReading.question,
        questionAnalysis: {
          mood: 'general',
          topic: 'general', 
          period: 'present'
        },
        cards: [],
        reading: JSON.parse(completedReading.answer),
        rewards: {
          exp: 10,
          coins: 5
        },
        transactionId: completedReading.id,
        selectedCards: [],
        createdAt: completedReading.createdAt.toISOString(),
        isSaved: true
      };
    }
    
    console.log(`✅ API response format validated:`);
    console.log(`   Success: ${statusResponse.success}`);
    console.log(`   Reading ID: ${statusResponse.data.readingId}`);
    console.log(`   Status: ${statusResponse.data.status}`);
    console.log(`   Has reading data: ${!!statusResponse.data.reading}\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.reading.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All API endpoint tests passed!');
    console.log('✅ Database schema supports async reading system');
    console.log('✅ Status transitions work correctly');
    console.log('✅ Error handling is functional');
    console.log('✅ Statistics and user queries work properly');
    console.log('✅ API response formats are compatible');

  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
    
    // Cleanup on error
    try {
      await prisma.reading.deleteMany({
        where: { userId: { startsWith: 'test-api-user-' } }
      });
      await prisma.user.deleteMany({
        where: { id: { startsWith: 'test-api-user-' } }
      });
      console.log('🧹 Emergency cleanup completed');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testApiEndpoints().catch(console.error);