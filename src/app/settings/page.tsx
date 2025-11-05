// src/app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const { isDark, theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'dashboard' | 'preferences'>('dashboard')
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [profileError, setProfileError] = useState('')
  
  // Dashboard customization settings
  const [showMetrics, setShowMetrics] = useState(true)
  const [showSystemHealth, setShowSystemHealth] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(3000)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])
  
  // Load user preferences
  useEffect(() => {
    if (user) {
      loadPreferences()
      setProfileName(user.name)
    }
  }, [user])
  
  const loadPreferences = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/preferences?userId=${user.id}`)
      const data = await response.json()
      
      if (data.preferences) {
        const prefs = data.preferences
        setRefreshInterval(prefs.refresh_interval || 3000)
        
        if (prefs.visible_widgets) {
          const widgets = JSON.parse(prefs.visible_widgets)
          setShowMetrics(widgets.includes('metrics'))
          setShowSystemHealth(widgets.includes('systemHealth'))
          setShowAlerts(widgets.includes('alerts'))
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }
  
  const savePreferences = async () => {
    if (!user) return
    
    setIsSaving(true)
    setSuccessMessage('')
    
    try {
      const visibleWidgets = []
      if (showMetrics) visibleWidgets.push('metrics')
      if (showSystemHealth) visibleWidgets.push('systemHealth')
      if (showAlerts) visibleWidgets.push('alerts')
      
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          preferences: {
            visible_widgets: JSON.stringify(visibleWidgets),
            theme: theme,
            refresh_interval: refreshInterval
          }
        })
      })
      
      if (response.ok) {
        setSuccessMessage('Preferences saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  const updateProfile = async () => {
    if (!user) return
    
    setIsSaving(true)
    setProfileError('')
    setSuccessMessage('')
    
    try {
      // Validate
      if (!profileName.trim()) {
        setProfileError('Name cannot be empty')
        setIsSaving(false)
        return
      }
      
      // If changing password, validate
      if (newPassword || confirmNewPassword || currentPassword) {
        if (!currentPassword) {
          setProfileError('Current password is required to change password')
          setIsSaving(false)
          return
        }
        
        if (newPassword !== confirmNewPassword) {
          setProfileError('New passwords do not match')
          setIsSaving(false)
          return
        }
        
        if (newPassword.length < 6) {
          setProfileError('New password must be at least 6 characters')
          setIsSaving(false)
          return
        }
      }
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: profileName,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setProfileError(data.error || 'Failed to update profile')
        setIsSaving(false)
        return
      }
      
      setSuccessMessage('Profile updated successfully!')
      setIsEditingProfile(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      
      // Update local user data
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        parsedUser.name = profileName
        localStorage.setItem('user', JSON.stringify(parsedUser))
      }
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileError('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }
  
  const cancelProfileEdit = () => {
    setIsEditingProfile(false)
    setProfileName(user?.name || '')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setProfileError('')
  }
  
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading...
          </p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b p-6 transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your account and dashboard preferences
            </p>
          </div>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Preferences
          </button>
        </div>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className={`rounded-lg p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Profile Information</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            {/* Error Message */}
            {profileError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500">
                <p className="text-red-400 text-sm">{profileError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={!isEditingProfile}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } ${!isEditingProfile ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
              
              {/* Email (Read-only) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className={`w-full px-4 py-2 rounded-lg border opacity-60 cursor-not-allowed ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  Email cannot be changed
                </p>
              </div>
              
              {/* Role (Read-only) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role || ''}
                  readOnly
                  className={`w-full px-4 py-2 rounded-lg border opacity-60 cursor-not-allowed ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              {/* Password Change Section - Only show when editing */}
              {isEditingProfile && (
                <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="font-bold mb-4">Change Password (Optional)</h3>
                  
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    
                    {/* New Password */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                    
                    {/* Confirm New Password */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Edit Mode Buttons */}
              {isEditingProfile && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={updateProfile}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      isSaving
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                    } text-white`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={cancelProfileEdit}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className={`rounded-lg p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-bold mb-4">Dashboard Customization</h2>
            <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose which widgets to display on your dashboard
            </p>
            
            <div className="space-y-4">
              {/* Metrics Widget Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg border transition-colors hover:bg-gray-700/20">
                <div>
                  <p className="font-medium">System Metrics</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    CPU, Memory, and Disk usage cards
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showMetrics}
                  onChange={(e) => setShowMetrics(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-blue-500"
                />
              </label>
              
              {/* System Health Widget Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg border transition-colors hover:bg-gray-700/20">
                <div>
                  <p className="font-medium">System Health Panel</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Detailed health metrics with progress bars
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showSystemHealth}
                  onChange={(e) => setShowSystemHealth(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-blue-500"
                />
              </label>
              
              {/* Alerts Widget Toggle */}
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-lg border transition-colors hover:bg-gray-700/20">
                <div>
                  <p className="font-medium">Security Alerts Feed</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Real-time security alerts and notifications
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showAlerts}
                  onChange={(e) => setShowAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 text-blue-500"
                />
              </label>
            </div>
          </div>
        )}
        
        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className={`rounded-lg p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-bold mb-4">General Preferences</h2>
            
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Theme
                </label>
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Current: {isDark ? 'Dark' : 'Light'} (Click to toggle)
                </button>
              </div>
              
              {/* Refresh Interval */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Data Refresh Interval
                </label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={1000}>1 second</option>
                  <option value={3000}>3 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={30000}>30 seconds</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Save Button - Only for Dashboard and Preferences tabs */}
        {(activeTab === 'dashboard' || activeTab === 'preferences') && (
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                isSaving
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
              } text-white`}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
            
            {successMessage && (
              <p className="text-green-400 font-medium">
                ✅ {successMessage}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}