import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultPackages = [
  {
    id: 1,
    title: "Starter Pack",
    subtitle: "เริ่มต้นดูดวง",
    price: 9900, // ฿99
    creditAmount: 20,
    ctaText: "ซื้อ 20 Stars",
    popular: false,
    sortOrder: 1
  },
  {
    id: 2,
    title: "Popular Pack", 
    subtitle: "คุ้มค่าที่สุด",
    price: 19900, // ฿199
    creditAmount: 50,
    ctaText: "ซื้อ 50 Stars",
    popular: true,
    sortOrder: 2
  },
  {
    id: 3,
    title: "Premium Pack",
    subtitle: "สำหรับผู้ใช้งานหนัก",
    price: 39900, // ฿399
    creditAmount: 120,
    ctaText: "ซื้อ 120 Stars",
    popular: false,
    sortOrder: 3
  },
  {
    id: 4,
    title: "Super Pack",
    subtitle: "ดูดวงไม่จำกัด",
    price: 59900, // ฿599
    creditAmount: 200,
    ctaText: "ซื้อ 200 Stars",
    popular: false,
    sortOrder: 4
  }
]

async function main() {
  console.log('Start seeding packages...')
  
  for (const pack of defaultPackages) {
    await prisma.pack.upsert({
      where: { id: pack.id },
      update: pack,
      create: pack,
    })
    console.log(`✓ Package "${pack.title}" created/updated`)
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })