/**
 * Theme utilities for managing user mode and light/dark theme
 */

export function setTheme(mode: string, theme: "light" | "dark") {
  const htmlElement = document.documentElement
  htmlElement.setAttribute("data-mode", mode)
  htmlElement.setAttribute("data-theme", theme)
  
  // Save preferences to localStorage for persistence
  localStorage.setItem("theme-mode", mode)
  localStorage.setItem("theme-preference", theme)
}

export function getThemeMode(): string {
  if (typeof window === "undefined") return "calm"
  return localStorage.getItem("theme-mode") || "calm"
}

export function getThemePreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return (localStorage.getItem("theme-preference") as "light" | "dark") || "light"
}

export function initializeTheme() {
  if (typeof window === "undefined") return
  
  const mode = getThemeMode()
  const preference = getThemePreference()
  
  setTheme(mode, preference)
}
