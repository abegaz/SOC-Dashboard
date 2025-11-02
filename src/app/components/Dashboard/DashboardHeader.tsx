// src/components/Dashboard/DashboardHeader.tsx
'use client'

import ThemeToggle from '../ui/ThemeToggle'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user, logout } = useAuth()
  
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
        
        {/* Right side: User info, Theme Toggle, Logout */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          {user && (
            <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs">{user.email}</p>
            </div>
          )}
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}