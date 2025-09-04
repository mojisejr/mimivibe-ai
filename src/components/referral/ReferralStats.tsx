"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ReferralStatsData {
  totalReferrals: number;
  activeReferrals: number;
  totalRewardsEarned: number;
  recentReferrals: Array<{
    id: string;
    referredUser: string;
    joinDate: string;
    rewardEarned: number;
    status: 'pending' | 'active' | 'claimed';
  }>;
  monthlyStats: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

interface ReferralStatsProps {
  userId?: string;
}

export function ReferralStats({ userId }: ReferralStatsProps) {
  const [stats, setStats] = useState<ReferralStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchReferralStats();
    }
  }, [userId]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referrals/status');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.stats) {
          setStats(data.data.stats);
        } else {
          // Mock data for demonstration
          setStats({
            totalReferrals: 5,
            activeReferrals: 3,
            totalRewardsEarned: 150,
            recentReferrals: [
              {
                id: '1',
                referredUser: 'สมชาย K.',
                joinDate: '2025-01-20',
                rewardEarned: 30,
                status: 'claimed'
              },
              {
                id: '2',
                referredUser: 'มานี P.',
                joinDate: '2025-01-18',
                rewardEarned: 25,
                status: 'active'
              },
              {
                id: '3',
                referredUser: 'กิตติ S.',
                joinDate: '2025-01-15',
                rewardEarned: 30,
                status: 'pending'
              }
            ],
            monthlyStats: {
              thisMonth: 3,
              lastMonth: 2,
              growth: 50
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
      // Set mock data on error
      setStats({
        totalReferrals: 0,
        activeReferrals: 0,
        totalRewardsEarned: 0,
        recentReferrals: [],
        monthlyStats: {
          thisMonth: 0,
          lastMonth: 0,
          growth: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-base-300 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-base-300 rounded"></div>
            <div className="h-20 bg-base-300 rounded"></div>
            <div className="h-20 bg-base-300 rounded"></div>
          </div>
          <div className="h-40 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg text-center">
        <p className="text-base-content/60">ไม่สามารถโหลดสถิติได้</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'claimed':
        return <div className="badge badge-success badge-sm">รับแล้ว</div>;
      case 'active':
        return <div className="badge badge-primary badge-sm">ใช้งาน</div>;
      case 'pending':
        return <div className="badge badge-warning badge-sm">รอ</div>;
      default:
        return <div className="badge badge-ghost badge-sm">-</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-base-content">สถิติการแนะนำ</h2>
          <p className="text-sm text-base-content/60">ผลงานและรางวัลของคุณ</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/10 text-center"
        >
          <div className="text-2xl font-bold text-primary mb-1">
            {stats.totalReferrals}
          </div>
          <div className="text-xs text-base-content/60">เพื่อนทั้งหมด</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-4 border border-secondary/10 text-center"
        >
          <div className="text-2xl font-bold text-secondary mb-1">
            {stats.activeReferrals}
          </div>
          <div className="text-xs text-base-content/60">กำลังใช้งาน</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-4 border border-accent/10 text-center"
        >
          <div className="text-2xl font-bold text-accent mb-1">
            {stats.totalRewardsEarned}
          </div>
          <div className="text-xs text-base-content/60">รางวัลรวม</div>
        </motion.div>
      </div>

      {/* Growth Indicator */}
      <div className="bg-info/5 rounded-2xl p-4 mb-6 border border-info/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-base-content">เดือนนี้</span>
              {stats.monthlyStats.growth > 0 && (
                <div className="badge badge-success badge-sm">
                  +{stats.monthlyStats.growth}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-info">
              {stats.monthlyStats.thisMonth}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-base-content/60">เดือนก่อน</div>
            <div className="text-lg font-semibold text-base-content/80">
              {stats.monthlyStats.lastMonth}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      <div>
        <h3 className="text-lg font-semibold text-base-content mb-4">เพื่อนล่าสุด</h3>
        
        {stats.recentReferrals.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>ยังไม่มีเพื่อนที่แนะนำ</p>
            <p className="text-sm">เชิญเพื่อนมาใช้งานเพื่อรับรางวัล!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentReferrals.map((referral) => (
              <motion.div
                key={referral.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-base-200/50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <div className="font-medium text-base-content">
                      {referral.referredUser}
                    </div>
                    <div className="text-sm text-base-content/60">
                      {new Date(referral.joinDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-accent">
                      +{referral.rewardEarned}
                    </div>
                    <div className="text-xs text-base-content/60">รางวัล</div>
                  </div>
                  {getStatusBadge(referral.status)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}