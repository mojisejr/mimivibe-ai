"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastContainer";
import { useProfile } from "@/hooks/useProfile";

interface ExchangeSettings {
  coinToStar: {
    rate: number;
    available: boolean;
  };
  coinToCredit: {
    rate: number;
    available: boolean;
  };
}

interface CoinExchangePanelProps {
  settings: ExchangeSettings;
  onExchange: (exchangeType: string, coinAmount: number) => Promise<any>;
  onRefresh: () => Promise<void>;
}

export function CoinExchangePanel({ 
  settings, 
  onExchange,
  onRefresh 
}: CoinExchangePanelProps) {
  const { data: profileData } = useProfile();
  const [selectedExchange, setSelectedExchange] = useState<"star" | "credit" | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [exchanging, setExchanging] = useState(false);
  const { addToast } = useToast();

  const currentCoins = profileData?.stats.totalCoins || 0;

  const calculateReceived = (type: "star" | "credit", coins: number): number => {
    if (type === "star") {
      return Math.floor(coins / settings.coinToStar.rate);
    } else {
      return Math.floor(coins / settings.coinToCredit.rate);
    }
  };

  const getMaxCoins = (type: "star" | "credit"): number => {
    const rate = type === "star" ? settings.coinToStar.rate : settings.coinToCredit.rate;
    return Math.floor(currentCoins / rate) * rate;
  };

  const handleExchange = async () => {
    if (!selectedExchange || coinAmount <= 0) return;

    const rate = selectedExchange === "star" ? settings.coinToStar.rate : settings.coinToCredit.rate;
    
    if (coinAmount < rate) {
      addToast({
        type: "warning",
        message: `ต้องใช้เหรียญอย่างน้อย ${rate} เหรียญ ⚠️`,
        duration: 3000,
      });
      return;
    }

    if (coinAmount > currentCoins) {
      addToast({
        type: "error",
        message: "เหรียญไม่เพียงพอ ❌",
        duration: 3000,
      });
      return;
    }

    try {
      setExchanging(true);
      const exchangeType = selectedExchange === "star" ? "COIN_TO_STAR" : "COIN_TO_CREDIT";
      const result = await onExchange(exchangeType, coinAmount);
      
      if (result.success) {
        const received = calculateReceived(selectedExchange, coinAmount);
        const itemName = selectedExchange === "star" ? "ดาว" : "เครดิต";
        const icon = selectedExchange === "star" ? "⭐" : "🎁";
        
        addToast({
          type: "success",
          message: `แลกเปลี่ยนสำเร็จ! ได้ ${received} ${itemName} 🎉 ${icon}`,
          duration: 4000,
        });
        
        // Reset form
        setCoinAmount(0);
        setSelectedExchange(null);
        
        // Refresh data
        await onRefresh();
      }
    } catch (error) {
      console.error("Exchange error:", error);
      addToast({
        type: "error",
        message: "ไม่สามารถแลกเปลี่ยนได้ กรุณาลองใหม่ ❌",
        duration: 3000,
      });
    } finally {
      setExchanging(false);
    }
  };

  const quickAmounts = selectedExchange ? [
    settings[selectedExchange === "star" ? "coinToStar" : "coinToCredit"].rate,
    settings[selectedExchange === "star" ? "coinToStar" : "coinToCredit"].rate * 5,
    settings[selectedExchange === "star" ? "coinToStar" : "coinToCredit"].rate * 10,
    getMaxCoins(selectedExchange)
  ].filter(amount => amount <= currentCoins && amount > 0) : [];

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Exchange Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-base-content text-center">
          เลือกประเภทการแลกเปลี่ยน
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coin to Star */}
          <motion.div
            variants={itemVariants}
            className={`
              p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
              ${selectedExchange === "star" 
                ? "border-accent bg-accent/10" 
                : "border-base-300 bg-base-100 hover:border-accent/50"
              }
              ${!settings.coinToStar.available ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => settings.coinToStar.available && setSelectedExchange("star")}
          >
            <div className="text-center space-y-3">
              <div className="text-4xl">⭐</div>
              <h3 className="text-lg font-bold text-base-content">แลกดาว</h3>
              <div className="text-sm text-base-content/70">
                {settings.coinToStar.rate} เหรียญ = 1 ดาว
              </div>
              <div className="text-xs text-accent font-medium">
                สำหรับทำนายไพ่
              </div>
              {!settings.coinToStar.available && (
                <div className="text-xs text-error">ไม่พร้อมใช้งาน</div>
              )}
            </div>
          </motion.div>

          {/* Coin to Credit */}
          <motion.div
            variants={itemVariants}
            className={`
              p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
              ${selectedExchange === "credit" 
                ? "border-primary bg-primary/10" 
                : "border-base-300 bg-base-100 hover:border-primary/50"
              }
              ${!settings.coinToCredit.available ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => settings.coinToCredit.available && setSelectedExchange("credit")}
          >
            <div className="text-center space-y-3">
              <div className="text-4xl">🎁</div>
              <h3 className="text-lg font-bold text-base-content">แลกเครดิต</h3>
              <div className="text-sm text-base-content/70">
                {settings.coinToCredit.rate} เหรียญ = 1 เครดิต
              </div>
              <div className="text-xs text-primary font-medium">
                สำหรับทำนายไพ่ฟรี
              </div>
              {!settings.coinToCredit.available && (
                <div className="text-xs text-error">ไม่พร้อมใช้งาน</div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Exchange Form */}
      {selectedExchange && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-base-100 rounded-2xl p-6 border border-base-300 space-y-6"
        >
          <div className="text-center">
            <h3 className="text-lg font-bold text-base-content mb-2">
              แลกเปลี่ยน{selectedExchange === "star" ? "ดาว" : "เครดิต"}
            </h3>
            <div className="text-sm text-base-content/70">
              คุณมีเหรียญ {currentCoins} เหรียญ
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-base-content mb-2">
                จำนวนเหรียญที่ต้องการแลก
              </label>
              <input
                type="number"
                min="0"
                max={currentCoins}
                step={selectedExchange === "star" ? settings.coinToStar.rate : settings.coinToCredit.rate}
                value={coinAmount || ""}
                onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                className="input input-bordered w-full text-center text-lg"
                placeholder="0"
              />
            </div>

            {/* Quick Amount Buttons */}
            {quickAmounts.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-base-content/70 text-center">เลือกจำนวนด่วน</div>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amount, index) => (
                    <button
                      key={index}
                      className="btn btn-outline btn-sm"
                      onClick={() => setCoinAmount(amount)}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Exchange Preview */}
            {coinAmount > 0 && (
              <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/70">จ่าย:</span>
                  <span className="font-bold text-secondary">{coinAmount} 🪙</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-base-content/70">ได้รับ:</span>
                  <span className="font-bold text-primary">
                    {calculateReceived(selectedExchange, coinAmount)} {selectedExchange === "star" ? "⭐" : "🎁"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Exchange Button */}
          <div className="flex space-x-3">
            <button
              className="btn btn-ghost flex-1"
              onClick={() => {
                setSelectedExchange(null);
                setCoinAmount(0);
              }}
            >
              ยกเลิก
            </button>
            <button
              className="btn btn-primary flex-1"
              onClick={handleExchange}
              disabled={!coinAmount || coinAmount <= 0 || exchanging || 
                       coinAmount < (selectedExchange === "star" ? settings.coinToStar.rate : settings.coinToCredit.rate)}
            >
              {exchanging ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "แลกเปลี่ยน"
              )}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}