// src/app/dashboard/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

import DashboardHeader from '../components/Dashboard/DashboardHeader'
import MetricsGrid from '../components/Dashboard/MetricsGrid'
import SystemHealthPanel from '../components/Dashboard/SystemHealthPanel'
import AlertFeed, { Alert } from '../components/Dashboard/AlertFeed'
import AnalyticsMetrics from '../components/Analytics/AnalyticsMetrics'
import TeamPerformance from '../components/Analytics/TeamPerformance'

// ============================================
// MOCK DATA GENERATOR
// ============================================
function generateMockSystemHealth() {
  return {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
    network: Math.random() > 0.2 ? 'healthy' : 'degraded'
  }
}

function generateMockAlert(id: number): Alert {
  const severities = ['info', 'warning', 'critical', 'success'] as const
  const messages = [
    'New login from unknown device',
    'Multiple failed login attempts detected',
    'Unusual outbound traffic detected',
    'Malware signature detected on endpoint',
    'Suspicious file download activity',
    'Potential data exfiltration activity',
    'New software installation detected',
  ]
  return {
    id,
    type: severities[Math.floor(Math.random() * severities.length)] as 'info' | 'warning' | 'critical' | 'success',
    timestamp: new Date().toISOString(),
    message: messages[Math.floor(Math.random() * messages.length)]
  }
}

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
export default function Dashboard() {
  const { isDark } = useTheme()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const router = useRouter()

  // Mobile detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ============================================
  // PROTECTED ROUTE - CHECK AUTHENTICATION
  // ============================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  // ============================================
  // USER PREFERENCES STATE
  // ============================================
  const [preferences, setPreferences] = useState({
    showMetrics: true,
    showSystemHealth: true,
    showAlerts: true,
    showAnalyticsMetrics: true,
    showTeamPerformance: true,
    refreshInterval: 3000
  })
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)

  // State for system health metrics
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 'healthy'
  })

  // ============================================
  // STATE FOR ALERTS
  // ============================================
  const [alerts, setAlerts] = useState<Alert[]>([])

  // ============================================
  // LOAD USER PREFERENCES
  // ============================================
  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user])

  const loadUserPreferences = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/preferences?userId=${user.id}`)
      const data = await response.json()

      if (data.preferences) {
        const prefs = data.preferences

        let visibleWidgets = ['metrics', 'systemHealth', 'alerts', 'analyticsMetrics', 'teamPerformance']
        if (prefs.visible_widgets) {
          try {
            visibleWidgets = JSON.parse(prefs.visible_widgets)
          } catch (e) {
            console.error('Error parsing visible_widgets:', e)
          }
        }

        setPreferences({
          showMetrics: visibleWidgets.includes('metrics'),
          showSystemHealth: visibleWidgets.includes('systemHealth'),
          showAlerts: visibleWidgets.includes('alerts'),
          showAnalyticsMetrics: visibleWidgets.includes('analyticsMetrics'),
          showTeamPerformance: visibleWidgets.includes('teamPerformance'),
          refreshInterval: prefs.refresh_interval || 3000
        })
      }

      setPreferencesLoaded(true)
    } catch (error) {
      console.error('Error loading preferences:', error)
      setPreferencesLoaded(true)
    }
  }

  // ============================================
  // EFFECT: Update system health based on refresh interval
  // ============================================
  useEffect(() => {
    if (!preferencesLoaded) return

    setSystemHealth(generateMockSystemHealth())
    const interval = setInterval(() => {
      const newData = generateMockSystemHealth()
      setSystemHealth(newData)
      console.log('Dashboard updated:', newData)
    }, preferences.refreshInterval)
    return () => clearInterval(interval)
  }, [preferences.refreshInterval, preferencesLoaded])

  // ============================================
  // EFFECT: Add new alert every 5 seconds
  // ============================================
  useEffect(() => {
    if (!preferencesLoaded || !preferences.showAlerts) return

    const initialAlert = generateMockAlert(1)
    setAlerts([initialAlert])

    let nextId = 2

    const alertInterval = setInterval(() => {
      const newAlert = generateMockAlert(nextId)
      setAlerts((prevAlerts) => {
        const updatedAlerts = [newAlert, ...prevAlerts]
        return updatedAlerts.slice(0, 8)
      })
      nextId = nextId + 1
    }, 5000)

    return () => {
      clearInterval(alertInterval)
    }
  }, [preferencesLoaded, preferences.showAlerts])

  // ============================================
  // LOADING STATE
  // ============================================
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // ============================================
  // MOBILE VIEW - SIMPLE STACK LAYOUT
  // ============================================
  if (isMobile) {
    return (
      <div className={`min-h-screen transition-colors ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      }`}>
        <DashboardHeader
          title="Security Dashboard"
          subtitle="Real-time monitoring"
        />
        <main className="p-3 space-y-4"
