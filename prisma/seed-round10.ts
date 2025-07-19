import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRound10Data() {
  console.log('🌱 Seeding Round 10 Gamification Data...')

  try {
    // Seed Exchange Settings
    console.log('📊 Seeding Exchange Settings...')
    
    const exchangeSettings = await prisma.exchangeSetting.upsert({
      where: { id: 1 },
      update: {
        exchangeType: 'COIN_TO_STAR',
        receivedItem: 'star',
        coinPerUnit: 10, // 10 coins = 1 star
        isActive: true,
        metadata: {
          description: 'แลกเปลี่ยนเหรียญเป็นดาวสำหรับทำนายไพ่',
          category: 'premium_credits'
        }
      },
      create: {
        exchangeType: 'COIN_TO_STAR',
        receivedItem: 'star',
        coinPerUnit: 10,
        isActive: true,
        metadata: {
          description: 'แลกเปลี่ยนเหรียญเป็นดาวสำหรับทำนายไพ่',
          category: 'premium_credits'
        }
      }
    })

    const exchangeSettings2 = await prisma.exchangeSetting.upsert({
      where: { id: 2 },
      update: {
        exchangeType: 'COIN_TO_CREDIT',
        receivedItem: 'freePoint',
        coinPerUnit: 15, // 15 coins = 1 free credit
        isActive: true,
        metadata: {
          description: 'แลกเปลี่ยนเหรียญเป็นเครดิตฟรีสำหรับทำนายไพ่',
          category: 'free_credits'
        }
      },
      create: {
        exchangeType: 'COIN_TO_CREDIT',
        receivedItem: 'freePoint',
        coinPerUnit: 15,
        isActive: true,
        metadata: {
          description: 'แลกเปลี่ยนเหรียญเป็นเครดิตฟรีสำหรับทำนายไพ่',
          category: 'free_credits'
        }
      }
    })

    console.log('✅ Exchange Settings seeded successfully')

    // Seed Campaign Templates
    console.log('📅 Seeding Campaign Templates...')
    
    const dailyLoginTemplate = await prisma.campaignTemplate.upsert({
      where: { id: 'daily_login_template' },
      update: {
        name: 'Daily Login Campaign',
        type: 'DAILY_LOGIN',
        isActive: true,
        rewards: [
          { day: 1, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 2, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 3, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 4, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 5, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 6, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 7, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' },
          { day: 14, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' },
          { day: 21, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' },
          { day: 28, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' }
        ],
        metadata: {
          baseExp: 10,
          baseCoins: 5,
          weeklyMultiplier: 2,
          monthEndMultiplier: 3
        }
      },
      create: {
        id: 'daily_login_template',
        name: 'Daily Login Campaign',
        type: 'DAILY_LOGIN',
        isActive: true,
        rewards: [
          { day: 1, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 2, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 3, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 4, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 5, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 6, exp: 10, coins: 5, description: 'เข้าสู่ระบบประจำวัน' },
          { day: 7, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' },
          { day: 14, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' },
          { day: 21, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' },
          { day: 28, exp: 20, coins: 10, description: 'สัปดาห์โบนัส!' }
        ],
        metadata: {
          baseExp: 10,
          baseCoins: 5,
          weeklyMultiplier: 2,
          monthEndMultiplier: 3
        }
      }
    })

    // Add additional flexible campaign templates
    const specialEventTemplate = await prisma.campaignTemplate.upsert({
      where: { id: 'special_event_template' },
      update: {
        name: 'Special Event Campaign',
        type: 'DAILY_LOGIN',
        isActive: false, // Not active by default
        rewards: [
          { day: 1, exp: 20, coins: 15, stars: 1, description: 'เริ่มต้นอีเวนต์พิเศษ!' },
          { day: 2, exp: 25, coins: 20, description: 'วันที่ 2 ของอีเวนต์' },
          { day: 3, exp: 30, coins: 25, stars: 1, description: 'โบนัสกลางอีเวนต์' },
          { day: 4, exp: 35, coins: 30, description: 'เกือบจะจบอีเวนต์แล้ว' },
          { day: 5, exp: 50, coins: 50, stars: 3, description: 'จบอีเวนต์พิเศษ! 🎉' }
        ],
        metadata: {
          baseExp: 20,
          baseCoins: 15,
          eventType: 'special',
          duration: 5,
          description: 'อีเวนต์พิเศษระยะสั้น 5 วัน'
        }
      },
      create: {
        id: 'special_event_template',
        name: 'Special Event Campaign',
        type: 'DAILY_LOGIN',
        isActive: false,
        rewards: [
          { day: 1, exp: 20, coins: 15, stars: 1, description: 'เริ่มต้นอีเวนต์พิเศษ!' },
          { day: 2, exp: 25, coins: 20, description: 'วันที่ 2 ของอีเวนต์' },
          { day: 3, exp: 30, coins: 25, stars: 1, description: 'โบนัสกลางอีเวนต์' },
          { day: 4, exp: 35, coins: 30, description: 'เกือบจะจบอีเวนต์แล้ว' },
          { day: 5, exp: 50, coins: 50, stars: 3, description: 'จบอีเวนต์พิเศษ! 🎉' }
        ],
        metadata: {
          baseExp: 20,
          baseCoins: 15,
          eventType: 'special',
          duration: 5,
          description: 'อีเวนต์พิเศษระยะสั้น 5 วัน'
        }
      }
    })

    const premiumTemplate = await prisma.campaignTemplate.upsert({
      where: { id: 'premium_rewards_template' },
      update: {
        name: 'Premium Rewards Campaign',
        type: 'DAILY_LOGIN',
        isActive: false,
        rewards: [
          { day: 1, exp: 15, coins: 10, description: 'เข้าสู่ระบบ Premium' },
          { day: 3, exp: 20, coins: 15, stars: 1, description: 'โบนัส 3 วัน' },
          { day: 5, exp: 25, coins: 20, stars: 1, description: 'โบนัส 5 วัน' },
          { day: 7, exp: 35, coins: 30, stars: 2, description: 'โบนัสสัปดาห์ Premium' },
          { day: 14, exp: 50, coins: 50, stars: 3, description: 'โบนัส 2 สัปดาห์ Premium' },
          { day: 21, exp: 75, coins: 75, stars: 4, description: 'โบนัส 3 สัปดาห์ Premium' },
          { day: 30, exp: 100, coins: 100, stars: 5, description: 'โบนัสเดือน Premium' }
        ],
        metadata: {
          baseExp: 15,
          baseCoins: 10,
          premiumMultiplier: 1.5,
          starBonusDays: [3, 5, 7, 14, 21, 30],
          description: 'แคมเปญรางวัลพิเศษสำหรับผู้ใช้งานขั้นสูง'
        }
      },
      create: {
        id: 'premium_rewards_template',
        name: 'Premium Rewards Campaign',
        type: 'DAILY_LOGIN',
        isActive: false,
        rewards: [
          { day: 1, exp: 15, coins: 10, description: 'เข้าสู่ระบบ Premium' },
          { day: 3, exp: 20, coins: 15, stars: 1, description: 'โบนัส 3 วัน' },
          { day: 5, exp: 25, coins: 20, stars: 1, description: 'โบนัส 5 วัน' },
          { day: 7, exp: 35, coins: 30, stars: 2, description: 'โบนัสสัปดาห์ Premium' },
          { day: 14, exp: 50, coins: 50, stars: 3, description: 'โบนัส 2 สัปดาห์ Premium' },
          { day: 21, exp: 75, coins: 75, stars: 4, description: 'โบนัส 3 สัปดาห์ Premium' },
          { day: 30, exp: 100, coins: 100, stars: 5, description: 'โบนัสเดือน Premium' }
        ],
        metadata: {
          baseExp: 15,
          baseCoins: 10,
          premiumMultiplier: 1.5,
          starBonusDays: [3, 5, 7, 14, 21, 30],
          description: 'แคมเปญรางวัลพิเศษสำหรับผู้ใช้งานขั้นสูง'
        }
      }
    })

    console.log('✅ Campaign Templates seeded successfully')

    // Seed Reward Configurations (Achievement Badges)
    console.log('🏆 Seeding Reward Configurations...')
    
    const achievementConfigs = [
      {
        name: 'FIRST_READING',
        type: 'ACHIEVEMENT',
        icon: '🔮',
        title: 'การทำนายครั้งแรก',
        description: 'ทำนายไพ่ครั้งแรก',
        criteria: { readingCount: 1 },
        rewards: { exp: 50, coins: 10 },
        sortOrder: 1
      },
      {
        name: 'READING_STREAK_7',
        type: 'ACHIEVEMENT',
        icon: '🔥',
        title: 'ผู้เชี่ยวชาญ 7 วัน',
        description: 'ทำนายไพ่ติดต่อกัน 7 วัน',
        criteria: { streakDays: 7 },
        rewards: { exp: 100, coins: 25 },
        sortOrder: 2
      },
      {
        name: 'LEVEL_10',
        type: 'ACHIEVEMENT',
        icon: '⭐',
        title: 'ยอดนักทำนาย',
        description: 'เลื่อนขึ้น Level 10',
        criteria: { level: 10 },
        rewards: { exp: 200, stars: 1 },
        sortOrder: 3
      },
      {
        name: 'TOTAL_READINGS_50',
        type: 'ACHIEVEMENT',
        icon: '📚',
        title: 'นักสะสมการทำนาย',
        description: 'ทำนายไพ่ครบ 50 ครั้ง',
        criteria: { totalReadings: 50 },
        rewards: { exp: 300, coins: 50 },
        sortOrder: 4
      },
      {
        name: 'REFERRAL_MASTER',
        type: 'ACHIEVEMENT',
        icon: '👥',
        title: 'ผู้แนะนำตัวยง',
        description: 'แนะนำเพื่อนเข้าร่วม 5 คน',
        criteria: { referralCount: 5 },
        rewards: { stars: 3, coins: 100 },
        sortOrder: 5
      },
      {
        name: 'COIN_COLLECTOR',
        type: 'ACHIEVEMENT',
        icon: '💰',
        title: 'นักสะสมเหรียญ',
        description: 'เก็บเหรียญครบ 1,000 เหรียญ',
        criteria: { totalCoinsEarned: 1000 },
        rewards: { exp: 150, stars: 2 },
        sortOrder: 6
      },
      {
        name: 'DAILY_LOGIN_30',
        type: 'ACHIEVEMENT',
        icon: '📅',
        title: 'ผู้ซื่อสัตย์',
        description: 'เข้าสู่ระบบติดต่อกัน 30 วัน',
        criteria: { loginStreak: 30 },
        rewards: { exp: 500, stars: 3, coins: 100 },
        sortOrder: 7
      },
      {
        name: 'REVIEWER_EXPERT',
        type: 'ACHIEVEMENT',
        icon: '📝',
        title: 'ผู้รีวิวเซียน',
        description: 'รีวิวการทำนาย 20 ครั้ง',
        criteria: { reviewCount: 20 },
        rewards: { exp: 200, coins: 50 },
        sortOrder: 8
      },
      {
        name: 'ACCURACY_MASTER',
        type: 'ACHIEVEMENT',
        icon: '🎯',
        title: 'ยอดผู้ให้คะแนน',
        description: 'รีวิวความแม่นยำเฉลี่ย 80% ขึ้นไป',
        criteria: { averageAccuracy: 80, reviewCount: 10 },
        rewards: { exp: 300, stars: 2 },
        sortOrder: 9
      },
      {
        name: 'PRESTIGE_LEVEL_1',
        type: 'ACHIEVEMENT',
        icon: '👑',
        title: 'เกียรติยศระดับ 1',
        description: 'ได้รับ Prestige Level 1',
        criteria: { prestigeLevel: 1 },
        rewards: { exp: 1000, stars: 5, coins: 200 },
        sortOrder: 10
      },
      {
        name: 'READING_MASTER_100',
        type: 'ACHIEVEMENT',
        icon: '🏆',
        title: 'ปรมาจารย์ทำนาย',
        description: 'ทำนายไพ่ครบ 100 ครั้ง',
        criteria: { totalReadings: 100 },
        rewards: { exp: 500, stars: 3, coins: 150 },
        sortOrder: 11
      },
      {
        name: 'COIN_MILLIONAIRE',
        type: 'ACHIEVEMENT',
        icon: '💎',
        title: 'เศรษฐีเหรียญ',
        description: 'เก็บเหรียญครบ 10,000 เหรียญ',
        criteria: { totalCoinsEarned: 10000 },
        rewards: { exp: 1000, stars: 5, coins: 500 },
        sortOrder: 12
      },
      {
        name: 'LEVEL_25_ELITE',
        type: 'ACHIEVEMENT',
        icon: '⚡',
        title: 'นักทำนายชั้นยอด',
        description: 'เลื่อนขึ้น Level 25',
        criteria: { level: 25 },
        rewards: { exp: 400, stars: 2, coins: 100 },
        sortOrder: 13
      },
      {
        name: 'LEVEL_50_LEGEND',
        type: 'ACHIEVEMENT',
        icon: '🌟',
        title: 'ตำนานนักทำนาย',
        description: 'เลื่อนขึ้น Level 50',
        criteria: { level: 50 },
        rewards: { exp: 800, stars: 4, coins: 250 },
        sortOrder: 14
      },
      {
        name: 'SOCIAL_BUTTERFLY',
        type: 'ACHIEVEMENT',
        icon: '🦋',
        title: 'ผีเสื้อสังคม',
        description: 'แนะนำเพื่อนเข้าร่วม 10 คน',
        criteria: { referralCount: 10 },
        rewards: { exp: 600, stars: 5, coins: 300 },
        sortOrder: 15
      },
      {
        name: 'STREAK_CHAMPION',
        type: 'ACHIEVEMENT',
        icon: '🔥',
        title: 'แชมป์ความต่อเนื่อง',
        description: 'ทำนายไพ่ติดต่อกัน 30 วัน',
        criteria: { streakDays: 30 },
        rewards: { exp: 750, stars: 4, coins: 200 },
        sortOrder: 16
      },
      {
        name: 'MARATHON_READER',
        type: 'ACHIEVEMENT',
        icon: '🏃',
        title: 'นักทำนายมาราธอน',
        description: 'ทำนายไพ่ครบ 250 ครั้ง',
        criteria: { totalReadings: 250 },
        rewards: { exp: 1200, stars: 6, coins: 400 },
        sortOrder: 17
      },
      {
        name: 'REVIEW_SPECIALIST',
        type: 'ACHIEVEMENT',
        icon: '📊',
        title: 'ผู้เชี่ยวชาญรีวิว',
        description: 'รีวิวการทำนาย 50 ครั้ง',
        criteria: { reviewCount: 50 },
        rewards: { exp: 400, stars: 2, coins: 150 },
        sortOrder: 18
      },
      {
        name: 'LOYAL_USER_365',
        type: 'ACHIEVEMENT',
        icon: '💝',
        title: 'ผู้ใช้งานที่ซื่อสัตย์',
        description: 'เข้าสู่ระบบติดต่อกัน 365 วัน',
        criteria: { loginStreak: 365 },
        rewards: { exp: 2000, stars: 10, coins: 1000 },
        sortOrder: 19
      },
      {
        name: 'ULTIMATE_MASTER',
        type: 'ACHIEVEMENT',
        icon: '🎖️',
        title: 'ปรมาจารย์สูงสุด',
        description: 'ทำนายไพ่ครบ 500 ครั้ง และเลื่อนขึ้น Level 75',
        criteria: { totalReadings: 500, level: 75 },
        rewards: { exp: 3000, stars: 15, coins: 1500 },
        sortOrder: 20
      }
    ]

    for (const config of achievementConfigs) {
      await prisma.rewardConfiguration.upsert({
        where: { name: config.name },
        update: config,
        create: config
      })
    }

    console.log('✅ Reward Configurations seeded successfully')

    // Seed Prestige Rewards
    console.log('👑 Seeding Prestige Rewards...')
    
    const prestigeRewards = [
      {
        prestigeLevel: 1,
        rewardType: 'COINS_BONUS',
        value: 10.0, // 10% bonus
        description: 'เพิ่มโบนัสเหรียญ 10% จากทุกกิจกรรม'
      },
      {
        prestigeLevel: 2,
        rewardType: 'COINS_BONUS',
        value: 20.0, // 20% bonus
        description: 'เพิ่มโบนัสเหรียญ 20% จากทุกกิจกรรม'
      },
      {
        prestigeLevel: 3,
        rewardType: 'COINS_BONUS',
        value: 30.0, // 30% bonus
        description: 'เพิ่มโบนัสเหรียญ 30% จากทุกกิจกรรม'
      },
      {
        prestigeLevel: 5,
        rewardType: 'EXP_MULTIPLIER',
        value: 1.5, // 1.5x multiplier
        description: 'เพิ่ม EXP 1.5 เท่าจากการทำนายไพ่'
      },
      {
        prestigeLevel: 10,
        rewardType: 'SPECIAL_BADGE',
        value: 1.0,
        description: 'ได้รับตราสัญลักษณ์พิเศษ "ยอดนักทำนาย"'
      }
    ]

    for (const reward of prestigeRewards) {
      await prisma.prestigeReward.upsert({
        where: { prestigeLevel: reward.prestigeLevel },
        update: reward,
        create: reward
      })
    }

    console.log('✅ Prestige Rewards seeded successfully')

    console.log('🎉 Round 10 Gamification Data seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding Round 10 data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedRound10Data()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })