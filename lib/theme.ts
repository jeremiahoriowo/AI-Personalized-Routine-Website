/**
 * Theme utilities for managing user mode and light/dark theme
 */

const MODE_KEY = "theme-mode"
const THEME_KEY = "theme-preference"
const NEXT_THEME_KEY = "theme"
const ANIMATIONS_KEY = "theme-animations-enabled"

type ThemePreference = "light" | "dark"

function applyTheme(mode: string, theme: ThemePreference) {
  const htmlElement = document.documentElement
  htmlElement.setAttribute("data-mode", mode)
  htmlElement.setAttribute("data-theme", theme)
  htmlElement.classList.toggle("dark", theme === "dark")
}

function applyAnimationPreference(enabled: boolean) {
  const htmlElement = document.documentElement
  htmlElement.setAttribute("data-animations", enabled ? "on" : "off")
}

export function setTheme(mode: string, theme: ThemePreference) {
  if (typeof window === "undefined") return

  applyTheme(mode, theme)

  localStorage.setItem(MODE_KEY, mode)
  localStorage.setItem(THEME_KEY, theme)
  localStorage.setItem(NEXT_THEME_KEY, theme)

  window.dispatchEvent(new Event("routine-theme-change"))
}

export function areAnimationsEnabled(): boolean {
  if (typeof window === "undefined") return true

  const stored = localStorage.getItem(ANIMATIONS_KEY)
  if (stored === null) {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }

  return stored === "true"
}

export function setAnimationsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return

  localStorage.setItem(ANIMATIONS_KEY, enabled ? "true" : "false")
  applyAnimationPreference(enabled)
  window.dispatchEvent(new Event("routine-animation-change"))
}

export function getThemeMode(): string {
  if (typeof window === "undefined") return "calm"
  return localStorage.getItem(MODE_KEY) || "calm"
}

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem(THEME_KEY) as ThemePreference) || "light"
}

export function initializeTheme() {
  if (typeof window === "undefined") return
  
  const mode = getThemeMode()
  const preference = getThemePreference()
  const animationsEnabled = areAnimationsEnabled()
  
  applyTheme(mode, preference)
  applyAnimationPreference(animationsEnabled)
}
