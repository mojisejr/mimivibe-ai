'use client'

import { useState } from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useProfile } from '@/hooks/useProfile'
import { useReadyAchievements } from '@/hooks/useReadyAchievements'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const router = useRouter()
  const pathname = usePathname()
  const { data: profileData, loading } = useProfile()
  const { data: achievementsData } = useReadyAchievements()

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
    { href: '/payments', label: 'การชำระ', icon: '💳' },
    { href: '/events', label: 'กิจกรรม', icon: '🎉', badge: achievementsData?.count && achievementsData.count > 0 ? achievementsData.count : undefined },
    { href: '/exchange', label: 'แลกเปลี่ยน', icon: '🪙' },
    { href: '/profile', label: 'โปรไฟล์', icon: '👤' },
    { href: '/packages', label: 'แพ็คเกจ', icon: '💎' }
  ]

  const isCurrentPage = (href: string) => pathname === href

  const handleMobileNavigation = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

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
            <div key={link.href} className="relative">
              {link.badge && link.badge > 0 && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-content text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-10">
                  {link.badge}
                </div>
              )}
              <button
                onClick={() => router.push(link.href)}
                className={`btn btn-ghost btn-sm transition-colors duration-200 ${
                  isCurrentPage(link.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-base-content hover:bg-base-200'
                }`}
              >
                {link.label}
              </button>
            </div>
          ))}
        </div>

        {/* Right: User Info and Controls */}
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

          {/* Achievement Notification Badge */}
          {achievementsData && achievementsData.count > 0 && (
            <div className="indicator">
              <span className="indicator-item badge badge-primary badge-sm">
                {achievementsData.count}
              </span>
              <button
                onClick={() => router.push('/events')}
                className="btn btn-ghost btn-circle btn-sm"
                title={`${achievementsData.count} ความสำเร็จพร้อมรับ`}
              >
                <div className="text-xl">🏆</div>
              </button>
            </div>
          )}

          {/* Desktop: User Button */}
          <div className="hidden md:block">
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Mobile: Hamburger Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-circle"
              aria-label="Open menu"
            >
              <motion.div
                animate={mobileMenuOpen ? "open" : "closed"}
                className="flex flex-col w-6 h-6 justify-center items-center"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 6 }
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-6 h-0.5 bg-current block transition-all"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-6 h-0.5 bg-current block mt-1.5 transition-all"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -6 }
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-6 h-0.5 bg-current block mt-1.5 transition-all"
                />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )

  // All pages use the same layout as /ask page
  return (
    <>
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-base-100 shadow-2xl z-50 md:hidden border-l border-base-300"
            >
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-base-300 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-base-content">เมนู</h2>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn btn-ghost btn-circle btn-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <nav className="space-y-2">
                    {navigationLinks.map((link, index) => (
                      <motion.button
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleMobileNavigation(link.href)}
                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left relative ${
                          isCurrentPage(link.href)
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'hover:bg-base-200 text-base-content'
                        }`}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span className="font-medium text-sm">{link.label}</span>
                        <div className="ml-auto flex items-center space-x-2">
                          {link.badge && link.badge > 0 && (
                            <span className="badge badge-primary badge-sm">{link.badge}</span>
                          )}
                          {isCurrentPage(link.href) && (
                            <motion.div
                              layoutId="mobileActiveIndicator"
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </nav>
                </div>

                {/* User Avatar at Bottom */}
                <div className="p-4 border-t border-base-300 flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <div className="scale-125">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </motion.div>
                  <div className="text-center mt-2">
                    <p className="text-xs text-base-content/70">แตะเพื่อจัดการบัญชี</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}