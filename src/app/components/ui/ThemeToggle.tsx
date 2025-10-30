// src/components/ui/ThemeToggle.tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

// ============================================
// THEME TOGGLE BUTTON COMPONENT
// ============================================
export default function ThemeToggle() {
  // Access theme data using our custom hook!
  const { theme, toggleTheme, isDark } = useTheme()
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative
        w-16 h-8
        rounded-full
        transition-colors duration-300
        focus:outline-none
        focus:ring-2 focus:ring-offset-2
        ${isDark 
          ? 'bg-gray-700 focus:ring-blue-500' 
          : 'bg-blue-500 focus:ring-blue-300'
        }
      `}
      aria-label="Toggle theme"
    >
      {/* The sliding circle */}
      <div
        className={`
          absolute top-1 left-1
          w-6 h-6
          rounded-full
          bg-white
          transition-transform duration-300
          flex items-center justify-center
          ${isDark ? 'translate-x-0' : 'translate-x-8'}
        `}
      >
        {/* Icon that changes based on theme */}
        {isDark ? (
          // Moon icon for dark mode
          <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  )
}