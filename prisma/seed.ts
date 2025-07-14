import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// User IDs to seed
const USER_IDS = [
  '8b2e0109-fa25-4cdf-b052-bea475cfdfb6',
  'user_2zVXXDNKQC5H2fpLxwLVLjjaC6t'
];

// Thai question templates for realistic data
const THAI_QUESTIONS = [
  'ความรักของฉันในปีนี้จะเป็นอย่างไร',
  'งานใหม่ที่กำลังสมัครจะผ่านไหม',
  'ฉันควรลงทุนหุ้นตัวไหนดี',
  'ความสัมพันธ์กับครอบครัวจะดีขึ้นไหม',
  'สุขภาพของฉันในเดือนนี้เป็นอย่างไร',
  'ฉันควรย้ายบ้านไหม',
  'การเงินของฉันในปีนี้จะเป็นอย่างไร',
  'ฉันควรเปลี่ยนงานไหม',
  'คนที่ฉันชอบเขารู้สึกอย่างไรกับฉัน',
  'ธุรกิจที่ฉันคิดจะทำมีโอกาสสำเร็จไหม',
  'ฉันควรกลับไปเรียนต่อไหม',
  'ปัญหาที่ฉันกำลังเจอจะหายไปเมื่อไหร่',
  'ฉันควรให้อภัยคนที่ทำร้ายฉันไหม',
  'การตัดสินใจที่สำคัญที่ฉันกำลังคิดอยู่ควรทำไหม',
  'ฉันจะพบรักแท้เมื่อไหร่'
];

// Thai reading responses for realistic data
const THAI_READINGS = [
  'ไพ่ที่ออกมาบอกว่าคุณกำลังเข้าสู่ช่วงเวลาที่ดี ความรักจะเข้ามาในชีวิตอย่างไม่คาดคิด แต่ควรใจเย็นและรอคอยในสิ่งที่ดีกว่า',
  'การงานของคุณกำลังจะมีการเปลี่ยนแปลงใหญ่ ไพ่แนะนำให้คุณเตรียมตัวให้ดีและมั่นใจในตัวเอง โอกาสใหม่กำลังจะมาถึง',
  'ด้านการเงิน ไพ่บอกว่าควรระวังการใช้จ่ายในช่วงนี้ แต่ถ้าวางแผนดีๆ จะมีเงินเข้ามาจากแหล่งที่ไม่คาดคิด',
  'ครอบครัวของคุณมีพลังงานบวกล้อมรอบ ควรใช้เวลาร่วมกันมากขึ้น ความเข้าใจกันจะดีขึ้นอย่างเห็นได้ชัด',
  'สุขภาพโดยรวมดี แต่ควรดูแลจิตใจให้มากขึ้น การพักผ่อนและการออกกำลังกายจะช่วยให้คุณมีพลังงานที่ดีขึ้น',
  'การย้ายบ้านในช่วงนี้จะนำมาซึ่งโอกาสใหม่ๆ ไพ่แนะนำให้คิดดีๆ แต่ถ้าตัดสินใจแล้วให้ก้าวไปข้างหน้าอย่างมั่นใจ',
  'ธุรกิจที่คุณคิดจะทำมีโอกาสสำเร็จสูง แต่ต้องมีการวางแผนที่ดีและหาพันธมิตรที่เชื่อถือได้มาช่วย',
  'การเรียนต่อจะเปิดโลกใหม่ให้กับคุณ ไพ่บอกว่านี่คือเวลาที่เหมาะสมสำหรับการพัฒนาตัวเอง'
];

// Mood analysis options
const MOODS = ['optimistic', 'contemplative', 'excited', 'peaceful', 'determined', 'hopeful', 'curious', 'reflective'];
const TOPICS = ['love', 'career', 'finance', 'family', 'health', 'personal', 'spiritual', 'education'];
const TIMEFRAMES = ['immediate', 'short-term', 'medium-term', 'long-term'];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Get available card IDs from database
let availableCardIds: number[] = [];

async function getAvailableCardIds() {
  if (availableCardIds.length === 0) {
    const cards = await prisma.card.findMany({ select: { id: true } });
    availableCardIds = cards.map(c => c.id);
  }
  return availableCardIds;
}

async function generateCardIds(count: number = 3): Promise<number[]> {
  const allCardIds = await getAvailableCardIds();
  const cardIds = [];
  const usedIds = new Set();
  
  while (cardIds.length < count && cardIds.length < allCardIds.length) {
    const randomIndex = Math.floor(Math.random() * allCardIds.length);
    const id = allCardIds[randomIndex];
    if (!usedIds.has(id)) {
      cardIds.push(id);
      usedIds.add(id);
    }
  }
  
  return cardIds;
}

