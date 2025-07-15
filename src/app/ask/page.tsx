'use client'

import { AskPage } from './components/AskPage'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'

export default function AskPageRoute() {
  return (
    <>
      {/* New Article-Style Ask Page */}
      <AskPage />
      
      {/* Bottom Navigation (Mobile Only) - Only show on initial state */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNavigation />
      </div>
    </>
  )
}