import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Specific user to seed
const USER_ID = 'user_2zrwAmp6h6JNftrdRnINXWafr6M';

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

async function seedSpecificUser() {
  console.log(`🌱 Seeding data for user: ${USER_ID}`);
  
  // Level and experience for this user (Level 8, experienced user)
  const level = 8;
  const baseExp = level * 100 + Math.floor(Math.random() * 80);
  const totalReadings = Math.floor(Math.random() * 25) + 15; // 15-40 readings
  
  // 1. Update user with realistic stats
  const existingUser = await prisma.user.findUnique({
    where: { id: USER_ID }
  });

  if (!existingUser) {
    console.log(`👤 Creating new user: ${USER_ID}`);
    await prisma.user.create({
      data: {
        id: USER_ID,
        stars: Math.floor(Math.random() * 30) + 15, // 15-45 stars
        coins: Math.floor(Math.random() * 150) + 75, // 75-225 coins
        exp: baseExp,
        level: level,
        freePoint: Math.floor(Math.random() * 3) + 2, // 2-5 free points
        role: 'USER',
        createdAt: getRandomDate(new Date('2024-01-01'), new Date('2024-11-01')),
        updatedAt: new Date(),
      },
    });
  } else {
    console.log(`🔄 Updating existing user: ${USER_ID}`);
    await prisma.user.update({
      where: { id: USER_ID },
      data: {
        stars: Math.floor(Math.random() * 30) + 15,
        coins: Math.floor(Math.random() * 150) + 75,
        exp: baseExp,
        level: level,
        freePoint: Math.floor(Math.random() * 3) + 2,
        updatedAt: new Date(),
      },
    });
  }

  // 2. Create reading history (15-40 readings)
  console.log(`📚 Creating ${totalReadings} readings...`);
  const readings = [];
  for (let i = 0; i < totalReadings; i++) {
    const readingId = `reading_${USER_ID}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = getRandomDate(new Date('2024-01-01'), new Date());
    const question = getRandomItem(THAI_QUESTIONS);
    const answer = getRandomItem(THAI_READINGS);
    const cardIds = await generateCardIds(Math.floor(Math.random() * 3) + 3); // 3-5 cards
    
    readings.push({
      id: readingId,
      userId: USER_ID,
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
  console.log(`💰 Creating transactions...`);
  const transactions = [
    // Reading rewards
    ...readings.map((reading, i) => ({
      id: `trans_reading_${USER_ID}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: USER_ID,
      eventType: 'reading_completed',
      deltaExp: 25,
      deltaCoins: 5,
      deltaPoint: 0,
      metadata: JSON.stringify({ readingId: reading.id }),
      createdAt: reading.createdAt
    })),
    
    // Daily login rewards (last 10 days)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `trans_daily_${USER_ID}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: USER_ID,
      eventType: 'daily_login',
      deltaExp: Math.floor(Math.random() * 10) + 10,
      deltaCoins: Math.floor(Math.random() * 5) + 5,
      deltaPoint: 0,
      metadata: JSON.stringify({ day: i + 1, streak: i + 1 }),
      createdAt: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000)
    })),
    
    // Payment transaction
    {
      id: `trans_payment_${USER_ID}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: USER_ID,
      eventType: 'stripe_topup',
      deltaExp: 0,
      deltaCoins: 0,
      deltaPoint: 30,
      metadata: JSON.stringify({ 
        packId: 3, 
        amount: 39900, 
        stripePaymentId: `pi_test_${Date.now()}` 
      }),
      createdAt: getRandomDate(new Date('2024-10-01'), new Date())
    },

    // Level up rewards
    ...Array.from({ length: level - 1 }, (_, i) => ({
      id: `trans_levelup_${USER_ID}_${i + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: USER_ID,
      eventType: 'level_up',
      deltaExp: (i + 2) * 10,
      deltaCoins: (i + 2) * 5,
      deltaPoint: 0,
      metadata: JSON.stringify({ newLevel: i + 2 }),
      createdAt: getRandomDate(new Date('2024-01-01'), new Date())
    })),

    // Coin exchange
    {
      id: `trans_exchange_${USER_ID}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: USER_ID,
      eventType: 'coin_exchange',
      deltaExp: 0,
      deltaCoins: -50,
      deltaPoint: 5,
      metadata: JSON.stringify({ exchangeRate: 10, coinAmount: 50, receivedStars: 5 }),
      createdAt: getRandomDate(new Date('2024-11-01'), new Date())
    }
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

  // REMOVED: Daily login campaign feature - no longer in use
  // This was creating DailyLoginCampaign records that are not used by any API endpoints
  console.log(`📅 Skipping daily login campaign (feature removed)...`);

  // 5. Create referral code
  console.log(`🔗 Creating referral code...`);
  const refCode = `REF${USER_ID.slice(-6).toUpperCase()}`;
  const existingRef = await prisma.referralCode.findFirst({
    where: { userId: USER_ID }
  });
  
  if (!existingRef) {
    await prisma.referralCode.create({
      data: {
        userId: USER_ID,
        code: refCode,
        isUsed: false,
      }
    });
  }

  // 6. Create coin exchange record
  console.log(`🪙 Creating coin exchange...`);
  const existingExchange = await prisma.coinExchange.findFirst({
    where: { userId: USER_ID }
  });

  if (!existingExchange) {
    await prisma.coinExchange.create({
      data: {
        userId: USER_ID,
        exchangeType: 'coins_to_stars',
        coinAmount: 50,
        receivedItem: 'stars',
        receivedAmount: 5,
        metadata: JSON.stringify({ exchangeRate: 10 }),
        status: 'completed'
      }
    });
  }

  console.log(`✅ Completed seeding for user: ${USER_ID}`);
  console.log(`📊 Summary:`);
  console.log(`- Readings: ${totalReadings}`);
  console.log(`- Transactions: ${transactions.length}`);
  console.log(`- Level: ${level}`);
  console.log(`- Daily login campaign: removed (feature not in use)`);
  console.log(`- Referral code: ${refCode}`);
}

async function main() {
  console.log('🚀 Starting specific user seed process...');

  try {
    await seedSpecificUser();
    console.log('🎉 Specific user seed completed successfully!');
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