async function seedUserData(userId: string, index: number) {
  console.log(`🌱 Seeding data for user: ${userId}`);
  
  // Different levels for variety
  const baseLevel = index === 0 ? 5 : 12;
  const baseExp = baseLevel * 100 + Math.floor(Math.random() * 80);
  const totalReadings = Math.floor(Math.random() * 20) + 10;
  
  // 1. Update user with realistic stats
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      stars: Math.floor(Math.random() * 50) + 20,
      coins: Math.floor(Math.random() * 100) + 50,
      exp: baseExp,
      level: baseLevel,
      freePoint: Math.floor(Math.random() * 5) + 2,
      updatedAt: new Date(),
    },
    create: {
      id: userId,
      stars: Math.floor(Math.random() * 50) + 20,
      coins: Math.floor(Math.random() * 100) + 50,
      exp: baseExp,
      level: baseLevel,
      freePoint: Math.floor(Math.random() * 5) + 2,
      createdAt: getRandomDate(new Date('2024-01-01'), new Date('2024-12-01')),
      updatedAt: new Date(),
    },
  });

  // 2. Create reading history (10-30 readings)
  const readings = [];
  for (let i = 0; i < totalReadings; i++) {
    const readingId = `reading_${userId}_${i}_${Date.now()}`;
    const createdAt = getRandomDate(new Date('2024-01-01'), new Date());
    const question = getRandomItem(THAI_QUESTIONS);
    const answer = getRandomItem(THAI_READINGS);
    const cardIds = await generateCardIds(Math.floor(Math.random() * 3) + 3); // 3-5 cards
    
    readings.push({
      id: readingId,
      userId,
      question,
      answer: JSON.stringify({
        analysis: {
          mood: getRandomItem(MOODS),
          topic: getRandomItem(TOPICS),
          timeframe: getRandomItem(TIMEFRAMES)
        },
        reading: answer,
        cards: cardIds,
        expEarned: 25,
        coinsEarned: 5
      }),
      type: 'tarot',
      createdAt,
      cardIds
    });
  }

  // Insert readings
  for (const reading of readings) {
    const existingReading = await prisma.reading.findUnique({
      where: { id: reading.id }
    });
    
    if (!existingReading) {
      await prisma.reading.create({
        data: {
          id: reading.id,
          userId: reading.userId,
          question: reading.question,
          answer: reading.answer,
          type: reading.type,
          createdAt: reading.createdAt,
        }
      });

      // Insert reading cards
      for (let j = 0; j < reading.cardIds.length; j++) {
        await prisma.readingCard.create({
          data: {
            readingId: reading.id,
            cardId: reading.cardIds[j],
            position: j
          }
        });
      }
    }
  }

  // 3. Create point transactions
  const transactions = [
    // Reading rewards
    ...readings.map((reading, i) => ({
      id: `trans_reading_${userId}_${i}`,
      userId,
      eventType: 'reading_completed',
      deltaExp: 25,
      deltaCoins: 5,
      deltaPoint: 0,
      metadata: JSON.stringify({ readingId: reading.id }),
      createdAt: reading.createdAt
    })),
    
    // Daily login rewards (last 7 days)
    ...Array.from({ length: 7 }, (_, i) => ({
      id: `trans_daily_${userId}_${i}`,
      userId,
      eventType: 'daily_login',
      deltaExp: Math.floor(Math.random() * 10) + 10,
      deltaCoins: Math.floor(Math.random() * 5) + 5,
      deltaPoint: 0,
      metadata: JSON.stringify({ day: i + 1, streak: i + 1 }),
      createdAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
    })),
    
    // Some payment transactions
    ...(index === 0 ? [{
      id: `trans_payment_${userId}`,
      userId,
      eventType: 'stripe_topup',
      deltaExp: 0,
      deltaCoins: 0,
      deltaPoint: 50,
      metadata: JSON.stringify({ 
        packId: 2, 
        amount: 19900, 
        stripePaymentId: `pi_test_${Date.now()}` 
      }),
      createdAt: getRandomDate(new Date('2024-11-01'), new Date())
    }] : []),

    // Level up rewards
    ...Array.from({ length: baseLevel - 1 }, (_, i) => ({
      id: `trans_levelup_${userId}_${i + 1}`,
      userId,
      eventType: 'level_up',
      deltaExp: (i + 2) * 10, // Bonus EXP for leveling up
      deltaCoins: (i + 2) * 5, // Bonus coins for leveling up
      deltaPoint: 0,
      metadata: JSON.stringify({ newLevel: i + 2 }),
      createdAt: getRandomDate(new Date('2024-01-01'), new Date())
    }))
  ];

  // Insert transactions
  for (const transaction of transactions) {
    const existing = await prisma.pointTransaction.findUnique({
      where: { id: transaction.id }
    });
    
    if (!existing) {
      await prisma.pointTransaction.create({
        data: transaction
      });
    }
  }

  // 4. Create daily login campaign for current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const claimedDays = Array.from({ length: Math.min(now.getDate(), 15) }, (_, i) => i + 1);

  await prisma.dailyLoginCampaign.upsert({
    where: {
      userId_year_month: {
        userId,
        year: currentYear,
        month: currentMonth
      }
    },
    update: {
      claimedDays: JSON.stringify(claimedDays),
      streak: claimedDays.length,
      lastClaim: new Date(),
    },
    create: {
      userId,
      year: currentYear,
      month: currentMonth,
      claimedDays: JSON.stringify(claimedDays),
      streak: claimedDays.length,
      lastClaim: new Date(),
    }
  });

  // 5. Create referral code
  const refCode = `REF${userId.slice(-6).toUpperCase()}`;
  const existingRef = await prisma.referralCode.findFirst({
    where: { userId: userId }
  });
  
  if (!existingRef) {
    await prisma.referralCode.create({
      data: {
        userId,
        code: refCode,
        isUsed: false,
      }
    });
  }

  // 6. Create some coin exchanges
  if (index === 1) {
    await prisma.coinExchange.create({
      data: {
        userId,
        exchangeType: 'coins_to_stars',
        coinAmount: 50,
        receivedItem: 'stars',
        receivedAmount: 5,
        metadata: JSON.stringify({ exchangeRate: 10 }),
        status: 'completed'
      }
    });
  }

  console.log(`✅ Completed seeding for user: ${userId}`);
}

