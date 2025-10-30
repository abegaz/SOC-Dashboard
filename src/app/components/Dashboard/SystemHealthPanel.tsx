// src/components/Dashboard/SystemHealthPanel.tsx
'use client'

import ProgressBar from '../ui/ProgressBar'
import { useTheme } from '@/contexts/ThemeContext'

// ============================================
// PROPS INTERFACE
// ============================================
interface SystemHealthPanelProps {
  cpu: number
  memory: number
  disk: number
  network: string
}

// ============================================
// SYSTEM HEALTH PANEL COMPONENT
// ============================================
export default function SystemHealthPanel({ cpu, memory, disk, network }: SystemHealthPanelProps) {
  const { isDark } = useTheme()
  
  // Helper function to style the network status badge
  const getStatusBadge = (status: string) => {
    if (status === 'healthy') {
      return 'bg-green-500/20 text-green-400'
    }
    return 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <div className={`rounded-lg p-6 border transition-colors ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        System Health Status
      </h2>
      
      {/* Health Bars */}
      <div className="space-y-4">
        <ProgressBar label="CPU" value={cpu} />
        <ProgressBar label="Memory" value={memory} />
        <ProgressBar label="Disk" value={disk} />

        {/* Network Status */}
        <div className={`flex justify-between items-center pt-4 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Network Status
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(network)}`}>
            {network === 'healthy' ? '● Healthy' : '● Degraded'}
          </span>
        </div>
      </div>
    </div>
  )
}