const { PrismaClient } = require('@prisma/client');

async function checkVersionConflict() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking for version conflicts...');
    
    // Get readingAgent template
    const template = await prisma.promptTemplate.findUnique({
      where: { name: 'readingAgent' },
      include: {
        versions: {
          orderBy: { version: 'desc' }
        }
      }
    });
    
    if (!template) {
      console.log('❌ No readingAgent template found');
      return;
    }
    
    console.log(`📋 Template current version: ${template.version}`);
    console.log(`📋 All versions in database:`);
    
    template.versions.forEach(v => {
      console.log(`- Version ${v.version}: ID=${v.id}, Active=${v.isActive}, Created=${v.createdAt}`);
    });
    
    // Calculate what the next version should be
    const maxVersion = template.versions.length > 0 ? Math.max(...template.versions.map(v => v.version)) : 0;
    const nextVersion = maxVersion + 1;
    
    console.log(`\n🔍 Analysis:`);
    console.log(`- Max version in versions table: ${maxVersion}`);
    console.log(`- Template.version field: ${template.version}`);
    console.log(`- Next version should be: ${nextVersion}`);
    
    // Check if there's a mismatch
    if (template.version !== maxVersion) {
      console.log(`\n⚠️  MISMATCH DETECTED!`);
      console.log(`Template.version (${template.version}) != max version in versions table (${maxVersion})`);
    }
    
    // Check for duplicate versions
    const duplicates = await prisma.promptVersion.groupBy({
      by: ['templateId', 'version'],
      where: { templateId: template.id },
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } }
    });
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE VERSIONS FOUND:');
      for (const dup of duplicates) {
        console.log(`- Version ${dup.version}: ${dup._count.id} records`);
        
        // Get details of duplicates
        const dupRecords = await prisma.promptVersion.findMany({
          where: {
            templateId: template.id,
            version: dup.version
          },
          orderBy: { createdAt: 'asc' }
        });
        
        dupRecords.forEach((record, index) => {
          console.log(`  ${index + 1}. ID=${record.id}, Created=${record.createdAt}, Active=${record.isActive}`);
        });
      }
    }
    
    // Simulate what updatePrompt would try to do
    console.log(`\n🧪 Simulation: updatePrompt would try to create version ${nextVersion}`);
    
    // Check if that version already exists
    const existingVersion = await prisma.promptVersion.findFirst({
      where: {
        templateId: template.id,
        version: nextVersion
      }
    });
    
    if (existingVersion) {
      console.log(`❌ Version ${nextVersion} already exists! This would cause the unique constraint error.`);
      console.log(`   Existing record: ID=${existingVersion.id}, Created=${existingVersion.createdAt}`);
    } else {
      console.log(`✅ Version ${nextVersion} does not exist yet. Should be safe to create.`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVersionConflict();