// Card data backup utility for Round 7A hard reset
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function backupCards() {
  try {
    console.log('🔄 Starting Card data backup...')
    
    // Fetch all card data
    const cards = await prisma.card.findMany({
      orderBy: { id: 'asc' }
    })
    
    console.log(`📊 Found ${cards.length} cards to backup`)
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'scripts', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    // Save cards as JSON with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = path.join(backupDir, `cards-backup-${timestamp}.json`)
    
    fs.writeFileSync(backupFile, JSON.stringify(cards, null, 2))
    
    console.log(`✅ Card data backed up to: ${backupFile}`)
    console.log(`📦 Total cards backed up: ${cards.length}`)
    
    // Also create a SQL script for easy restoration
    const sqlFile = path.join(backupDir, `cards-restore-${timestamp}.sql`)
    let sqlContent = `-- Card data restoration script for Round 7A
-- Generated on: ${new Date().toISOString()}
-- Total cards: ${cards.length}

DELETE FROM "Card" WHERE id > 0;

INSERT INTO "Card" (id, name, "displayName", arcana, "shortMeaning", "longMeaning", "longMeaningRaw", keywords, "imageUrl") VALUES\n`
    
    const cardValues = cards.map(card => 
      `(${card.id}, ${JSON.stringify(card.name)}, ${JSON.stringify(card.displayName)}, ${JSON.stringify(card.arcana)}, ${JSON.stringify(card.shortMeaning)}, ${JSON.stringify(card.longMeaning)}, ${JSON.stringify(card.longMeaningRaw)}, ${JSON.stringify(card.keywords)}, ${JSON.stringify(card.imageUrl)})`
    ).join(',\n')
    
    sqlContent += cardValues + ';\n\n'
    sqlContent += `-- Reset sequence to continue from the last ID\n`
    sqlContent += `SELECT setval('"Card_id_seq"', ${Math.max(...cards.map(c => c.id))}, true);\n`
    
    fs.writeFileSync(sqlFile, sqlContent)
    
    console.log(`✅ SQL restoration script created: ${sqlFile}`)
    
    return {
      jsonBackup: backupFile,
      sqlRestore: sqlFile,
      cardCount: cards.length
    }
    
  } catch (error) {
    console.error('❌ Card backup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function restoreCards(backupFile: string) {
  try {
    console.log('🔄 Starting Card data restoration...')
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`)
    }
    
    const cardsData = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
    
    console.log(`📊 Found ${cardsData.length} cards to restore`)
    
    // Clear existing cards
    await prisma.card.deleteMany({})
    
    // Restore cards
    await prisma.card.createMany({
      data: cardsData
    })
    
    console.log(`✅ Restored ${cardsData.length} cards successfully`)
    
  } catch (error) {
    console.error('❌ Card restoration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// CLI interface
const command = process.argv[2]
const backupFile = process.argv[3]

if (command === 'backup') {
  backupCards()
    .then((result) => {
      console.log('🎉 Backup completed successfully')
      console.log('📁 Files created:')
      console.log(`   JSON: ${result.jsonBackup}`)
      console.log(`   SQL:  ${result.sqlRestore}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Backup failed:', error.message)
      process.exit(1)
    })
} else if (command === 'restore' && backupFile) {
  restoreCards(backupFile)
    .then(() => {
      console.log('🎉 Restoration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Restoration failed:', error.message)
      process.exit(1)
    })
} else {
  console.log('Usage:')
  console.log('  npm run backup-cards backup')
  console.log('  npm run backup-cards restore <backup-file.json>')
  process.exit(1)
}