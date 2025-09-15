import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRewards() {
  console.log('🎁 Starting reward configuration seeding...')

  // Default reward configurations
  const rewards = [
    // Referral System Rewards
    {
      name: 'REFERRAL_INVITER',
      type: 'referral',
      icon: '👥',
      title: 'แนะนำเพื่อน',
      description: 'รางวัลสำหรับผู้แนะนำเพื่อน',
      criteria: {
        eventType: 'referral_success',
        role: 'inviter'
      },
      rewards: {
        coins: 50
      }
    },
    {
      name: 'REFERRAL_INVITED',
      type: 'referral',
      icon: '🎁',
      title: 'สมาชิกใหม่',
      description: 'รางวัลสำหรับผู้ถูกแนะนำ',
      criteria: {
        eventType: 'referral_success',
        role: 'invited'
      },
      rewards: {
        stars: 1
      }
    },

    // Achievement System Rewards
    {
      name: 'FIRST_READING',
      type: 'achievement',
      icon: '🔮',
      title: 'ครั้งแรก',
      description: 'รางวัลการดูดวงครั้งแรก',
      criteria: {
        eventType: 'reading_milestone',
        count: 1
      },
      rewards: {
        freePoint: 2
      }
    },
    {
      name: 'READING_MILESTONE_10',
      type: 'achievement',
      icon: '⭐',
      title: 'นักดูดวง',
      description: 'รางวัลดูดวง 10 ครั้ง',
      criteria: {
        eventType: 'reading_milestone',
        count: 10
      },
      rewards: {
        coins: 25
      }
    },
    {
      name: 'READING_MILESTONE_50',
      type: 'achievement',
      icon: '🌟',
      title: 'ผู้เชี่ยวชาญ',
      description: 'รางวัลดูดวง 50 ครั้ง',
      criteria: {
        eventType: 'reading_milestone',
        count: 50
      },
      rewards: {
        freePoint: 5
      }
    },
    {
      name: 'READING_MILESTONE_100',
      type: 'achievement',
      icon: '💫',
      title: 'ปรมาจารย์',
      description: 'รางวัลดูดวง 100 ครั้ง',
      criteria: {
        eventType: 'reading_milestone',
        count: 100
      },
      rewards: {
        stars: 3
      }
    },

    // Level System Rewards
    {
      name: 'LEVEL_UP_10',
      type: 'level',
      icon: '🏆',
      title: 'เลเวล 10',
      description: 'รางวัลถึงเลเวล 10',
      criteria: {
        eventType: 'level_milestone',
        level: 10
      },
      rewards: {
        coins: 30
      }
    },
    {
      name: 'LEVEL_UP_25',
      type: 'level',
      icon: '👑',
      title: 'เลเวล 25',
      description: 'รางวัลถึงเลเวล 25',
      criteria: {
        eventType: 'level_milestone',
        level: 25
      },
      rewards: {
        freePoint: 5
      }
    },

    // Daily Activity Rewards
    {
      name: 'DAILY_LOGIN',
      type: 'daily',
      icon: '📅',
      title: 'เข้าสู่ระบบ',
      description: 'รางวัลเข้าสู่ระบบรายวัน',
      criteria: {
        eventType: 'daily_activity',
        type: 'login'
      },
      rewards: {
        coins: 5
      }
    }
  ]

  let created = 0
  let updated = 0

  for (const reward of rewards) {
    try {
      const existing = await prisma.rewardConfiguration.findUnique({
        where: { name: reward.name }
      })

      if (existing) {
        await prisma.rewardConfiguration.update({
          where: { name: reward.name },
          data: {
            type: reward.type,
            icon: reward.icon,
            title: reward.title,
            description: reward.description,
            criteria: reward.criteria,
            rewards: reward.rewards,
            isActive: true
          }
        })
        updated++
      } else {
        await prisma.rewardConfiguration.create({
          data: reward
        })
        created++
      }
    } catch (error) {
      console.error(`Failed to seed reward ${reward.name}:`, error)
    }
  }

  console.log(`✅ Reward seeding completed: ${created} created, ${updated} updated`)
}

