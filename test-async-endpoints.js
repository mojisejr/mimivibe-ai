#!/usr/bin/env node

/**
 * Test script for async reading endpoints
 * Tests the complete flow: submit -> status -> process
 */

const BASE_URL = 'http://localhost:3000';

async function testSubmitEndpoint() {
  console.log('🧪 Testing Submit Endpoint (using test-async)...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/readings/test-async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: 'What does the future hold for my career?',
        cardCount: 3
      })
    });

    const data = await response.json();
    console.log('✅ Submit Response:', {
      status: response.status,
      data: data
    });

    if (data.readingId) {
      return data.readingId;
    } else {
      console.log('❌ No readingId returned');
      return null;
    }
  } catch (error) {
    console.error('❌ Submit Error:', error.message);
    return null;
  }
}

async function testStatusEndpoint(readingId) {
  console.log(`🧪 Testing Status Endpoint for reading: ${readingId}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/readings/test-status/${readingId}`);
    const data = await response.json();
    
    console.log('✅ Status Response:', {
      status: response.status,
      data: data
    });

    return data;
  } catch (error) {
    console.error('❌ Status Error:', error.message);
    return null;
  }
}

async function testProcessEndpoint() {
  console.log('🧪 Testing Process Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/readings/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('✅ Process Response:', {
      status: response.status,
      data: data
    });

    return data;
  } catch (error) {
    console.error('❌ Process Error:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Async Reading Endpoint Tests\n');
  
  // Test 1: Submit a reading
  const readingId = await testSubmitEndpoint();
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (readingId) {
    // Test 2: Check status
    await testStatusEndpoint(readingId);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Process readings
    await testProcessEndpoint();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Check status again after processing
    console.log('🧪 Checking status after processing...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await testStatusEndpoint(readingId);
  }
  
  console.log('\n✨ Tests completed!');
}

// Run the tests
runTests().catch(console.error);