"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUESTIONS: Array<{ id: string; label: string; type: 'text' | 'select'; options?: string[] }> = [
  // Core Discovery - What matters most
  { id: 'primaryFocus', label: 'What is the ONE thing you want to develop most right now?', type: 'text' },
  { id: 'focusAreas', label: 'What 2-3 other areas matter to you? (comma separated)', type: 'text' },
  { id: 'skills', label: 'What specific skills or habits do these require? (comma separated)', type: 'text' },
  
  // Time & Energy Reality
  { id: 'availableTime', label: 'Realistically, how much focused time do you have daily?', type: 'select', options: ['30–60 minutes', '1–2 hours', '2–4 hours', 'More than 4 hours'] },
  { id: 'bestTime', label: 'When do you have the most energy?', type: 'select', options: ['Early morning (5-8am)', 'Late morning (9-11am)', 'Afternoon (12-4pm)', 'Evening (5-8pm)', 'Night (9pm+)'] },
  { id: 'energyPattern', label: 'How would you describe your energy throughout the day?', type: 'select', options: ['Strong start, fades by afternoon', 'Slow start, peaks midday', 'Steady all day', 'Energy comes in waves'] },
  
  // Obstacles & Patterns
  { id: 'breakers', label: 'What typically derails your consistency? (comma separated)', type: 'text' },
  { id: 'currentConsistency', label: 'What pattern do you notice in yourself?', type: 'select', options: ['I start excited but lose steam', 'I struggle to begin', "I'm inconsistent but keep trying", "I'm steady once I start", "I'm very disciplined"] },
  
  // Structure Preferences
  { id: 'structureKind', label: 'What routine structure helps you most?', type: 'select', options: ['Simple (2-3 core habits)', 'Balanced (clear time blocks, some flex)', 'Detailed (specific schedule)'] },
  { id: 'learningPref', label: 'How do you learn best?', type: 'select', options: ['Short daily practice (15-30min)', 'Longer focused sessions (45-90min)', 'Mix of both'] },
  
  // Motivation & Meaning
  { id: 'whyNow', label: 'What made you want to build this routine now?', type: 'text' },
  { id: 'commitment', label: 'For the next 30 days, what would make you feel proud?', type: 'text' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const initial: Record<string, string> = {
    primaryFocus: 'Web development',
    focusAreas: 'Leadership, music',
    skills: 'Coding, team communication, piano practice',
    availableTime: '1–2 hours',
    bestTime: 'Early morning (5-8am)',
    energyPattern: 'Strong start, fades by afternoon',
    breakers: 'Procrastination, phone distractions, unclear priorities',
    currentConsistency: "I'm inconsistent but keep trying",
    structureKind: 'Balanced (clear time blocks, some flex)',
    learningPref: 'Short daily practice (15-30min)',
    whyNow: 'I feel stuck in my current habits and want to make real progress',
    commitment: 'Show up consistently for my core habits without pressure'
  }

  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)

  function onChange(id: string, value: string) {
    setForm(prev => ({ ...prev, [id]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/ai/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.error) {
        alert('Error creating routine: ' + data.error)
      } else {
        // Redirect to today page after successful creation
        router.push('/today')
      }
    } catch (err) {
      alert('Network error creating routine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-xl font-semibold">AI Coach Onboarding</h1>
      <p className="text-sm text-gray-600 dark:text-slate-400">Answer these gently. The AI will suggest a calm, realistic routine.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        {QUESTIONS.map(q => (
          <div key={q.id}>
            <label className="block text-sm font-medium mb-1">{q.label}</label>
            {q.type === 'text' ? (
              <input value={form[q.id]} onChange={e => onChange(q.id, e.target.value)} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
            ) : (
              <select value={form[q.id]} onChange={e => onChange(q.id, e.target.value)} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                <option value="">Select</option>
                {q.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}

        <div>
          <button type="submit" className="px-4 py-2 bg-calm-500 text-white rounded hover:bg-calm-600 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? 'Generating...' : 'Create Routine'}
          </button>
        </div>
      </form>
    </div>
  )
}
