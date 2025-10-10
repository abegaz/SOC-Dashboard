// src/components/Dashboard/AlertFeed.tsx

import AlertItem from './AlertItem'

// ============================================
// ALERT DATA TYPE
// ============================================
// Define the shape of an alert object
export interface Alert {
  id: number                                    // Unique ID for each alert
  type: 'critical' | 'warning' | 'info' | 'success'
  message: string
  timestamp: string
}

// ============================================
// PROPS INTERFACE
// ============================================
interface AlertFeedProps {
  alerts: Alert[]    // Array of Alert objects
}

// ============================================
// ALERT FEED COMPONENT
// ============================================
// This component receives an array of alerts and displays them
export default function AlertFeed({ alerts }: AlertFeedProps) {
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Security Alerts</h2>
        
        {/* Badge showing number of alerts */}
        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
          {alerts.length} Active
        </span>
      </div>

      {/* Alert List */}
      <div className="space-y-0">
        {/* 
          ============================================
          THE .map() METHOD - SUPER IMPORTANT!
          ============================================
          
          .map() transforms an array into JSX elements
          
          How it works:
          1. Takes each item in the array
          2. Runs a function on that item
          3. Returns a new array with the results
          
          Example:
          [1, 2, 3].map(num => num * 2)  →  [2, 4, 6]
          
          In React:
          alerts.map(alert => <AlertItem ... />)
          
          This creates an AlertItem component for EACH alert in the array!
        */}
        
        {alerts.length > 0 ? (
          // If we have alerts, map over them
          alerts.map((alert) => (
            <AlertItem 
              key={alert.id}              // React needs unique keys for lists
              type={alert.type}
              message={alert.message}
              timestamp={alert.timestamp}
            />
          ))
        ) : (
          // If no alerts, show a message
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">✅</p>
            <p>No alerts at this time. All systems operational.</p>
          </div>
        )}
      </div>
    </div>
  )
}