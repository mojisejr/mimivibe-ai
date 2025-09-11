"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastContainer";
import { useProfile } from "@/hooks/useProfile";

interface SwapInterfaceProps {
  exchangeRate: number; // coins per star
  onSwap: (coinAmount: number) => Promise<any>;
  onRefresh: () => Promise<void>;
}

export function SwapInterface({ 
  exchangeRate, 
  onSwap,
  onRefresh 
}: SwapInterfaceProps) {
  const { data: profileData } = useProfile();
  const [coinAmount, setCoinAmount] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);
  const { addToast } = useToast();

  const currentCoins = profileData?.stats.coins || 0;
  const currentStars = profileData?.credits.stars || 0;

  const calculateStars = (coins: number): number => {
    return Math.floor(coins / exchangeRate);
  };

  const handleSwap = async () => {
    const coins = parseFloat(coinAmount);
    
    if (!coins || coins <= 0) {
      addToast({
        type: "warning",
        message: "กรุณาใส่จำนวนเหรียญที่ต้องการแลก ⚠️",
        duration: 3000,
      });
      return;
    }

    if (coins < exchangeRate) {
      addToast({
        type: "warning",
        message: `ต้องใช้เหรียญอย่างน้อย ${exchangeRate} เหรียญ ⚠️`,
        duration: 3000,
      });
      return;
    }

    if (coins > currentCoins) {
      addToast({
        type: "error",
        message: "เหรียญไม่เพียงพอ ❌",
        duration: 3000,
      });
      return;
    }

    try {
      setIsSwapping(true);
      const result = await onSwap(coins);
      
      if (result.success) {
        const received = calculateStars(coins);
        
        addToast({
          type: "success",
          message: `Swap สำเร็จ! ได้ ${received} ดาว 🎉 ⭐`,
          duration: 4000,
        });
        
        setCoinAmount("");
        await onRefresh();
      }
    } catch (error) {
      console.error("Swap error:", error);
      addToast({
        type: "error",
        message: "ไม่สามารถ Swap ได้ กรุณาลองใหม่ ❌",
        duration: 3000,
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleMaxClick = () => {
    const maxCoins = Math.floor(currentCoins / exchangeRate) * exchangeRate;
    setCoinAmount(maxCoins.toString());
  };

  const coins = parseFloat(coinAmount) || 0;
  const expectedStars = calculateStars(coins);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-base-100 rounded-3xl p-6 border border-base-300 shadow-lg max-w-md mx-auto"
    >
      {/* Swap Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-base-content">Swap</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-success font-medium">Live</span>
        </div>
      </div>

      {/* From Token */}
      <div className="space-y-4">
        <div className="bg-base-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-base-content/70">From</span>
            <span className="text-sm text-base-content/70">
              Balance: {currentCoins.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-secondary/20 px-3 py-2 rounded-xl min-w-[100px]">
              <span className="text-2xl">🪙</span>
              <span className="font-bold text-secondary">COIN</span>
            </div>
            
            <div className="flex-1">
              <input
                type="number"
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-right text-2xl font-bold text-base-content placeholder:text-base-content/40 focus:outline-none"
                min="0"
                step={exchangeRate}
              />
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={handleMaxClick}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path
                d="M7 13L12 18L17 13M7 11L12 6L17 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>

        {/* To Token */}
        <div className="bg-base-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-base-content/70">To</span>
            <span className="text-sm text-base-content/70">
              Balance: {currentStars.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-accent/20 px-3 py-2 rounded-xl min-w-[100px]">
              <span className="text-2xl">⭐</span>
              <span className="font-bold text-accent">STAR</span>
            </div>
            
            <div className="flex-1">
              <div className="text-right text-2xl font-bold text-base-content">
                {expectedStars.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Exchange Rate */}
        {coins > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-info/10 border border-info/20 rounded-xl p-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-info">Exchange Rate:</span>
              <span className="font-medium text-info">
                {exchangeRate} COIN = 1 STAR
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-base-content/70">You pay:</span>
              <span className="font-medium">{coins} 🪙</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/70">You receive:</span>
              <span className="font-medium">{expectedStars} ⭐</span>
            </div>
          </motion.div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!coins || coins < exchangeRate || coins > currentCoins || isSwapping}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300
            ${coins && coins >= exchangeRate && coins <= currentCoins && !isSwapping
              ? "bg-primary text-primary-content hover:bg-primary/90 shadow-lg hover:shadow-xl"
              : "bg-base-300 text-base-content/50 cursor-not-allowed"
            }
          `}
        >
          {isSwapping ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="loading loading-spinner loading-sm"></span>
              <span>Swapping...</span>
            </span>
          ) : !coins ? (
            "Enter amount"
          ) : coins < exchangeRate ? (
            `Minimum ${exchangeRate} COIN`
          ) : coins > currentCoins ? (
            "Insufficient balance"
          ) : (
            `Swap ${coins} COIN → ${expectedStars} STAR`
          )}
        </button>
      </div>
    </motion.div>
  );
}