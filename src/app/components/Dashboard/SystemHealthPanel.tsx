// src/components/Dashboard/SystemHealthPanel.tsx

import ProgressBar from '../ui/ProgressBar'

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
  
  // Helper function to style the network status badge
  const getStatusBadge = (status: string) => {
    if (status === 'healthy') {
      return 'bg-green-500/20 text-green-400'
    }
    return 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">System Health Status</h2>
      
      {/* Health Bars */}
      <div className="space-y-4">
        {/* 
          Using our reusable ProgressBar component!
          Notice how clean and readable this is compared to repeating the code 3 times
        */}
        <ProgressBar label="CPU" value={cpu} />
        <ProgressBar label="Memory" value={memory} />
        <ProgressBar label="Disk" value={disk} />

        {/* Network Status */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <span className="text-sm text-gray-400">Network Status</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(network)}`}>
            {network === 'healthy' ? '● Healthy' : '● Degraded'}
          </span>
        </div>
      </div>
    </div>
  )
}