// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// ============================================
// TYPE DEFINITIONS
// ============================================
interface User {
  id: number
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null                          // Current logged-in user
  isAuthenticated: boolean                   // Is user logged in?
  isLoading: boolean                         // Is auth state being checked?
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (updatedUser: Partial<User>) => void  // NEW: Update user data
}

// ============================================
// CREATE CONTEXT
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // ============================================
  // LOAD USER FROM LOCALSTORAGE ON MOUNT
  // ============================================
  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user')
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        console.log('✅ User session restored:', parsedUser.email)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
    
    setIsLoading(false)
  }, [])

  // ============================================
  // LOGIN FUNCTION
  // ============================================
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      // Store user in state and localStorage
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      console.log('✅ Login successful:', data.user.email)
      return { success: true }
      
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An error occurred. Please try again.' }
    }
  }

  // ============================================
  // LOGOUT FUNCTION
  // ============================================
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    console.log('✅ User logged out')
    router.push('/')
  }

  // ============================================
  // UPDATE USER FUNCTION
  // ============================================
  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return
    
    const newUser = { ...user, ...updatedUser }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    console.log('✅ User data updated in context:', newUser)
  }

  // ============================================
  // REGISTER FUNCTION
  // ============================================
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' }
      }

      // Automatically log in after successful registration
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      console.log('✅ Registration successful:', data.user.email)
      return { success: true }
      
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'An error occurred. Please try again.' }
    }
  }

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================
// CUSTOM HOOK TO USE AUTH
// ============================================
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}