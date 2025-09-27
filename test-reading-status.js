const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReadingStatus() {
  try {
    console.log('Testing reading status functionality...');
    
    // Test 1: Check if we can query readings by status
    console.log('\n1. Testing status field query...');
    const pendingReadings = await prisma.reading.findMany({
      where: {
        status: 'PENDING'
      },
      take: 1
    });
    console.log('✅ Status field query works:', pendingReadings.length, 'pending readings found');
    
    // Test 2: Check Reading model fields
    console.log('\n2. Testing Reading model structure...');
    const firstReading = await prisma.reading.findFirst({
      select: {
        id: true,
        status: true,
        processingStartedAt: true,
        processingCompletedAt: true,
        errorMessage: true
      }
    });
    console.log('✅ Reading model fields:', firstReading);
    
    // Test 3: Try to create a test reading
    console.log('\n3. Testing reading creation with status...');
    const testReading = await prisma.reading.create({
      data: {
        userId: 'test-user-id',
        question: 'Test question for status verification',
        type: 'tarot',
        status: 'PENDING',
        isDeleted: false,
        isReviewed: false
      }
    });
    console.log('✅ Reading created with status:', testReading.id, testReading.status);
    
    // Clean up test reading
    await prisma.reading.delete({
      where: { id: testReading.id }
    });
    console.log('✅ Test reading cleaned up');
    
    console.log('\n🎉 All tests passed! Status field is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReadingStatus();