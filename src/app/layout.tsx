// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
// Initialize database on server startup
import '../lib/init-db'

export const metadata: Metadata = {
  title: 'Security Operations Dashboard',
  description: 'Real-time security monitoring and alerts',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

