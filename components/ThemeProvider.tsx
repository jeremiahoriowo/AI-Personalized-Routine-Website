"use client"

import React, { useEffect } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { initializeTheme } from '@/lib/theme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeTheme()
  }, [])

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
