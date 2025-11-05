// src/components/Dashboard/DashboardHeader.tsx
'use client'

import Link from 'next/link'
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
        
        {/* Right side: User info, Settings, Theme Toggle, Logout */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          {user && (
            <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs">{user.email}</p>
            </div>
          )}
          
          {/* Settings Button */}
          <Link
            href="/settings"
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          
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