// src/app/dashboard/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
// @ts-ignore - Grid layout doesn't have perfect types
import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

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
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
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
  
  // ============================================
  // DRAG & DROP LAYOUT STATE
  // ============================================
  const [layout, setLayout] = useState([
    { i: 'metrics', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'systemHealth', x: 0, y: 4, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'alerts', x: 6, y: 4, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'analyticsMetrics', x: 0, y: 10, w: 12, h: 5, minW: 6, minH: 4 },
    { i: 'teamPerformance', x: 0, y: 15, w: 12, h: 6, minW: 6, minH: 5 }
  ])
  const [isLayoutLocked, setIsLayoutLocked] = useState(false)
  
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
        
        if (prefs.dashboard_layout) {
          try {
            const savedLayout = JSON.parse(prefs.dashboard_layout)
            if (savedLayout && savedLayout.length > 0) {
              setLayout(savedLayout)
            }
          } catch (e) {
            console.error('Error parsing dashboard_layout:', e)
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
  // HANDLE LAYOUT CHANGE (DRAG & DROP)
  // ============================================
  const handleLayoutChange = (newLayout: any) => {
    if (isLayoutLocked) return
    setLayout(newLayout)
  }
  
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
        <main className="p-3 space-y-4">
          {/* Metrics Widget */}
          {preferences.showMetrics && (
            <div className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3">
                <h3 className={`font-bold mb-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  System Metrics
                </h3>
                <MetricsGrid 
                  cpu={systemHealth.cpu}
                  memory={systemHealth.memory}
                  disk={systemHealth.disk}
                />
              </div>
            </div>
          )}
          
          {/* System Health Widget */}
          {preferences.showSystemHealth && (
            <div className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3">
                <h3 className={`font-bold mb-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  System Health
                </h3>
                <SystemHealthPanel 
                  cpu={systemHealth.cpu}
                  memory={systemHealth.memory}
                  disk={systemHealth.disk}
                  network={systemHealth.network}
                />
              </div>
            </div>
          )}
          
          {/* Alerts Widget */}
          {preferences.showAlerts && (
            <div className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3">
                <h3 className={`font-bold mb-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Security Alerts
                </h3>
                <AlertFeed alerts={alerts} />
              </div>
            </div>
          )}
          
          {/* Analytics Metrics Widget */}
          {preferences.showAnalyticsMetrics && (
            <div className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3">
                <h3 className={`font-bold mb-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Analytics Overview
                </h3>
                <AnalyticsMetrics />
              </div>
            </div>
          )}
          
          {/* Team Performance Widget */}
          {preferences.showTeamPerformance && (
            <div className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-3">
                <h3 className={`font-bold mb-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Team Performance
                </h3>
                <TeamPerformance />
              </div>
            </div>
          )}
          
          {/* Info Box */}
          <div className={`border rounded-lg p-3 transition-colors ${
            isDark 
              ? 'bg-blue-900/20 border-blue-500/30' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>Note: </strong> 
              Metrics update every {preferences.refreshInterval / 1000}s.
            </p>
          </div>
        </main>
      </div>
    )
  }
  // ============================================
  // Remove Drag and Drop for Mobile
  // ============================================

  // Mobile: Simple stacked divs (no grid at all)
  if (isMobile) {
    return (
      <main className="p-3 space-y-4">
        {/* Just regular divs that stack */}
      </main>
    )
  }

// Desktop: Grid with drag-and-drop
return (
  <GridLayout isDraggable={!isLayoutLocked} ...>
    {/* Draggable grid */}
  </GridLayout>
)
  
  // ============================================
  // DESKTOP VIEW - GRID LAYOUT
  // ============================================
  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <DashboardHeader 
        title="Security Operations Dashboard"
        subtitle="Real-time monitoring and alerts"
      />
      <main className="max-w-7xl mx-auto p-6">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={1200}
          onLayoutChange={handleLayoutChange}
          isDraggable={!isLayoutLocked}
          isResizable={!isLayoutLocked}
          compactType="vertical"
          preventCollision={false}
        >
          {/* Metrics Widget */}
          {preferences.showMetrics && (
            <div key="metrics" className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 h-full overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    System Metrics
                  </h3>
                  {!isLayoutLocked && (
                    <span className="text-xs text-gray-500 cursor-move">⋮⋮</span>
                  )}
                </div>
                <MetricsGrid 
                  cpu={systemHealth.cpu}
                  memory={systemHealth.memory}
                  disk={systemHealth.disk}
                />
              </div>
            </div>
          )}
          
          {/* System Health Widget */}
          {preferences.showSystemHealth && (
            <div key="systemHealth" className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 h-full overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    System Health
                  </h3>
                  {!isLayoutLocked && (
                    <span className="text-xs text-gray-500 cursor-move">⋮⋮</span>
                  )}
                </div>
                <SystemHealthPanel 
                  cpu={systemHealth.cpu}
                  memory={systemHealth.memory}
                  disk={systemHealth.disk}
                  network={systemHealth.network}
                />
              </div>
            </div>
          )}
          
          {/* Alerts Widget */}
          {preferences.showAlerts && (
            <div key="alerts" className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 h-full overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Security Alerts
                  </h3>
                  {!isLayoutLocked && (
                    <span className="text-xs text-gray-500 cursor-move">⋮⋮</span>
                  )}
                </div>
                <AlertFeed alerts={alerts} />
              </div>
            </div>
          )}
          
          {/* Analytics Metrics Widget */}
          {preferences.showAnalyticsMetrics && (
            <div key="analyticsMetrics" className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 h-full overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Analytics Overview
                  </h3>
                  {!isLayoutLocked && (
                    <span className="text-xs text-gray-500 cursor-move">⋮⋮</span>
                  )}
                </div>
                <AnalyticsMetrics />
              </div>
            </div>
          )}
          
          {/* Team Performance Widget */}
          {preferences.showTeamPerformance && (
            <div key="teamPerformance" className={`rounded-lg border transition-colors ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 h-full overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Team Performance
                  </h3>
                  {!isLayoutLocked && (
                    <span className="text-xs text-gray-500 cursor-move">⋮⋮</span>
                  )}
                </div>
                <TeamPerformance />
              </div>
            </div>
          )}
        </GridLayout>
        
        {/* Show message if all widgets are hidden */}
        {!preferences.showMetrics && !preferences.showSystemHealth && !preferences.showAlerts && !preferences.showAnalyticsMetrics && !preferences.showTeamPerformance && (
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
        <div className={`mt-6 border rounded-lg p-4 transition-colors ${
          isDark 
            ? 'bg-blue-900/20 border-blue-500/30' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            <strong>Note: </strong> 
            Metrics update every {preferences.refreshInterval / 1000} seconds.
          </p>
        </div>
      </main>
    </div>
  )
}
