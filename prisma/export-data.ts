import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Initialize Prisma client for local database
const prisma = new PrismaClient();

interface ExportedData {
  cards: any[];
  packs: any[];
  rewardConfigurations: any[];
  exchangeSettings: any[];
  promptTemplates: any[];
  promptVersions: any[];
  exportTimestamp: string;
  exportSource: string;
}

async function exportCards() {
  console.log('📦 Exporting Card data...');
  const cards = await prisma.card.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`✅ Exported ${cards.length} cards`);
  return cards;
}

async function exportPacks() {
  console.log('📦 Exporting Pack data...');
  const packs = await prisma.pack.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`✅ Exported ${packs.length} packs`);
  return packs;
}

async function exportRewardConfigurations() {
  console.log('📦 Exporting RewardConfiguration data...');
  const rewardConfigurations = await prisma.rewardConfiguration.findMany({
    orderBy: { createdAt: 'asc' }
  });
  console.log(`✅ Exported ${rewardConfigurations.length} reward configurations`);
  return rewardConfigurations;
}

async function exportExchangeSettings() {
  console.log('📦 Exporting ExchangeSetting data...');
  const exchangeSettings = await prisma.exchangeSetting.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`✅ Exported ${exchangeSettings.length} exchange settings`);
  return exchangeSettings;
}

async function exportPromptTemplates() {
  console.log('📦 Exporting PromptTemplate data...');
  const promptTemplates = await prisma.promptTemplate.findMany({
    orderBy: { id: 'asc' }
  });
  console.log(`✅ Exported ${promptTemplates.length} prompt templates`);
  return promptTemplates;
}

async function exportPromptVersions() {
  console.log('📦 Exporting PromptVersion data...');
  const promptVersions = await prisma.promptVersion.findMany({
    orderBy: [{ templateId: 'asc' }, { version: 'asc' }]
  });
  console.log(`✅ Exported ${promptVersions.length} prompt versions`);
  return promptVersions;
}

async function saveExportedData(data: ExportedData) {
  const exportDir = path.join(__dirname, 'exports');
  
  // Create exports directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `data-export-${timestamp}.json`;
  const filepath = path.join(exportDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`💾 Data exported to: ${filepath}`);
  
  // Also create a latest.json for easy access
  const latestPath = path.join(exportDir, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(data, null, 2));
  console.log(`💾 Latest export saved to: ${latestPath}`);

  return filepath;
}

async function main() {
  try {
    console.log('🚀 Starting data export from local PostgreSQL database...');
    console.log('⚠️  This will NOT modify any data, only read and export');
    
    const exportedData: ExportedData = {
      cards: await exportCards(),
      packs: await exportPacks(),
      rewardConfigurations: await exportRewardConfigurations(),
      exchangeSettings: await exportExchangeSettings(),
      promptTemplates: await exportPromptTemplates(),
      promptVersions: await exportPromptVersions(),
      exportTimestamp: new Date().toISOString(),
      exportSource: 'local-postgresql'
    };

    const filepath = await saveExportedData(exportedData);

    console.log('\n📊 Export Summary:');
    console.log(`   Cards: ${exportedData.cards.length}`);
    console.log(`   Packs: ${exportedData.packs.length}`);
    console.log(`   Reward Configurations: ${exportedData.rewardConfigurations.length}`);
    console.log(`   Exchange Settings: ${exportedData.exchangeSettings.length}`);
    console.log(`   Prompt Templates: ${exportedData.promptTemplates.length}`);
    console.log(`   Prompt Versions: ${exportedData.promptVersions.length}`);
    console.log(`   Export file: ${filepath}`);
    
    console.log('\n✅ Data export completed successfully!');
    console.log('🔒 Local database data remains unchanged and safe');

  } catch (error) {
    console.error('❌ Error during data export:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { main as exportData };
export type { ExportedData };