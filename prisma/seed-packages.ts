import { PrismaClient } from '@prisma/client'
import { seedWithSafetyChecks } from '../src/lib/database-seed'

const defaultPackages = [
  {
    id: 1,
    title: "แพ็คเริ่มต้น",
    subtitle: "เหมาะสำหรับผู้เริ่มต้นสำรวจโลกแห่งการทำนาย",
    price: 99, // ฿99
    creditAmount: 8, // 99/8 = 12.38 บาทต่อคำถาม
    ctaText: "เริ่มต้นเลย",
    popular: false,
    sortOrder: 1,
    metadata: {
      features: [
        "8 คำถามทำนายแม่นยำ",
        "การตีความไพ่พื้นฐาน", 
        "บันทึกประวัติการทำนาย",
        "คำแนะนำจากการทำนาย"
      ],
      description: "เหมาะสำหรับผู้ที่อยากลองสัมผัสประสบการณ์การทำนายไพ่ทาโรต์เป็นครั้งแรก",
      bestFor: "ผู้เริ่มต้น",
      valuePerReading: "12.38 บาทต่อคำถาม"
    }
  },
  {
    id: 2,
    title: "แพ็คคุ้มค่า", 
    subtitle: "ตัวเลือกที่ดีที่สุดสำหรับการทำนายสม่ำเสมอ",
    price: 199, // ฿199
    creditAmount: 22, // 199/22 = 9.05 บาทต่อคำถาม (คุ้มค่าที่สุด!)
    ctaText: "เลือกแพ็คนี้",
    popular: true,
    sortOrder: 2,
    metadata: {
      features: [
        "22 คำถามทำนายแม่นยำ",
        "การตีความไพ่ขั้นสูง",
        "บันทึกประวัติการทำนาย", 
        "คำแนะนำเชิงลึกจากการทำนาย",
        "การสนับสนุนแบบพิเศษ",
        "รูปแบบการทำนายหลากหลาย"
      ],
      description: "แพ็คที่คุ้มค่าที่สุด! เหมาะสำหรับผู้ที่ต้องการคำแนะนำจากการทำนายอย่างสม่ำเสมอ",
      bestFor: "ผู้ใช้ทั่วไป",
      valuePerReading: "9.05 บาทต่อคำถาม",
      savings: "ประหยัดกว่าแพ็คอื่น 25%"
    }
  },
  {
    id: 3,
    title: "แพ็คพรีเมียม",
    subtitle: "สำหรับผู้แสวงหาจิตวิญญาณระดับสูง",
    price: 399, // ฿399  
    creditAmount: 35, // 399/35 = 11.4 บาทต่อคำถาม
    ctaText: "อัปเกรดเลย",
    popular: false,
    sortOrder: 3,
    metadata: {
      features: [
        "35 คำถามทำนายแม่นยำ",
        "การตีความไพ่ระดับเซียน", 
        "บันทึกประวัติการทำนายไม่จำกัด",
        "คำแนะนำเชิงลึกพิเศษ",
        "การสนับสนุนแบบ VIP",
        "รูปแบบการทำนายพิเศษเฉพาะ",
        "การวิเคราะห์แนวโน้มอนาคต",
        "คำปรึกษาเชิงจิตวิญญาณ"
      ],
      description: "สำหรับผู้แสวงหาความจริงในระดับลึก พร้อมการบริการระดับพรีเมียม",
      bestFor: "ผู้เชี่ยวชาญ",
      valuePerReading: "11.40 บาทต่อคำถาม",
      extras: "บริการพิเศษและการตีความระดับเซียน"
    }
  }
]

async function main(prisma: PrismaClient) {
  console.log('🌱 Start seeding packages...')
  
  // อัพเดต packages ด้วย upsert
  for (const pack of defaultPackages) {
    await prisma.pack.upsert({
      where: { id: pack.id },
      update: pack,
      create: pack,
    })
    const priceInBaht = pack.price
    const pricePerQuestion = priceInBaht / pack.creditAmount
    console.log(`✓ "${pack.title}": ${priceInBaht}฿ | ${pack.creditAmount} คำถาม | ${pricePerQuestion.toFixed(2)}฿/คำถาม ${pack.popular ? '⭐ POPULAR' : ''}`)
  }
  
  console.log('\n📊 Package Comparison:')
  console.log('แพ็คเริ่มต้น: 12.38฿/คำถาม')
  console.log('แพ็คคุ้มค่า: 9.05฿/คำถาม ⭐ (คุ้มค่าที่สุด!)')
  console.log('แพ็คพรีเมียม: 11.40฿/คำถาม')
  console.log('\n✅ Seeding finished successfully!')
}

// Run with safety checks
seedWithSafetyChecks(async (prisma) => {
  await main(prisma);
}, 'Package Seed Script')
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });