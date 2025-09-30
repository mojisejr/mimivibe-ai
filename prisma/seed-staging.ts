import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import type { ExportedData } from './export-data';

// Initialize Prisma client for staging database
// This will use the staging DATABASE_URL and DIRECT_URL from environment
const prisma = new PrismaClient();

interface SeedingStats {
  cards: { created: number; skipped: number };
  packs: { created: number; skipped: number };
  rewardConfigurations: { created: number; skipped: number };
  exchangeSettings: { created: number; skipped: number };
  promptTemplates: { created: number; skipped: number };
  promptVersions: { created: number; skipped: number };
}

async function loadExportedData(): Promise<ExportedData> {
  const exportPath = path.join(__dirname, 'exports', 'latest.json');
  
  if (!fs.existsSync(exportPath)) {
    throw new Error(`Export file not found at ${exportPath}. Please run the export script first.`);
  }

  const data = fs.readFileSync(exportPath, 'utf-8');
  return JSON.parse(data) as ExportedData;
}

async function seedCards(cards: any[]): Promise<{ created: number; skipped: number }> {
  console.log('🃏 Seeding Card data...');
  let created = 0;
  let skipped = 0;

  for (const card of cards) {
    try {
      // Check if card already exists
      const existing = await prisma.card.findUnique({
        where: { id: card.id }
      });

      if (existing) {
        console.log(`   ⏭️  Card ${card.id} (${card.name}) already exists, skipping`);
        skipped++;
        continue;
      }

      await prisma.card.create({
        data: {
          id: card.id,
          name: card.name,
          displayName: card.displayName || card.name,
          arcana: card.arcana,
          shortMeaning: card.shortMeaning || card.uprightMeaning || '',
          longMeaning: card.longMeaning || card.reversedMeaning || '',
          longMeaningRaw: card.longMeaningRaw || card.reversedMeaning || '',
          keywords: card.keywords,
          imageUrl: card.imageUrl
        }
      });
      
      console.log(`   ✅ Created card ${card.id} (${card.name})`);
      created++;
    } catch (error) {
      console.error(`   ❌ Error creating card ${card.id}:`, error);
      throw error;
    }
  }

  return { created, skipped };
}

async function seedPacks(packs: any[]): Promise<{ created: number; skipped: number }> {
  console.log('📦 Seeding Pack data...');
  let created = 0;
  let skipped = 0;

  for (const pack of packs) {
    try {
      // Check if pack already exists
      const existing = await prisma.pack.findUnique({
        where: { id: pack.id }
      });

      if (existing) {
        console.log(`   ⏭️  Pack ${pack.id} (${pack.name}) already exists, skipping`);
        skipped++;
        continue;
      }

      await prisma.pack.create({
        data: {
          id: pack.id,
          title: pack.title || pack.name || '',
          subtitle: pack.subtitle || pack.description,
          ctaText: pack.ctaText || 'ซื้อเลย',
          price: pack.price,
          creditAmount: pack.creditAmount || pack.credits || 0,
          metadata: pack.metadata,
          isActive: pack.isActive !== undefined ? pack.isActive : true,
          popular: pack.popular || pack.isPopular || false,
          sortOrder: pack.sortOrder || 0
        }
      });
      
      console.log(`   ✅ Created pack ${pack.id} (${pack.name})`);
      created++;
    } catch (error) {
      console.error(`   ❌ Error creating pack ${pack.id}:`, error);
      throw error;
    }
  }

  return { created, skipped };
}

async function seedRewardConfigurations(rewardConfigurations: any[]): Promise<{ created: number; skipped: number }> {
  console.log('🎁 Seeding RewardConfiguration data...');
  let created = 0;
  let skipped = 0;

  for (const config of rewardConfigurations) {
    try {
      // Check if reward configuration already exists
      const existing = await prisma.rewardConfiguration.findUnique({
        where: { id: config.id }
      });

      if (existing) {
        console.log(`   ⏭️  RewardConfiguration ${config.id} (${config.action}) already exists, skipping`);
        skipped++;
        continue;
      }

      await prisma.rewardConfiguration.create({
        data: {
          id: config.id,
          name: config.name || config.action || '',
          type: config.type || config.action || 'action',
          icon: config.icon || '🎁',
          title: config.title || config.action || '',
          description: config.description || '',
          criteria: config.criteria || {},
          rewards: config.rewards || { xp: config.xpReward || 0, coins: config.coinReward || 0 },
          isActive: config.isActive !== undefined ? config.isActive : true,
          sortOrder: config.sortOrder || 0,
          createdAt: new Date(config.createdAt || Date.now()),
          updatedAt: new Date(config.updatedAt || Date.now())
        }
      });
      
      console.log(`   ✅ Created reward configuration ${config.id} (${config.action})`);
      created++;
    } catch (error) {
      console.error(`   ❌ Error creating reward configuration ${config.id}:`, error);
      throw error;
    }
  }

  return { created, skipped };
}

