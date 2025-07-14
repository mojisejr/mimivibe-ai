#!/usr/bin/env node

/**
 * Webhook Testing Script
 * ใช้สำหรับทดสอบ Clerk webhook ก่อนที่จะตั้งค่าจริง
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const https = require('https');
const crypto = require('crypto');

// Configuration
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET?.replace(/"/g, '') || '';
const NGROK_URL = process.argv[2];
const ENDPOINT = '/api/webhooks/clerk';

if (!NGROK_URL) {
  console.log('❌ Usage: node scripts/test-webhook.js <ngrok-url>');
  console.log('📝 Example: node scripts/test-webhook.js https://abc123.ngrok.io');
  process.exit(1);
}

if (!WEBHOOK_SECRET) {
  console.log('❌ CLERK_WEBHOOK_SECRET not found in environment');
  console.log('📝 Make sure .env.local has CLERK_WEBHOOK_SECRET');
  process.exit(1);
}

// Test payload
const testPayload = {
  type: 'user.created',
  data: {
    id: `user_test_${Date.now()}`,
    email_addresses: [
      {
        email_address: 'webhook.test@example.com',
        verification: {
          status: 'verified'
        }
      }
    ],
    first_name: 'Webhook',
    last_name: 'Test',
    image_url: 'https://example.com/test-avatar.jpg',
    created_at: Date.now(),
    updated_at: Date.now()
  }
};

// Generate proper svix signature
function generateSignature(payload, secret, timestamp, msgId) {
  // Extract the base64 key from webhook secret (format: whsec_base64key)
  const base64Key = secret.split('_')[1];
  if (!base64Key) {
    throw new Error('Invalid webhook secret format. Expected whsec_xxx');
  }
  
  const signedPayload = `${msgId}.${timestamp}.${payload}`;
  const secretBytes = Buffer.from(base64Key, 'base64');
  
  const signature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedPayload, 'utf8')
    .digest('base64');
    
  return `v1,${signature}`;
}

async function testWebhook() {
  const payloadString = JSON.stringify(testPayload);
  const timestamp = Math.floor(Date.now() / 1000);
  const messageId = `msg_test_${Date.now()}`;
  const signature = generateSignature(payloadString, WEBHOOK_SECRET, timestamp, messageId);

  const postData = payloadString;
  const url = new URL(NGROK_URL + ENDPOINT);

  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'svix-id': messageId,
      'svix-timestamp': timestamp.toString(),
      'svix-signature': signature,
      'User-Agent': 'Svix-Webhooks/1.0'
    }
  };

  console.log('🧪 Testing Clerk Webhook...');
  console.log(`📡 URL: ${NGROK_URL}${ENDPOINT}`);
  console.log(`👤 Test User ID: ${testPayload.data.id}`);
  console.log(`📧 Test Email: ${testPayload.data.email_addresses[0].email_address}`);
  console.log('⏱️  Sending request...\n');

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        console.log(`📋 Response Headers:`, res.headers);
        console.log(`📄 Response Body:`, data);

        if (res.statusCode === 200) {
          console.log('\n✅ Webhook test successful!');
          console.log('🎯 Next steps:');
          console.log('1. Check your terminal logs for webhook processing messages');
          console.log('2. Verify user was created in database');
          console.log('3. Set up real webhook in Clerk Dashboard');
        } else {
          console.log('\n❌ Webhook test failed');
          console.log('🔍 Check the error details above');
        }

        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log('\n❌ Request failed:', err.message);
      console.log('🔍 Common issues:');
      console.log('- Check ngrok is running and URL is correct');
      console.log('- Check dev server is running on port 3000');
      console.log('- Check network connectivity');
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Run test
testWebhook().catch(console.error);