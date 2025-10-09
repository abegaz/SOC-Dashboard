// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  // This state will hold our system health data
  // We'll learn about mock data in the next step!
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 'healthy'
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Security Operations Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time monitoring and alerts</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Metrics Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* CPU Metric Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CPU Usage</p>
                <p className="text-3xl font-bold mt-2">{systemHealth.cpu}%</p>
              </div>
              <div className="text-blue-500">
                {/* Icon placeholder - we'll add icons later */}
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Memory Metric Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Memory Usage</p>
                <p className="text-3xl font-bold mt-2">{systemHealth.memory}%</p>
              </div>
              <div className="text-green-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Disk Metric Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Disk Usage</p>
                <p className="text-3xl font-bold mt-2">{systemHealth.disk}%</p>
              </div>
              <div className="text-purple-500">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Visualization Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">System Health Status</h2>
          
          {/* Health Bars */}
          <div className="space-y-4">
            {/* CPU Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">CPU</span>
                <span className="text-sm font-medium">{systemHealth.cpu}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${systemHealth.cpu}%` }}
                ></div>
              </div>
            </div>

            {/* Memory Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Memory</span>
                <span className="text-sm font-medium">{systemHealth.memory}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${systemHealth.memory}%` }}
                ></div>
              </div>
            </div>

            {/* Disk Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">Disk</span>
                <span className="text-sm font-medium">{systemHealth.disk}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${systemHealth.disk}%` }}
                ></div>
              </div>
            </div>

            {/* Network Status */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <span className="text-sm text-gray-400">Network Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemHealth.network === 'healthy' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {systemHealth.network === 'healthy' ? '● Online' : '● Offline'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}