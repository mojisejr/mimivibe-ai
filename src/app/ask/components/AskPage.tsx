"use client";

import { useState } from "react";
import { ReadingResponse } from "@/types/reading";
import { HeroSection } from "./HeroSection";
import { LoadingState } from "./LoadingState";
import { AnimatedArticleDisplay } from "./AnimatedArticleDisplay";
import { UnifiedNavbar } from "@/components/layout/UnifiedNavbar";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { motion } from "framer-motion";
import { mapErrorToEnhanced } from "@/lib/errors/error-mapper";
import { EnhancedError } from "@/types/errors";

type PageState = "initial" | "loading" | "result" | "error";

export function AskPage() {
  const [pageState, setPageState] = useState<PageState>("initial");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [readingData, setReadingData] = useState<
    ReadingResponse["data"] | null
  >(null);
  const [error, setError] = useState<EnhancedError | null>(null);

  const handleQuestionSubmit = async (question: string) => {
    setCurrentQuestion(question);
    setPageState("loading");
    setError(null);

    try {
      const response = await fetch("/api/readings/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        const enhancedError = mapErrorToEnhanced(
          data.error || "การทำนายล้มเหลว",
          { 
            component: "AskPage",
            action: "handleQuestionSubmit",
            url: "/api/readings/ask",
            additionalData: { httpStatus: response.status }
          }
        );
        setError(enhancedError);
        setPageState("error");
        return;
      }

      if (data.success) {
        setReadingData(data.data);
        setPageState("result");
      } else {
        const enhancedError = mapErrorToEnhanced(
          data.error || "ไม่สามารถทำนายได้",
          { 
            component: "AskPage",
            action: "handleQuestionSubmit"
          }
        );
        setError(enhancedError);
        setPageState("error");
      }
    } catch (err) {
      const enhancedError = mapErrorToEnhanced(err, {
        component: "AskPage",
        action: "handleQuestionSubmit"
      });
      setError(enhancedError);
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
        const data = await response.json();
        const enhancedError = mapErrorToEnhanced(
          data.error || "ไม่สามารถบันทึกการทำนายได้",
          { 
            component: "AskPage",
            action: "handleSaveReading",
            url: "/api/readings/save",
            additionalData: { httpStatus: response.status }
          }
        );
        throw enhancedError;
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
      const enhancedError = mapErrorToEnhanced(err, {
        component: "AskPage",
        action: "handleSaveReading"
      });
      setError(enhancedError);
      setPageState("error");
      throw enhancedError;
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
        const data = await response.json();
        const enhancedError = mapErrorToEnhanced(
          data.error || "ไม่สามารถลบการทำนายได้",
          { 
            component: "AskPage",
            action: "handleDeleteReading",
            url: `/api/readings/${readingData.readingId}`,
            additionalData: { httpStatus: response.status }
          }
        );
        throw enhancedError;
      }

      // Reset to initial state
      handleAskAgain();
    } catch (err) {
      const enhancedError = mapErrorToEnhanced(err, {
        component: "AskPage",
        action: "handleDeleteReading"
      });
      setError(enhancedError);
      setPageState("error");
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

            <div className="relative z-10 w-full max-w-md mx-auto">
              <ErrorDisplay
                error={error}
                onRetry={handleRetry}
                onDismiss={handleAskAgain}
                className="mb-8"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
