"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  initialQuestion?: string;
}

export function HeroSection({
  onSubmit,
  isLoading,
  initialQuestion = "",
}: HeroSectionProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const { data: profileData } = useProfile();

  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-24 overflow-hidden">
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
        <motion.div
          className="mb-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Title Section */}
          <motion.div className="mb-12" variants={fadeInUp}>
            <h1 className="text-4xl md:text-4xl lg:text-6xl font-bold mb-6 leading-relaxed">
              <span className="text-base-content">ไพ่พร้อมแล้ว 😉</span>
              <br />
              {/* <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                🪄
              </span> */}
            </h1>
            <p className="text-lg md:text-2xl text-neutral-content mb-8 font-semibold leading-relaxed">
              บอกฉันสิ คุณอยากรู้อะไร?
            </p>

            {/* Stars Counter with Glassmorphism */}
            {profileData?.credits && (
              <motion.div
                className="flex items-center justify-center space-x-4 mb-8"
                variants={fadeInUp}
              >
                <div className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-primary/20 hover:shadow-2xl transition-all duration-300">
                  <span className="text-warning text-xl">⭐</span>
                  <span className="font-semibold text-base-content">
                    {profileData.credits.stars}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-base-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-secondary/20 hover:shadow-2xl transition-all duration-300">
                  <span className="text-secondary text-xl">🎁</span>
                  <span className="font-semibold text-base-content">
                    {profileData.credits.freePoint}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Question Input Form with Glassmorphism */}
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-xl mx-auto"
            variants={fadeInUp}
          >
            <div className="relative mb-6">
              <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-primary/20 p-1">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="เช่น: ความรักของฉันจะเป็นอย่างไรในช่วงนี้..."
                  className="textarea w-full h-32 text-lg resize-none bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-neutral-content/60"
                  disabled={isLoading}
                  maxLength={180}
                />
              </div>
              <div className="absolute bottom-4 right-4 text-xs text-neutral-content bg-base-100/80 backdrop-blur-sm rounded-full px-2 py-1">
                {question.length}/180
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="btn btn-lg w-full py-4 px-8 text-lg font-semibold disabled:opacity-50 bg-gradient-to-r from-accent to-accent-focus text-white border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading loading-spinner w-5 h-5"></div>
                  <span>กำลังเตรียมไพ่...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">🔮</span>
                  <span>เริ่มทำนาย</span>
                </div>
              )}
            </motion.button>
          </motion.form>

          {/* Insufficient Credits Warning with Glassmorphism */}
          {profileData?.credits && !profileData.credits.canRead && (
            <motion.div className="mt-6" variants={fadeInUp}>
              <div className="alert alert-warning bg-warning/10 border-2 border-warning/30 backdrop-blur-sm shadow-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-warning text-lg">⚠️</span>
                  <span className="font-medium text-warning-content">
                    คุณไม่มีเครดิตเพียงพอ กรุณาเติมเครดิตหรือใช้ของฟรีประจำวัน
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Suggested Questions */}
          <motion.div className="mt-12" variants={fadeInUp}>
            <p className="text-sm text-neutral-content mb-4">คำถามยอดนิยม:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "ความรักของฉันจะเป็นอย่างไรในช่วงนี้?",
                "งานการเงินจะดีขึ้นไหม?",
                "ฉันควรทำอะไรดีในช่วงนี้?",
                "สิ่งที่รอคอยจะมาถึงเมื่อไหร่?",
              ].map((suggestedQuestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => setQuestion(suggestedQuestion)}
                  className="btn btn-outline btn-sm border-2 border-primary/30 hover:border-primary hover:bg-primary/10 text-left justify-start"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestedQuestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
