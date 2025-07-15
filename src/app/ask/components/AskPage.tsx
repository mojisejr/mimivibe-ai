'use client'

import { useState } from 'react'
import { ReadingResponse } from '@/types/reading'
import { HeroSection } from './HeroSection'
import { LoadingState } from './LoadingState'
import { ArticleDisplay } from './ArticleDisplay'
import { AutoHideNavbar } from './AutoHideNavbar'

type PageState = 'initial' | 'loading' | 'result' | 'error'

interface ErrorState {
  message: string
  canRetry: boolean
}

export function AskPage() {
  const [pageState, setPageState] = useState<PageState>('initial')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [readingData, setReadingData] = useState<ReadingResponse['data'] | null>(null)
  const [error, setError] = useState<ErrorState | null>(null)

  const handleQuestionSubmit = async (question: string) => {
    setCurrentQuestion(question)
    setPageState('loading')
    setError(null)

    try {
      const response = await fetch('/api/readings/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'การทำนายล้มเหลว')
      }

      if (data.success) {
        setReadingData(data.data)
        setPageState('result')
      } else {
        throw new Error(data.error || 'ไม่สามารถทำนายได้')
      }
    } catch (err) {
      console.error('Reading error:', err)
      setError({
        message: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        canRetry: true
      })
      setPageState('error')
    }
  }

  const handleSaveReading = async () => {
    if (!readingData) return

    try {
      const response = await fetch(`/api/readings/${readingData.readingId}/save`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('ไม่สามารถบันทึกการทำนายได้')
      }

      // Show success feedback (could be a toast notification)
      console.log('Reading saved successfully')
    } catch (err) {
      console.error('Save error:', err)
      // Show error feedback
    }
  }

  const handleDeleteReading = async () => {
    if (!readingData) return

    const confirmed = window.confirm('คุณต้องการลบการทำนายนี้ใช่หรือไม่?')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/readings/${readingData.readingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('ไม่สามารถลบการทำนายได้')
      }

      // Reset to initial state
      handleAskAgain()
    } catch (err) {
      console.error('Delete error:', err)
      // Show error feedback
    }
  }

  const handleAskAgain = () => {
    setPageState('initial')
    setCurrentQuestion('')
    setReadingData(null)
    setError(null)
  }

  const handleRetry = () => {
    if (currentQuestion) {
      handleQuestionSubmit(currentQuestion)
    } else {
      handleAskAgain()
    }
  }

  return (
    <>
      {/* Auto-Hide Navbar */}
      <AutoHideNavbar 
        currentState={pageState === 'error' ? 'initial' : pageState}
        showInStates={['result']}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        {pageState === 'initial' && (
          <HeroSection 
            onSubmit={handleQuestionSubmit}
            isLoading={false}
          />
        )}

        {pageState === 'loading' && (
          <LoadingState question={currentQuestion} />
        )}

        {pageState === 'result' && readingData && (
          <ArticleDisplay
            readingData={readingData}
            onSave={handleSaveReading}
            onDelete={handleDeleteReading}
            onAskAgain={handleAskAgain}
          />
        )}

        {pageState === 'error' && error && (
          <div className="page-container flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-base-100 to-error/10">
            <div className="w-full max-w-md mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">😞</span>
                </div>
                <h2 className="heading-2 text-error mb-4">
                  เกิดข้อผิดพลาด
                </h2>
                <p className="body-normal text-error/80 mb-8">
                  {error.message}
                </p>
              </div>

              <div className="space-y-4">
                {error.canRetry && (
                  <button
                    onClick={handleRetry}
                    className="btn btn-error w-full"
                  >
                    ลองอีกครั้ง
                  </button>
                )}
                <button
                  onClick={handleAskAgain}
                  className="btn btn-neutral w-full"
                >
                  เริ่มใหม่
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}