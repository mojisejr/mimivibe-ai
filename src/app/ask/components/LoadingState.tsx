"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingStateProps {
  question: string;
}

export function LoadingState({ question }: LoadingStateProps) {
  const [timer, setTimer] = useState(0);
  const [loadingText, setLoadingText] = useState(
    "ทำใจให้สบาย... แม่หมอกำลังทำนาย"
  );

  const loadingMessages = useMemo(
    () => [
      "ทำใจให้สบาย... แม่หมอกำลังทำนาย",
      "กำลังสับไพ่อย่างระมัดระวัง...",
      "กำลังหยิบไพ่ที่เหมาะสมกับคุณ...",
      "กำลังอ่านพลังงานจากไพ่ที่หยิบได้...",
      "เกือบเสร็จแล้ว... กำลังตีความหมาย...",
    ],
    []
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setLoadingText((prev) => {
        const currentIndex = loadingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 3000);

    return () => clearInterval(textInterval);
  }, [loadingMessages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-24 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-base-100 via-base-200 to-base-300"></div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-secondary/20 rounded-full blur-lg"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Question Display with Glassmorphism */}
        <motion.div
          className="mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-primary/20 p-8">
            <h2 className="text-2xl font-bold text-primary mb-4">
              🔮 คำถามของคุณ:
            </h2>
            <p className="text-lg text-neutral-content italic leading-relaxed">
              &ldquo;{question}&rdquo;
            </p>
          </div>
        </motion.div>

        {/* Enhanced Loading Animation */}
        <motion.div
          className="mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <div className="relative w-40 h-40 mx-auto mb-8">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 border-4 border-primary/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Middle ring */}
            <motion.div
              className="absolute inset-4 border-4 border-secondary/30 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            {/* Spinning cards animation */}
            <motion.div
              className="absolute inset-8 border-4 border-accent/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute top-2 left-1/2 transform -translate-x-1/2"
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-8 h-10 bg-gradient-to-b from-primary to-secondary rounded-md shadow-lg border border-primary/30"></div>
              </motion.div>
              <motion.div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                animate={{
                  rotateY: [180, 360, 540],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="w-8 h-10 bg-gradient-to-b from-secondary to-accent rounded-md shadow-lg border border-secondary/30"></div>
              </motion.div>
              <motion.div
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
                animate={{
                  rotateY: [360, 540, 720],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="w-8 h-10 bg-gradient-to-b from-accent to-primary rounded-md shadow-lg border border-accent/30"></div>
              </motion.div>
              <motion.div
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                animate={{
                  rotateY: [540, 720, 900],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              >
                <div className="w-8 h-10 bg-gradient-to-b from-primary to-secondary rounded-md shadow-lg border border-primary/30"></div>
              </motion.div>
            </motion.div>

            {/* Center crystal ball with enhanced glow */}
            <motion.div
              className="absolute inset-12 bg-gradient-to-br from-primary/60 to-secondary/60 rounded-full shadow-2xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  "0 0 20px rgba(98, 156, 107, 0.5)",
                  "0 0 40px rgba(98, 156, 107, 0.8)",
                  "0 0 20px rgba(98, 156, 107, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Inner glow */}
            <motion.div
              className="absolute inset-16 bg-gradient-to-br from-white/30 to-transparent rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Loading Text with enhanced styling */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={loadingText}
              className="text-2xl md:text-3xl font-bold text-primary mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {loadingText}
            </motion.h2>
          </AnimatePresence>

          {/* Enhanced Timer */}
          <motion.div
            className="text-lg text-neutral-content mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            เวลาที่ใช้:{" "}
            <motion.span
              className="font-mono font-bold text-primary bg-base-100/80 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {formatTime(timer)}
            </motion.span>
          </motion.div>

          {/* Enhanced Progress dots */}
          <div className="flex justify-center space-x-3 mb-8">
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                className={`w-4 h-4 rounded-full ${
                  (timer / 3) % 5 > index
                    ? "bg-gradient-to-r from-primary to-secondary"
                    : "bg-primary/30"
                }`}
                animate={{
                  scale: (timer / 3) % 5 > index ? [1, 1.3, 1] : 1,
                  opacity: (timer / 3) % 5 > index ? [0.7, 1, 0.7] : 0.3,
                  boxShadow:
                    (timer / 3) % 5 > index
                      ? [
                          "0 0 5px rgba(98, 156, 107, 0.5)",
                          "0 0 15px rgba(98, 156, 107, 0.8)",
                          "0 0 5px rgba(98, 156, 107, 0.5)",
                        ]
                      : "none",
                }}
                transition={{
                  duration: 0.6,
                  repeat: (timer / 3) % 5 > index ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Enhanced Mystical elements */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.p
            className="text-lg text-primary font-semibold mb-3"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨ จักรวาลกำลังส่งสัญญาณมาถึงคุณ ✨
          </motion.p>
          <motion.p
            className="text-base text-neutral-content"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            กรุณารอสักครู่ ไพ่ของคุณกำลังเผยความลับ...
          </motion.p>

          {/* Additional mystical elements */}
          <motion.div
            className="flex justify-center space-x-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              🌙
            </motion.span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl"
            >
              ⭐
            </motion.span>
            <motion.span
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="text-2xl"
            >
              🔮
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
