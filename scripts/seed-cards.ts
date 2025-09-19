#!/usr/bin/env tsx
/*
  scripts/seed-cards.ts
  Seeds Card table using local-docs/card-backup.json.
  Dev-only utility, safe-guarded by scripts/protect-prod.ts
*/
import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CardJson {
  id?: string
  name: string
  displayName: string
  arcana: string
  keywords: string[] | string
  shortMeaning: string
  longMeaning: string
  longMeaningRaw?: string
  imageUrl: string
}

async function main() {
  // Guard against prod DB misuse
  try {
    const guard = await import('./protect-prod')
    void guard
  } catch {}

  const url = process.env.DATABASE_URL || ''
  if (!/localhost|127\.0\.0\.1/.test(url)) {
    console.error('Guard: DATABASE_URL must be localhost for dev seeding. Aborting.')
    process.exit(5)
  }

  const filePath = path.resolve(process.cwd(), 'local-docs/card-backup.json')
  if (!fs.existsSync(filePath)) {
    console.error('Card backup JSON not found at', filePath)
    process.exit(1)
  }
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data: CardJson[] = JSON.parse(raw)

  let count = 0
  for (const c of data) {
    const keywordsStr = Array.isArray(c.keywords)
      ? JSON.stringify(c.keywords)
      : String(c.keywords ?? '')

    await prisma.card.upsert({
      where: { name: c.name },
      update: {
        displayName: c.displayName,
        arcana: c.arcana,
        shortMeaning: c.shortMeaning,
        longMeaning: c.longMeaning,
        longMeaningRaw: c.longMeaningRaw ?? c.longMeaning,
        keywords: keywordsStr,
        imageUrl: c.imageUrl,
      },
      create: {
        name: c.name,
        displayName: c.displayName,
        arcana: c.arcana,
        shortMeaning: c.shortMeaning,
        longMeaning: c.longMeaning,
        longMeaningRaw: c.longMeaningRaw ?? c.longMeaning,
        keywords: keywordsStr,
        imageUrl: c.imageUrl,
      },
    })
    count++
  }

  const total = await prisma.card.count()
  console.log(`Ensured ${count} cards. Total in DB: ${total}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
