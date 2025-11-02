// src/components/Dashboard/MetricsGrid.tsx
'use client'

import MetricCard from './MetricCard'

// ============================================
// PROPS INTERFACE
// ============================================
interface MetricsGridProps {
  cpu: number
  memory: number
  disk: number
}

// ============================================
// METRICS GRID COMPONENT
// ============================================
export default function MetricsGrid({ cpu, memory, disk }: MetricsGridProps) {
  
  // Define the icons as components
  const CpuIcon = (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  )

  const MemoryIcon = (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  )

  const DiskIcon = (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <MetricCard 
        title="CPU Usage"
        value={cpu}
        icon={CpuIcon}
        color="blue"
      />
      
      <MetricCard 
        title="Memory Usage"
        value={memory}
        icon={MemoryIcon}
        color="green"
      />
      
      <MetricCard 
        title="Disk Usage"
        value={disk}
        icon={DiskIcon}
        color="purple"
      />
    </div>
  )
}