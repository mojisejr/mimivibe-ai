"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { ExchangeHeader } from "@/components/exchange/ExchangeHeader";
import { SwapInterface } from "@/components/exchange/SwapInterface";
import { ExchangeHistory } from "@/components/exchange/ExchangeHistory";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

interface ExchangeSettings {
  coinToCredit: {
    rate: number; // coins per credit
    available: boolean;
  };
}

interface ExchangeData {
  settings: ExchangeSettings;
  history: Array<{
    id: string;
    exchangeType: string;
    coinAmount: number;
    receivedItem: string;
    receivedAmount: number;
    createdAt: string;
    status: string;
  }>;
}

export default function ExchangePage() {
  const { user, isLoaded } = useUser();
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/exchange/settings");
      if (!response.ok) {
        throw new Error(`Failed to fetch exchange data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setExchangeData(result.data);
      } else {
        throw new Error(result.error || "Failed to load exchange data");
      }
    } catch (error) {
      console.error("Exchange data fetch error:", error);
      setError(error instanceof Error ? error.message : "Failed to load exchange data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchExchangeData();
    } else if (isLoaded && !user) {
      setLoading(false);
      setError("Authentication required");
    }
  }, [isLoaded, user]);

  const handleSwap = async (coinAmount: number) => {
    try {
      const response = await fetch("/api/exchange/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exchangeType: "COIN_TO_CREDIT",
          coinAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Swap failed");
      }

      const result = await response.json();
      if (result.success) {
        // Refresh exchange data to show updated balances and history
        await fetchExchangeData();
        return result;
      } else {
        throw new Error(result.error || "Swap failed");
      }
    } catch (error) {
      console.error("Swap error:", error);
      throw error;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <SkeletonLoader type="stats" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-base-content mb-4">
              แลกเปลี่ยนเหรียญ 🪙
            </h1>
            <p className="text-base-content/70">
              กรุณาเข้าสู่ระบบเพื่อแลกเปลี่ยนเหรียญ
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100">
        <UnifiedNavbar />
        <div className="pt-20 px-4 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-base-content mb-4">
              แลกเปลี่ยนเหรียญ 🪙
            </h1>
            <div className="alert alert-error max-w-md mx-auto">
              <span>{error}</span>
            </div>
            <button 
              className="btn btn-primary mt-4"
              onClick={() => fetchExchangeData()}
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <UnifiedNavbar />
      <div className="pt-20 px-4 pb-24 safe-area-bottom">
        <div className="max-w-4xl mx-auto space-y-8">
          <ExchangeHeader />
          
          {exchangeData && (
            <>
              <SwapInterface
                exchangeRate={exchangeData.settings.coinToCredit.rate}
                onSwap={handleSwap}
                onRefresh={fetchExchangeData}
              />
              
              <ExchangeHistory history={exchangeData.history} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}