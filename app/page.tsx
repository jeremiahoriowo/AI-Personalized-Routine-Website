import React from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import HomeContent from '@/components/HomeContent'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // If user is authenticated, redirect to today page
  if (session) {
    redirect('/today')
  }

  return <HomeContent />
}
