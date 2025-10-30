// src/components/ui/ProgressBar.tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

// ============================================
// PROPS INTERFACE
// ============================================
interface ProgressBarProps {
  label: string
  value: number
  color?: string
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
export default function ProgressBar({ label, value, color }: ProgressBarProps) {
  const { isDark } = useTheme()
  
  // Dynamic color selection based on value (if no color provided)
  const getBarColor = () => {
    if (color) return color
    
    if (value < 50) return 'bg-green-500'
    if (value < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div>
      {/* Label and Value */}
      <div className="flex justify-between mb-2">
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}%</span>
      </div>
      
      {/* Progress Bar Track */}
      <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        {/* Progress Bar Fill */}
        <div 
          className={`${getBarColor()} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )
}