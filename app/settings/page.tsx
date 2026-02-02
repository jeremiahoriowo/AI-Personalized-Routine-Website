"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [activeTemplate, setActiveTemplate] = useState<any>(null)
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
  }, [])

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

  if (loading) return <div className="text-xs md:text-sm text-gray-600 dark:text-slate-400">Loading...</div>

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      <h1 className="text-lg md:text-xl font-semibold dark:text-white">Settings</h1>

      {/* Active Template */}
      <div className="p-3 md:p-4 bg-calm-50 border border-calm-200 rounded dark:bg-slate-900 dark:border-slate-700">
        <h2 className="font-medium text-sm md:text-base mb-2">Active Routine Template</h2>
        {activeTemplate ? (
          <div>
            <div className="text-xs md:text-sm font-medium dark:text-slate-100">{activeTemplate.title}</div>
            <div className="text-xs text-gray-600 mt-1 dark:text-slate-400">
              Created {new Date(activeTemplate.createdAt).toLocaleDateString()}
              {activeTemplate.createdByAI && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">AI Generated</span>}
            </div>
          </div>
        ) : (
          <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400">No active template. Create one to get started.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="font-medium text-sm md:text-base dark:text-slate-200">Quick Actions</h2>
        <Link href="/onboarding" className="block p-2 md:p-3 bg-white border rounded hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800">
          <div className="font-medium text-xs md:text-sm dark:text-slate-100">🤖 Re-run AI Coach</div>
          <div className="text-xs text-gray-600 mt-1 dark:text-slate-400">Create a new routine with AI guidance</div>
        </Link>
        <Link href="/manual" className="block p-2 md:p-3 bg-white border rounded hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800">
          <div className="font-medium text-xs md:text-sm dark:text-slate-100">✏️ Build Manual Template</div>
          <div className="text-xs text-gray-600 mt-1 dark:text-slate-400">Create a routine from scratch</div>
        </Link>
      </div>

      {/* All Templates */}
      <div className="space-y-2">
        <h2 className="font-medium text-sm md:text-base dark:text-slate-200">All Templates ({templates.length})</h2>
        {templates.length === 0 ? (
          <p className="text-xs md:text-sm text-gray-600 dark:text-slate-400">No templates yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t: any) => (
              <div key={t.id} className={`p-2 md:p-3 border rounded ${t.isActive ? 'bg-calm-50 border-calm-300 dark:bg-slate-900 dark:border-slate-700' : 'bg-white border-gray-200 dark:bg-slate-900 dark:border-slate-700'}`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs md:text-sm dark:text-slate-100 truncate">{t.title}</div>
                    <div className="text-xs text-gray-600 mt-1 dark:text-slate-400 flex flex-wrap gap-1">
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      {t.createdByAI && <span className="text-blue-600 dark:text-blue-400">AI</span>}
                      {t.isActive && <span className="text-green-600 dark:text-green-400">Active</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 w-full sm:w-auto">
                    {!t.isActive && (
                      <button
                        onClick={() => activateTemplate(t.id)}
                        className="flex-1 sm:flex-none px-2 py-1 text-xs border rounded hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="flex-1 sm:flex-none px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
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
