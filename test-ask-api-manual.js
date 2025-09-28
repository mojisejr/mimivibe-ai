// Manual test script for /api/readings/ask route
// Tests authentication, error handling, and both sync/async flows

const BASE_URL = 'http://localhost:3000';

// Test scenarios
const testScenarios = [
  {
    name: 'Test 1: No Authentication (should fail)',
    url: `${BASE_URL}/api/readings/ask`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: 'What does the future hold for me?',
      language: 'th'
    }),
    expectedStatus: 401,
    expectedError: 'AUTHENTICATION_REQUIRED'
  },
  {
    name: 'Test 2: Invalid Question Format (empty)',
    url: `${BASE_URL}/api/readings/ask`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: '',
      language: 'th'
    }),
    expectedStatus: 400,
    expectedError: 'INVALID_QUESTION_FORMAT'
  },
  {
    name: 'Test 3: Question Too Short',
    url: `${BASE_URL}/api/readings/ask`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: 'short',
      language: 'th'
    }),
    expectedStatus: 400,
    expectedError: 'QUESTION_TOO_SHORT'
  },
  {
    name: 'Test 4: Question Too Long',
    url: `${BASE_URL}/api/readings/ask`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: 'a'.repeat(501), // 501 characters
      language: 'th'
    }),
    expectedStatus: 400,
    expectedError: 'QUESTION_TOO_LONG'
  },
  {
    name: 'Test 5: Async Mode Request',
    url: `${BASE_URL}/api/readings/ask?async=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: 'What guidance do the cards have for my career path?',
      language: 'th'
    }),
    expectedStatus: 200,
    expectedAsync: true
  }
];

async function runTest(scenario) {
  console.log(`\n🧪 ${scenario.name}`);
  console.log(`📍 ${scenario.method} ${scenario.url}`);
  
  try {
    const response = await fetch(scenario.url, {
      method: scenario.method,
      headers: scenario.headers,
      body: scenario.body
    });
    
    const data = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    // Validate expected results
    if (scenario.expectedStatus && response.status === scenario.expectedStatus) {
      console.log(`✅ Status code matches expected: ${scenario.expectedStatus}`);
    } else if (scenario.expectedStatus) {
      console.log(`❌ Status code mismatch. Expected: ${scenario.expectedStatus}, Got: ${response.status}`);
    }
    
    if (scenario.expectedError && data.error?.code === scenario.expectedError) {
      console.log(`✅ Error code matches expected: ${scenario.expectedError}`);
    } else if (scenario.expectedError && data.error?.code) {
      console.log(`❌ Error code mismatch. Expected: ${scenario.expectedError}, Got: ${data.error.code}`);
    }
    
    if (scenario.expectedAsync && data.data?.status === 'PENDING') {
      console.log(`✅ Async mode working: Reading status is PENDING`);
    }
    
  } catch (error) {
    console.log(`❌ Request failed:`, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Manual API Tests for /api/readings/ask');
  console.log('=' .repeat(60));
  
  for (const scenario of testScenarios) {
    await runTest(scenario);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ All tests completed!');
  console.log('\n📝 Notes:');
  console.log('- Tests 1-4 should fail with proper error responses');
  console.log('- Test 5 will fail due to authentication but should show proper error handling');
  console.log('- To test with authentication, you need to add Clerk session cookies');
}

// Run the tests
runAllTests().catch(console.error);