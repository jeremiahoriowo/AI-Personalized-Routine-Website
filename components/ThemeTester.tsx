'use client'

import { useState, useEffect } from 'react'
import { setTheme, getThemeMode, getThemePreference } from '@/lib/theme'

const modes = ['calm', 'professional', 'playful', 'disciplined']
const themes = ['light', 'dark'] as const

export default function ThemeTester() {
  const [currentMode, setCurrentMode] = useState<string>('calm')
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentMode(getThemeMode())
    setCurrentTheme(getThemePreference())
  }, [])

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode)
    setTheme(mode, currentTheme)
  }

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme)
    setTheme(currentMode, theme)
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-20 left-4 z-40 bg-surface border border-accent rounded-lg p-3 shadow-lg">
      <div className="text-xs font-semibold text-text mb-2">Theme Tester</div>
      
      <div className="mb-3">
        <div className="text-xs text-text mb-1">Mode:</div>
        <div className="flex flex-wrap gap-1">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`text-xs px-2 py-1 rounded ${
                currentMode === mode
                  ? 'bg-accent text-white'
                  : 'bg-base text-text border border-accent'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-text mb-1">Theme:</div>
        <div className="flex gap-1">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`text-xs px-2 py-1 rounded flex-1 ${
                currentTheme === theme
                  ? 'bg-accent text-white'
                  : 'bg-base text-text border border-accent'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
