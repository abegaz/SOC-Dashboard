// src/components/Dashboard/DashboardHeader.tsx
'use client'

import ThemeToggle from '../ui/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'

// ============================================
// PROPS INTERFACE
// ============================================
interface DashboardHeaderProps {
  title: string
  subtitle: string
}

// ============================================
// DASHBOARD HEADER COMPONENT
// ============================================
export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { isDark } = useTheme()
  
  return (
    <header className={`border-b p-6 transition-colors ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        </div>
        
        {/* Theme Toggle Button */}
        <ThemeToggle />
      </div>
    </header>
  )
}