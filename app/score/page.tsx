"use client"
import React, { useEffect, useState } from 'react'
import { getThemeMode } from '@/lib/theme'

type ThemeMode = 'calm' | 'professional' | 'playful' | 'disciplined'
type ProgressBand = 'high' | 'medium' | 'building' | 'low'

function normalizeThemeMode(mode: string): ThemeMode {
  if (mode === 'professional' || mode === 'playful' || mode === 'disciplined') {
    return mode
  }
  return 'calm'
}

function getProgressBand(progress: number): ProgressBand {
  if (progress >= 75) return 'high'
  if (progress >= 65) return 'medium'
  if (progress >= 50) return 'building'
  return 'low'
}

function getGeneratedReflection(mode: ThemeMode, progress: number): string {
  const roundedProgress = Math.round(progress)
  const band = getProgressBand(progress)

  const reflections: Record<ThemeMode, Record<ProgressBand, string>> = {
    calm: {
      high: `${roundedProgress}% is beautiful progress. You're honoring your rhythm well—keep this gentle consistency and protect the routines that are already supporting you.`,
      medium: `${roundedProgress}% is a meaningful step forward. You're doing well; keep showing up calmly and your consistency will naturally grow stronger.`,
      building: `${roundedProgress}% shows real effort, and that matters. You did good—stay kind to yourself, keep steady, and you can do even more next week.`,
      low: `${roundedProgress}% still counts as progress. Start with one small, steady win tomorrow and build calmly from there.`,
    },
    professional: {
      high: `${roundedProgress}% completion reflects strong execution. Maintain this consistency and continue operating at the same standard.`,
      medium: `${roundedProgress}% indicates good traction. You're performing well, and tighter consistency can move this into high-performance territory.`,
      building: `${roundedProgress}% is a fair baseline. Good work so far; with better consistency, you can deliver significantly stronger outcomes.`,
      low: `${roundedProgress}% is below target but recoverable. Refocus on core priorities and rebuild consistency immediately.`,
    },
    playful: {
      high: `${roundedProgress}%? That's awesome—you crushed it! Keep this streak alive and stay consistent so your wins keep stacking.`,
      medium: `${roundedProgress}% is pretty good! You're doing well, and a little more consistency will push you to the next level.`,
      building: `${roundedProgress}% is a good start—you did good, friend. Keep going, do a little more each day, and you'll surprise yourself.`,
      low: `${roundedProgress}% is a rough patch, but you're still in the game. Reset tomorrow, grab easy wins first, and build your momentum back up.`,
    },
    disciplined: {
      high: `${roundedProgress}% is strong. You did the work—repeat it. Consistency is the standard now.`,
      medium: `${roundedProgress}% is decent, not excellent. Good effort, but tighten execution and cut missed tasks.`,
      building: `${roundedProgress}% means you showed up. That's good—but you can do more. Push harder and stay consistent.`,
      low: `${roundedProgress}% is below standard. Reset your plan, execute the basics, and stop skipping.`,
    },
  }

  return reflections[mode][band]
}

export default function ScorePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [themeMode, setThemeMode] = useState<ThemeMode>('calm')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/analytics/weekly')
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const syncThemeMode = () => {
      setThemeMode(normalizeThemeMode(getThemeMode()))
    }

    syncThemeMode()
    window.addEventListener('routine-theme-change', syncThemeMode)
    return () => {
      window.removeEventListener('routine-theme-change', syncThemeMode)
    }
  }, [])

  if (loading) return <div className="text-xs md:text-sm text-text-muted px-3 md:px-0">Loading...</div>

  if (!data) return <div className="text-xs md:text-sm text-text-muted px-3 md:px-0">No data available</div>

  const { weeks, overall } = data
  const completionRaw = Number(overall?.completionPercent ?? 0)
  const completionPercent = Number.isFinite(completionRaw) ? completionRaw : 0
  const generatedReflection = getGeneratedReflection(themeMode, completionPercent)

  return (
    <div className="space-y-4 md:space-y-6 pb-8 px-3 md:px-0">
      <h1 className="text-lg md:text-xl font-semibold text-text">Progress & Reflection</h1>

      {/* Overall Summary */}
      <div className="p-3 md:p-4 bg-surface border border-border-color rounded">
        <h2 className="font-medium mb-2 md:mb-3 text-sm text-text">Last 28 Days</h2>
        <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
          <div>
            <div className="text-xl md:text-2xl font-bold text-accent">{overall.daysWithRoutines}</div>
            <div className="text-xs text-text-muted">Days tracked</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-accent">{overall.completionPercent}%</div>
            <div className="text-xs text-text-muted">Completion</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-accent">{overall.averageDiscipline}%</div>
            <div className="text-xs text-text-muted">Avg discipline</div>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="space-y-2 md:space-y-3">
        <h2 className="font-medium text-sm text-text">Weekly Progress</h2>
        {weeks.map((week: any, idx: number) => (
          <div key={idx} className="p-2 md:p-3 bg-base border border-border-color rounded">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2 mb-2">
              <span className="text-xs md:text-sm font-medium text-text">Week {week.weekNum}</span>
              <span className="text-xs text-text-muted">
                {new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all"
                  style={{ width: `${week.completionPercent}%` }}
                />
              </div>
              <span className="text-xs md:text-sm font-medium w-10 md:w-12 text-right text-text">{week.completionPercent}%</span>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-text-muted">
              <span>{week.daysWithRoutines} days</span>
              <span>{week.completedInstances}/{week.totalInstances} tasks</span>
              <span>Avg: {week.averageDiscipline}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reflection Prompts */}
      <div className="space-y-2 md:space-y-3 p-3 md:p-4 bg-base border border-border-color rounded">
        <h2 className="font-medium text-sm text-text">Reflection</h2>

        <div className="p-3 bg-surface border border-border-color rounded space-y-2">
          <p className="text-xs text-text-muted">
            Completion: <span className="font-semibold text-text">{Math.round(completionPercent)}%</span>
          </p>
          <p className="text-xs md:text-sm text-text">{generatedReflection}</p>
        </div>

        {/*
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 text-text">What worked well this week?</label>
          <textarea
            className="w-full p-2 border border-border-color rounded text-xs md:text-sm bg-surface text-text placeholder-text-muted"
            rows={3}
            placeholder="Celebrate small wins..."
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 text-text">What needs adjustment?</label>
          <textarea
            className="w-full p-2 border border-border-color rounded text-xs md:text-sm bg-surface text-text placeholder-text-muted"
            rows={3}
            placeholder="What could make it easier?"
          />
        </div>

        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-accent text-white rounded text-xs md:text-sm hover:opacity-90">
          Save reflection
        </button>
        */}
      </div>

      {/* Encouragement */}
      <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded text-xs md:text-sm text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
        <p className="font-medium">Remember</p>
        <p className="mt-1">Progress isn't linear. Showing up is what matters. Every completed task is a step forward.</p>
      </div>
    </div>
  )
}
