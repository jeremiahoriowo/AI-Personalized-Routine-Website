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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-surface text-accent text-xs">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Calm routines, real progress
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text">
              Purpose-Driven Routine Builder
            </h1>
            <p className="text-xs sm:text-sm md:text-[1rem] text-text-muted">
              Build rhythm without pressure. Create a daily flow that supports your goals,
              energy, and life — gently.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
              <Link
                href="/register"
                className="px-4 md:px-5 py-2 md:py-2.5 bg-accent text-white rounded-md text-sm font-medium hover:opacity-90 transition"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-4 md:px-5 py-2 md:py-2.5 border border-surface rounded-md text-sm font-medium text-text hover:bg-surface transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Feature Cards on Left Side */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-4 border border-surface rounded-lg bg-base shadow-sm">
              <h2 className="text-sm md:text-[1rem] font-semibold text-text">AI Coach Onboarding</h2>
              <p className="text-xs md:text-sm text-text-muted mt-1">
                Answer 12 gentle questions and get a balanced routine with time blocks.
              </p>
            </div>
            <div className="p-4 border border-surface rounded-lg bg-base shadow-sm">
              <h2 className="text-sm md:text-[1rem] font-semibold text-text">Manual Builder</h2>
              <p className="text-xs md:text-sm text-text-muted mt-1">
                Add activities one by one, choose weights, and set your own time range.
              </p>
            </div>
          </div>

          {/* Stats on Left Side */}
          <div className="grid gap-2 grid-cols-3">
            <div className="p-3 rounded-lg bg-surface border border-surface">
              <div className="text-xs text-text-muted">Daily Flow</div>
              <div className="text-sm md:text-[1rem] font-medium text-text">7–9 focused blocks</div>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-surface">
              <div className="text-xs text-text-muted">Time Ranges</div>
              <div className="text-sm md:text-[1rem] font-medium text-text">Clear start–end times</div>
            </div>
            <div className="p-3 rounded-lg bg-surface border border-surface">
              <div className="text-xs text-text-muted">Gentle Scoring</div>
              <div className="text-sm md:text-[1rem] font-medium text-text">Progress without pressure</div>
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
