"use client";

import type { PaymentSummaryStats } from "@/types/payment";

interface PaymentSummaryProps {
  summary: PaymentSummaryStats;
  isLoading?: boolean;
}

export function PaymentSummary({ summary, isLoading = false }: PaymentSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-sm border border-base-300/50">
            <div className="card-body p-4">
              <div className="skeleton h-4 w-16 mb-2"></div>
              <div className="skeleton h-6 w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "ยอดรวมทั้งหมด",
      value: `฿${summary.totalAmount}`,
      icon: "💰",
      color: "text-success"
    },
    {
      title: "ดาวที่ได้รับ",
      value: summary.totalCredits.toLocaleString(),
      icon: "⭐",
      color: "text-warning"
    },
    {
      title: "จำนวนการชำระ",
      value: summary.totalTransactions.toLocaleString(),
      icon: "📊",
      color: "text-info"
    },
    {
      title: "อัตราสำเร็จ",
      value: `${summary.successRate}%`,
      icon: "✅",
      color: "text-primary"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-right">
                <p className="text-xs text-neutral-content">{stat.title}</p>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}