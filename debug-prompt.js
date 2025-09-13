const { PrismaClient } = require('@prisma/client');

async function checkPromptData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking readingAgent prompt data...');
    
    // Check prompt template
    const template = await prisma.promptTemplate.findUnique({
      where: { name: 'readingAgent' },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 5
        }
      }
    });
    
    if (!template) {
      console.log('❌ No readingAgent template found');
      return;
    }
    
    console.log('📋 Template Info:');
    console.log(`- ID: ${template.id}`);
    console.log(`- Name: ${template.name}`);
    console.log(`- Current Version: ${template.version}`);
    console.log(`- Active: ${template.isActive}`);
    console.log(`- Created: ${template.createdAt}`);
    console.log(`- Updated: ${template.updatedAt}`);
    
    console.log('\n📋 Version History:');
    template.versions.forEach(v => {
      console.log(`- Version ${v.version}: ${v.isActive ? 'ACTIVE' : 'inactive'} (${v.createdAt})`);
      if (v.description) console.log(`  Description: ${v.description}`);
    });
    
    // Check for potential duplicate versions
    const duplicates = await prisma.promptVersion.groupBy({
      by: ['templateId', 'version'],
      where: { templateId: template.id },
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } }
    });
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  Duplicate versions found:');
      duplicates.forEach(d => {
        console.log(`- Template ${d.templateId}, Version ${d.version}: ${d._count.id} records`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPromptData();