"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/ToastContainer';

interface PrestigeBonus {
  type: string;
  value: number;
  description: string;
}

interface PrestigeData {
  currentPrestigeLevel: number;
  currentLevel: number;
  canPrestige: boolean;
  nextPrestigeRewards: {
    coins: number;
    stars: number;
    exp: number;
  };
  currentBonuses: PrestigeBonus[];
  nextBonuses: PrestigeBonus[];
  requirementsToPrestige: {
    requiredLevel: number;
    currentLevel: number;
    progress: number;
  };
}

export function PrestigeSystem() {
  const [prestigeData, setPrestigeData] = useState<PrestigeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prestiging, setPrestiging] = useState(false);
  const { addToast } = useToast();

  const fetchPrestigeData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/prestige');
      if (!response.ok) {
        throw new Error('Failed to fetch prestige data');
      }
      const result = await response.json();
      if (result.success) {
        setPrestigeData(result.data);
      }
    } catch (error) {
      console.error('Error fetching prestige data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestigeData();
  }, []);

  const handlePrestige = async () => {
    if (!prestigeData?.canPrestige) return;

    try {
      setPrestiging(true);
      const response = await fetch('/api/user/prestige', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to prestige');
      }

      const result = await response.json();
      if (result.success) {
        addToast({
          type: 'success',
          message: `🎉 Prestige สำเร็จ! คุณได้รับ Prestige Level ${result.data.prestigeLevel}`,
          duration: 5000,
        });

        // Refresh prestige data
        await fetchPrestigeData();
      } else {
        throw new Error(result.error || 'Prestige failed');
      }
    } catch (error) {
      console.error('Prestige error:', error);
      addToast({
        type: 'error',
        message: 'ไม่สามารถ Prestige ได้ กรุณาลองใหม่ ❌',
        duration: 3000,
      });
    } finally {
      setPrestiging(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-warning/10 to-secondary/10 rounded-2xl p-6 border border-warning/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-base-300 rounded w-3/4"></div>
          <div className="h-4 bg-base-300 rounded w-1/2"></div>
          <div className="h-32 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!prestigeData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-warning/10 to-secondary/10 rounded-2xl p-6 border border-warning/20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">👑</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-warning">เกียรติยศ (Prestige)</h2>
            <p className="text-sm text-base-content/70">
              ระดับเกียรติยศ: {prestigeData.currentPrestigeLevel}
            </p>
          </div>
        </div>
        
        {prestigeData.currentPrestigeLevel > 0 && (
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(prestigeData.currentPrestigeLevel, 5) }).map((_, i) => (
              <span key={i} className="text-warning text-xl">⭐</span>
            ))}
            {prestigeData.currentPrestigeLevel > 5 && (
              <span className="text-sm font-bold text-warning">+{prestigeData.currentPrestigeLevel - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Current Bonuses */}
      {prestigeData.currentBonuses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-base-content mb-3">โบนัสปัจจุบัน</h3>
          <div className="space-y-2">
            {prestigeData.currentBonuses.map((bonus, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-success/10 rounded-xl border border-success/20">
                <span className="text-success text-lg">✨</span>
                <span className="text-sm text-base-content">{bonus.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prestige Requirements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-base-content mb-3">
          ข้อกำหนดสำหรับ Prestige ครั้งต่อไป
        </h3>
        
        <div className="space-y-4">
          {/* Level Progress */}
          <div className="p-4 bg-base-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-base-content/70">ระดับที่ต้องการ</span>
              <span className="text-sm font-medium">
                {prestigeData.requirementsToPrestige.currentLevel} / {prestigeData.requirementsToPrestige.requiredLevel}
              </span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-warning to-secondary h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(prestigeData.requirementsToPrestige.progress, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Next Prestige Rewards */}
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">รางวัลที่จะได้รับ</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-warning/10 rounded-lg">
                <div className="text-lg">🪙</div>
                <div className="text-sm font-bold text-warning">
                  {prestigeData.nextPrestigeRewards.coins.toLocaleString()}
                </div>
                <div className="text-xs text-base-content/70">เหรียญ</div>
              </div>
              <div className="text-center p-2 bg-secondary/10 rounded-lg">
                <div className="text-lg">⭐</div>
                <div className="text-sm font-bold text-secondary">
                  {prestigeData.nextPrestigeRewards.stars}
                </div>
                <div className="text-xs text-base-content/70">ดาว</div>
              </div>
            </div>
          </div>

          {/* Next Bonuses */}
          {prestigeData.nextBonuses.length > prestigeData.currentBonuses.length && (
            <div className="p-4 bg-info/10 rounded-xl border border-info/20">
              <h4 className="font-semibold text-info mb-2">โบนัสใหม่ที่จะได้รับ</h4>
              <div className="space-y-2">
                {prestigeData.nextBonuses
                  .slice(prestigeData.currentBonuses.length)
                  .map((bonus, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span className="text-info">🆕</span>
                      <span className="text-base-content/80">{bonus.description}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prestige Button */}
      <motion.button
        whileHover={prestigeData.canPrestige ? { scale: 1.02 } : {}}
        whileTap={prestigeData.canPrestige ? { scale: 0.98 } : {}}
        onClick={handlePrestige}
        disabled={!prestigeData.canPrestige || prestiging}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all duration-300
          ${prestigeData.canPrestige && !prestiging
            ? 'bg-gradient-to-r from-warning to-secondary text-white hover:shadow-lg'
            : 'bg-base-300 text-base-content/50 cursor-not-allowed'
          }
        `}
      >
        {prestiging ? (
          <span className="flex items-center justify-center space-x-2">
            <span className="loading loading-spinner loading-sm"></span>
            <span>กำลัง Prestige...</span>
          </span>
        ) : prestigeData.canPrestige ? (
          `🏆 Prestige เป็น Level ${prestigeData.currentPrestigeLevel + 1}`
        ) : (
          `ต้องถึง Level ${prestigeData.requirementsToPrestige.requiredLevel} ก่อน`
        )}
      </motion.button>

      {/* Warning */}
      {prestigeData.canPrestige && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-error/10 border border-error/20 rounded-xl"
        >
          <div className="flex items-start space-x-2">
            <span className="text-error text-lg mt-0.5">⚠️</span>
            <div className="text-sm text-error">
              <strong>คำเตือน:</strong> การ Prestige จะรีเซ็ตระดับและ EXP ของคุณกลับเป็น 1 
              แต่คุณจะได้รับโบนัสถาวรและรางวัลพิเศษ
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}