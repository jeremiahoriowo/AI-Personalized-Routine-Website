"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { Wand2, Pen } from 'lucide-react'
import { areAnimationsEnabled, setAnimationsEnabled } from '@/lib/theme'

export default function SettingsPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [activeTemplate, setActiveTemplate] = useState<any>(null)
  const [animationsEnabled, setAnimationsEnabledState] = useState(true)
  const [loading, setLoading] = useState(true)

  async function loadTemplates() {
    setLoading(true)
    const res = await fetch('/api/templates')
    const json = await res.json()
    setTemplates(json)
    const active = json.find((t: any) => t.isActive)
    setActiveTemplate(active)
    setLoading(false)
  }

  useEffect(() => {
    loadTemplates()

    const syncAnimations = () => {
      setAnimationsEnabledState(areAnimationsEnabled())
    }

    syncAnimations()
    window.addEventListener('routine-animation-change', syncAnimations)
    return () => {
      window.removeEventListener('routine-animation-change', syncAnimations)
    }
  }, [])

  function handleAnimationsToggle() {
    const next = !animationsEnabled
    setAnimationsEnabledState(next)
    setAnimationsEnabled(next)
  }

  async function activateTemplate(templateId: string) {
    const res = await fetch('/api/templates/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId })
    })
    if (res.ok) {
      await loadTemplates()
    }
  }

  async function deleteTemplate(templateId: string) {
    if (!confirm('Delete this template? This cannot be undone.')) return
    const res = await fetch(`/api/templates/${templateId}`, { method: 'DELETE' })
    if (res.ok) {
      await loadTemplates()
    }
  }

  if (loading) return <div className="text-xs md:text-sm text-text-muted">Loading...</div>

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      <h1 className="text-lg md:text-xl font-semibold text-text">Settings</h1>

      {/* Active Template */}
      <div className="p-3 md:p-4 bg-surface border border-border-color rounded">
        <h2 className="font-bold text-md mb-2 text-text">Active Routine Template</h2>
        {activeTemplate ? (
          <div>
            <div className="text-xs md:text-sm font-medium text-text">{activeTemplate.title}</div>
            <div className="text-xs text-text-muted mt-1">
              Created {new Date(activeTemplate.createdAt).toLocaleDateString()}
              {activeTemplate.createdByAI && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">AI Generated</span>}
            </div>
          </div>
        ) : (
          <p className="text-xs md:text-sm text-text-muted">No active template. Create one to get started.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="font-medium text-sm md:text-base text-text">Quick Actions</h2>
        <Link href="/onboarding" className="block p-2 md:p-3 bg-base border border-border-color rounded hover:bg-surface">
          <div className="flex items-center gap-2 font-medium text-xs md:text-sm text-text">
            <Wand2 className="w-4 h-4" />
            <span>Re-run AI Coach</span>
          </div>
          <div className="text-xs text-text-muted mt-1">Create a new routine with AI guidance</div>
        </Link>
        <Link href="/manual" className="block p-2 md:p-3 bg-base border border-border-color rounded hover:bg-surface">
          <div className="flex items-center gap-2 font-medium text-xs md:text-sm text-text">
            <Pen className="w-4 h-4" />
            <span>Build Manual Template</span>
          </div>
          <div className="text-xs text-text-muted mt-1">Create a routine from scratch</div>
        </Link>
      </div>

      {/* Display */}
      <div className="space-y-2">
        <h2 className="font-medium text-sm md:text-base text-text">Display</h2>
        <div className="p-2 md:p-3 bg-base border border-border-color rounded">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-medium text-xs md:text-sm text-text">Live Background Effects</div>
              <div className="text-xs text-text-muted mt-1">
                Disable for focus mode or better battery life
              </div>
            </div>
            <button
              onClick={handleAnimationsToggle}
              className={`px-2.5 py-1.5 text-xs ${
                animationsEnabled
                  ? 'btn-standout'
                  : 'btn-ghost'
              }`}
            >
              {animationsEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* All Templates */}
      <div className="space-y-2">
        <h2 className="font-medium text-sm md:text-base text-text">All Templates ({templates.length})</h2>
        {templates.length === 0 ? (
          <p className="text-xs md:text-sm text-text-muted">No templates yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t: any) => (
              <div key={t.id} className={`p-2 md:p-3 border border-border-color rounded ${t.isActive ? 'bg-accent/10' : 'bg-base'}`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs md:text-sm text-text truncate">{t.title}</div>
                    <div className="text-xs text-text-muted mt-1 flex flex-wrap gap-1">
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      {t.createdByAI && <span className="text-blue-600">AI</span>}
                      {t.isActive && <span className="text-green-600">Active</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 w-full sm:w-auto">
                    {!t.isActive && (
                      <button
                        onClick={() => activateTemplate(t.id)}
                        className="flex-1 sm:flex-none px-2 py-1 text-xs btn-standout"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="flex-1 sm:flex-none px-2 py-1 text-xs rounded border border-red-300 bg-surface text-red-700 font-medium shadow-sm transition hover:bg-red-50 hover:border-red-400 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
