"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePackages } from "@/hooks/usePackages";

const cardHover = {
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export function PricingCards() {
  const { packages, loading, error } = usePackages();

  if (loading) {
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} variants={fadeInUp}>
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl">
              <div className="card-body text-center p-8">
                <div className="skeleton h-8 w-8 mx-auto mb-6 rounded-full"></div>
                <div className="skeleton h-6 w-32 mx-auto mb-2"></div>
                <div className="skeleton h-8 w-24 mx-auto mb-4"></div>
                <div className="space-y-3 mb-8">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="skeleton h-4 w-full"></div>
                  ))}
                </div>
                <div className="skeleton h-12 w-full"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="alert alert-error max-w-md mx-auto">
          <span>ไม่สามารถโหลดแพ็คเกจได้: {error}</span>
        </div>
      </motion.div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="alert alert-warning max-w-md mx-auto">
          <span>ไม่พบแพ็คเกจในระบบ</span>
        </div>
      </motion.div>
    );
  }

  const getPackageIcon = (index: number) => {
    const icons = ["⭐", "💎", "👑"];
    return icons[index] || "🎁";
  };

  const getPackageStyle = (index: number, isPopular: boolean) => {
    if (isPopular) {
      return "bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary shadow-2xl hover:shadow-3xl";
    }

    const styles = [
      "bg-gradient-to-br from-base-100 to-base-200 border-2 border-neutral/20 shadow-xl hover:shadow-2xl",
      "bg-gradient-to-br from-base-100 to-base-200 border-2 border-primary/20 shadow-xl hover:shadow-2xl",
      "bg-gradient-to-br from-base-100 to-base-200 border-2 border-accent/20 shadow-xl hover:shadow-2xl",
    ];
    return styles[index] || styles[0];
  };

  const getButtonStyle = (index: number, isPopular: boolean) => {
    if (isPopular) {
      return "btn btn-primary w-full shadow-lg";
    }

    const styles = [
      "btn btn-outline btn-primary w-full",
      "btn btn-outline btn-secondary w-full",
      "btn btn-outline btn-accent w-full",
    ];
    return styles[index] || styles[0];
  };

  const getPriceColor = (index: number, isPopular: boolean) => {
    if (isPopular) return "text-primary";

    const colors = ["text-primary", "text-secondary", "text-accent"];
    return colors[index] || colors[0];
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: { staggerChildren: 0.2 },
        },
      }}
    >
      {packages.map((pkg, index) => (
        <motion.div
          key={pkg.id}
          variants={{
            ...fadeInUp,
            ...cardHover,
          }}
          className="group relative"
          whileHover="hover"
        >
          {pkg.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="badge badge-accent badge-lg">ยอดนิยม</div>
            </div>
          )}

          <div
            className={`card ${getPackageStyle(
              index,
              pkg.popular || false
            )} transition-all duration-300`}
          >
            <div className="card-body text-center p-8">
              <div className="mb-6">
                <span className="text-4xl">{getPackageIcon(index)}</span>
              </div>

              <h3 className="text-2xl font-bold text-base-content mb-2">
                {pkg.title}
              </h3>

              <div
                className={`text-3xl font-bold ${getPriceColor(
                  index,
                  pkg.popular || false
                )} mb-4`}
              >
                {pkg.price}฿
              </div>

              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-success mr-2">✓</span>
                  <span>⭐ {pkg.creditAmount} ดาว</span>
                </li>
                <li className="flex items-center">
                  <span className="text-success mr-2">✓</span>
                  <span>🎁 เหรียญโบนัส</span>
                </li>
                <li className="flex items-center">
                  <span className="text-success mr-2">✓</span>
                  <span>📱 ใช้งานได้ทันที</span>
                </li>
                <li className="flex items-center">
                  <span className="text-success mr-2">✓</span>
                  <span>🔮 คำแนะนำจาก AI</span>
                </li>
                {index > 0 && (
                  <li className="flex items-center">
                    <span className="text-success mr-2">✓</span>
                    <span>📋 บันทึกผลการทำนาย</span>
                  </li>
                )}
                {index > 1 && (
                  <li className="flex items-center">
                    <span className="text-success mr-2">✓</span>
                    <span>🔔 การแจ้งเตือนพิเศษ</span>
                  </li>
                )}
              </ul>

              <Link href="/packages">
                <button className={getButtonStyle(index, pkg.popular || false)}>
                  เลือกแพ็คเกจนี้
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
