const { PrismaClient } = require('@prisma/client');

async function checkSequence() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking PromptVersion sequence and ID constraints...');
    
    // Get the highest ID in the table
    const maxIdResult = await prisma.promptVersion.aggregate({
      _max: { id: true }
    });
    
    console.log('📊 Current max ID:', maxIdResult._max.id);
    
    // Get all prompt versions to check for gaps
    const allVersions = await prisma.promptVersion.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, templateId: true, version: true }
    });
    
    console.log('📋 All PromptVersion records:');
    allVersions.forEach(v => {
      console.log(`  ID: ${v.id}, TemplateID: ${v.templateId}, Version: ${v.version}`);
    });
    
    // Check for ID gaps
    const ids = allVersions.map(v => v.id).sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < ids.length; i++) {
      if (ids[i] - ids[i-1] > 1) {
        gaps.push(`Gap between ${ids[i-1]} and ${ids[i]}`);
      }
    }
    
    if (gaps.length > 0) {
      console.log('⚠️  ID Gaps found:', gaps);
    } else {
      console.log('✅ No ID gaps found');
    }
    
    // Try to get the next sequence value (PostgreSQL specific)
    try {
      const sequenceResult = await prisma.$queryRaw`
        SELECT last_value, is_called FROM prompt_versions_id_seq;
      `;
      console.log('🔢 Sequence info:', sequenceResult);
    } catch (err) {
      console.log('⚠️  Could not get sequence info:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSequence();