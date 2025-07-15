'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useProfile } from '@/hooks/useProfile'

interface AutoHideNavbarProps {
  showInStates?: ('initial' | 'loading' | 'result')[]
  currentState: 'initial' | 'loading' | 'result'
}

export function AutoHideNavbar({ 
  showInStates = ['result'], 
  currentState 
}: AutoHideNavbarProps) {
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()
  const router = useRouter()
  const { data: profileData } = useProfile()

  // Only show navbar in specified states
  const shouldShow = showInStates.includes(currentState)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (previous !== undefined && latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  if (!shouldShow) {
    return null
  }

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-300 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 hover:opacity-70 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-primary-content text-sm font-bold">M</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-base-content">แม่หมอมีมี่</h1>
                <p className="text-xs text-neutral-content">หมอดูไพ่ทาโรต์ AI</p>
              </div>
            </button>
          </div>

          {/* Center: Navigation Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => router.push('/ask')}
              className="btn btn-ghost btn-sm text-primary hover:bg-primary/10"
            >
              ถามไพ่
            </button>
            <button
              onClick={() => router.push('/history')}
              className="btn btn-ghost btn-sm text-base-content hover:bg-base-200"
            >
              ประวัติ
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="btn btn-ghost btn-sm text-base-content hover:bg-base-200"
            >
              โปรไฟล์
            </button>
            <button
              onClick={() => router.push('/packages')}
              className="btn btn-ghost btn-sm text-base-content hover:bg-base-200"
            >
              แพ็คเกจ
            </button>
          </div>

          {/* Right: User Info and Avatar */}
          <div className="flex items-center space-x-3">
            {/* Credits Display (Hidden on mobile) */}
            {profileData?.credits && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="badge badge-warning gap-1">
                  <span>⭐</span>
                  <span className="text-sm font-medium">
                    {profileData.credits.stars}
                  </span>
                </div>
                <div className="badge badge-secondary gap-1">
                  <span>🎁</span>
                  <span className="text-sm font-medium">
                    {profileData.credits.freePoint}
                  </span>
                </div>
              </div>
            )}

            {/* User Button */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Border Indicator */}
      <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
    </motion.nav>
  )
}