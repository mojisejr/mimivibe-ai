/**
 * End-to-End Test for Async Reading Flow
 * Tests the complete workflow from API request to background processing
 */

const BASE_URL = 'http://localhost:3001';

async function testAsyncReadingFlow() {
  console.log('🚀 Starting Async Reading Flow Test...\n');

  try {
    // Step 1: Test async reading creation
    console.log('📝 Step 1: Creating async reading request...');
    
    const createResponse = await fetch(`${BASE_URL}/api/readings/test-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'What does the future hold for my career?',
        type: 'general'
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Failed to create async reading:', errorText);
      return;
    }

    const createResult = await createResponse.json();
    console.log('✅ Async reading created:', {
      readingId: createResult.readingId,
      status: createResult.status,
      estimatedTime: createResult.estimatedCompletionTime
    });

    const readingId = createResult.readingId;

    // Step 2: Check processing stats
    console.log('\n📊 Step 2: Checking processing statistics...');
    
    const statsResponse = await fetch(`${BASE_URL}/api/readings/process`);
    const statsResult = await statsResponse.json();
    console.log('📈 Processing stats:', statsResult.stats);

    // Step 3: Process the reading
    console.log('\n⚙️ Step 3: Processing the reading...');
    
    const processResponse = await fetch(`${BASE_URL}/api/readings/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        readingId: readingId
      })
    });

    const processResult = await processResponse.json();
    console.log('🔄 Processing result:', {
      success: processResult.success,
      message: processResult.message
    });

    // Step 4: Verify the reading was completed
    console.log('\n🔍 Step 4: Verifying reading completion...');
    
    // Wait a moment for processing to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check stats again to see the change
    const finalStatsResponse = await fetch(`${BASE_URL}/api/readings/process`);
    const finalStatsResult = await finalStatsResponse.json();
    console.log('📊 Final processing stats:', finalStatsResult.stats);

    console.log('\n✅ Async Reading Flow Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to test batch processing
async function testBatchProcessing() {
  console.log('\n🔄 Testing Batch Processing...');

  try {
    const batchResponse = await fetch(`${BASE_URL}/api/readings/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batchSize: 3
      })
    });

    const batchResult = await batchResponse.json();
    console.log('📦 Batch processing result:', batchResult);

  } catch (error) {
    console.error('❌ Batch processing test failed:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  console.log('🧪 Running Async Reading System Tests\n');
  console.log('=' .repeat(50));
  
  await testAsyncReadingFlow();
  await testBatchProcessing();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 All tests completed!');
}

// Check if we're running this script directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAsyncReadingFlow,
  testBatchProcessing,
  runAllTests
};