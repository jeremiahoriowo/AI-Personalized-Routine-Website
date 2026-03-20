"use client"
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Timer, Check, Circle } from 'lucide-react'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [days, setDays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<any>(null)

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

  async function loadMonth(date: Date) {
    setLoading(true)
    const year = date.getFullYear()
    const month = date.getMonth()
    const res = await fetch(`/api/calendar/month?year=${year}&month=${month}`)
    const json = await res.json()
    setDays(json.days || [])
    setLoading(false)
  }

  useEffect(() => {
    loadMonth(currentMonth)
  }, [currentMonth])

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  function getDayData(dayNum: number) {
    const target = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
    return days.find(d => {
      const dDate = new Date(d.date)
      return dDate.getDate() === dayNum && dDate.getMonth() === target.getMonth()
    })
  }

  function getCompletionPercent(day: any) {
    if (!day || !day.instances || day.instances.length === 0) return null
    const completed = day.instances.filter((i: any) => i.check?.isCompleted).length
    return Math.round((completed / day.instances.length) * 100)
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)

  function handleMonthChange(newMonth: number) {
    setCurrentMonth(new Date(year, newMonth))
  }

  function handleYearChange(newYear: number) {
    setCurrentMonth(new Date(newYear, month))
  }

  return (
    <div className="space-y-3 md:space-y-4 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <button onClick={prevMonth} className="inline-flex items-center gap-1 px-2 md:px-3 py-1 border border-border-color rounded text-xs md:text-sm text-text hover:bg-surface">
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>
        
        <div className="flex gap-1 md:gap-2">
          <select 
            value={month} 
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            className="px-2 md:px-3 py-1 border border-border-color rounded text-xs md:text-sm bg-base text-text"
          >
            {months.map((m, idx) => (
              <option key={idx} value={idx}>{m}</option>
            ))}
          </select>
          
          <select 
            value={year} 
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="px-2 md:px-3 py-1 border border-border-color rounded text-xs md:text-sm bg-base text-text"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button onClick={nextMonth} className="inline-flex items-center gap-1 px-2 md:px-3 py-1 border border-border-color rounded text-xs md:text-sm text-text hover:bg-surface">
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-xs md:text-sm text-text-muted px-3 md:px-0">Loading...</div>
      ) : (
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-text-muted py-1 md:py-2">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={idx} className="aspect-square" />
            const dayData = getDayData(day)
            const percent = getCompletionPercent(dayData)
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(dayData)}
                className={`aspect-square border rounded p-1 md:p-2 text-xs md:text-sm hover:bg-surface ${isToday ? 'border-accent bg-accent/10' : 'border-border-color'} ${dayData ? 'bg-base' : 'bg-surface'}`}
              >
                <div className="font-medium text-xs md:text-sm text-text">{day}</div>
                {percent !== null && (
                  <div className={`text-xs mt-0.5 md:mt-1 ${percent === 100 ? 'text-green-600' : percent > 50 ? 'text-yellow-600' : 'text-text-muted'}`}>
                    {percent}%
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {selectedDay && (
        <div className="mt-2 md:mt-4 p-2 md:p-4 bg-surface border border-border-color rounded">
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <h2 className="font-semibold text-sm md:text-base text-text">{new Date(selectedDay.date).toDateString()}</h2>
            <button onClick={() => setSelectedDay(null)} className="text-xs md:text-sm text-text-muted hover:text-text">Close</button>
          </div>
          {selectedDay.instances && selectedDay.instances.length > 0 ? (
            <div className="space-y-1 md:space-y-2">
              {selectedDay.instances
                .slice()
                .sort((a: any, b: any) => {
                  const ta = a.customStartTime || ''
                  const tb = b.customStartTime || ''
                  if (!ta && !tb) return (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
                  if (!ta) return 1
                  if (!tb) return -1
                  return ta.localeCompare(tb)
                })
                .map((inst: any) => (
                  <div key={inst.id} className="flex justify-between items-center text-xs md:text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={inst.check?.isCompleted ? 'line-through text-text-muted' : 'text-text'}>
                        {inst.customTitle}
                      </div>
                      {inst.customStartTime && inst.customEndTime ? (
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime12h(inst.customStartTime)} - {formatTime12h(inst.customEndTime)}</span>
                        </div>
                      ) : inst.customRecommendedTime ? (
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          <span>{inst.customRecommendedTime}</span>
                        </div>
                      ) : null}
                    </div>
                    <span>
                      {inst.check?.isCompleted ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-text-muted" />
                      )}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
              <p className="text-xs md:text-sm text-text-muted">No routine for this day</p>
          )}
          {selectedDay.dailyScore && (
              <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border-color">
              <span className="font-medium text-text">Score: </span>
              <span className="text-accent">{selectedDay.dailyScore.disciplineRating}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
