"use client";

import { useState } from "react";
import { safeFormatDistanceToNow } from "@/lib/utils/dateUtils";
import type { PaymentHistoryItem } from "@/types/payment";

interface PaymentCardProps {
  payment: PaymentHistoryItem;
  onClick?: () => void;
}

export const PaymentCard = ({ payment, onClick }: PaymentCardProps) => {
  const [copied, setCopied] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return {
          className: "badge-success",
          label: "สำเร็จ",
          emoji: "✅",
        };
      case "failed":
        return {
          className: "badge-error",
          label: "ล้มเหลว",
          emoji: "❌",
        };
      case "pending":
        return {
          className: "badge-warning",
          label: "รอดำเนินการ",
          emoji: "⏳",
        };
      default:
        return {
          className: "badge-neutral",
          label: status,
          emoji: "❓",
        };
    }
  };

  const getPackageEmoji = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("เริ่มต้น") || lowerTitle.includes("starter"))
      return "🌟";
    if (lowerTitle.includes("คุ้มค่า") || lowerTitle.includes("value"))
      return "💎";
    if (lowerTitle.includes("พรีเมียม") || lowerTitle.includes("premium"))
      return "👑";
    return "🎁";
  };

  const copyPaymentId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(payment.stripePaymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy payment ID:", error);
    }
  };

  const statusBadge = getStatusBadge(payment.status);

  return (
    <div
      className={`card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full flex flex-col border border-base-300/50 hover:border-primary/30 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="card-body flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-3">
            <h3 className="font-semibold text-base-content text-sm md:text-base leading-tight">
              {payment.pack.title}
            </h3>
            {payment.pack.subtitle && (
              <p className="text-xs text-neutral-content mt-1">
                {payment.pack.subtitle}
              </p>
            )}
          </div>
          <div className="text-xl md:text-2xl flex-shrink-0 bg-primary/10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center">
            {getPackageEmoji(payment.pack.title)}
          </div>
        </div>

        {/* Amount and Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg md:text-xl font-bold text-primary">
              ฿{payment.amountDisplay}
            </span>
            <span className="text-xs text-neutral-content">
              ({payment.currency.toUpperCase()})
            </span>
          </div>
          <div className={`badge ${statusBadge.className} badge-sm gap-1`}>
            <span>{statusBadge.emoji}</span>
            <span className="text-xs">{statusBadge.label}</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center mb-4">
          <p className="text-xs text-neutral-content flex items-center">
            <span className="mr-1">🕐</span>
            {safeFormatDistanceToNow(payment.createdAt, "ไม่ทราบวันที่")}
          </p>
        </div>

        {/* Payment Details */}
        <div className="space-y-3 text-sm mb-4">
          <div>
            <p className="text-xs text-neutral-content mb-1">เครดิตที่ได้รับ</p>
            <div className="flex items-center space-x-1">
              <span className="text-warning">⭐</span>
              <span className="font-semibold">{payment.creditsAdded}</span>
              <span className="text-xs text-neutral-content">ดาว</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-neutral-content mb-1">Payment ID</p>
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-base-200 p-2 rounded transition-colors border border-base-300/30"
              onClick={copyPaymentId}
              title={copied ? "คัดลอกแล้ว!" : "คลิกเพื่อคัดลอก"}
            >
              <span className="text-xs font-mono text-neutral-content truncate mr-2 flex-1 min-w-0">
                {payment.stripePaymentId}
              </span>
              <span className="text-xs flex-shrink-0">
                {copied ? "✅" : "📋"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
