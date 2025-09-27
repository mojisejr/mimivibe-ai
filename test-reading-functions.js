const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testReadingFunctions() {
  console.log('🧪 Testing reading status functions...\n');

  try {
    // Test 1: Check if we can query by status using raw SQL
    console.log('1. Testing raw SQL query for status field...');
    const rawResult = await prisma.$queryRaw`
      SELECT id, status, "userId", question, "createdAt" 
      FROM readings 
      WHERE status = 'COMPLETED' 
      LIMIT 5
    `;
    console.log('✅ Raw SQL query successful:', rawResult.length, 'readings found');

    // Test 2: Get or create a test user first
    console.log('\n2. Getting existing user or checking users table...');
    const existingUsers = await prisma.$queryRaw`
      SELECT id FROM users LIMIT 1
    `;
    
    let testUserId;
    if (existingUsers.length > 0) {
      testUserId = existingUsers[0].id;
      console.log('✅ Using existing user:', testUserId);
    } else {
      console.log('⚠️ No users found, skipping user-dependent tests');
      console.log('💡 This is normal for a fresh database');
      
      // Test status field functionality without user dependency
      console.log('\n3. Testing status enum values directly...');
      const enumTest = await prisma.$queryRaw`
        SELECT unnest(enum_range(NULL::"ReadingStatus")) as status_value
      `;
      console.log('✅ ReadingStatus enum values:', enumTest.map(r => r.status_value));
      
      console.log('\n🎉 Status field and enum work correctly!');
      console.log('💡 The TypeScript issue is separate from database functionality.');
      return;
    }

    // Test 3: Test creating a reading with status (using existing user)
    console.log('\n3. Testing create reading with status...');
    const readingId = 'test-reading-' + Date.now();
    
    const createResult = await prisma.$executeRaw`
      INSERT INTO readings (id, "userId", question, type, status, "isDeleted", "isReviewed", "createdAt", "updatedAt")
      VALUES (
        ${readingId},
        ${testUserId},
        'Test question for status',
        'tarot',
        'PENDING',
        false,
        false,
        NOW(),
        NOW()
      )
    `;
    console.log('✅ Create reading successful, rows affected:', createResult);

    // Test 4: Test updating status
    console.log('\n4. Testing update reading status...');
    const updateResult = await prisma.$executeRaw`
      UPDATE readings 
      SET status = 'PROCESSING', "processingStartedAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${readingId}
    `;
    console.log('✅ Update status successful, rows affected:', updateResult);

    // Test 5: Test querying by different statuses
    console.log('\n5. Testing query by status...');
    const pendingCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM readings WHERE status = 'PENDING' AND "isDeleted" = false
    `;
    const processingCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM readings WHERE status = 'PROCESSING' AND "isDeleted" = false
    `;
    const completedCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM readings WHERE status = 'COMPLETED' AND "isDeleted" = false
    `;
    const failedCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM readings WHERE status = 'FAILED' AND "isDeleted" = false
    `;

    console.log('✅ Status counts:');
    console.log('  - PENDING:', pendingCount[0].count);
    console.log('  - PROCESSING:', processingCount[0].count);
    console.log('  - COMPLETED:', completedCount[0].count);
    console.log('  - FAILED:', failedCount[0].count);

    // Test 6: Clean up test data
    console.log('\n6. Cleaning up test data...');
    const deleteResult = await prisma.$executeRaw`
      DELETE FROM readings WHERE id = ${readingId}
    `;
    console.log('✅ Cleanup successful, rows deleted:', deleteResult);

    console.log('\n🎉 All tests passed! The status field and enum work correctly.');
    console.log('💡 The issue is with TypeScript types, not the database functionality.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

testReadingFunctions();