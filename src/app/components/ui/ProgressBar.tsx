// src/components/ui/ProgressBar.tsx

// ============================================
// PROPS INTERFACE
// ============================================
interface ProgressBarProps {
  label: string      // e.g., "CPU"
  value: number      // e.g., 75
  color?: string     // Optional: defaults to dynamic color
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================
// A reusable progress bar that changes color based on value
export default function ProgressBar({ label, value, color }: ProgressBarProps) {
  
  // Dynamic color selection based on value (if no color provided)
  const getBarColor = () => {
    if (color) return color // Use provided color if given
    
    // Otherwise, use value-based coloring
    if (value < 50) return 'bg-green-500'
    if (value < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div>
      {/* Label and Value */}
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      
      {/* Progress Bar Track (gray background) */}
      <div className="w-full bg-gray-700 rounded-full h-3">
        {/* Progress Bar Fill (colored, animated) */}
        <div 
          className={`${getBarColor()} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  )
}