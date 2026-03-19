"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium bg-base text-text border-surface hover:bg-surface"
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
