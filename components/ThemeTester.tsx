'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  setTheme,
  getThemeMode,
  getThemePreference,
  areAnimationsEnabled,
  setAnimationsEnabled,
} from '@/lib/theme'

const modes = ['calm', 'professional', 'playful', 'disciplined']
const themes = ['light', 'dark'] as const

export default function ThemeTester() {
  const [currentMode, setCurrentMode] = useState<string>('calm')
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light')
  const [animationsEnabled, setAnimationsEnabledState] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const sync = () => {
      setCurrentMode(getThemeMode())
      setCurrentTheme(getThemePreference())
      setAnimationsEnabledState(areAnimationsEnabled())
    }

    const handleToggle = () => {
      setIsOpen((prev) => !prev)
    }

    setMounted(true)
    sync()

    window.addEventListener('routine-theme-change', sync)
    window.addEventListener('routine-animation-change', sync)
    window.addEventListener('routine-theme-tester-toggle', handleToggle)

    return () => {
      window.removeEventListener('routine-theme-change', sync)
      window.removeEventListener('routine-animation-change', sync)
      window.removeEventListener('routine-theme-tester-toggle', handleToggle)
    }
  }, [])

  const handleModeChange = (mode: string) => {
    setCurrentMode(mode)
    setTheme(mode, currentTheme)
  }

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme)
    setTheme(currentMode, theme)
  }

  const handleAnimationsToggle = () => {
    const next = !animationsEnabled
    setAnimationsEnabledState(next)
    setAnimationsEnabled(next)
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed bottom-20 left-4 z-40 bg-surface border border-accent rounded-lg p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-text">Theme Tester</div>
        <button
          onClick={() => setIsOpen(false)}
          className="btn-ghost h-6 w-6 p-0"
          aria-label="Close theme tester"
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      
      <div className="mb-3">
        <div className="text-xs text-text mb-1">Mode:</div>
        <div className="flex flex-wrap gap-1">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`text-xs px-2 py-1 ${
                currentMode === mode
                  ? 'btn-standout'
                  : 'btn-ghost'
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
              className={`text-xs px-2 py-1 flex-1 ${
                currentTheme === theme
                  ? 'btn-standout'
                  : 'btn-ghost'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs text-text mb-1">Background Effects:</div>
        <button
          onClick={handleAnimationsToggle}
          className={`w-full text-xs px-2 py-1 ${
            animationsEnabled
              ? 'btn-standout'
              : 'btn-ghost'
          }`}
        >
          {animationsEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>
    </div>
  )
}
