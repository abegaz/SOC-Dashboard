// src/components/Dashboard/MetricCard.tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

// ============================================
// PROPS INTERFACE
// ============================================
interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

// ============================================
// METRIC CARD COMPONENT
// ============================================
export default function MetricCard({ title, value, icon, color }: MetricCardProps) {
  // ACCESS THE THEME! This was missing!
  const { isDark } = useTheme()
  
  // Helper function to determine status based on value
  const getStatus = () => {
    if (value < 50) return { text: 'Normal', color: 'text-green-400' }
    if (value < 80) return { text: 'Elevated', color: 'text-yellow-400' }
    return { text: 'High', color: 'text-red-400' }
  }

  const status = getStatus()

  // Map color names to Tailwind classes
  const colorClasses = {
    blue: 'hover:border-blue-500 text-blue-500',
    green: 'hover:border-green-500 text-green-500',
    purple: 'hover:border-purple-500 text-purple-500',
    red: 'hover:border-red-500 text-red-500',
    yellow: 'hover:border-yellow-500 text-yellow-500'
  }

  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <div className={`rounded-lg p-6 border transition-colors ${selectedColor.split(' ')[0]} ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          {/* Title of the metric */}
          <p className={isDark ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>{title}</p>
          
          {/* Value with percentage */}
          <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}%
          </p>
          
          {/* Status indicator */}
          <p className="text-xs mt-2">
            <span className={status.color}>● {status.text}</span>
          </p>
        </div>
        
        {/* Icon container */}
        <div className={selectedColor.split(' ')[1]}>
          {icon}
        </div>
      </div>
    </div>
  )
}