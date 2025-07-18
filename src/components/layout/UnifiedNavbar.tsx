'use client'

import { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useProfile } from '@/hooks/useProfile'

interface UnifiedNavbarProps {
  autoHide?: boolean
  showInStates?: ('initial' | 'loading' | 'result')[]
  currentState?: 'initial' | 'loading' | 'result'
  className?: string
}

export function UnifiedNavbar({ 
  autoHide = false,
  showInStates,
  currentState,
  className = ""
}: UnifiedNavbarProps) {
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()
  const router = useRouter()
  const pathname = usePathname()
  const { data: profileData, loading } = useProfile()

  // State-based visibility (only for /ask page)
  const shouldShowBasedOnState = !showInStates || !currentState || showInStates.includes(currentState)

  // Auto-hide functionality
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!autoHide) return
    
    const previous = scrollY.getPrevious()
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
    if (!isDesktop && previous !== undefined && latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  if (!shouldShowBasedOnState) {
    return null
  }

  const navigationLinks = [
    { href: '/ask', label: 'ถามไพ่', icon: '🔮' },
    { href: '/history', label: 'ประวัติ', icon: '📜' },
    { href: '/profile', label: 'โปรไฟล์', icon: '👤' },
    { href: '/packages', label: 'แพ็คเกจ', icon: '💎' }
  ]

  const isCurrentPage = (href: string) => pathname === href

  const navbarContent = (
    <div className={`max-w-6xl mx-auto px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <button
            onClick={() => router.push('/')}
            className="block hover:opacity-80 transition-opacity duration-200"
          >
            <img
              src="/images/logo.png"
              alt="MiMi Vibes - หมอดูไพ่ทาโรต์ AI"
              className="h-8 w-auto sm:h-10 lg:h-12 object-contain"
              style={{ 
                maxWidth: '120px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          </button>
        </div>

        {/* Center: Navigation Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-6">
          {navigationLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className={`btn btn-ghost btn-sm transition-colors duration-200 ${
                isCurrentPage(link.href)
                  ? 'text-primary bg-primary/10'
                  : 'text-base-content hover:bg-base-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right: User Info and Avatar */}
        <div className="flex items-center space-x-3">
          {/* Credits Display (Hidden on mobile) */}
          <div className="hidden sm:flex items-center space-x-3">
            {loading ? (
              // Loading skeleton for credits
              <>
                <div className="skeleton h-6 w-16 rounded-full"></div>
                <div className="skeleton h-6 w-16 rounded-full"></div>
              </>
            ) : profileData?.credits ? (
              // Actual credits display
              <>
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
              </>
            ) : null}
          </div>

          {/* User Button */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  )

  // All pages use the same layout as /ask page
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
      {navbarContent}
      {/* Mobile Bottom Border Indicator */}
      <div className="h-1 bg-gradient-to-r from-primary to-secondary"></div>
    </motion.nav>
  )
}