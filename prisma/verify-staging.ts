import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verifying staging database content...\n');

  try {
    // Check Cards
    const cardCount = await prisma.card.count();
    console.log(`📦 Cards: ${cardCount} records`);
    
    // Check Packs
    const packCount = await prisma.pack.count();
    console.log(`💰 Packs: ${packCount} records`);
    
    // Check RewardConfiguration
    const rewardCount = await prisma.rewardConfiguration.count();
    console.log(`🎁 Reward Configurations: ${rewardCount} records`);
    
    // Check ExchangeSetting
    const exchangeCount = await prisma.exchangeSetting.count();
    console.log(`💱 Exchange Settings: ${exchangeCount} records`);
    
    // Check PromptTemplate
    const templateCount = await prisma.promptTemplate.count();
    console.log(`📝 Prompt Templates: ${templateCount} records`);
    
    // Check PromptVersion
    const versionCount = await prisma.promptVersion.count();
    console.log(`🔄 Prompt Versions: ${versionCount} records`);
    
    console.log('\n📊 Verification Summary:');
    console.log(`   Total configuration records: ${cardCount + packCount + rewardCount + exchangeCount + templateCount + versionCount}`);
    
    // Sample some data to verify content
    console.log('\n🔍 Sample Data Verification:');
    
    const sampleCard = await prisma.card.findFirst();
    if (sampleCard) {
      console.log(`   ✅ Sample Card: ${sampleCard.name} (${sampleCard.displayName})`);
    }
    
    const sampleReward = await prisma.rewardConfiguration.findFirst();
    if (sampleReward) {
      console.log(`   ✅ Sample Reward: ${sampleReward.name} (${sampleReward.type})`);
    }
    
    const sampleTemplate = await prisma.promptTemplate.findFirst();
    if (sampleTemplate) {
      console.log(`   ✅ Sample Template: ${sampleTemplate.name} (v${sampleTemplate.version})`);
    }
    
    console.log('\n✅ Staging database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Error verifying staging database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();