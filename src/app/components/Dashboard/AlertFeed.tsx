// src/components/Dashboard/AlertFeed.tsx
'use client'

import AlertItem from './AlertItem'
import { useTheme } from '@/contexts/ThemeContext'

// ============================================
// ALERT DATA TYPE
// ============================================
export interface Alert {
  id: number
  type: 'critical' | 'warning' | 'info' | 'success'
  message: string
  timestamp: string
}

// ============================================
// PROPS INTERFACE
// ============================================
interface AlertFeedProps {
  alerts: Alert[]
}

// ============================================
// ALERT FEED COMPONENT
// ============================================
export default function AlertFeed({ alerts }: AlertFeedProps) {
  const { isDark } = useTheme()
  
  return (
    <div className={`rounded-lg p-6 border transition-colors ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Security Alerts
        </h2>
        
        {/* Badge showing number of alerts */}
        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
          {alerts.length} Active
        </span>
      </div>

      {/* Alert List */}
      <div className="space-y-0">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <AlertItem 
              key={alert.id}
              type={alert.type}
              message={alert.message}
              timestamp={alert.timestamp}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">✅</p>
            <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
              No alerts at this time. All systems operational.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}