async function seedExchangeSettings() {
  console.log('💱 Starting exchange settings seeding...')

  const exchangeSettings = [
    {
      exchangeType: 'COIN_TO_FREE_POINT',
      receivedItem: 'FREE_POINTS',
      coinPerUnit: 15,
      isActive: true,
      metadata: {
        description: 'แลกเหรียญเป็นแต้มฟรี',
        minAmount: 15,
        maxAmount: 1000
      }
    },
    {
      exchangeType: 'COIN_TO_FREE_POINT_BONUS',
      receivedItem: 'FREE_POINTS',
      coinPerUnit: 12,
      isActive: false,
      metadata: {
        description: 'อัตราแลกเปลี่ยนพิเศษ (ปิดใช้งาน)',
        minAmount: 100,
        maxAmount: 1000,
        bonusRate: true
      }
    }
  ]

  let created = 0
  let updated = 0

  for (const setting of exchangeSettings) {
    try {
      const existing = await prisma.exchangeSetting.findFirst({
        where: { 
          exchangeType: setting.exchangeType,
          coinPerUnit: setting.coinPerUnit
        }
      })

      if (existing) {
        await prisma.exchangeSetting.update({
          where: { id: existing.id },
          data: setting
        })
        updated++
      } else {
        await prisma.exchangeSetting.create({
          data: setting
        })
        created++
      }
    } catch (error) {
      console.error(`Failed to seed exchange setting ${setting.exchangeType}:`, error)
    }
  }

  console.log(`✅ Exchange settings seeding completed: ${created} created, ${updated} updated`)
}

async function seedPackages() {
  console.log('📦 Starting payment packages seeding...')

  const packages = [
    {
      id: 1,
      title: 'Starter Pack',
      subtitle: 'เริ่มต้นดูดวง',
      price: 9900, // 99.00 THB in satang
      creditAmount: 10,
      ctaText: 'ซื้อเลย',
      popular: false,
      sortOrder: 1,
      metadata: {
        description: 'แพ็กเกจเริ่มต้นสำหรับมือใหม่',
        features: ['10 ครั้งการดูดวง', 'AI คุณภาพสูง', 'บันทึกประวัติ']
      }
    },
    {
      id: 2,
      title: 'Popular Pack',
      subtitle: 'ยอดนิยมที่สุด',
      price: 19900, // 199.00 THB in satang
      creditAmount: 25,
      ctaText: 'ซื้อเลย',
      popular: true,
      sortOrder: 2,
      metadata: {
        description: 'แพ็กเกจยอดนิยม คุ้มค่าที่สุด',
        features: ['25 ครั้งการดูดวง', 'AI คุณภาพสูง', 'บันทึกประวัติ', 'โบนัส 5 ครั้ง']
      }
    },
    {
      id: 3,
      title: 'Premium Pack',
      subtitle: 'สำหรับผู้เชี่ยวชาญ',
      price: 39900, // 399.00 THB in satang
      creditAmount: 60,
      ctaText: 'ซื้อเลย',
      popular: false,
      sortOrder: 3,
      metadata: {
        description: 'แพ็กเกจพรีเมียม สำหรับการใช้งานหนัก',
        features: ['60 ครั้งการดูดวง', 'AI คุณภาพสูง', 'บันทึกประวัติ', 'โบนัส 15 ครั้ง', 'รายงานพิเศษ']
      }
    }
  ]

  let created = 0
  let updated = 0

  for (const pack of packages) {
    try {
      const existing = await prisma.pack.findUnique({
        where: { id: pack.id }
      })

      if (existing) {
        await prisma.pack.update({
          where: { id: pack.id },
          data: pack
        })
        updated++
      } else {
        await prisma.pack.create({
          data: pack
        })
        created++
      }
    } catch (error) {
      console.error(`Failed to seed package ${pack.title}:`, error)
    }
  }

  console.log(`✅ Package seeding completed: ${created} created, ${updated} updated`)
}

async function main() {
  try {
    console.log('🌱 Starting comprehensive database seeding...')
    
    await seedRewards()
    await seedExchangeSettings()
    await seedPackages()
    
    console.log('✅ All seeding operations completed successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedRewards, seedExchangeSettings, seedPackages }