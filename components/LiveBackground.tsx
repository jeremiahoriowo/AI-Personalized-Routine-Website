'use client'

import { useEffect, useRef, useState } from 'react'
import { areAnimationsEnabled, getThemeMode, getThemePreference } from '@/lib/theme'

type ThemeMode = 'calm' | 'professional' | 'playful' | 'disciplined'
type ThemePreference = 'light' | 'dark'

type Palette = {
  base: string
  surface: string
  accent: string
  muted: string
}

function normalizeMode(mode: string): ThemeMode {
  if (mode === 'professional' || mode === 'playful' || mode === 'disciplined') {
    return mode
  }
  return 'calm'
}

function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement)
  return {
    base: styles.getPropertyValue('--color-base').trim() || '#f8fafb',
    surface: styles.getPropertyValue('--color-surface').trim() || '#eef2f7',
    accent: styles.getPropertyValue('--color-accent').trim() || '#2563eb',
    muted: styles.getPropertyValue('--color-text-muted').trim() || '#64748b',
  }
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()
}

function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillRect(x - size, y - size, size * 2, size * 2)
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - size)
  ctx.lineTo(x + size, y + size)
  ctx.lineTo(x - size, y + size)
  ctx.closePath()
  ctx.fill()
}

function drawCalm(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  width: number,
  height: number,
  time: number,
  isDark: boolean
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, palette.base)
  gradient.addColorStop(1, palette.surface)
  ctx.globalAlpha = isDark ? 0.24 : 0.4
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = palette.accent
  const count = 16
  for (let i = 0; i < count; i++) {
    const driftSpeed = 18 + (i % 3) * 6
    const x = ((i * 83 + time * driftSpeed) % (width + 140)) - 70
    const y = ((i * 57 + Math.sin(time * 0.7 + i) * 36 + i * 31) % (height + 140)) - 70
    const size = 10 + (i % 4) * 3
    ctx.globalAlpha = isDark ? 0.05 : 0.08
    drawCircle(ctx, x, y, size)
  }

  ctx.globalAlpha = 1
}

function drawProfessional(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  width: number,
  height: number,
  time: number,
  isDark: boolean
) {
  ctx.globalAlpha = isDark ? 0.16 : 0.24
  ctx.fillStyle = palette.base
  ctx.fillRect(0, 0, width, height)

  const spacing = 34
  const offset = (time * 12) % spacing
  ctx.globalAlpha = isDark ? 0.1 : 0.07
  ctx.strokeStyle = palette.muted
  ctx.lineWidth = 1

  for (let x = -height; x < width + height; x += spacing) {
    ctx.beginPath()
    ctx.moveTo(x + offset, 0)
    ctx.lineTo(x + offset + height, height)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

function drawPlayful(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  width: number,
  height: number,
  time: number,
  isDark: boolean
) {
  const gradient = ctx.createRadialGradient(width * 0.7, height * 0.2, 0, width * 0.5, height * 0.6, width)
  gradient.addColorStop(0, palette.surface)
  gradient.addColorStop(1, palette.base)
  ctx.globalAlpha = isDark ? 0.2 : 0.36
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const count = 20
  for (let i = 0; i < count; i++) {
    const shapeSize = 5 + (i % 4) * 2
    const riseSpeed = 10 + (i % 3) * 4
    const travel = (time * riseSpeed + i * 61) % (height + 160)
    const y = height - travel
    const baseX = (i * 89) % Math.max(width, 1)
    const drift = Math.sin(time * 1.1 + i * 1.7) * 45
    const x = (baseX + drift + width) % Math.max(width, 1)

    ctx.globalAlpha = isDark ? 0.12 : 0.16
    ctx.fillStyle = i % 2 === 0 ? palette.accent : palette.muted

    if (i % 3 === 0) {
      drawSquare(ctx, x, y, shapeSize)
    } else if (i % 3 === 1) {
      drawCircle(ctx, x, y, shapeSize)
    } else {
      drawTriangle(ctx, x, y, shapeSize)
    }
  }

  ctx.globalAlpha = 1
}

function drawDisciplined(
  ctx: CanvasRenderingContext2D,
  palette: Palette,
  width: number,
  height: number,
  time: number,
  isDark: boolean
) {
  ctx.globalAlpha = isDark ? 0.16 : 0.24
  ctx.fillStyle = palette.base
  ctx.fillRect(0, 0, width, height)

  const cell = 84
  const drift = Math.sin(time * 0.2) * 2
  ctx.globalAlpha = isDark ? 0.11 : 0.08
  ctx.strokeStyle = palette.muted
  ctx.lineWidth = 1

  for (let y = 30; y < height + cell; y += cell) {
    for (let x = 30; x < width + cell; x += cell) {
      const dx = x + ((x + y) % 2 === 0 ? drift : -drift)
      const dy = y + ((x / cell) % 2 === 0 ? -drift : drift)
      ctx.strokeRect(dx - 10, dy - 10, 20, 20)
    }
  }

  ctx.globalAlpha = isDark ? 0.09 : 0.06
  ctx.strokeStyle = palette.accent
  const lineOffset = (time * 2) % 120
  for (let i = 0; i < 6; i++) {
    const y = (i * 120 + lineOffset) % (height + 20)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

function renderMode(
  ctx: CanvasRenderingContext2D,
  mode: ThemeMode,
  palette: Palette,
  width: number,
  height: number,
  time: number,
  theme: ThemePreference
) {
  const isDark = theme === 'dark'

  if (mode === 'professional') {
    drawProfessional(ctx, palette, width, height, time, isDark)
    return
  }

  if (mode === 'playful') {
    drawPlayful(ctx, palette, width, height, time, isDark)
    return
  }

  if (mode === 'disciplined') {
    drawDisciplined(ctx, palette, width, height, time, isDark)
    return
  }

  drawCalm(ctx, palette, width, height, time, isDark)
}

export default function LiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<ThemeMode>('calm')
  const [theme, setTheme] = useState<ThemePreference>('light')
  const [animationsEnabled, setAnimationsEnabledState] = useState(true)

  useEffect(() => {
    const syncFromTheme = () => {
      setMode(normalizeMode(getThemeMode()))
      setTheme(getThemePreference())
      setAnimationsEnabledState(areAnimationsEnabled())
    }

    syncFromTheme()

    window.addEventListener('routine-theme-change', syncFromTheme)
    window.addEventListener('routine-animation-change', syncFromTheme)
    return () => {
      window.removeEventListener('routine-theme-change', syncFromTheme)
      window.removeEventListener('routine-animation-change', syncFromTheme)
    }
  }, [])

  useEffect(() => {
    if (!animationsEnabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return

    let rafId = 0
    let running = true
    let width = window.innerWidth
    let height = window.innerHeight
    let last = 0
    const maxFps = 30
    const frameDuration = 1000 / maxFps
    let palette = readPalette()

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      palette = readPalette()
    }

    const draw = (timestamp: number) => {
      if (!running) return

      if (timestamp - last < frameDuration) {
        rafId = requestAnimationFrame(draw)
        return
      }

      last = timestamp
      const time = timestamp * 0.001
      context.clearRect(0, 0, width, height)
      renderMode(context, mode, palette, width, height, time, theme)
      rafId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    rafId = requestAnimationFrame(draw)

    return () => {
      running = false
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
    }
  }, [animationsEnabled, mode, theme])

  if (!animationsEnabled) return null

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-base/30" aria-hidden="true" />
    </>
  )
}
