import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomeContent() {
  return (
    <main className="min-h-screen w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* Left Side - Content */}
        <div className="flex flex-col justify-center space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 lg:px-12 py-8 transform scale-[0.95] transition-transform duration-300">
          <div className="space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-calm-50 border border-calm-200 text-calm-700 text-xs dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-calm-500" />
              Calm routines, real progress
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Purpose-Driven Routine Builder
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-slate-400">
              Build rhythm without pressure. Create a daily flow that supports your goals,
              energy, and life — gently.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
              <Link
                href="/register"
                className="px-4 md:px-5 py-2 md:py-2.5 bg-calm-500 text-white rounded-md text-sm font-medium hover:bg-calm-600 transition"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-4 md:px-5 py-2 md:py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Feature Cards on Left Side */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-4 border rounded-lg bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
              <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">AI Coach Onboarding</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1 dark:text-slate-400">
                Answer 12 gentle questions and get a balanced routine with time blocks.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
              <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">Manual Builder</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1 dark:text-slate-400">
                Add activities one by one, choose weights, and set your own time range.
              </p>
            </div>
          </div>

          {/* Stats on Left Side */}
          <div className="grid gap-2 grid-cols-3">
            <div className="p-3 rounded-lg bg-calm-50 border border-calm-200 dark:bg-slate-900 dark:border-slate-700">
              <div className="text-xs text-gray-600 dark:text-slate-400">Daily Flow</div>
              <div className="text-sm md:text-base font-medium text-gray-900 dark:text-white">7–9 focused blocks</div>
            </div>
            <div className="p-3 rounded-lg bg-calm-50 border border-calm-200 dark:bg-slate-900 dark:border-slate-700">
              <div className="text-xs text-gray-600 dark:text-slate-400">Time Ranges</div>
              <div className="text-sm md:text-base font-medium text-gray-900 dark:text-white">Clear start–end times</div>
            </div>
            <div className="p-3 rounded-lg bg-calm-50 border border-calm-200 dark:bg-slate-900 dark:border-slate-700">
              <div className="text-xs text-gray-600 dark:text-slate-400">Gentle Scoring</div>
              <div className="text-sm md:text-base font-medium text-gray-900 dark:text-white">Progress without pressure</div>
            </div>
          </div>
        </div>

        {/* Right Side - Fixed Full-Height Image */}
        <div className="hidden md:block fixed top-0 right-0 w-1/2 h-screen">
          <Image
            src="/images/notepad.jpg"
            alt="Routine planning notepad"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </main>
  )
}
