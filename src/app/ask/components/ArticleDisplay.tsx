'use client'

import { useState } from 'react'
import { ReadingResponse } from '@/types/reading'

interface ArticleDisplayProps {
  readingData: ReadingResponse['data']
  onSave?: () => void
  onDelete?: () => void
  onAskAgain?: () => void
}

export function ArticleDisplay({ readingData, onSave, onDelete, onAskAgain }: ArticleDisplayProps) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    onSave?.()
    setIsSaved(true)
  }

  return (
    <div className="page-container bg-base-200">
      <div className="content-container">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="mb-6">
            <h1 className="heading-1 md:text-4xl text-base-content mb-4 leading-tight">
              {readingData.reading.header}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto"></div>
          </div>
          
          {/* Question */}
          <div className="max-w-2xl mx-auto mb-8">
            <p className="body-large text-neutral-content italic border-l-4 border-primary/30 pl-4">
              &ldquo;{readingData.question}&rdquo;
            </p>
          </div>

          {/* Reading Meta Info */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="badge badge-primary gap-2">
              <span>🔮</span>
              <span>แม่หมอมีมี่</span>
            </div>
            <div className="badge badge-secondary gap-2">
              <span>📅</span>
              <span>{new Date(readingData.createdAt).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="badge badge-accent gap-2">
              <span>🃏</span>
              <span>{readingData.cards.length} ใบ</span>
            </div>
          </div>
        </header>

        {/* Cards Section */}
        <section className="mb-12">
          <h2 className="heading-2 text-base-content mb-8 text-center">ไพ่ที่จั่วได้</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-3xl mx-auto">
            {readingData.cards.map((card, index) => (
              <div key={card.id} className="text-center">
                <div className="relative group mb-4">
                  <div className="card card-mystical w-full aspect-[2/3] overflow-hidden transition-transform duration-300 group-hover:scale-105 p-0">
                    <img
                      src={card.imageUrl}
                      alt={card.displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/cards/card-back.jpg'
                      }}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-content text-sm font-semibold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-base-content body-small mb-2">{card.displayName}</h3>
                <p className="text-xs text-neutral-content">{card.shortMeaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Reading Content */}
        <article className="max-w-3xl mx-auto">
          {/* Main Reading */}
          <section className="prose prose-lg max-w-none mb-12">
            <div className="card card-mystical p-8">
              <h2 className="heading-2 text-base-content mb-6">การทำนาย</h2>
              <div className="body-normal text-base-content leading-relaxed whitespace-pre-line">
                {readingData.reading.reading}
              </div>
            </div>
          </section>

          {/* Suggestions */}
          {readingData.reading.suggestions && readingData.reading.suggestions.length > 0 && (
            <section className="mb-12">
              <div className="alert alert-info p-8">
                <div className="w-full">
                  <h2 className="heading-2 text-info-content mb-6">คำแนะนำ</h2>
                  <ul className="space-y-4">
                    {readingData.reading.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-info text-info-content text-sm rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </span>
                        <span className="body-normal text-info-content leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Final Message */}
          {readingData.reading.final && (
            <section className="mb-12">
              <div className="alert alert-success p-8">
                <div className="w-full">
                  <h2 className="heading-2 text-success-content mb-6">ข้อสรุป</h2>
                  <div className="body-normal text-success-content leading-relaxed whitespace-pre-line">
                    {readingData.reading.final}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* End Message */}
          {readingData.reading.end && (
            <section className="mb-12">
              <div className="card card-mystical p-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="body-normal text-base-content leading-relaxed">
                  {readingData.reading.end}
                </div>
              </div>
            </section>
          )}

          {/* Notice */}
          {readingData.reading.notice && (
            <section className="mb-12">
              <div className="alert alert-warning p-6">
                <div className="w-full">
                  <h3 className="heading-3 mb-3 text-warning-content">หมายเหตุ</h3>
                  <p className="body-normal text-warning-content leading-relaxed">{readingData.reading.notice}</p>
                </div>
              </div>
            </section>
          )}

          {/* Rewards */}
          {readingData.rewards && (
            <section className="mb-12">
              <div className="alert alert-success p-6">
                <div className="w-full">
                  <h3 className="heading-3 mb-4 text-center text-success-content">รางวัลที่ได้รับ</h3>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="text-warning-content text-xl">⭐</span>
                      </div>
                      <div className="body-small text-success-content font-medium">+{readingData.rewards.exp} EXP</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-2 mx-auto">
                        <span className="text-accent-content text-xl">🪙</span>
                      </div>
                      <div className="body-small text-success-content font-medium">+{readingData.rewards.coins} เหรียญ</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </article>

        {/* Action Buttons */}
        <div className="sticky bottom-8 max-w-2xl mx-auto">
          <div className="card card-mystical p-6 shadow-xl bg-base-100/95 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`btn flex-1 ${
                  isSaved
                    ? 'btn-success'
                    : 'btn btn-primary'
                }`}
              >
                <span>{isSaved ? '✓' : '💾'}</span>
                <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกการทำนาย'}</span>
              </button>
              
              <button
                onClick={onDelete}
                className="btn btn-outline btn-error flex-1"
              >
                <span>🗑️</span>
                <span>ลบการทำนาย</span>
              </button>
              
              <button
                onClick={onAskAgain}
                className="btn btn-accent flex-1"
              >
                <span>🔮</span>
                <span>ถามใหม่</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}