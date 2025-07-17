'use client'

import { useState } from 'react'
import { ReadingResponse } from '@/types/reading'
import { CardFallback } from '@/components/cards/CardFallback'

interface CardImageProps {
  src: string
  alt: string
  position: number
}

function CardImage({ src, alt, position }: CardImageProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="relative">
        <CardFallback className="w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-content text-sm font-semibold rounded-full flex items-center justify-center shadow-lg">
          {position}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="card card-mystical w-full aspect-[2/3] overflow-hidden transition-transform duration-300 group-hover:scale-105 p-0 shadow-lg">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-content text-sm font-semibold rounded-full flex items-center justify-center shadow-lg">
        {position}
      </div>
    </div>
  )
}

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
    <div className="page-container bg-base-200 pt-20 lg:pt-24">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {readingData.cards.map((card, index) => (
              <div key={card.id} className="text-center">
                <div className="relative group mb-4">
                  <CardImage 
                    src={card.imageUrl}
                    alt={card.displayName}
                    position={index + 1}
                  />
                </div>
                <h3 className="font-semibold text-base-content text-sm sm:text-base mb-2">{card.displayName}</h3>
                <p className="text-xs text-neutral-content leading-relaxed">{card.shortMeaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Reading Content */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Main Reading */}
          <section className="prose prose-lg max-w-none mb-12">
            <div className="card card-mystical p-6 sm:p-8 shadow-lg">
              <h2 className="heading-2 text-base-content mb-6 text-center sm:text-left">การทำนาย</h2>
              <div className="body-normal text-base-content leading-relaxed whitespace-pre-line text-left">
                {readingData.reading.reading}
              </div>
            </div>
          </section>

          {/* Suggestions */}
          {readingData.reading.suggestions && readingData.reading.suggestions.length > 0 && (
            <section className="mb-12">
              <div className="alert alert-info p-6 sm:p-8 shadow-lg">
                <div className="w-full">
                  <h2 className="heading-2 text-info-content mb-6 text-center sm:text-left">คำแนะนำ</h2>
                  <ul className="space-y-4">
                    {readingData.reading.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-7 h-7 bg-info text-info-content text-sm rounded-full flex items-center justify-center font-semibold shadow-sm">
                          {index + 1}
                        </span>
                        <span className="body-normal text-info-content leading-relaxed text-left">{suggestion}</span>
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
              <div className="alert alert-success p-6 sm:p-8 shadow-lg">
                <div className="w-full">
                  <h2 className="heading-2 text-success-content mb-6 text-center sm:text-left">ข้อสรุป</h2>
                  <div className="body-normal text-success-content leading-relaxed whitespace-pre-line text-left">
                    {readingData.reading.final}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* End Message */}
          {readingData.reading.end && (
            <section className="mb-12">
              <div className="card card-mystical p-6 sm:p-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg">
                <div className="body-normal text-base-content leading-relaxed">
                  {readingData.reading.end}
                </div>
              </div>
            </section>
          )}

          {/* Notice */}
          {readingData.reading.notice && (
            <section className="mb-12">
              <div className="alert alert-warning p-6 shadow-lg">
                <div className="w-full">
                  <h3 className="heading-3 mb-3 text-warning-content text-center sm:text-left">หมายเหตุ</h3>
                  <p className="body-normal text-warning-content leading-relaxed text-left">{readingData.reading.notice}</p>
                </div>
              </div>
            </section>
          )}

          {/* Rewards */}
          {readingData.rewards && (
            <section className="mb-12">
              <div className="alert alert-success p-6 shadow-lg">
                <div className="w-full">
                  <h3 className="heading-3 mb-6 text-center text-success-content">รางวัลที่ได้รับ</h3>
                  <div className="flex justify-center space-x-8">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-warning rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                        <span className="text-warning-content text-xl">⭐</span>
                      </div>
                      <div className="body-small text-success-content font-medium">+{readingData.rewards.exp} EXP</div>
                    </div>
                    <div className="text-center">
                      <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
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

        {/* Action Buttons - Improved Mobile UX */}
        <div className="pb-8">
          {/* Desktop Action Buttons */}
          <div className="hidden sm:block sticky bottom-8 max-w-2xl mx-auto">
            <div className="card card-mystical p-6 shadow-xl bg-base-100/95 backdrop-blur-sm">
              <div className="flex gap-4">
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

          {/* Mobile Action Buttons - Inline Layout */}
          <div className="sm:hidden max-w-2xl mx-auto px-4">
            <div className="space-y-4">
              {/* Primary Action - Ask Again */}
              <button
                onClick={onAskAgain}
                className="btn btn-accent w-full btn-lg shadow-lg"
              >
                <span>🔮</span>
                <span>ถามใหม่</span>
              </button>
              
              {/* Secondary Actions - Horizontal */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`btn btn-sm ${
                    isSaved
                      ? 'btn-success'
                      : 'btn btn-primary btn-outline'
                  }`}
                >
                  <span className="text-xs">{isSaved ? '✓' : '💾'}</span>
                  <span className="text-xs">{isSaved ? 'บันทึกแล้ว' : 'บันทึก'}</span>
                </button>
                
                <button
                  onClick={onDelete}
                  className="btn btn-sm btn-outline btn-error"
                >
                  <span className="text-xs">🗑️</span>
                  <span className="text-xs">ลบ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}