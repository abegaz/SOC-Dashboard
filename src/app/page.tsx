// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
// Using relative imports from src/app/page.tsx
// ../ goes UP one level from app/ to src/
// Then into components/
import DashboardHeader from './components/Dashboard/DashboardHeader'
import MetricsGrid from './components/Dashboard/MetricsGrid'
import SystemHealthPanel from './components/Dashboard/SystemHealthPanel'

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

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
// Notice how clean and readable this is now!
// All the complexity is hidden in smaller, focused components
export default function Dashboard() {
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 'healthy'
  })

  // Set up real-time updates
  useEffect(() => {
    setSystemHealth(generateMockSystemHealth())

    const interval = setInterval(() => {
      const newData = generateMockSystemHealth()
      setSystemHealth(newData)
      console.log('Dashboard updated:', newData)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 
        Component 1: Header
        Notice how we pass data using props
      */}
      <DashboardHeader 
        title="Security Operations Dashboard"
        subtitle="Real-time monitoring and alerts"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* 
          Component 2: Metrics Grid
          We pass the 3 values it needs
        */}
        <MetricsGrid 
          cpu={systemHealth.cpu}
          memory={systemHealth.memory}
          disk={systemHealth.disk}
        />

        {/* 
          Component 3: System Health Panel
          We pass all the health data
        */}
        <SystemHealthPanel 
          cpu={systemHealth.cpu}
          memory={systemHealth.memory}
          disk={systemHealth.disk}
          network={systemHealth.network}
        />

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>🔄 Live Updates:</strong> This dashboard updates every 3 seconds with new mock data. 
            The entire UI is now built with reusable components! Open your browser console (F12) to see update logs.
          </p>
        </div>
      </main>
    </div>
  )
}