async function seedExchangeSettings(exchangeSettings: any[]): Promise<{ created: number; skipped: number }> {
  console.log('💱 Seeding ExchangeSetting data...');
  let created = 0;
  let skipped = 0;

  for (const setting of exchangeSettings) {
    try {
      // Check if exchange setting already exists
      const existing = await prisma.exchangeSetting.findUnique({
        where: { id: setting.id }
      });

      if (existing) {
        console.log(`   ⏭️  ExchangeSetting ${setting.id} already exists, skipping`);
        skipped++;
        continue;
      }

      await prisma.exchangeSetting.create({
        data: {
          id: setting.id,
          exchangeType: setting.exchangeType || 'coin_to_point',
          receivedItem: setting.receivedItem || 'free_point',
          coinPerUnit: setting.coinPerUnit || setting.coinToFreePointRate || 15,
          isActive: setting.isActive !== undefined ? setting.isActive : true,
          metadata: setting.metadata,
          createdAt: new Date(setting.createdAt || Date.now()),
          updatedAt: new Date(setting.updatedAt || Date.now())
        }
      });
      
      console.log(`   ✅ Created exchange setting ${setting.id}`);
      created++;
    } catch (error) {
      console.error(`   ❌ Error creating exchange setting ${setting.id}:`, error);
      throw error;
    }
  }

  return { created, skipped };
}

async function seedPromptTemplates(promptTemplates: any[]): Promise<{ created: number; skipped: number }> {
  console.log('📝 Seeding PromptTemplate data...');
  let created = 0;
  let skipped = 0;

  for (const template of promptTemplates) {
    try {
      // Check if prompt template already exists
      const existing = await prisma.promptTemplate.findUnique({
        where: { id: template.id }
      });

      if (existing) {
        console.log(`   ⏭️  PromptTemplate ${template.id} (${template.name}) already exists, skipping`);
        skipped++;
        continue;
      }

      await prisma.promptTemplate.create({
        data: {
          id: template.id,
          name: template.name,
          encryptedContent: template.encryptedContent || '',
          version: template.version || 1,
          isActive: template.isActive !== undefined ? template.isActive : true,
          description: template.description,
          performanceNotes: template.performanceNotes,
          createdAt: new Date(template.createdAt || Date.now()),
          updatedAt: new Date(template.updatedAt || Date.now())
        }
      });
      
      console.log(`   ✅ Created prompt template ${template.id} (${template.name})`);
      created++;
    } catch (error) {
      console.error(`   ❌ Error creating prompt template ${template.id}:`, error);
      throw error;
    }
  }

  return { created, skipped };
}

async function seedPromptVersions(promptVersions: any[]): Promise<{ created: number; skipped: number }> {
  console.log('🔄 Seeding PromptVersion data...');
  let created = 0;
  let skipped = 0;

  for (const version of promptVersions) {
    try {
      // Check if prompt version already exists
      const existing = await prisma.promptVersion.findUnique({
        where: { id: version.id }
      });

      if (existing) {
        console.log(`   ⏭️  PromptVersion ${version.id} (v${version.version}) already exists, skipping`);
        skipped++;
        continue;
      }

      await prisma.promptVersion.create({
        data: {
          id: version.id,
          templateId: version.templateId,
          version: version.version,
          encryptedContent: version.encryptedContent || version.content || '',
          isActive: version.isActive !== undefined ? version.isActive : false,
          description: version.description,
          performanceMetrics: version.performanceMetrics,
          createdAt: new Date(version.createdAt || Date.now())
        }
      });
      
      console.log(`   ✅ Created prompt version ${version.id} (v${version.version})`);
      created++;
    } catch (error) {
      console.error(`   ❌ Error creating prompt version ${version.id}:`, error);
      throw error;
    }
  }

  return { created, skipped };
}

async function main() {
  try {
    console.log('🚀 Starting data seeding to staging Supabase database...');
    console.log('⚠️  This will add data to the staging database');
    
    // Load exported data
    const exportedData = await loadExportedData();
    console.log(`📊 Loaded export from ${exportedData.exportTimestamp}`);
    
    const stats: SeedingStats = {
      cards: await seedCards(exportedData.cards),
      packs: await seedPacks(exportedData.packs),
      rewardConfigurations: await seedRewardConfigurations(exportedData.rewardConfigurations),
      exchangeSettings: await seedExchangeSettings(exportedData.exchangeSettings),
      promptTemplates: await seedPromptTemplates(exportedData.promptTemplates),
      promptVersions: await seedPromptVersions(exportedData.promptVersions)
    };

    console.log('\n📊 Seeding Summary:');
    console.log(`   Cards: ${stats.cards.created} created, ${stats.cards.skipped} skipped`);
    console.log(`   Packs: ${stats.packs.created} created, ${stats.packs.skipped} skipped`);
    console.log(`   Reward Configurations: ${stats.rewardConfigurations.created} created, ${stats.rewardConfigurations.skipped} skipped`);
    console.log(`   Exchange Settings: ${stats.exchangeSettings.created} created, ${stats.exchangeSettings.skipped} skipped`);
    console.log(`   Prompt Templates: ${stats.promptTemplates.created} created, ${stats.promptTemplates.skipped} skipped`);
    console.log(`   Prompt Versions: ${stats.promptVersions.created} created, ${stats.promptVersions.skipped} skipped`);
    
    const totalCreated = Object.values(stats).reduce((sum, stat) => sum + stat.created, 0);
    const totalSkipped = Object.values(stats).reduce((sum, stat) => sum + stat.skipped, 0);
    
    console.log(`\n✅ Seeding completed successfully!`);
    console.log(`   Total records created: ${totalCreated}`);
    console.log(`   Total records skipped: ${totalSkipped}`);

  } catch (error) {
    console.error('❌ Error during data seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { main as seedStaging };