"use client"

import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { getThemeMode, getThemePreference, setTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [themePreference, setThemePreference] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
    setThemePreference(getThemePreference())

    const handleThemeChange = () => {
      setThemePreference(getThemePreference())
    }

    window.addEventListener('routine-theme-change', handleThemeChange)
    return () => window.removeEventListener('routine-theme-change', handleThemeChange)
  }, [])

  if (!mounted) return null

  const isDark = themePreference === 'dark'

  function handleToggle() {
    const nextTheme = isDark ? 'light' : 'dark'
    setThemePreference(nextTheme)
    setTheme(getThemeMode(), nextTheme)
  }

  return (
    <button
      onClick={handleToggle}
      className="btn-ghost px-3 py-1.5 text-xs backdrop-blur-sm"
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? (
        <>
          <Moon className="w-4 h-4" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span>Light</span>
        </>
      )}
    </button>
  )
}