async function seedPaymentPackages() {
  console.log('🛍️ Seeding payment packages...');
  
  const packages = [
    {
      title: 'Starter Pack',
      subtitle: 'เริ่มต้นการเดินทางทางจิตวิญญาณ',
      price: 9900, // ฿99
      creditAmount: 20,
      ctaText: 'เริ่มต้นเลย',
      popular: false,
      sortOrder: 1
    },
    {
      title: 'Popular Pack',
      subtitle: 'ยอดนิยม - คุณค่าคุ้มที่สุด',
      price: 19900, // ฿199
      creditAmount: 50,
      ctaText: 'ซื้อเลย',
      popular: true,
      sortOrder: 2
    },
    {
      title: 'Premium Pack',
      subtitle: 'สำหรับผู้ที่ต้องการคำตอบมากมาย',
      price: 39900, // ฿399
      creditAmount: 120,
      ctaText: 'อัพเกรด',
      popular: false,
      sortOrder: 3
    },
    {
      title: 'Super Pack',
      subtitle: 'ประสบการณ์พรีเมียมสุดขีด',
      price: 59900, // ฿599
      creditAmount: 200,
      ctaText: 'ปลดล็อค',
      popular: false,
      sortOrder: 4
    }
  ];

  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const existing = await prisma.pack.findFirst({
      where: { title: pkg.title }
    });
    
    if (existing) {
      await prisma.pack.update({
        where: { id: existing.id },
        data: pkg
      });
    } else {
      await prisma.pack.create({
        data: pkg
      });
    }
  }

  console.log('✅ Payment packages seeded');
}

async function seedExchangeSettings() {
  console.log('💱 Seeding exchange settings...');
  
  await prisma.exchangeSetting.upsert({
    where: { id: 1 },
    update: {
      exchangeType: 'coins_to_stars',
      receivedItem: 'stars',
      coinPerUnit: 10,
      isActive: true,
      metadata: JSON.stringify({
        dailyLimit: 100,
        minExchange: 10,
        description: 'แลกเหรียญเป็นดาว'
      })
    },
    create: {
      exchangeType: 'coins_to_stars',
      receivedItem: 'stars',
      coinPerUnit: 10,
      isActive: true,
      metadata: JSON.stringify({
        dailyLimit: 100,
        minExchange: 10,
        description: 'แลกเหรียญเป็นดาว'
      })
    }
  });

  console.log('✅ Exchange settings seeded');
}

async function main() {
  console.log('🚀 Starting seed process...');

  try {
    // Seed payment packages and exchange settings first
    await seedPaymentPackages();
    await seedExchangeSettings();

    // Seed data for each user
    for (let i = 0; i < USER_IDS.length; i++) {
      await seedUserData(USER_IDS[i], i);
    }

    console.log('🎉 Seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`- Users seeded: ${USER_IDS.length}`);
    console.log('- Reading history: 10-30 readings per user');
    console.log('- Point transactions: Reading rewards, daily logins, level ups');
    console.log('- Daily login campaigns: Current month data');
    console.log('- Referral codes: Generated for each user');
    console.log('- Payment packages: 4 tiers');
    console.log('- Exchange settings: Coins to stars');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });