const { PrismaClient } = require('@prisma/client');

async function fixSequence() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Fixing PromptVersion sequence...');
    
    // Get the current max ID
    const maxIdResult = await prisma.promptVersion.aggregate({
      _max: { id: true }
    });
    
    const maxId = maxIdResult._max.id || 0;
    console.log('📊 Current max ID:', maxId);
    
    // Reset the sequence to the correct value
    const nextId = maxId + 1;
    await prisma.$executeRaw`SELECT setval('prompt_versions_id_seq', ${nextId}, false);`;
    
    console.log(`✅ Sequence reset to ${nextId}`);
    
    // Verify the fix
    const sequenceResult = await prisma.$queryRaw`
      SELECT last_value, is_called FROM prompt_versions_id_seq;
    `;
    console.log('🔢 New sequence info:', sequenceResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSequence();