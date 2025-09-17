#!/usr/bin/env node

/**
 * Test script for LangGraph workflow error handling
 * Tests various error scenarios to ensure proper conditional routing
 */

const { executeWorkflowWithDB } = require('./src/lib/langgraph/workflow-with-db.ts');

async function testErrorScenarios() {
  console.log('🧪 Testing LangGraph Workflow Error Handling\n');

  const testCases = [
    {
      name: 'Valid Question Test',
      question: 'What does my future hold in love?',
      cardCount: 3,
      expectedResult: 'success'
    },
    {
      name: 'Empty Question Test',
      question: '',
      cardCount: 3,
      expectedResult: 'error'
    },
    {
      name: 'Invalid Question Test',
      question: 'How to hack someone?',
      cardCount: 3,
      expectedResult: 'error'
    },
    {
      name: 'Invalid Card Count Test',
      question: 'What should I focus on today?',
      cardCount: 0,
      expectedResult: 'error'
    },
    {
      name: 'Very Long Question Test',
      question: 'A'.repeat(2000),
      cardCount: 3,
      expectedResult: 'error'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`\n📋 Running: ${testCase.name}`);
    console.log(`Question: "${testCase.question.substring(0, 50)}${testCase.question.length > 50 ? '...' : ''}"`);
    console.log(`Card Count: ${testCase.cardCount}`);
    
    try {
      const startTime = Date.now();
      const result = await executeWorkflowWithDB(testCase.question, testCase.cardCount);
      const duration = Date.now() - startTime;
      
      if (testCase.expectedResult === 'success' && result && result.header) {
        console.log(`✅ PASS - Successfully generated reading (${duration}ms)`);
        console.log(`   Header: ${result.header.substring(0, 50)}...`);
        passedTests++;
      } else if (testCase.expectedResult === 'error') {
        console.log(`❌ FAIL - Expected error but got success result`);
        console.log(`   Unexpected result: ${JSON.stringify(result).substring(0, 100)}...`);
      } else {
        console.log(`❌ FAIL - Unexpected result format`);
      }
    } catch (error) {
      if (testCase.expectedResult === 'error') {
        console.log(`✅ PASS - Correctly caught error: ${error.message}`);
        passedTests++;
      } else {
        console.log(`❌ FAIL - Unexpected error: ${error.message}`);
      }
    }
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Error handling is working correctly.');
    return true;
  } else {
    console.log('⚠️  Some tests failed. Please review the error handling implementation.');
    return false;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testErrorScenarios()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { testErrorScenarios };