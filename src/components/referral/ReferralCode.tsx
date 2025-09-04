"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastContainer";

interface ReferralCodeProps {
  userId?: string;
}

interface ReferralData {
  code: string;
  isUsed: boolean;
  createdAt: string;
  referralStats?: {
    totalReferrals: number;
    totalRewards: number;
  };
}

export function ReferralCode({ userId }: ReferralCodeProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchReferralData();
    }
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referrals/status');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReferralData(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralData?.code) return;

    try {
      setCopying(true);
      const referralUrl = `${window.location.origin}?ref=${referralData.code}`;
      
      await navigator.clipboard.writeText(referralUrl);
      
      addToast({
        type: "success",
        message: "คัดลอกลิงก์แนะนำเพื่อนสำเร็จ! 🎉",
        duration: 3000,
      });
    } catch (error) {
      addToast({
        type: "error",
        message: "ไม่สามารถคัดลอกได้ กรุณาลองใหม่ ❌",
        duration: 3000,
      });
    } finally {
      setCopying(false);
    }
  };

  const handleShare = async () => {
    if (!referralData?.code) return;

    const referralUrl = `${window.location.origin}?ref=${referralData.code}`;
    const shareText = "มาดูดวงกับ MiMiVibes กันเถอะ! AI จะช่วยทำนายดวงชะตาให้คุณแบบส่วนตัว 🔮✨";

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MiMiVibes - AI Tarot Reading',
          text: shareText,
          url: referralUrl
        });
      } catch (error) {
        console.error('Failed to share:', error);
        handleCopyCode(); // Fallback to copy
      }
    } else {
      handleCopyCode(); // Fallback for browsers without Web Share API
    }
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-base-300 rounded mb-4"></div>
          <div className="h-16 bg-base-300 rounded mb-4"></div>
          <div className="h-12 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg text-center">
        <div className="text-base-content/60 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">ไม่พบข้อมูลแนะนำเพื่อน</p>
          <p className="text-sm">กรุณาลองใหม่อีกครั้ง</p>
        </div>
      </div>
    );
  }

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralData.code}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-base-content">แนะนำเพื่อน</h2>
          <p className="text-sm text-base-content/60">รับรางวัลเมื่อเพื่อนสมัครสมาชิก</p>
        </div>
      </div>

      {/* Referral Code Display */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-4 mb-4 border border-primary/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-base-content/70">รหัสแนะนำของคุณ</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs text-success font-medium">Active</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-base-100/50 rounded-xl p-3">
            <p className="font-mono text-lg font-bold text-primary break-all">
              {referralData.code}
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyCode}
            disabled={copying}
            className="btn btn-sm btn-primary"
          >
            {copying ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Referral URL */}
      <div className="bg-base-200/50 rounded-xl p-3 mb-4">
        <p className="text-xs text-base-content/60 mb-1">ลิงก์เต็ม:</p>
        <p className="font-mono text-sm text-base-content break-all">{referralUrl}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="flex-1 btn btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          แชร์เพื่อน
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyCode}
          className="flex-1 btn btn-outline btn-primary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          คัดลอก
        </motion.button>
      </div>

      {/* Stats Display */}
      {referralData.referralStats && (
        <div className="mt-6 pt-6 border-t border-base-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {referralData.referralStats.totalReferrals}
              </div>
              <div className="text-sm text-base-content/60">เพื่อนที่เชิญ</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {referralData.referralStats.totalRewards}
              </div>
              <div className="text-sm text-base-content/60">รางวัลที่ได้รับ</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}