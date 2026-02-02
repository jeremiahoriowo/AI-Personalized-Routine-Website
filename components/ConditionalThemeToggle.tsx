'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ThemeToggle from './ThemeToggle'
import LogoutButton from './LogoutButton'

export default function ConditionalThemeToggle() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isHomePage = pathname === '/'

  return (
    <div
      className={`fixed top-4 z-50 flex items-center gap-2 right-4 left-auto md:right-auto ${
        isHomePage ? 'md:left-[calc(50%-3rem-8em)]' : 'md:left-4'
      }`}
    >
      {session && <LogoutButton />}
      <ThemeToggle />
    </div>
  )
}
