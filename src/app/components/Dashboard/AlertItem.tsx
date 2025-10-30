// src/components/Dashboard/AlertItem.tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

type AlertType = 'critical' | 'warning' | 'info' | 'success'

interface AlertItemProps {
  type: AlertType
  message: string
  timestamp: string
}

export default function AlertItem({ type, message, timestamp }: AlertItemProps) {
  const { isDark } = useTheme()
  
  const getAlertStyles = (alertType: AlertType) => {
    const styles = {
      critical: {
        bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
        border: 'border-red-500',
        text: isDark ? 'text-red-400' : 'text-red-700',
        icon: '🔴'
      },
      warning: {
        bg: isDark ? 'bg-yellow-900/30' : 'bg-yellow-50',
        border: 'border-yellow-500',
        text: isDark ? 'text-yellow-400' : 'text-yellow-700',
        icon: '⚠️'
      },
      info: {
        bg: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
        border: 'border-blue-500',
        text: isDark ? 'text-blue-400' : 'text-blue-700',
        icon: 'ℹ️'
      },
      success: {
        bg: isDark ? 'bg-green-900/30' : 'bg-green-50',
        border: 'border-green-500',
        text: isDark ? 'text-green-400' : 'text-green-700',
        icon: '✅'
      }
    }
    
    return styles[alertType]
  }

  const style = getAlertStyles(type)

  return (
    <div 
      className={`
        ${style.bg} 
        ${style.border} 
        border-l-4 
        rounded-lg 
        p-4 
        mb-3 
        transition-all 
        duration-300 
        hover:scale-[1.02]
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <span className={`${style.text} font-bold text-sm uppercase`}>
            {type}
          </span>
        </div>
        
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          {timestamp}
        </span>
      </div>
      
      <p className={`text-sm ml-7 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {message}
      </p>
    </div>
  )
}