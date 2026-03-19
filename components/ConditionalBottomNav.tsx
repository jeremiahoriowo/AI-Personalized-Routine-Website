'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import BottomNav from './BottomNav'

export default function ConditionalBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // Hide navbar on home page or if user is not authenticated
  const isHomePage = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register'
  
  if (isHomePage || isAuthPage || !session) {
    return null
  }

  return <BottomNav />
}
