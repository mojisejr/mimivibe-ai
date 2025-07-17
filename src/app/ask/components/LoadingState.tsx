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
      className="page-container flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-24 bg-gradient-to-br from-base-100 to-base-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Question Display */}
        <motion.div 
          className="card card-mystical mb-12 p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="heading-3 text-base-content mb-4">คำถามของคุณ:</h2>
          <p className="body-normal text-neutral-content italic">
            &ldquo;{question}&rdquo;
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Spinning cards animation */}
            <motion.div 
              className="absolute inset-0 border-4 border-primary/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <motion.div 
                className="absolute top-2 left-1/2 transform -translate-x-1/2"
                animate={{ 
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm shadow-lg"></div>
              </motion.div>
              <motion.div 
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                animate={{ 
                  rotateY: [180, 360, 540],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm shadow-lg"></div>
              </motion.div>
              <motion.div 
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
                animate={{ 
                  rotateY: [360, 540, 720],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm shadow-lg"></div>
              </motion.div>
              <motion.div 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                animate={{ 
                  rotateY: [540, 720, 900],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm shadow-lg"></div>
              </motion.div>
            </motion.div>

            {/* Center crystal ball */}
            <motion.div 
              className="absolute inset-6 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-full opacity-80"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Loading Text */}
          <AnimatePresence mode="wait">
            <motion.h2 
              key={loadingText}
              className="heading-2 md:text-3xl text-primary mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {loadingText}
            </motion.h2>
          </AnimatePresence>

          {/* Timer */}
          <motion.div 
            className="body-large text-neutral-content mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            เวลาที่ใช้:{" "}
            <motion.span 
              className="font-mono font-semibold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {formatTime(timer)}
            </motion.span>
          </motion.div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  (timer / 3) % 5 > index
                    ? "bg-primary"
                    : "bg-primary/30"
                }`}
                animate={{ 
                  scale: (timer / 3) % 5 > index ? [1, 1.2, 1] : 1,
                  opacity: (timer / 3) % 5 > index ? [0.7, 1, 0.7] : 0.3
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: (timer / 3) % 5 > index ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Mystical elements */}
        <motion.div 
          className="text-center text-primary opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.p 
            className="body-small mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            ✨ จักรวาลกำลังส่งสัญญาณมาถึงคุณ ✨
          </motion.p>
          <motion.p 
            className="text-xs"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            กรุณารอสักครู่ ไพ่ของคุณกำลังเผยความลับ...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
