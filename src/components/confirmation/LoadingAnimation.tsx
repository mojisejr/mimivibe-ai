"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const encouragingMessages = [
  "🌟 กำลังเชื่อมต่อกับพลังจักรวาล...",
  "🔮 แม่หมอมีมี่กำลังสับไพ่ให้คุณ...",
  "✨ กำลังอ่านพลังงานของคุณ...",
  "🌙 กำลังตีความสัญลักษณ์ในไพ่...",
  "💫 กำลังรวบรวมข้อมูลจากดวงดาว...",
  "🎴 กำลังเลือกไพ่ที่เหมาะสมที่สุด...",
  "🌸 กำลังถ่ายทอดพลังบวกให้คุณ...",
  "🦋 กำลังเตรียมคำทำนายพิเศษ...",
];

export function LoadingAnimation() {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % encouragingMessages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Floating Tarot Cards */}
      <div className="relative h-20 mb-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-12 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg border border-accent"
            style={{
              left: `${30 + i * 20}%`,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <div className="absolute inset-1 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-md flex items-center justify-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="text-accent text-2xl"
              >
                ✦
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Crystal Ball Animation */}
      {/*<motion.div
        className="relative mt-16"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 backdrop-blur-sm border border-base-100/20 flex items-center justify-center">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-3xl"
          >
            🔮
          </motion.div>
        </div> */}

      {/* Sparkles around crystal ball */}
      {/*{[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="absolute text-accent text-sm"
            style={{
              top: `${Math.sin((index * Math.PI) / 2) * 40 + 40}px`,
              left: `${Math.cos((index * Math.PI) / 2) * 40 + 40}px`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>*/}

      {/* Encouraging Message */}
      <motion.div
        key={currentMessage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-accent text-lg font-medium">
          {encouragingMessages[currentMessage]}
        </p>
      </motion.div>

      {/* Progress Dots */}
      {/*<div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>}*/}
    </div>
  );
}
