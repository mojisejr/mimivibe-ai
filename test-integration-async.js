/**
 * Comprehensive Integration Test for Async Reading System
 * Tests multiple scenarios and edge cases
 */

const BASE_URL = 'http://localhost:3000';

// Test scenarios
const testScenarios = [
  {
    name: 'Valid Career Question',
    question: 'What does the future hold for my career?',
    expectedStatus: 'PENDING'
  },
  {
    name: 'Valid Love Question',
    question: 'Will I find love this year?',
    expectedStatus: 'PENDING'
  },
  {
    name: 'Valid Financial Question',
    question: 'How can I improve my financial situation?',
    expectedStatus: 'PENDING'
  }
];

async function submitReading(question) {
  console.log(`📝 Submitting: "${question}"`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/readings/test-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        language: 'th'
      }),
    });

    const data = await response.json();
    
    console.log(`✅ Submit Status: ${response.status}`);
    if (data.success) {
      console.log(`📋 Reading ID: ${data.readingId}`);
      console.log(`⏰ Estimated completion: ${data.estimatedCompletionTime}`);
      console.log(`💰 User credits: Stars=${data.user.stars}, FreePoints=${data.user.freePoint}`);
    }

    return { success: response.status === 200, data };
  } catch (error) {
    console.error(`❌ Submit Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkStatus(readingId) {
  try {
    const response = await fetch(`${BASE_URL}/api/readings/test-status/${readingId}`);
    const data = await response.json();
    
    if (data.success) {
      const reading = data.reading;
      console.log(`📊 Status: ${reading.status}`);
      console.log(`🕐 Created: ${reading.createdAt}`);
      console.log(`🔄 Updated: ${reading.updatedAt}`);
      
      if (reading.processingStartedAt) {
        console.log(`⚡ Processing started: ${reading.processingStartedAt}`);
      }
      
      if (reading.processingCompletedAt) {
        console.log(`✅ Processing completed: ${reading.processingCompletedAt}`);
      }
      
      if (reading.errorMessage) {
        console.log(`⚠️ Error: ${reading.errorMessage}`);
      }
      
      if (reading.answer) {
        console.log(`🔮 Answer: ${reading.answer.substring(0, 100)}...`);
      }
      
      console.log(`🃏 Cards: ${reading.cards.length} cards`);
    }

    return { success: response.status === 200, data };
  } catch (error) {
    console.error(`❌ Status Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function triggerProcessing() {
  console.log(`🔄 Triggering background processing...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/readings/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Processing completed: ${data.message}`);
      console.log(`📈 Stats: Processed=${data.stats.processed}, Successful=${data.stats.successful}, Failed=${data.stats.failed}`);
    }

    return { success: response.status === 200, data };
  } catch (error) {
    console.error(`❌ Processing Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runIntegrationTest() {
  console.log('🚀 Starting Comprehensive Async Reading Integration Test\n');
  
  const results = [];
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Test Scenario ${i + 1}: ${scenario.name}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Step 1: Submit reading
    const submitResult = await submitReading(scenario.question);
    
    if (!submitResult.success) {
      console.log(`❌ Test ${i + 1} failed at submission`);
      results.push({ scenario: scenario.name, success: false, step: 'submit' });
      continue;
    }
    
    const readingId = submitResult.data.readingId;
    
    // Step 2: Check initial status
    console.log(`\n📋 Checking initial status...`);
    const initialStatus = await checkStatus(readingId);
    
    if (!initialStatus.success) {
      console.log(`❌ Test ${i + 1} failed at initial status check`);
      results.push({ scenario: scenario.name, success: false, step: 'initial_status' });
      continue;
    }
    
    // Step 3: Trigger processing
    console.log(`\n🔄 Triggering processing...`);
    const processResult = await triggerProcessing();
    
    if (!processResult.success) {
      console.log(`❌ Test ${i + 1} failed at processing`);
      results.push({ scenario: scenario.name, success: false, step: 'processing' });
      continue;
    }
    
    // Step 4: Check final status
    console.log(`\n📋 Checking final status...`);
    const finalStatus = await checkStatus(readingId);
    
    if (!finalStatus.success) {
      console.log(`❌ Test ${i + 1} failed at final status check`);
      results.push({ scenario: scenario.name, success: false, step: 'final_status' });
      continue;
    }
    
    // Validate the flow
    const reading = finalStatus.data.reading;
    const isValidFlow = reading.status !== 'PENDING' && 
                       reading.processingStartedAt && 
                       reading.processingCompletedAt;
    
    if (isValidFlow) {
      console.log(`✅ Test ${i + 1} completed successfully`);
      results.push({ scenario: scenario.name, success: true, readingId, finalStatus: reading.status });
    } else {
      console.log(`❌ Test ${i + 1} failed validation`);
      results.push({ scenario: scenario.name, success: false, step: 'validation' });
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 INTEGRATION TEST SUMMARY`);
  console.log(`${'='.repeat(60)}\n`);
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const details = result.success 
      ? `(Final Status: ${result.finalStatus})` 
      : `(Failed at: ${result.step})`;
    console.log(`${status} ${result.scenario} ${details}`);
  });
  
  console.log(`\n🎯 Overall Success Rate: ${((successful / total) * 100).toFixed(1)}%`);
  
  if (successful === total) {
    console.log(`\n🎉 All integration tests passed! The async reading system is working correctly.`);
  } else {
    console.log(`\n⚠️ Some tests failed. Please review the results above.`);
  }
}

// Run the integration test
runIntegrationTest().catch(console.error);