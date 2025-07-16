'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquare, X, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/ui'

export interface ReviewData {
  accurateLevel: number // 0-100
  comment?: string
}

export interface ReviewModalProps {
  readingId: string | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (reviewData: ReviewData) => Promise<void>
  isSubmitting?: boolean
}

export function ReviewModal({ 
  readingId, 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false 
}: ReviewModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [showAnimation, setShowAnimation] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Rating levels with percentages and descriptions
  const ratingLevels = [
    { value: 0, label: '0%', description: 'ไม่ตรงเลย', emoji: '😞', color: 'text-error' },
    { value: 20, label: '20%', description: 'ตรงเล็กน้อย', emoji: '🙁', color: 'text-warning' },
    { value: 50, label: '50%', description: 'ตรงพอสมควร', emoji: '😐', color: 'text-info' },
    { value: 80, label: '80%', description: 'ตรงมาก', emoji: '😊', color: 'text-success' },
    { value: 100, label: '100%', description: 'ตรงที่สุด', emoji: '🤩', color: 'text-success' }
  ]

  useEffect(() => {
    if (isOpen && readingId) {
      // Reset form
      setSelectedRating(null)
      setComment('')
      setSubmitted(false)
      
      // Trigger animation after modal opens
      const timer = setTimeout(() => {
        setShowAnimation(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShowAnimation(false)
    }
  }, [isOpen, readingId])

  const handleSubmit = async () => {
    if (selectedRating === null) return

    try {
      await onSubmit({
        accurateLevel: selectedRating,
        comment: comment.trim() || undefined
      })
      
      setSubmitted(true)
      
      // Auto close after success animation
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Review submission error:', error)
    }
  }

  const isValid = selectedRating !== null
  const commentLength = comment.length
  const maxCommentLength = 500

  if (!isOpen || !readingId) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-sm bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-success to-success-focus p-8 text-center">
            <div className="animate-bounce">
              <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              ขอบคุณสำหรับรีวิว!
            </h2>
            <p className="text-white/80 text-sm">
              คุณได้รับรางวัล +10 EXP และ +2 เหรียญ
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 btn btn-circle btn-ghost btn-sm"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-secondary p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Logo size="sm" showText={false} variant="white" />
          </div>
          
          <div className={`transition-all duration-1000 ${
            showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            <Star className="w-16 h-16 text-primary-content mx-auto mb-3" />
          </div>
          
          <h2 className="text-xl font-bold text-primary-content mb-2">
            รีวิวการทำนาย
          </h2>
          
          <p className="text-primary-content/80 text-sm">
            การทำนายครั้งนี้ตรงกับความเป็นจริงแค่ไหน?
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating Selection */}
          <div className={`transition-all duration-500 delay-200 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <label className="block text-sm font-medium text-base-content mb-3">
              ระดับความแม่นยำ
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ratingLevels.map((level, index) => (
                <div
                  key={level.value}
                  className={`cursor-pointer p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                    selectedRating === level.value
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
                  }`}
                  onClick={() => setSelectedRating(level.value)}
                >
                  <div className="text-lg mb-1">{level.emoji}</div>
                  <div className={`font-bold text-sm ${level.color}`}>
                    {level.label}
                  </div>
                  <div className="text-xs text-base-content/70 mt-1">
                    {level.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Section */}
          <div className={`transition-all duration-500 delay-300 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <label className="block text-sm font-medium text-base-content mb-2">
              ความคิดเห็นเพิ่มเติม (ไม่บังคับ)
            </label>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))}
                placeholder="แบ่งปันประสบการณ์การทำนายของคุณ..."
                className="textarea textarea-bordered w-full h-24 resize-none"
                disabled={isSubmitting}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-base-content/50">
                  <MessageSquare className="w-3 h-3" />
                  <span>Optional</span>
                </div>
                <div className={`text-xs ${
                  commentLength > maxCommentLength * 0.9 ? 'text-warning' : 'text-base-content/50'
                }`}>
                  {commentLength}/{maxCommentLength}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className={`transition-all duration-500 delay-400 ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className={`btn btn-primary btn-block ${
                isSubmitting ? 'loading' : ''
              }`}
            >
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
            </button>
            
            {!isValid && (
              <p className="text-xs text-error mt-2 text-center">
                กรุณาเลือกระดับความแม่นยำ
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}