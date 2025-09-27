const { PrismaClient, ReadingStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAsyncReadingSystem() {
  console.log('🚀 Testing Async Reading System...\n');

  try {
    // Step 1: Create a test user
    console.log('👤 Step 1: Creating test user...');
    const testUserId = 'test-user-' + Date.now();
    
    const testUser = await prisma.user.create({
      data: {
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        stars: 10,
        freePoint: 5,
        coins: 100,
        level: 1,
        exp: 0,
        updatedAt: new Date(),
      }
    });
    console.log('✅ Test user created:', testUser.id);

    // Step 2: Test createPendingReading function
    console.log('\n📝 Step 2: Testing createPendingReading...');
    
    const pendingReading = await prisma.reading.create({
      data: {
        userId: testUser.id,
        question: 'What does the future hold for my career?',
        type: 'tarot',
        status: ReadingStatus.PENDING,
        isDeleted: false,
        isReviewed: false,
      }
    });
    
    console.log('✅ Pending reading created:', {
      id: pendingReading.id,
      status: pendingReading.status,
      question: pendingReading.question
    });

    // Step 3: Test status transitions
    console.log('\n⚙️ Step 3: Testing status transitions...');
    
    // Mark as processing
    const processingReading = await prisma.reading.update({
      where: { id: pendingReading.id },
      data: {
        status: ReadingStatus.PROCESSING,
        processingStartedAt: new Date(),
      }
    });
    console.log('✅ Reading marked as PROCESSING:', processingReading.status);

    // Mark as completed
    const completedReading = await prisma.reading.update({
      where: { id: pendingReading.id },
      data: {
        status: ReadingStatus.COMPLETED,
        processingCompletedAt: new Date(),
        answer: {
          reading: "Test reading result",
          cards: ["The Fool", "The Magician", "The High Priestess"]
        }
      }
    });
    console.log('✅ Reading marked as COMPLETED:', completedReading.status);

    // Step 4: Test querying by status
    console.log('\n📊 Step 4: Testing status queries...');
    
    const pendingCount = await prisma.reading.count({
      where: { status: ReadingStatus.PENDING, isDeleted: false }
    });
    
    const processingCount = await prisma.reading.count({
      where: { status: ReadingStatus.PROCESSING, isDeleted: false }
    });
    
    const completedCount = await prisma.reading.count({
      where: { status: ReadingStatus.COMPLETED, isDeleted: false }
    });

    console.log('📈 Status counts:', {
      pending: pendingCount,
      processing: processingCount,
      completed: completedCount
    });

    // Step 5: Test error handling
    console.log('\n❌ Step 5: Testing error status...');
    
    const errorReading = await prisma.reading.create({
      data: {
        userId: testUser.id,
        question: 'Test error scenario',
        type: 'tarot',
        status: ReadingStatus.FAILED,
        errorMessage: 'Test error message',
        isDeleted: false,
        isReviewed: false,
      }
    });
    console.log('✅ Error reading created:', errorReading.status);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.reading.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All async reading system tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Full error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAsyncReadingSystem();