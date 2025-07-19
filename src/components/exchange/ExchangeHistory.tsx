"use client";

import { motion } from "framer-motion";

interface ExchangeHistoryItem {
  id: string;
  exchangeType: string;
  coinAmount: number;
  receivedItem: string;
  receivedAmount: number;
  createdAt: string;
  status: string;
}

interface ExchangeHistoryProps {
  history: ExchangeHistoryItem[];
}

export function ExchangeHistory({ history }: ExchangeHistoryProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExchangeIcon = (exchangeType: string): string => {
    switch (exchangeType) {
      case "COIN_TO_STAR":
        return "⭐";
      case "COIN_TO_CREDIT":
        return "🎁";
      default:
        return "🔄";
    }
  };

  const getExchangeTitle = (exchangeType: string): string => {
    switch (exchangeType) {
      case "COIN_TO_STAR":
        return "แลกดาว";
      case "COIN_TO_CREDIT":
        return "แลกเครดิต";
      default:
        return "แลกเปลี่ยน";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "text-success";
      case "pending":
        return "text-warning";
      case "failed":
        return "text-error";
      default:
        return "text-base-content/70";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "สำเร็จ";
      case "pending":
        return "รอดำเนินการ";
      case "failed":
        return "ไม่สำเร็จ";
      default:
        return status;
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  if (history.length === 0) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">📜</div>
        <h3 className="text-xl font-bold text-base-content mb-2">
          ยังไม่มีประวัติการแลกเปลี่ยน
        </h3>
        <p className="text-base-content/70">
          เมื่อคุณแลกเปลี่ยนเหรียญ ประวัติจะแสดงที่นี่
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-base-content mb-2">
          📜 ประวัติการแลกเปลี่ยน
        </h2>
        <p className="text-base-content/70">
          ประวัติการแลกเปลี่ยนเหรียญของคุณ
        </p>
      </div>

      {/* History Stats */}
      <div className="bg-gradient-to-r from-info/10 to-success/10 rounded-2xl p-6 border border-info/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-info">
              {history.filter(h => h.status === "completed").length}
            </div>
            <div className="text-sm text-base-content/70">ทำรายการสำเร็จ</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">
              {history.filter(h => h.exchangeType === "COIN_TO_STAR").length}
            </div>
            <div className="text-sm text-base-content/70">แลกดาว</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {history.filter(h => h.exchangeType === "COIN_TO_CREDIT").length}
            </div>
            <div className="text-sm text-base-content/70">แลกเครดิต</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">
              {history.reduce((sum, h) => sum + h.coinAmount, 0)}
            </div>
            <div className="text-sm text-base-content/70">เหรียญที่ใช้</div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="bg-base-100 rounded-xl p-4 border border-base-300 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Exchange Icon */}
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{getExchangeIcon(item.exchangeType)}</span>
                </div>

                {/* Exchange Details */}
                <div>
                  <h3 className="font-bold text-base-content">
                    {getExchangeTitle(item.exchangeType)}
                  </h3>
                  <div className="text-sm text-base-content/70">
                    {formatDate(item.createdAt)}
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </div>
                </div>
              </div>

              {/* Exchange Amounts */}
              <div className="text-right">
                <div className="text-sm text-base-content/70">จ่าย</div>
                <div className="font-bold text-secondary">
                  -{item.coinAmount} 🪙
                </div>
                <div className="text-sm text-base-content/70 mt-1">ได้</div>
                <div className="font-bold text-primary">
                  +{item.receivedAmount} {getExchangeIcon(item.exchangeType)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More (for future implementation) */}
      {history.length >= 10 && (
        <div className="text-center">
          <button className="btn btn-outline">
            โหลดเพิ่มเติม
          </button>
        </div>
      )}
    </motion.div>
  );
}