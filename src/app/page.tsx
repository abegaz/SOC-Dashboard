// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
// Using relative imports from src/app/page.tsx
// ../ goes UP one level from app/ to src/
// Then into components/
import DashboardHeader from './components/Dashboard/DashboardHeader'
import MetricsGrid from './components/Dashboard/MetricsGrid'
import SystemHealthPanel from './components/Dashboard/SystemHealthPanel'
import AlertFeed, {type Alert } from './components/Dashboard/AlertFeed'
import AlertItem from './components/Dashboard/AlertItem'

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
  const types: Alert['type'][] = ['critical', 'warning', 'info', 'success']
  const messages = [
    'CPU usage exceeded 90%',
    'Memory usage exceeded 80%',
    'Disk space below 20%',
    'New login from unknown IP',
    'Software update available',
    'Backup completed successfully'
  ]
  const type = types[Math.floor(Math.random() * types.length)]
  const message = messages[Math.floor(Math.random() * messages.length)]
  const timestamp = new Date().toLocaleTimeString()
  return { id, type, message, timestamp }
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
  
  // Counter for unique alert IDs
  const [alertIdCounter, setAlertIdCounter] = useState(1)

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
    // Add initial alert
    const initialAlert = generateMockAlert(alertIdCounter)
    setAlerts([initialAlert])
    setAlertIdCounter(alertIdCounter + 1)
    
    // Add new alert every 5 seconds
    const alertInterval = setInterval(() => {
      setAlertIdCounter((prevId) => {
        const newAlert = generateMockAlert(prevId)
        
        // Add new alert to the BEGINNING of the array (newest first)
        // Keep only the last 8 alerts
        setAlerts((prevAlerts) => {
          const updatedAlerts = [newAlert, ...prevAlerts]
          return updatedAlerts.slice(0, 5) // Keep only first 5
        })
        
        console.log('New alert generated:', newAlert)
        return prevId + 1
      })
    }, 10000) // 10000ms = 10 seconds
    
    // Cleanup
    return () => clearInterval(alertInterval)
  }, []) // Empty array = run once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <DashboardHeader 
        title="Security Operations Dashboard"
        subtitle="Real-time monitoring and alerts"
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