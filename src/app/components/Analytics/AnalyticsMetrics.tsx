// src/components/Analytics/AnalyticsMetrics.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

// ============================================
// TYPE DEFINITIONS
// ============================================
interface AnalyticsData {
  totalIncidents: number
  openIncidents: number
  closedIncidents: number
  averageMTTD: number  // Mean Time To Detect (in minutes)
  averageMTTR: number  // Mean Time To Respond (in minutes)
  criticalIncidents: number
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AnalyticsMetrics() {
  const { isDark } = useTheme()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // FETCH ANALYTICS DATA ON MOUNT
  // ============================================
  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics?type=overview')
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const result = await response.json()
      setData(result.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error || !data) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{error || 'No data available'}</p>
      </div>
    )
  }

  // ============================================
  // FORMAT TIME HELPER
  // ============================================
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes.toFixed(1)}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins.toFixed(0)}m`
  }

  // ============================================
  // METRIC CARD COMPONENT
  // ============================================
  const MetricCard = ({ 
    label, 
    value, 
    icon, 
    color = 'blue',
    suffix = ''
  }: { 
    label: string
    value: string | number
    icon: React.ReactNode
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
    suffix?: string
  }) => {
    const colorClasses = {
      blue: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600',
      green: isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600',
      red: isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600',
      yellow: isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
      purple: isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
    }

    return (
      <div className={`p-4 rounded-lg transition-colors ${
        isDark ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium uppercase tracking-wide ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {label}
          </span>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div className="flex items-baseline">
          <span className={`text-2xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </span>
          {suffix && (
            <span className={`ml-1 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    )
  }

  // ============================================
  // RENDER METRICS GRID
  // ============================================
  return (
    <div className="space-y-3">
      {/* Row 1: Incident Counts */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Total Incidents"
          value={data.totalIncidents}
          color="blue"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        <MetricCard
          label="Open"
          value={data.openIncidents}
          color="yellow"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <MetricCard
          label="Closed"
          value={data.closedIncidents}
          color="green"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Row 2: Response Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          label="Avg MTTD"
          value={formatTime(data.averageMTTD)}
          color="purple"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        
        <MetricCard
          label="Avg MTTR"
          value={formatTime(data.averageMTTR)}
          color="blue"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        
        <MetricCard
          label="Critical"
          value={data.criticalIncidents}
          color="red"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Info Text */}
      <div className={`text-xs text-center pt-2 ${
        isDark ? 'text-gray-500' : 'text-gray-600'
      }`}>
        MTTD = Mean Time To Detect | MTTR = Mean Time To Respond
      </div>
    </div>
  )
}