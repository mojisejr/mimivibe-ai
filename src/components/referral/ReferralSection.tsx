'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { ReferralCopyButton } from './ReferralCopyButton'
import { useToast } from '@/components/ui/ToastContainer'

interface ReferralData {
  referralCode: string
  referralLink: string
  stats: {
    totalReferred: number
    successfulReferrals: number
    totalRewards: {
      exp: number
      coins: number
      stars: number
    }
  }
  recentReferrals: Array<{
    id: string
    referredAt: string
    rewarded: boolean
    rewardAmount: {
      exp: number
      coins: number
    }
  }>
}

export const ReferralSection = () => {
  const { user, isLoaded } = useUser()
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchReferralData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/referrals/status')
        if (!response.ok) {
          throw new Error('Failed to fetch referral data')
        }
        
        const result = await response.json()
        if (result.success) {
          setReferralData(result.data)
        } else {
          throw new Error(result.error || 'Failed to load referral data')
        }
      } catch (err) {
        console.error('Referral fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load referral data')
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [isLoaded, user])

  const handleCopySuccess = () => {
    addToast({
      type: 'success',
      title: 'คัดลอกสำเร็จ!',
      message: 'ลิงก์เชิญเพื่อนถูกคัดลอกไปยังคลิปบอร์ดแล้ว',
      duration: 3000,
    })
  }

  const handleCopyError = () => {
    addToast({
      type: 'error',
      title: 'เกิดข้อผิดพลาด',
      message: 'ไม่สามารถคัดลอกลิงก์ได้ กรุณาลองใหม่อีกครั้ง',
      duration: 3000,
    })
  }

  if (!isLoaded || !user) {
    return (
      <div className="card card-mystical">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-6 bg-base-300 rounded mb-4"></div>
            <div className="h-4 bg-base-300 rounded mb-2"></div>
            <div className="h-4 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card card-mystical">
        <div className="card-body">
          <h3 className="heading-3 mb-4">🎁 เชิญเพื่อนรับรางวัล</h3>
          <div className="animate-pulse">
            <div className="h-4 bg-base-300 rounded mb-4"></div>
            <div className="h-12 bg-base-300 rounded mb-4"></div>
            <div className="h-6 bg-base-300 rounded mb-2"></div>
            <div className="h-6 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card card-mystical border-error">
        <div className="card-body">
          <h3 className="heading-3 mb-4 text-error">⚠️ เกิดข้อผิดพลาด</h3>
          <p className="body-normal text-error mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-outline btn-error btn-sm"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  if (!referralData) {
    return null
  }

  return (
    <div className="card card-mystical">
      <div className="card-body">
        <h3 className="heading-3 mb-4">🎁 เชิญเพื่อนรับรางวัล</h3>
        
        <div className="mb-6">
          <p className="body-normal mb-4">
            เชิญเพื่อนมาใช้ MiMi Vibes และรับรางวัลพิเศษ!
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="bg-info/10 rounded-lg p-3">
              <div className="text-sm text-info font-medium mb-1">📝 เพื่อนใหม่ได้รับ (ทันทีตอนสมัคร):</div>
              <div className="text-xs text-info">• +1 ดาว + 5 เหรียญ</div>
            </div>
            <div className="bg-success/10 rounded-lg p-3">
              <div className="text-sm text-success font-medium mb-1">🎉 คุณได้รับ (เมื่อเพื่อนทำนายครั้งแรก):</div>
              <div className="text-xs text-success">• +1 ดาว + 25 EXP</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="label">
            <span className="label-text font-semibold">รหัสเชิญเพื่อนของคุณ</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={referralData.referralCode}
              readOnly
              className="input input-bordered flex-1 font-mono text-center text-lg font-bold"
            />
            <ReferralCopyButton
              referralLink={referralData.referralLink}
              onCopySuccess={handleCopySuccess}
              onCopyError={handleCopyError}
            />
          </div>
          <div className="label">
            <span className="label-text-alt">แชร์รหัสนี้ให้เพื่อนเพื่อรับรางวัล</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat">
            <div className="stat-figure text-primary">
              <span className="text-2xl">👥</span>
            </div>
            <div className="stat-title">เชิญทั้งหมด</div>
            <div className="stat-value text-primary">{referralData.stats.totalReferred}</div>
            <div className="stat-desc">คน</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-success">
              <span className="text-2xl">✅</span>
            </div>
            <div className="stat-title">ได้รับรางวัล</div>
            <div className="stat-value text-success">{referralData.stats.successfulReferrals}</div>
            <div className="stat-desc">คน</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-warning">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="stat-title">รางวัลรวม</div>
            <div className="stat-value text-warning">{referralData.stats.totalRewards.stars}</div>
            <div className="stat-desc">ดาว</div>
          </div>
        </div>

        {referralData.recentReferrals.length > 0 && (
          <>
            <div className="divider"></div>
            <div>
              <h4 className="font-semibold mb-3">🕐 เพื่อนที่เชิญล่าสุด</h4>
              <div className="space-y-2">
                {referralData.recentReferrals.slice(0, 5).map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-2 bg-base-200 rounded">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${referral.rewarded ? 'text-success' : 'text-warning'}`}>
                        {referral.rewarded ? '✅' : '⏳'}
                      </span>
                      <span className="text-sm">
                        {new Date(referral.referredAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-content">
                      {referral.rewarded ? 'ได้รับรางวัลแล้ว' : 'รอทำนายครั้งแรก'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}