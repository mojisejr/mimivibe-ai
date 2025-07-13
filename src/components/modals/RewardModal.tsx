'use client'

import { useEffect, useState } from 'react'
import { Gift, Star, Coins, X, Sparkles } from 'lucide-react'

export interface Reward {
  exp: number
  coins: number
  level?: number
  isLevelUp?: boolean
}

export interface RewardModalProps {
  reward: Reward | null
  isOpen: boolean
  onClose: () => void
}

export function RewardModal({ reward, isOpen, onClose }: RewardModalProps) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isOpen && reward) {
      // Trigger animation after modal opens
      const timer = setTimeout(() => {
        setShowAnimation(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShowAnimation(false)
    }
  }, [isOpen, reward])

  if (!isOpen || !reward) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 btn btn-circle btn-ghost btn-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-secondary p-6 text-center">
          <div className={`transition-all duration-1000 ${
            showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            <Gift className="w-16 h-16 text-primary-content mx-auto mb-3" />
          </div>
          
          <h2 className="text-xl font-bold text-primary-content mb-2">
            {reward.isLevelUp ? 'ยินดีด้วย! เลเวลอัพ!' : 'ได้รับรางวัล!'}
          </h2>
          
          <p className="text-primary-content/80 text-sm">
            คุณได้รับรางวัลจากการดูดวง
          </p>
        </div>

        {/* Rewards */}
        <div className="p-6 space-y-4">
          {/* EXP Reward */}
          {reward.exp > 0 && (
            <div className={`flex items-center justify-between p-4 bg-warning/10 border border-warning/20 rounded-lg transition-all duration-500 delay-200 ${
              showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="font-semibold text-base-content">ประสบการณ์</div>
                  <div className="text-sm text-base-content/70">Experience Points</div>
                </div>
              </div>
              <div className="text-xl font-bold text-warning">
                +{reward.exp}
              </div>
            </div>
          )}

          {/* Coins Reward */}
          {reward.coins > 0 && (
            <div className={`flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg transition-all duration-500 delay-300 ${
              showAnimation ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="font-semibold text-base-content">เหรียญ</div>
                  <div className="text-sm text-base-content/70">Mystical Coins</div>
                </div>
              </div>
              <div className="text-xl font-bold text-success">
                +{reward.coins}
              </div>
            </div>
          )}

          {/* Level Up */}
          {reward.isLevelUp && reward.level && (
            <div className={`p-4 bg-primary/10 border border-primary/20 rounded-lg text-center transition-all duration-500 delay-400 ${
              showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}>
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-bold text-primary text-lg mb-1">
                เลเวล {reward.level}
              </div>
              <div className="text-sm text-base-content/70">
                คุณได้เลื่อนระดับแล้ว!
              </div>
            </div>
          )}

          {/* Continue Button */}
          <div className={`pt-4 transition-all duration-500 delay-500 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <button
              onClick={onClose}
              className="btn btn-primary btn-block"
            >
              เยี่ยม!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}