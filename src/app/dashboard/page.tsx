// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
// From dashboard/page.tsx, we need to go up TWO levels (dashboard -> app -> src)
// Then into components/
import DashboardHeader from '../components/Dashboard/DashboardHeader'
import MetricsGrid from '../components/Dashboard/MetricsGrid'
import SystemHealthPanel from '../components/Dashboard/SystemHealthPanel'
import AlertFeed, { Alert } from '../components/Dashboard/AlertFeed'


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
    type : severities[Math.floor(Math.random() * severities.length)] as 'info' | 'warning' | 'critical' | 'success',
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
  // This will hold our array of alerts
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
        
        // Parse visible widgets
        let visibleWidgets = ['metrics', 'systemHealth', 'alerts']
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
          refreshInterval: prefs.refresh_interval || 3000
        })
        
        console.log('✅ Preferences loaded:', {
          showMetrics: visibleWidgets.includes('metrics'),
          showSystemHealth: visibleWidgets.includes('systemHealth'),
          showAlerts: visibleWidgets.includes('alerts'),
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
  // EFFECT: Add new alert every 5 seconds (only if alerts widget is visible)
  // ============================================
  useEffect(() => {
    if (!preferencesLoaded || !preferences.showAlerts) return
    
    // Add initial alert immediately
    const initialAlert = generateMockAlert(1)
    setAlerts([initialAlert])
    
    // Keep track of the next ID to use
    let nextId = 2
    
    // Add new alert every 5 seconds
    const alertInterval = setInterval(() => {
      // Generate new alert with current ID
      const newAlert = generateMockAlert(nextId)
      
      // Update alerts: add new one at beginning, keep only first 8
      setAlerts((prevAlerts) => {
        const updatedAlerts = [newAlert, ...prevAlerts]
        return updatedAlerts.slice(0, 8) // Keep only first 8
      })
      
      console.log('New alert generated:', newAlert)
      
      // Increment ID for next alert
      nextId = nextId + 1
    }, 5000) // 5000ms = 5 seconds
    
    // Cleanup function: stop the interval when component unmounts
    return () => {
      clearInterval(alertInterval)
      console.log('Alert interval cleaned up')
    }
  }, [preferencesLoaded, preferences.showAlerts]) // Re-run if showAlerts changes

  // ============================================
  // SHOW LOADING WHILE CHECKING AUTH
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

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <DashboardHeader 
        title="Security Operations Dashboard"
        subtitle="Real-time monitoring and alerts"
      />

      <main className="max-w-7xl mx-auto p-6">
        {/* Metrics Grid - Only show if enabled */}
        {preferences.showMetrics && (
          <MetricsGrid 
            cpu={systemHealth.cpu}
            memory={systemHealth.memory}
            disk={systemHealth.disk}
          />
        )}

        {/* Two Column Layout: System Health + Alert Feed */}
        <div className={`grid gap-6 mb-6 ${
          preferences.showSystemHealth && preferences.showAlerts 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1'
        }`}>
          {/* Left Column: System Health - Only show if enabled */}
          {preferences.showSystemHealth && (
            <SystemHealthPanel 
              cpu={systemHealth.cpu}
              memory={systemHealth.memory}
              disk={systemHealth.disk}
              network={systemHealth.network}
            />
          )}
          
          {/* Right Column: Alert Feed - Only show if enabled */}
          {preferences.showAlerts && (
            <AlertFeed alerts={alerts} />
          )}
        </div>

        {/* Show message if all widgets are hidden */}
        {!preferences.showMetrics && !preferences.showSystemHealth && !preferences.showAlerts && (
          <div className={`text-center py-16 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              All Widgets Hidden
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Go to Settings to enable dashboard widgets
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className={`border rounded-lg p-4 transition-colors ${
          isDark 
            ? 'bg-blue-900/20 border-blue-500/30' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>🔄 Live Updates:</strong> System metrics update every {preferences.refreshInterval / 1000} seconds. 
            New security alerts appear every 5 seconds. 
            <span className="font-semibold"> Customize your dashboard in Settings!</span>
          </p>
        </div>
      </main>
    </div>
  )
}