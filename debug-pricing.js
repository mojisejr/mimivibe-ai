const { PrismaClient } = require('@prisma/client');

async function debugPricing() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== INVESTIGATING PRICING DATABASE ISSUE ===\n');
    
    // 1. Check Pack table records
    console.log('1. PACK TABLE RECORDS:');
    console.log('========================');
    const packs = await prisma.pack.findMany({
      orderBy: { id: 'asc' }
    });
    
    packs.forEach(pack => {
      console.log(`Pack ID: ${pack.id}`);
      console.log(`  Title: ${pack.title}`);
      console.log(`  Price: ${pack.price} (stored value)`);
      console.log(`  Credit Amount: ${pack.creditAmount}`);
      console.log(`  Popular: ${pack.popular}`);
      console.log(`  Active: ${pack.isActive}`);
      console.log(`  Sort Order: ${pack.sortOrder}`);
      if (pack.metadata) {
        console.log(`  Metadata: ${JSON.stringify(pack.metadata)}`);
      }
      console.log('');
    });
    
    // 2. Check PaymentHistory records
    console.log('2. PAYMENT HISTORY RECORDS (Latest 10):');
    console.log('========================================');
    const payments = await prisma.paymentHistory.findMany({
      include: {
        pack: true,
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    if (payments.length === 0) {
      console.log('No payment history records found.');
    } else {
      payments.forEach(payment => {
        console.log(`Payment ID: ${payment.id}`);
        console.log(`  User: ${payment.user.email || payment.user.name} (${payment.userId})`);
        console.log(`  Pack: ${payment.pack.title} (ID: ${payment.packId})`);
        console.log(`  Amount: ${payment.amount} ${payment.currency.toUpperCase()}`);
        console.log(`  Pack Price: ${payment.pack.price}`);
        console.log(`  Credits Added: ${payment.creditsAdded}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Created: ${payment.createdAt}`);
        console.log('');
      });
    }
    
    // 3. Check CampaignTemplate records for 70% discount
    console.log('3. CAMPAIGN TEMPLATE RECORDS:');
    console.log('=============================');
    const campaigns = await prisma.campaignTemplate.findMany();
    
    if (campaigns.length === 0) {
      console.log('No campaign template records found.');
    } else {
      campaigns.forEach(campaign => {
        console.log(`Campaign ID: ${campaign.id}`);
        console.log(`  Name: ${campaign.name}`);
        console.log(`  Type: ${campaign.type}`);
        console.log(`  Active: ${campaign.isActive}`);
        console.log(`  Rewards: ${JSON.stringify(campaign.rewards)}`);
        if (campaign.metadata) {
          console.log(`  Metadata: ${JSON.stringify(campaign.metadata)}`);
        }
        console.log(`  Start Date: ${campaign.startDate}`);
        console.log(`  End Date: ${campaign.endDate}`);
        console.log('');
      });
    }
    
    // 4. Analysis summary
    console.log('4. ANALYSIS SUMMARY:');
    console.log('====================');
    
    if (packs.length > 0) {
      console.log('Pack Pricing Analysis:');
      packs.forEach(pack => {
        const expectedPrice = pack.title.includes('99') ? 99 : 
                            pack.title.includes('199') ? 199 :
                            pack.title.includes('399') ? 399 : 'Unknown';
        const storedPrice = pack.price;
        const multiplier = storedPrice / (expectedPrice === 'Unknown' ? 1 : expectedPrice);
        
        console.log(`  ${pack.title}:`);
        console.log(`    Expected: ${expectedPrice} THB`);
        console.log(`    Stored: ${storedPrice}`);
        console.log(`    Multiplier: ${multiplier}x`);
        
        if (multiplier === 100) {
          console.log(`    🚨 CRITICAL: 100x price inflation detected!`);
        }
      });
    }
    
    // 5. Check for any recent updates or patterns
    console.log('\n5. RECENT PAYMENT PATTERNS:');
    console.log('===========================');
    
    if (payments.length > 0) {
      const recentPayments = payments.slice(0, 5);
      recentPayments.forEach(payment => {
        const expectedPrice = payment.pack.title.includes('99') ? 99 :
                            payment.pack.title.includes('199') ? 199 :
                            payment.pack.title.includes('399') ? 399 : 'Unknown';
        const actualAmount = payment.amount;
        
        if (expectedPrice !== 'Unknown' && actualAmount !== expectedPrice) {
          console.log(`⚠️  Pricing mismatch found:`);
          console.log(`    Pack: ${payment.pack.title}`);
          console.log(`    Expected: ${expectedPrice} THB`);
          console.log(`    Charged: ${actualAmount} THB`);
          console.log(`    Date: ${payment.createdAt}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error investigating pricing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPricing();