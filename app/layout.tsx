import '../styles/globals.css'
import React from 'react'
import BottomNav from '../components/BottomNav'
import ThemeProvider from '../components/ThemeProvider'
import ConditionalThemeToggle from '../components/ConditionalThemeToggle'
import SessionProvider from '../components/SessionProvider'

export const metadata = {
  title: 'Purpose-Driven Routine Builder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-x-hidden">
        <SessionProvider>
          <ThemeProvider>
            <ConditionalThemeToggle />
            <div className="min-h-screen max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
              {children}
            </div>
            <BottomNav />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
