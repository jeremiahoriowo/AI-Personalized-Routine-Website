"use client"
import React, { useEffect, useState } from 'react'

export default function TodayPage(){
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [score, setScore] = useState<any>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<any>(null)
  const [templatesLoaded, setTemplatesLoaded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editWeight, setEditWeight] = useState('')
    const [editStartTime, setEditStartTime] = useState('')
    const [editEndTime, setEditEndTime] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addWeight, setAddWeight] = useState('1')
  const [addStartTime, setAddStartTime] = useState('')
  const [addEndTime, setAddEndTime] = useState('')

  const formatTime12h = (time?: string | null) => {
    if (!time) return ''
    const [hStr, mStr] = time.split(':')
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr || '0', 10)
    if (Number.isNaN(h) || Number.isNaN(m)) return time
    const period = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 === 0 ? 12 : h % 12
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`
  }

  async function load(){
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/calendar/today')
      const json = await res.json()
      console.log('Today API response:', json)
      console.log('data.found:', json.found)
      console.log('data.day:', json.day)
      if (json.error) {
        setError(json.error)
      } else {
        console.log('Day instances count:', json.day?.instances?.length)
        setData(json)
      }
      
      // Also fetch active template
      const templatesRes = await fetch('/api/templates')
      const templates = await templatesRes.json()
      console.log('Templates fetched:', templates)
      const active = templates.find((t: any) => t.isActive)
      console.log('Active template:', active)
      setActiveTemplate(active)
      setTemplatesLoaded(true)
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  // Auto-cleanup orphaned data
  useEffect(() => {
    const hasNoTemplates = !activeTemplate
    const hasInstances = data?.found && data?.day?.instances?.length > 0
    
    if (templatesLoaded && hasNoTemplates && hasInstances) {
      const cleanupOrphanedData = async () => {
        try {
          // Delete all orphaned instances
          for (const instance of data.day.instances) {
            await fetch(`/api/calendar/instances/${instance.id}`, { method: 'DELETE' })
          }
          // Reload to show empty state
          await load()
        } catch (err) {
          console.error('Cleanup error:', err)
        }
      }
      cleanupOrphanedData()
    }
  }, [data, activeTemplate])

  async function createToday(){
    setLoading(true)
    const res = await fetch('/api/calendar/create-today', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ forceRecreate: true }) })
    const json = await res.json()
    console.log('Create today response:', json)
    console.log('Created instances:', json.calendarDay?.instances?.length)
    await load()
  }

  async function toggleCheck(instanceId: string, currentStatus: boolean){
    setToggling(instanceId)
    try {
      const res = await fetch('/api/checks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayRoutineInstanceId: instanceId, isCompleted: !currentStatus })
      })
      const json = await res.json()
      if (json.error) {
        setError(json.error)
      } else {
        setScore(json.score)
        await load()
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setToggling(null)
    }
  }

  function openEdit(instance: any) {
    setEditingId(instance.id)
    setEditTitle(instance.customTitle)
    setEditWeight(instance.customWeight?.toString() || '1')
    setEditStartTime(instance.customStartTime || '')
    setEditEndTime(instance.customEndTime || '')
  }

  async function saveEdit() {
    if (!editingId) return
    try {
      const res = await fetch(`/api/calendar/instances/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customTitle: editTitle,
          customWeight: parseFloat(editWeight),
          customStartTime: editStartTime || null,
          customEndTime: editEndTime || null
        })
      })
      if (res.ok) {
        setEditingId(null)
        await load()
      } else {
        const json = await res.json()
        alert('Error: ' + (json.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function deleteRoutine(instanceId: string) {
    if (!confirm('Delete this routine? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/calendar/instances/${instanceId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        await load()
      } else {
        const json = await res.json()
        alert('Error: ' + (json.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  async function addRoutine() {
    if (!addTitle.trim()) return
    try {
      const res = await fetch('/api/calendar/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarDayId: data.day.id,
          activeTemplateId: activeTemplate?.id,
          title: addTitle.trim(),
          weight: parseFloat(addWeight),
          startTime: addStartTime || null,
          endTime: addEndTime || null
        })
      })
      if (res.ok) {
        setAddTitle('')
        setAddWeight('1')
          setAddStartTime('')
          setAddEndTime('')
        setIsAdding(false)
        await load()
      } else {
        const json = await res.json()
        alert('Error: ' + (json.error || 'Unknown error'))
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) return <div className="text-xs md:text-sm text-gray-600 dark:text-slate-400 px-3 md:px-0">Loading...</div>

  if (error) return (
    <div className="space-y-3 md:space-y-4 px-3 md:px-0">
      <h1 className="text-lg md:text-xl font-semibold dark:text-white">Today</h1>
      <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
        <p className="font-medium text-sm md:text-base">Error:</p>
        <p className="text-xs md:text-sm">{error}</p>
      </div>
      <button onClick={load} className="px-3 md:px-4 py-1.5 md:py-2 text-sm border rounded dark:border-slate-700 dark:text-slate-200">Retry</button>
    </div>
  )

  // Debug: show warning if no templates but day exists with instances
  const hasNoTemplates = !activeTemplate
  const hasInstances = data?.found && data?.day?.instances?.length > 0

  if (hasNoTemplates && hasInstances) {
    return (
      <div className="space-y-3 md:space-y-4 px-3 md:px-0">
        <h1 className="text-lg md:text-xl font-semibold dark:text-white">Today</h1>
        <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="font-medium text-sm md:text-base">Cleaning up old data...</p>
          <p className="text-xs md:text-sm text-gray-600 mt-2 dark:text-slate-400">Removing routines from deleted template.</p>
        </div>
      </div>
    )
  }

  if (!data?.found) {
    return (
      <div className="space-y-3 md:space-y-4 px-3 md:px-0">
        <h1 className="text-lg md:text-xl font-semibold dark:text-white">Today</h1>
        {activeTemplate ? (
          <>
            <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400">No routine exists for today.</p>
            <button onClick={createToday} className="px-3 md:px-4 py-1.5 md:py-2 text-sm bg-calm-500 text-white rounded">Create today's routine from active template</button>
          </>
        ) : (
          <>
            <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-900/20 dark:border-yellow-800">
              <p className="font-medium text-sm md:text-base">No templates found</p>
              <p className="text-xs md:text-sm text-gray-600 mt-2 dark:text-slate-400">All your templates have been deleted. Let's create a new routine to get started.</p>
            </div>
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="px-3 md:px-4 py-1.5 md:py-2 text-sm bg-calm-500 text-white rounded"
            >
              Create New Routine
            </button>
          </>
        )}
      </div>
    )
  }

  const day = data.day

  const templateMismatch = activeTemplate && day.templateId && activeTemplate.id !== day.templateId

  if (!day.instances || day.instances.length === 0) {
    return (
      <div className="space-y-3 md:space-y-4 px-3 md:px-0">
        <h1 className="text-lg md:text-xl font-semibold dark:text-white">Today — {new Date(day.date).toDateString()}</h1>
        <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="font-medium text-sm md:text-base">No routine items for today</p>
          <button onClick={createToday} className="mt-2 px-2 md:px-3 py-1 bg-yellow-600 text-white text-xs md:text-sm rounded">Create from template</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4 pb-8 px-3 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <h1 className="text-lg md:text-xl font-semibold dark:text-white">Today — {new Date(day.date).toDateString()}</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAdding(true)}
            className="flex-1 sm:flex-none px-2 md:px-3 py-1 text-xs md:text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-50 dark:border-blue-800 dark:text-blue-200 dark:hover:bg-blue-900/30"
          >
            ➕ Add
          </button>
          <button 
            onClick={createToday}
            className="flex-1 sm:flex-none px-2 md:px-3 py-1 text-xs md:text-sm border border-calm-300 text-calm-600 rounded hover:bg-calm-50 dark:border-slate-700 dark:text-calm-200 dark:hover:bg-slate-800"
          >
            🔄 Recreate
          </button>
        </div>
      </div>

      {templateMismatch && (
        <div className="p-2 md:p-3 bg-blue-50 border border-blue-300 rounded dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-xs md:text-sm font-medium text-blue-900">Template changed</p>
          <p className="text-xs text-blue-700 mt-1 dark:text-blue-200">You activated a different template. Recreate today's routine to apply the new template.</p>
          <button onClick={createToday} className="mt-2 px-2 md:px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
            Apply new template
          </button>
        </div>
      )}
      
      {score && (
        <div className="p-2 md:p-3 bg-calm-50 border border-calm-200 rounded dark:bg-slate-900 dark:border-slate-700">
          <p className="text-xs md:text-sm font-medium">Today's Score</p>
          <p className="text-base md:text-lg font-bold text-calm-500">{score.disciplineRating}%</p>
          <p className="text-xs text-gray-600 dark:text-slate-400">Progress: {score.achievedScore.toFixed(1)} / {score.totalPossibleScore.toFixed(1)}</p>
        </div>
      )}

      {isAdding && (
        <div className="p-2 md:p-3 bg-white border border-blue-300 rounded space-y-2 dark:bg-slate-900 dark:border-blue-800">
          <input
            type="text"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            className="w-full px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            placeholder="Routine title"
          />
          <input
            type="number"
            value={addWeight}
            onChange={(e) => setAddWeight(e.target.value)}
            className="w-full px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            placeholder="Weight"
            step="0.5"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="time"
              value={addStartTime}
              onChange={(e) => setAddStartTime(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              placeholder="Start time"
            />
            <input
              type="time"
              value={addEndTime}
              onChange={(e) => setAddEndTime(e.target.value)}
              className="flex-1 px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              placeholder="End time"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={addRoutine}
              className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs md:text-sm rounded hover:bg-blue-700"
            >
              Add Routine
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 px-2 py-1 border rounded text-xs md:text-sm hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {day.instances
          .slice()
          .sort((a: any, b: any) => {
            const ta = a.customStartTime || ''
            const tb = b.customStartTime || ''
            if (!ta && !tb) return (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
            if (!ta) return 1
            if (!tb) return -1
            return ta.localeCompare(tb)
          })
          .map((it: any) => (
            <div key={it.id}>
            {editingId === it.id ? (
              <div className="p-2 md:p-3 bg-white border border-blue-300 rounded space-y-2 dark:bg-slate-900 dark:border-blue-800">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  placeholder="Routine title"
                />
                <input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="w-full px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                  placeholder="Weight"
                  step="0.5"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    placeholder="Start time"
                  />
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-xs md:text-sm dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                    placeholder="End time"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={saveEdit}
                    className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs md:text-sm rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="flex-1 px-2 py-1 border rounded text-xs md:text-sm hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-2 md:p-3 bg-white border rounded flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-2 cursor-pointer hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800 ${it.check?.isCompleted ? 'border-green-300' : 'border-gray-200'} dark:border-slate-700`}>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-xs md:text-sm ${it.check?.isCompleted ? 'line-through text-gray-400' : ''} dark:text-slate-100`}>{it.customTitle}</div>
                  <div className="text-xs text-gray-500 flex flex-col sm:flex-row gap-1 sm:gap-2 dark:text-slate-400 mt-1 sm:mt-0">
                    {(it.customStartTime && it.customEndTime) && (
                      <span>🕐 {formatTime12h(it.customStartTime)} - {formatTime12h(it.customEndTime)}</span>
                    )}
                    {it.customRecommendedTime && !it.customStartTime && <span>⏱ {it.customRecommendedTime}</span>}
                    <span>Weight: {it.customWeight}</span>
                  </div>
                </div>
                <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openEdit(it)}
                    className="flex-1 sm:flex-none px-1.5 md:px-2 py-1 text-xs border rounded hover:bg-blue-50 text-blue-600 dark:border-slate-700 dark:text-blue-200 dark:hover:bg-slate-800"
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => deleteRoutine(it.id)}
                    className="flex-1 sm:flex-none px-1.5 md:px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
                  >
                    🗑 Delete
                  </button>
                  <button
                    onClick={() => toggleCheck(it.id, it.check?.isCompleted || false)}
                    disabled={toggling === it.id}
                    className={`flex-1 sm:flex-none px-2 md:px-3 py-1 rounded text-xs md:text-sm ${it.check?.isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} dark:bg-slate-800 dark:text-slate-200`}
                  >
                    {toggling === it.id ? 'Updating...' : it.check?.isCompleted ? '✓ Done' : 'Mark done'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
