import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering for authentication and database access
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Calculate level progression
    const levelProgression = calculateLevelProgression(user.exp, user.level, user.prestigeLevel)
    
    // Check if level up is needed
    if (levelProgression.newLevel > user.level) {
      const result = await prisma.$transaction(async (tx) => {
        // Update user level
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            level: levelProgression.newLevel
          }
        })

        // Create level up transaction record
        await tx.pointTransaction.create({
          data: {
            id: `levelup_${userId}_${Date.now()}`,
            userId,
            eventType: 'LEVEL_UP',
            deltaExp: 0,
            deltaCoins: 0,
            deltaPoint: 0,
            metadata: {
              fromLevel: user.level,
              toLevel: levelProgression.newLevel,
              totalExp: user.exp,
              levelUpAt: new Date().toISOString()
            }
          }
        })

        return updatedUser
      })

      // Check for achievements after level up
      try {
        const { AchievementService } = await import('@/lib/services/AchievementService');
        await AchievementService.checkAndTriggerAchievements(userId, 'LEVEL_UP');
      } catch (error) {
        console.error('Achievement check failed (non-critical):', error);
        // Don't fail the level up if achievement check fails
      }

      return NextResponse.json({
        success: true,
        data: {
          leveledUp: true,
          oldLevel: user.level,
          newLevel: levelProgression.newLevel,
          currentExp: user.exp,
          expForCurrentLevel: levelProgression.expForCurrentLevel,
          expForNextLevel: levelProgression.expForNextLevel,
          expToNextLevel: levelProgression.expToNextLevel,
          progression: levelProgression
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        leveledUp: false,
        currentLevel: user.level,
        currentExp: user.exp,
        expForCurrentLevel: levelProgression.expForCurrentLevel,
        expForNextLevel: levelProgression.expForNextLevel,
        expToNextLevel: levelProgression.expToNextLevel,
        progression: levelProgression
      }
    })

  } catch (error) {
    console.error('Level check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateLevelProgression(currentExp: number, currentLevel: number, prestigeLevel: number = 0) {
  // Base EXP formula: level^2 * 100 
  // With prestige: base formula * (1 + prestigeLevel * 0.2) for scaling
  const prestigeMultiplier = 1 + (prestigeLevel * 0.2)
  
  // Calculate what level the user should be at with current EXP
  let calculatedLevel = 1
  let totalExpNeeded = 0
  
  while (totalExpNeeded <= currentExp && calculatedLevel < 100) {
    const expForLevel = Math.floor((calculatedLevel * calculatedLevel * 100) * prestigeMultiplier)
    totalExpNeeded += expForLevel
    
    if (totalExpNeeded > currentExp) {
      break
    }
    
    calculatedLevel++
  }
  
  // Calculate EXP requirements for current level
  const expForCurrentLevel = calculatedLevel > 1 
    ? Math.floor(((calculatedLevel - 1) * (calculatedLevel - 1) * 100) * prestigeMultiplier)
    : 0
    
  const expForNextLevel = calculatedLevel < 100 
    ? Math.floor((calculatedLevel * calculatedLevel * 100) * prestigeMultiplier)
    : Math.floor((99 * 99 * 100) * prestigeMultiplier) // Cap at level 99 requirements
    
  // Calculate EXP accumulated for current level
  let expUsedForPreviousLevels = 0
  for (let level = 1; level < calculatedLevel; level++) {
    expUsedForPreviousLevels += Math.floor((level * level * 100) * prestigeMultiplier)
  }
  
  const expInCurrentLevel = currentExp - expUsedForPreviousLevels
  const expToNextLevel = expForNextLevel - expInCurrentLevel
  
  return {
    newLevel: Math.min(calculatedLevel, 100), // Cap at level 100
    expForCurrentLevel: expInCurrentLevel,
    expForNextLevel,
    expToNextLevel: Math.max(0, expToNextLevel),
    totalExpUsed: expUsedForPreviousLevels,
    prestigeMultiplier,
    maxLevel: 100
  }
}