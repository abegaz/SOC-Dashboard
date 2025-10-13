// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
// Using relative imports from src/app/page.tsx
// ../ goes UP one level from app/ to src/
// Then into components/
import DashboardHeader from './components/Dashboard/DashboardHeader'
import MetricsGrid from './components/Dashboard/MetricsGrid'
import SystemHealthPanel from './components/Dashboard/SystemHealthPanel'
import AlertFeed, { Alert } from './components/Dashboard/AlertFeed'


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
  // EFFECT: Update system health every 3 seconds
  // ============================================
  useEffect(() => {
    setSystemHealth(generateMockSystemHealth())

    const interval = setInterval(() => {
      const newData = generateMockSystemHealth()
      setSystemHealth(newData)
      console.log('Dashboard updated:', newData)
    }, 3000)

    return () => clearInterval(interval)
  }, [])
  
  // ============================================
  // EFFECT: Add new alert every 5 seconds
  // ============================================
  useEffect(() => {
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
  }, []) // Empty array = run once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardHeader 
        title="Security Operations Dashboard"
        subtitle="Real-time monitoring and alerts"
        // For mobile use
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-6 mt-4">
          <button
            onClick={() => setSystemHealth(generateMockSystemHealth())}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm sm:text-base font-semibold transition"
            >
        
        </div>
      />

      <main className="max-w-7xl mx-auto p-6">
        {/* Metrics Grid */}
        <MetricsGrid 
          cpu={systemHealth.cpu}
          memory={systemHealth.memory}
          disk={systemHealth.disk}
        />

        {/* Two Column Layout: System Health + Alert Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column: System Health */}
          <SystemHealthPanel 
            cpu={systemHealth.cpu}
            memory={systemHealth.memory}
            disk={systemHealth.disk}
            network={systemHealth.network}
          />
          
          {/* Right Column: Alert Feed */}
          <AlertFeed alerts={alerts} />
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>🔄 Live Updates:</strong> System metrics update every 3 seconds. 
            New security alerts appear every 5 seconds. Open your browser console (F12) to see update logs.
          </p>
        </div>
      </main>
    </div>
  )
}
