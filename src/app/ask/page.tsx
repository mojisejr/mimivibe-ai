'use client'

import { AskPage } from './components/AskPage'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { useSearchParams } from 'next/navigation'
import type { Locale } from '@/lib/i18n-config'

export default function AskPageRoute() {
  const searchParams = useSearchParams()
  const locale = (searchParams.get('locale') || 'th') as Locale

  return (
    <>
      {/* New Article-Style Ask Page */}
      <AskPage locale={locale} />

      {/* Bottom Navigation (Mobile Only) - Only show on initial state */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNavigation />
      </div>
    </>
  )
}