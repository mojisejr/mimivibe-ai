"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";

interface HeroSectionProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
  const [question, setQuestion] = useState("");
  const { data: profileData } = useProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  return (
    <div className="page-container flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-24 bg-gradient-to-br from-base-100 to-base-200">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="heading-1 md:text-5xl text-primary mb-4">
            ไพ่พร้อมแล้ว! 🪄
          </h1>
          <p className="body-large md:text-2xl text-neutral-content mb-8 font-semibold">
            บอกฉันสิ คุณอยากรู้อะไร?
          </p>

          {/* Stars Counter */}
          {profileData?.credits && (
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-2 bg-base-100 rounded-full px-4 py-2 shadow-md border border-primary/20">
                <span className="text-warning">⭐</span>
                <span className="body-small font-medium text-base-content">
                  {profileData.credits.stars}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-base-100 rounded-full px-4 py-2 shadow-md border border-secondary/20">
                <span className="text-secondary">🎁</span>
                <span className="body-small font-medium text-base-content">
                  {profileData.credits.freePoint}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Question Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="เช่น: ความรักของฉันจะเป็นอย่างไรในช่วงนี้..."
              className="textarea textarea-bordered w-full h-32 text-lg resize-none shadow-lg"
              disabled={isLoading}
              maxLength={180}
            />
            <div className="absolute bottom-3 right-3 text-xs text-neutral-content">
              {question.length}/180
            </div>
          </div>

          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="btn btn-mystical w-full mt-6 py-4 px-8 text-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="loading loading-spinner w-5 h-5"></div>
                <span>กำลังเตรียมไพ่...</span>
              </div>
            ) : (
              "เริ่มทำนาย"
            )}
          </button>
        </form>

        {/* Insufficient Credits Warning */}
        {profileData?.credits && !profileData.credits.canRead && (
          <div className="alert alert-warning mt-6">
            <div>
              <span className="body-small">
                คุณไม่มีเครดิตเพียงพอ กรุณาเติมเครดิตหรือใช้ของฟรีประจำวัน
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
