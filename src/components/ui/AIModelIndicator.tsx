"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AIModelIndicatorProps {
  className?: string;
}

interface ModelInfo {
  provider: string;
  model: string;
  displayName: string;
  emoji: string;
}

export function AIModelIndicator({ className = "" }: AIModelIndicatorProps) {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูล AI model ที่ใช้งานอยู่
    const fetchModelInfo = async () => {
      try {
        // ดึงจาก environment variables
        const defaultProvider =
          process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER || "openai";
        const fallbackProvider =
          process.env.NEXT_PUBLIC_AI_PROVIDER_FALLBACK || "gemini";

        // กำหนดข้อมูล model ตาม provider และ actual model configuration
        const providerInfo: Record<string, ModelInfo> = {
          openai: {
            provider: "openai",
            model: "GPT-4O Mini",
            displayName: "GPT-4O Mini",
            emoji: "🤖",
          },
          gemini: {
            provider: "gemini",
            model: "Gemini 2.5 Flash",
            displayName: "Gemini 2.5",
            emoji: "✨",
          },
        };

        // ใช้ default provider หรือ fallback
        const currentModel =
          providerInfo[defaultProvider] ||
          providerInfo[fallbackProvider] ||
          providerInfo.openai;
        setModelInfo(currentModel);
      } catch (error) {
        console.error("Error fetching model info:", error);
        // Fallback to default
        setModelInfo({
          provider: "openai",
          model: "GPT-4O Mini",
          displayName: "GPT-4O Mini",
          emoji: "🤖",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center space-x-2 ${className}`}
      >
        <div className="skeleton h-6 w-20 rounded-full"></div>
      </div>
    );
  }

  if (!modelInfo) {
    return null;
  }

  return (
    <motion.div
      className={`flex items-center justify-center space-x-2 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center space-x-2 bg-base-100/60 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-base-300/50 hover:border-primary/20 transition-all duration-200">
        <span className="text-xs text-primary">{modelInfo.emoji}</span>
        <span className="text-xs font-medium text-base-content/70">
          {modelInfo.displayName}
        </span>
        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );
}
