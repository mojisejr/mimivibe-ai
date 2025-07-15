'use client'

import { useState, useEffect, useMemo } from 'react'

interface LoadingStateProps {
  question: string
}

export function LoadingState({ question }: LoadingStateProps) {
  const [timer, setTimer] = useState(0)
  const [loadingText, setLoadingText] = useState('ทำใจให้สบาย... แม่หมอกำลังทำนาย')

  const loadingMessages = useMemo(() => [
    'ทำใจให้สบาย... แม่หมอกำลังทำนาย',
    'กำลังสับไพ่อย่างระมัดระวัง...',
    'กำลังเลือกไพ่ที่เหมาะสมกับคุณ...',
    'กำลังอ่านพลังงานจากไพ่ที่จั่วได้...',
    'เกือบเสร็จแล้ว... กำลังตีความหมาย...'
  ], [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingMessages.indexOf(prev)
        const nextIndex = (currentIndex + 1) % loadingMessages.length
        return loadingMessages[nextIndex]
      })
    }, 3000)

    return () => clearInterval(textInterval)
  }, [loadingMessages])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="page-container flex flex-col items-center justify-center px-4 py-8 pt-20 lg:pt-24 bg-gradient-to-br from-base-100 to-base-200">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Question Display */}
        <div className="card card-mystical mb-12 p-6">
          <h2 className="heading-3 text-base-content mb-4">คำถามของคุณ:</h2>
          <p className="body-normal text-neutral-content italic">&ldquo;{question}&rdquo;</p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {/* Spinning cards animation */}
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-spin">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm"></div>
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm"></div>
              </div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm"></div>
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm"></div>
              </div>
            </div>
            
            {/* Center crystal ball */}
            <div className="absolute inset-6 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-full opacity-80 animate-pulse"></div>
          </div>

          {/* Loading Text */}
          <h2 className="heading-2 md:text-3xl text-primary mb-4 transition-opacity duration-300">
            {loadingText}
          </h2>

          {/* Timer */}
          <div className="body-large text-neutral-content mb-8">
            เวลาที่ใช้: <span className="font-mono font-semibold">{formatTime(timer)}</span>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  (timer / 3) % 5 > index 
                    ? 'bg-primary scale-110' 
                    : 'bg-primary/30'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Mystical elements */}
        <div className="text-center text-primary opacity-70">
          <p className="body-small mb-2">✨ จักรวาลกำลังส่งสัญญาณมาถึงคุณ ✨</p>
          <p className="text-xs">กรุณารอสักครู่ ไพ่ของคุณกำลังเผยความลับ...</p>
        </div>
      </div>
    </div>
  )
}