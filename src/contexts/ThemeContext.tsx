// src/contexts/ThemeContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// ============================================
// TYPE DEFINITIONS
// ============================================
type Theme = 'dark' | 'light'

// This interface defines what our context provides
interface ThemeContextType {
  theme: Theme                        // Current theme ('dark' or 'light')
  toggleTheme: () => void            // Function to switch themes
  isDark: boolean                    // Helper: is it dark mode?
}

// ============================================
// CREATE THE CONTEXT
// ============================================
// This creates the "broadcasting station" for our theme
// undefined means it hasn't been set up yet
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ============================================
// THEME PROVIDER COMPONENT
// ============================================
// This component wraps your app and provides theme to everyone
interface ThemeProviderProps {
  children: ReactNode  // The components inside the provider
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // State to track current theme (starts with 'dark')
  const [theme, setTheme] = useState<Theme>('dark')
  
  // Function to toggle between dark and light
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))
  }
  
  // Helper boolean for convenience
  const isDark = theme === 'dark'
  
  // The value object that will be shared with all components
  const value = {
    theme,
    toggleTheme,
    isDark
  }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================
// CUSTOM HOOK TO USE THEME
// ============================================
// This is a custom hook that makes it easy to access theme anywhere
export function useTheme() {
  const context = useContext(ThemeContext)
  
  // If someone tries to use this hook outside the provider, throw error
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}