"use client"
import React, { useEffect, useState } from 'react'

export default function ScorePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reflection, setReflection] = useState({ whatWorked: '', whatNeeds: '' })

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

  if (loading) return <div className="text-xs md:text-sm text-gray-600 dark:text-slate-400 px-3 md:px-0">Loading...</div>

  if (!data) return <div className="text-xs md:text-sm text-gray-600 dark:text-slate-400 px-3 md:px-0">No data available</div>

  const { weeks, overall } = data

  return (
    <div className="space-y-4 md:space-y-6 pb-8 px-3 md:px-0">
      <h1 className="text-lg md:text-xl font-semibold dark:text-white">Progress & Reflection</h1>

      {/* Overall Summary */}
      <div className="p-3 md:p-4 bg-calm-50 border border-calm-200 rounded dark:bg-slate-900 dark:border-slate-700">
        <h2 className="font-medium mb-2 md:mb-3 text-sm md:text-base dark:text-white">Last 28 Days</h2>
        <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
          <div>
            <div className="text-xl md:text-2xl font-bold text-calm-500">{overall.daysWithRoutines}</div>
            <div className="text-xs text-gray-600 dark:text-slate-400">Days tracked</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-calm-500">{overall.completionPercent}%</div>
            <div className="text-xs text-gray-600 dark:text-slate-400">Completion</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-calm-500">{overall.averageDiscipline}%</div>
            <div className="text-xs text-gray-600 dark:text-slate-400">Avg discipline</div>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="space-y-2 md:space-y-3">
        <h2 className="font-medium text-sm md:text-base dark:text-white">Weekly Progress</h2>
        {weeks.map((week: any, idx: number) => (
          <div key={idx} className="p-2 md:p-3 bg-white border rounded dark:bg-slate-900 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-2 mb-2">
              <span className="text-xs md:text-sm font-medium dark:text-slate-100">Week {week.weekNum}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden dark:bg-slate-700">
                <div 
                  className="bg-calm-500 h-full transition-all"
                  style={{ width: `${week.completionPercent}%` }}
                />
              </div>
              <span className="text-xs md:text-sm font-medium w-10 md:w-12 text-right dark:text-slate-100">{week.completionPercent}%</span>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-gray-600 dark:text-slate-400">
              <span>{week.daysWithRoutines} days</span>
              <span>{week.completedInstances}/{week.totalInstances} tasks</span>
              <span>Avg: {week.averageDiscipline}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reflection Prompts */}
      <div className="space-y-2 md:space-y-3 p-3 md:p-4 bg-white border rounded dark:bg-slate-900 dark:border-slate-700">
        <h2 className="font-medium text-sm md:text-base dark:text-white">Reflection</h2>
        <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400">Take a moment to reflect on your progress. No judgment, just awareness.</p>
        
        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 dark:text-slate-200">What worked well this week?</label>
          <textarea
            value={reflection.whatWorked}
            onChange={(e) => setReflection({ ...reflection, whatWorked: e.target.value })}
            className="w-full p-2 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            rows={3}
            placeholder="Celebrate small wins..."
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium mb-1 dark:text-slate-200">What needs adjustment?</label>
          <textarea
            value={reflection.whatNeeds}
            onChange={(e) => setReflection({ ...reflection, whatNeeds: e.target.value })}
            className="w-full p-2 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            rows={3}
            placeholder="What could make it easier?"
          />
        </div>

        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-calm-500 text-white rounded text-xs md:text-sm hover:bg-calm-600">
          Save reflection
        </button>
      </div>

      {/* Encouragement */}
      <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded text-xs md:text-sm text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200">
        <p className="font-medium">Remember</p>
        <p className="mt-1">Progress isn't linear. Showing up is what matters. Every completed task is a step forward.</p>
      </div>
    </div>
  )
}
