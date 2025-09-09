import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFirstPaymentCampaign() {
  console.log('🎯 Setting up First Payment Campaign...');
  
  const campaignData = {
    id: 'first-payment-campaign-70',
    name: 'First Payment 70% Discount',
    type: 'first_payment_discount',
    isActive: true,
    rewards: {
      discountPercentage: 70,
      applicableToAllPackages: true,
      maxUsagePerUser: 1,
      description: '70% discount on first package purchase for new users'
    },
    metadata: {
      targetAudience: 'new_users_only',
      campaignDescription: '70% discount on first package purchase',
      marketingMessage: 'Special offer for new users - 70% off your first package!',
      features: [
        'ลด 70% สำหรับแพ็กเกจแรก',
        'เฉพาะสมาชิกใหม่เท่านั้น',
        'ใช้ได้กับทุกแพ็กเกจ',
        'จำกัดเพียง 1 ครั้งต่อบัญชี'
      ],
      bannerText: '🎉 พิเศษสำหรับคุณ! ลด 70% แพ็กเกจแรก',
      urgencyText: 'โอกาสพิเศษสำหรับสมาชิกใหม่',
      ctaText: 'รับส่วนลดเลย'
    },
    startDate: new Date('2025-09-09T00:00:00Z'),
    endDate: null // No end date - ongoing campaign
  };

  try {
    // Check if campaign already exists
    const existingCampaign = await prisma.campaignTemplate.findUnique({
      where: { id: campaignData.id }
    });

    if (existingCampaign) {
      // Update existing campaign
      await prisma.campaignTemplate.update({
        where: { id: campaignData.id },
        data: campaignData
      });
      console.log('✅ Updated existing First Payment Campaign');
    } else {
      // Create new campaign
      await prisma.campaignTemplate.create({
        data: campaignData
      });
      console.log('✅ Created new First Payment Campaign');
    }

    // Verify campaign was created/updated
    const campaign = await prisma.campaignTemplate.findUnique({
      where: { id: campaignData.id }
    });

    if (campaign) {
      console.log('📋 Campaign Details:');
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Name: ${campaign.name}`);
      console.log(`   Type: ${campaign.type}`);
      console.log(`   Active: ${campaign.isActive}`);
      console.log(`   Discount: ${(campaign.rewards as any).discountPercentage}%`);
      console.log(`   Start Date: ${campaign.startDate}`);
      console.log(`   End Date: ${campaign.endDate || 'Ongoing'}`);
    }

  } catch (error) {
    console.error('❌ Error setting up campaign:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting First Payment Campaign setup...');

  try {
    await seedFirstPaymentCampaign();
    console.log('🎉 First Payment Campaign setup completed successfully!');
  } catch (error) {
    console.error('❌ Campaign setup failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });