"use client"
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

export default function BottomNav(){
  const pathname = usePathname()
  const navItems = [
    { href: '/today', label: 'Today' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/score', label: 'Score' },
    { href: '/settings', label: 'Settings' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-base border-t border-surface py-2 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto flex justify-between">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs sm:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md transition ${
                isActive
                  ? 'bg-surface text-accent font-medium'
                  : 'text-text hover:bg-surface'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
