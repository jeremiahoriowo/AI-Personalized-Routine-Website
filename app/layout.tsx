import '../styles/globals.css'
import React from 'react'
import ConditionalBottomNav from '../components/ConditionalBottomNav'
import ThemeProvider from '../components/ThemeProvider'
import ConditionalThemeToggle from '../components/ConditionalThemeToggle'
import ThemeTester from '../components/ThemeTester'
import SessionProvider from '../components/SessionProvider'

export const metadata = {
  title: 'Purpose-Driven Routine Builder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-mode="calm" data-theme="light">
      <body className="bg-base text-text dark:bg-base dark:text-text overflow-x-hidden font-sans">
        <SessionProvider>
          <ThemeProvider>
            <ConditionalThemeToggle />
            <ThemeTester />
            <div className="min-h-screen max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
              {children}
            </div>
            <ConditionalBottomNav />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
