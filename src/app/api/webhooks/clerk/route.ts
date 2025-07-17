import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

// Clerk webhook event types
type ClerkEventType = 
  | 'user.created' 
  | 'user.updated' 
  | 'user.deleted'
  | 'session.created'
  | 'session.ended';

interface ClerkEvent {
  type: ClerkEventType;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      verification?: {
        status: string;
      };
    }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at?: number;
    updated_at?: number;
  };
}

// Default values for new users
const DEFAULT_USER_VALUES = {
  stars: 5,        // Free trial credits
  coins: 0,
  exp: 0,
  level: 1,
  freePoint: 5,    // Free daily readings
  role: 'USER' as const,
};

export async function POST(req: NextRequest) {
  console.log('🔔 Clerk webhook received');
  
  try {
    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ CLERK_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' }, 
        { status: 500 }
      );
    }

    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('❌ Missing required webhook headers');
      return NextResponse.json(
        { error: 'Missing required headers' }, 
        { status: 400 }
      );
    }

    const body = await req.text();
    const wh = new Webhook(webhookSecret);

    let evt: ClerkEvent;
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkEvent;
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { status: 400 }
      );
    }

    console.log(`📨 Processing event: ${evt.type} for user: ${evt.data.id}`);

    // Handle different event types
    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
        
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
        
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
        
      default:
        console.log(`ℹ️ Unhandled event type: ${evt.type}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

async function handleUserCreated(userData: ClerkEvent['data']) {
  console.log(`👤 Creating new user: ${userData.id}`);
  
  try {
    // Extract user information
    const primaryEmail = userData.email_addresses?.find(
      email => email.verification?.status === 'verified'
    )?.email_address || userData.email_addresses?.[0]?.email_address;

    const firstName = userData.first_name;
    const lastName = userData.last_name;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

    // Check if user already exists (in case of duplicate webhooks)
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id }
    });

    if (existingUser) {
      console.log(`ℹ️ User ${userData.id} already exists, skipping creation`);
      return;
    }

    // Create user with default values
    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        email: primaryEmail || null,
        name: fullName,
        imageUrl: userData.image_url || null,
        ...DEFAULT_USER_VALUES,
        createdAt: userData.created_at ? new Date(userData.created_at) : new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ User created successfully:`, {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      stars: newUser.stars,
      freePoint: newUser.freePoint
    });

    // Create initial point transaction for welcome bonus
    await prisma.pointTransaction.create({
      data: {
        id: `welcome_${userData.id}_${Date.now()}`,
        userId: userData.id,
        eventType: 'welcome_bonus',
        deltaExp: 0,
        deltaCoins: 0,
        deltaPoint: 5, // Welcome free points
        metadata: {
          reason: 'Welcome to MiMiVibes!',
          timestamp: new Date().toISOString()
        }
      }
    });

    // Create referral code for the new user
    await prisma.referralCode.create({
      data: {
        userId: userData.id,
        code: `REF${userData.id.slice(-6).toUpperCase()}`,
        isUsed: false,
      }
    });

    console.log(`🎁 Welcome bonus and referral code created for user: ${userData.id}`);
    
  } catch (error) {
    console.error(`❌ Failed to create user ${userData.id}:`, error);
    
    // Don't throw error to avoid webhook retries for non-critical failures
    if ((error as any)?.code === 'P2002') {
      console.log(`ℹ️ User ${userData.id} already exists (race condition), continuing...`);
    }
  }
}

async function handleUserUpdated(userData: ClerkEvent['data']) {
  console.log(`🔄 Updating user: ${userData.id}`);
  
  try {
    const primaryEmail = userData.email_addresses?.find(
      email => email.verification?.status === 'verified'
    )?.email_address || userData.email_addresses?.[0]?.email_address;

    const firstName = userData.first_name;
    const lastName = userData.last_name;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null;

    // Update user information
    await prisma.user.upsert({
      where: { id: userData.id },
      update: {
        email: primaryEmail || null,
        name: fullName,
        imageUrl: userData.image_url || null,
        updatedAt: new Date(),
      },
      create: {
        id: userData.id,
        email: primaryEmail || null,
        name: fullName,
        imageUrl: userData.image_url || null,
        ...DEFAULT_USER_VALUES,
        createdAt: userData.created_at ? new Date(userData.created_at) : new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ User ${userData.id} updated successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to update user ${userData.id}:`, error);
  }
}

async function handleUserDeleted(userData: ClerkEvent['data']) {
  console.log(`🗑️ User deletion requested: ${userData.id}`);
  
  try {
    // Soft delete by updating user record instead of hard delete
    // This preserves reading history and transaction data
    await prisma.user.update({
      where: { id: userData.id },
      data: {
        email: null,
        name: '[Deleted User]',
        imageUrl: null,
        updatedAt: new Date(),
      }
    });

    console.log(`✅ User ${userData.id} soft deleted successfully`);
    
  } catch (error) {
    console.error(`❌ Failed to delete user ${userData.id}:`, error);
  }
}