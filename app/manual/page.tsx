"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ManualBuilder() {
  const router = useRouter()
  const [templateName, setTemplateName] = useState('My Custom Routine')
  const [activities, setActivities] = useState<Array<{ title: string; weight: string; startTime: string; endTime: string }>>([])
  const [newActivity, setNewActivity] = useState({ title: '', weight: '1', startTime: '', endTime: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatTime12h = (time?: string) => {
    if (!time) return ''
    const [hStr, mStr] = time.split(':')
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr || '0', 10)
    if (Number.isNaN(h) || Number.isNaN(m)) return time
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 === 0 ? 12 : h % 12
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`
  }

  function addActivity() {
    if (!newActivity.title.trim()) {
      setError('Activity title is required')
      return
    }
    setError(null)
    setActivities([...activities, { ...newActivity }])
    setNewActivity({ title: '', weight: '1', startTime: '', endTime: '' })
  }

  function removeActivity(index: number) {
    setActivities(activities.filter((_, i) => i !== index))
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      setError('Template name is required')
      return
    }
    if (activities.length === 0) {
      setError('Add at least one activity')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/templates/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: templateName.trim(),
          items: activities.map((a, idx) => ({
            title: a.title,
            description: `${a.startTime ? formatTime12h(a.startTime) + ' - ' + formatTime12h(a.endTime) : 'Time TBD'}`,
            category: 'General',
            defaultWeight: parseFloat(a.weight) || 1,
            recommendedTime: a.startTime && a.endTime ? `${Math.round((parseInt(a.endTime.split(':')[0]) * 60 + parseInt(a.endTime.split(':')[1])) - (parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1])))} min` : '',
            startTime: a.startTime || null,
            endTime: a.endTime || null,
            orderIndex: idx
          }))
        })
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || 'Failed to save template')
        setSaving(false)
        return
      }

      const result = await res.json()
      
      // Activate this template
      const activateRes = await fetch('/api/templates/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: result.template.id })
      })

      if (activateRes.ok) {
        router.push('/today')
      } else {
        setError('Saved but failed to activate template')
        setSaving(false)
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      <div>
        <h1 className="text-lg md:text-xl font-semibold dark:text-white">Build Your Routine Manually</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-1 dark:text-slate-400">Add activities one by one. No AI, just you building what works.</p>
      </div>

      {error && (
        <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs md:text-sm dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Template Name */}
      <div className="space-y-1 md:space-y-2">
        <label className="block text-xs md:text-sm font-medium dark:text-slate-200">Template Name</label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="w-full px-2 md:px-3 py-1.5 md:py-2 border rounded text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder="e.g., My Balanced Day"
        />
      </div>

      {/* Add Activity Form */}
      <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded space-y-2 md:space-y-3 dark:bg-blue-900/20 dark:border-blue-800">
        <h2 className="font-medium text-sm">➕ Add Activity</h2>
        <div>
          <label className="block text-xs font-medium mb-1">Activity Title</label>
          <input
            type="text"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            placeholder="e.g., Web development, Leadership practice"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Weight (importance)</label>
          <input
            type="number"
            value={newActivity.weight}
            onChange={(e) => setNewActivity({ ...newActivity, weight: e.target.value })}
            className="w-full px-2 py-1.5 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            placeholder="1"
            step="0.5"
            min="0.5"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={newActivity.startTime}
              onChange={(e) => setNewActivity({ ...newActivity, startTime: e.target.value })}
              className="w-full px-2 py-1.5 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">End Time</label>
            <input
              type="time"
              value={newActivity.endTime}
              onChange={(e) => setNewActivity({ ...newActivity, endTime: e.target.value })}
              className="w-full px-2 py-1.5 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
        <button
          onClick={addActivity}
          className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-blue-600 text-white text-xs md:text-sm rounded hover:bg-blue-700"
        >
          Add Activity
        </button>
      </div>

      {/* Activities List */}
      {activities.length > 0 && (
        <div className="space-y-1 md:space-y-2">
          <h2 className="font-medium text-sm dark:text-slate-200">Activities ({activities.length})</h2>
          <div className="space-y-2">
            {activities.map((activity, idx) => (
              <div key={idx} className="p-2 md:p-3 bg-white border rounded flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex-1">
                  <div className="font-medium text-xs md:text-sm dark:text-slate-100">{activity.title}</div>
                  <div className="text-xs text-gray-600 mt-1 space-y-0.5 dark:text-slate-400">
                    {activity.startTime && <div>🕐 {formatTime12h(activity.startTime)} - {formatTime12h(activity.endTime)}</div>}
                    <div>Weight: {activity.weight}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeActivity(idx)}
                  className="w-full sm:w-auto px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={saveTemplate}
          disabled={saving || activities.length === 0}
          className="flex-1 px-3 md:px-4 py-2 text-sm bg-calm-500 text-white rounded hover:bg-calm-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Activate Template'}
        </button>
        <button
          onClick={() => router.back()}
          className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm border rounded hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
