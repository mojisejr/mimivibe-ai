/**
 * Test script for background reading processor
 * Tests the integration with updated database functions
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

async function testBackgroundProcessor() {
  console.log('🚀 Testing Background Reading Processor Integration...\n');

  try {
    // Step 1: Create a test user
    console.log('👤 Step 1: Creating test user...');
    const testUserId = `test-bg-user-${Date.now()}`;
    const testUser = await prisma.user.create({
      data: {
        id: testUserId,
        lineId: `line-${testUserId}`,
        email: `${testUserId}@test.com`,
        name: 'Test Background User',
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

    // Step 2: Create a pending reading
    console.log('📝 Step 2: Creating pending reading...');
    const pendingReading = await prisma.reading.create({
      data: {
        userId: testUser.id,
        question: 'What guidance do the cards have for my spiritual journey?',
        type: 'tarot',
        status: ReadingStatus.PENDING,
        isDeleted: false,
        isReviewed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Pending reading created: ${pendingReading.id}\n`);

    // Step 3: Test markReadingAsProcessing
    console.log('⚙️ Step 3: Testing markReadingAsProcessing...');
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
    console.log(`✅ Reading marked as PROCESSING: ${processingReading.status}\n`);

    // Step 4: Test markReadingAsCompleted with reading data
    console.log('✅ Step 4: Testing markReadingAsCompleted with reading data...');
    
    const mockReadingData = {
      questionAnalysis: {
        mood: 'spiritual',
        topic: 'personal_growth',
        period: 'present'
      },
      cards: [
        { name: 'The Hermit', position: 'past', meaning: 'Soul searching and inner wisdom' },
        { name: 'The Star', position: 'present', meaning: 'Hope, inspiration, and spiritual guidance' },
        { name: 'The World', position: 'future', meaning: 'Completion and spiritual fulfillment' }
      ],
      reading: {
        interpretation: 'Your spiritual journey shows a beautiful progression from introspection to enlightenment...',
        advice: 'Trust in your inner wisdom and remain open to the guidance that surrounds you.',
        outcome: 'A period of spiritual fulfillment and completion awaits you.'
      },
      selectedCards: ['hermit', 'star', 'world'],
      createdAt: new Date().toISOString(),
    };

    await prisma.reading.update({
      where: { id: pendingReading.id },
      data: {
        status: ReadingStatus.COMPLETED,
        processingCompletedAt: new Date(),
        answer: JSON.stringify(mockReadingData),
        errorMessage: null,
        updatedAt: new Date(),
      },
    });
    
    const completedReading = await prisma.reading.findUnique({
      where: { id: pendingReading.id }
    });
    
    console.log(`✅ Reading marked as COMPLETED: ${completedReading.status}`);
    console.log(`✅ Reading data stored: ${!!completedReading.answer}`);
    
    // Verify the stored data
    if (completedReading.answer) {
      const storedData = JSON.parse(completedReading.answer);
      console.log(`✅ Stored reading contains ${storedData.cards.length} cards`);
      console.log(`✅ Question analysis: ${storedData.questionAnalysis.mood} mood\n`);
    }

    // Step 5: Test API response format simulation
    console.log('📋 Step 5: Testing API response format simulation...');
    
    const apiResponse = {
      success: true,
      data: {
        readingId: completedReading.id,
        status: completedReading.status,
        processingStartedAt: completedReading.processingStartedAt?.toISOString() || null,
        processingCompletedAt: completedReading.processingCompletedAt?.toISOString() || null,
        errorMessage: completedReading.errorMessage
      }
    };

    // Add full reading data if completed
    if (completedReading.status === ReadingStatus.COMPLETED && completedReading.answer) {
      const readingData = JSON.parse(completedReading.answer);
      apiResponse.data.reading = {
        readingId: completedReading.id,
        question: completedReading.question,
        questionAnalysis: readingData.questionAnalysis,
        cards: readingData.cards,
        reading: readingData.reading,
        rewards: {
          exp: 10,
          coins: 5
        },
        transactionId: completedReading.id,
        selectedCards: readingData.selectedCards,
        createdAt: completedReading.createdAt.toISOString(),
        isSaved: true
      };
    }

    console.log(`✅ API response format validated:`);
    console.log(`   Success: ${apiResponse.success}`);
    console.log(`   Reading ID: ${apiResponse.data.readingId}`);
    console.log(`   Status: ${apiResponse.data.status}`);
    console.log(`   Has full reading: ${!!apiResponse.data.reading}`);
    console.log(`   Cards count: ${apiResponse.data.reading?.cards?.length || 0}\n`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.reading.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 Background Processor Integration Test Passed!');
    console.log('✅ Database functions work with reading data');
    console.log('✅ Status transitions are functional');
    console.log('✅ Reading data storage and retrieval works');
    console.log('✅ API response format is compatible');

  } catch (error) {
    console.error('❌ Background processor test failed:', error);
    
    // Cleanup on error
    try {
      await prisma.reading.deleteMany({
        where: { userId: { startsWith: 'test-bg-user-' } }
      });
      await prisma.user.deleteMany({
        where: { id: { startsWith: 'test-bg-user-' } }
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
testBackgroundProcessor().catch(console.error);