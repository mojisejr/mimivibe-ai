"use client";

import { useState } from "react";
import { ReadingResponse } from "@/types/reading";
import { HeroSection } from "./HeroSection";
import { LoadingState } from "./LoadingState";
import { AnimatedArticleDisplay } from "./AnimatedArticleDisplay";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { motion } from "framer-motion";
import { useErrorHandler, ProcessedError } from "@/hooks/useErrorHandler";
import { useTranslation } from "@/lib/i18n";

type PageState = "initial" | "loading" | "result" | "error";

interface ErrorState {
  title: string;
  message: string;
  suggestion?: string;
  canRetry: boolean;
  validationReason?: string;
  isValid?: boolean;
}

export function AskPage() {
  const { locale: currentLocale } = useTranslation();
  const [pageState, setPageState] = useState<PageState>("initial");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [readingData, setReadingData] = useState<
    ReadingResponse["data"] | null
  >(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const { processReadingError } = useErrorHandler();

  const handleQuestionSubmit = async (question: string) => {
    setCurrentQuestion(question);
    setPageState("loading");
    setError(null);

    let response: Response | undefined;
    try {
      response = await fetch("/api/readings/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, language: currentLocale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "การทำนายล้มเหลว");
      }

      if (data.success) {
        setReadingData(data.data);
        setPageState("result");
      } else {
        // Handle validation errors separately (isValid: false)
        if (data.isValid === false && data.validationReason) {
          setError({
            title: "เกิดข้อผิดพลาดของระบบ",
            message: data.validationReason,
            suggestion: "หากปัญหายังคงอยู่ กรุณาลองใหม่อีกครั้ง",
            canRetry: true,
            validationReason: data.validationReason,
            isValid: false,
          });
          setPageState("error");
          return;
        }
        
        // Handle other system errors
        throw new Error(data.error || "ไม่สามารถทำนายได้");
      }
    } catch (err) {
      console.error("Reading error:", err);
      const processedError = processReadingError(err, response);
      setError({
        title: processedError.title,
        message: processedError.message,
        suggestion: processedError.suggestion,
        canRetry: processedError.canRetry,
        validationReason: processedError.validationReason,
        isValid: processedError.isValid,
      });
      setPageState("error");
    }
  };

  const handleSaveReading = async () => {
    if (!readingData) return;

    try {
      const response = await fetch("/api/readings/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          readingId: readingData.readingId,
          question: readingData.question,
          answer: readingData.reading,
          selectedCards: readingData.selectedCards,
          transactionId: readingData.transactionId,
        }),
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถบันทึกการทำนายได้");
      }

      const result = await response.json();
      
      // Update reading data with permanent ID and saved status
      setReadingData(prev => prev ? {
        ...prev,
        readingId: result.data.readingId,
        isSaved: true,
        createdAt: result.data.createdAt
      } : null);

      // Show success feedback (could be a toast notification)
      // Reading saved successfully
    } catch (err) {
      console.error("Save error:", err);
      // Show error feedback
      throw err;
    }
  };

  const handleDeleteReading = async () => {
    if (!readingData) return;

    const confirmed = window.confirm("คุณต้องการลบการทำนายนี้ใช่หรือไม่?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/readings/${readingData.readingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถลบการทำนายได้");
      }

      // Reset to initial state
      handleAskAgain();
    } catch (err) {
      console.error("Delete error:", err);
      // Show error feedback
    }
  };

  const handleAskAgain = () => {
    setPageState("initial");
    setCurrentQuestion("");
    setReadingData(null);
    setError(null);
  };

  const handleQuestionClick = (question: string) => {
    setCurrentQuestion(question);
    setPageState("initial");
    setReadingData(null);
    setError(null);
    // Auto-submit the question after a short delay to show the question was filled
    setTimeout(() => {
      handleQuestionSubmit(question);
    }, 100);
  };

  const handleRetry = () => {
    // Reset all workflow state
    setPageState("initial");
    setReadingData(null);
    setError(null);
    
    // Restart with current question
    if (currentQuestion) {
      handleQuestionSubmit(currentQuestion);
    } else {
      handleAskAgain();
    }
  };

  return (
    <>
      {/* Auto-Hide Navbar */}
      <UnifiedNavbar
        autoHide={true}
        currentState={pageState === "error" ? "initial" : pageState}
        showInStates={["initial", "loading", "result"]}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        {pageState === "initial" && (
          <HeroSection
            onSubmit={handleQuestionSubmit}
            isLoading={false}
            initialQuestion={currentQuestion}
          />
        )}

        {pageState === "loading" && <LoadingState question={currentQuestion} />}

        {pageState === "result" && readingData && (
          <AnimatedArticleDisplay
            readingData={readingData}
            onSave={handleSaveReading}
            onDelete={handleDeleteReading}
            onAskAgain={handleAskAgain}
            onQuestionClick={handleQuestionClick}
          />
        )}

        {pageState === "error" && error && (
          <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-24 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-base-100 via-base-200 to-error/5"></div>

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute top-20 left-10 w-20 h-20 bg-error/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl"
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
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto text-center">
              <motion.div
                className="mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="bg-base-100/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-error/20 p-8">
                  <motion.div
                    className="w-24 h-24 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <span className="text-4xl">😞</span>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-error mb-4">
                    {error.title}
                  </h2>
                  <p className="text-lg text-error/80 mb-6 leading-relaxed">
                    {error.message}
                  </p>
                  {error.isValid === false && error.validationReason && (
                    <div className="mb-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                      <p className="text-sm font-medium text-warning mb-2">
                        🔍 เหตุผลที่คำถามไม่เหมาะสม:
                      </p>
                      <p className="text-sm text-warning/80 leading-relaxed">
                        {error.validationReason}
                      </p>
                    </div>
                  )}
                  {error.suggestion && (
                    <p className="text-sm text-base-content/60 mb-8 leading-relaxed bg-base-200/50 p-3 rounded-lg">
                      💡 {error.suggestion}
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {error.canRetry && (
                  <motion.button
                    onClick={handleRetry}
                    className="btn btn-lg w-full bg-gradient-to-r from-error to-error-focus text-white border-0 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl mr-2">🔄</span>
                    <span>ลองอีกครั้ง</span>
                  </motion.button>
                )}
                <motion.button
                  onClick={handleAskAgain}
                  className="btn btn-outline btn-lg w-full border-2 border-primary/30 hover:border-primary hover:bg-primary/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg mr-2">🏠</span>
                  <span>เริ่มใหม่</span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
