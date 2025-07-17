'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, History, User, Package, Home } from 'lucide-react'

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: 'หน้าหลัก',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      href: '/ask',
      label: 'ถามดวง',
      icon: MessageCircle,
      isActive: pathname === '/ask'
    },
    {
      href: '/history',
      label: 'ประวัติ',
      icon: History,
      isActive: pathname === '/history'
    },
    {
      href: '/packages',
      label: 'แพ็คเกจ',
      icon: Package,
      isActive: pathname === '/packages'
    },
    {
      href: '/profile',
      label: 'โปรไฟล์',
      icon: User,
      isActive: pathname === '/profile'
    }
  ]

  return (
    <div className="btm-nav btm-nav-lg bg-base-100 border-t border-base-300 safe-area-bottom">
      {navItems.map((item) => {
        const Icon = item.icon
        
        return (
          <Link 
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              item.isActive 
                ? 'text-primary active' 
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            <Icon className={`w-5 h-5 ${item.isActive ? 'text-primary' : ''}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        )
      })}
    </div>
  )
}