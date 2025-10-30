// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'Security Operations Dashboard',
  description: 'Real-time security monitoring and alerts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* 
          ThemeProvider wraps everything
          Now ALL components can access theme!
        */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}