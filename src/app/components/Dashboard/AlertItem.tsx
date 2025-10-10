// src/components/Dashboard/AlertItem.tsx

// ============================================
// TYPE DEFINITIONS
// ============================================
// Define what an alert looks like
// This creates a "contract" - any alert must have these properties
type AlertType = 'critical' | 'warning' | 'info' | 'success'

// Props interface - what data this component needs
interface AlertItemProps {
  type: AlertType
  message: string
  timestamp: string
}

// ============================================
// ALERT ITEM COMPONENT
// ============================================
export default function AlertItem({ type, message, timestamp }: AlertItemProps) {
  
  // ============================================
  // STYLING BASED ON ALERT TYPE
  // ============================================
  // This function returns different styles for different alert types
  // It's like a translator: give it a type, get back the right colors
  const getAlertStyles = (alertType: AlertType) => {
    // Using a JavaScript object as a lookup table
    // Key = alert type, Value = styling classes
    const styles = {
      critical: {
        bg: 'bg-red-900/30',           // Dark red background (30% opacity)
        border: 'border-red-500',      // Red border
        text: 'text-red-400',          // Red text
        icon: '🔴'                     // Red circle emoji
      },
      warning: {
        bg: 'bg-yellow-900/30',
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        icon: '⚠️'
      },
      info: {
        bg: 'bg-blue-900/30',
        border: 'border-blue-500',
        text: 'text-blue-400',
        icon: 'ℹ️'
      },
      success: {
        bg: 'bg-green-900/30',
        border: 'border-green-500',
        text: 'text-green-400',
        icon: '✅'
      }
    }
    
    // Return the style object for the given type
    // If type is 'critical', return styles.critical
    return styles[alertType]
  }

  // Get the styles for this specific alert
  const style = getAlertStyles(type)

  // ============================================
  // RENDER THE ALERT
  // ============================================
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
        animate-slideIn
      `}
    >
      {/* Flexbox layout: icon/type on left, timestamp on right */}
      <div className="flex items-start justify-between mb-2">
        {/* Left side: Icon and Type */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{style.icon}</span>
          <span className={`${style.text} font-bold text-sm uppercase`}>
            {type}
          </span>
        </div>
        
        {/* Right side: Timestamp */}
        <span className="text-gray-500 text-xs">
          {timestamp}
        </span>
      </div>
      
      {/* Alert message */}
      <p className="text-gray-300 text-sm ml-7">
        {message}
      </p>
    </div>
  )
}