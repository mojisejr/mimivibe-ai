"use client";

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const encouragingMessages = [
  "🌟 กำลังเชื่อมต่อกับพลังจักรวาล...",
  "🔮 แม่หมอมีมี่กำลังสับไพ่ให้คุณ...",
  "✨ กำลังอ่านพลังงานของคุณ...",
  "🌙 กำลังตีความสัญลักษณ์ในไพ่...",
  "💫 กำลังรวบรวมข้อมูลจากดวงดาว...",
  "🎴 กำลังเลือกไพ่ที่เหมาะสมที่สุด...",
  "🌸 กำลังถ่ายทอดพลังบวกให้คุณ...",
  "🦋 กำลังเตรียมคำทำนายพิเศษ..."
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
      {/* Tarot Card Animation */}
      <div className="relative">
        {/* Floating cards */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute w-16 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg border-2 border-gold-400 shadow-lg"
            style={{
              left: `${index * 20 - 20}px`,
              zIndex: 3 - index,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [0, index * 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
          >
            {/* Card back design */}
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="text-gold-300 text-2xl"
              >
                ✦
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Crystal Ball Animation */}
      <motion.div
        className="relative mt-16"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-3xl"
          >
            🔮
          </motion.div>
        </div>
        
        {/* Sparkles around crystal ball */}
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="absolute text-yellow-300 text-sm"
            style={{
              top: `${Math.sin(index * Math.PI / 2) * 40 + 40}px`,
              left: `${Math.cos(index * Math.PI / 2) * 40 + 40}px`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>

      {/* Encouraging Messages */}
      <motion.div
        key={currentMessage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-8"
      >
        <p className="text-purple-200 text-lg font-medium">
          {encouragingMessages[currentMessage]}
        </p>
      </motion.div>

      {/* Progress Dots */}
      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-purple-400"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}