'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// ============================================
// TYPE DEFINITIONS
// ============================================
interface Incident {
  id: number
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: string
  detected_at: string
  responded_at?: string
  resolved_at?: string
  detection_time?: number
  response_time?: number
  resolution_time?: number
  assigned_to_name?: string
}

interface TrainingRecord {
  id: number
  user_name: string
  course_name: string
  certification_name?: string
  status: string
  completed_at?: string
  expires_at?: string
  score?: number
}

// ============================================
// MAIN REPORTS PAGE
// ============================================
export default function ReportsPage() {
  const router = useRouter()
  const { isDark } = useTheme()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'incidents' | 'training' | 'analytics'>('incidents')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [training, setTraining] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])
  
  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      loadReportsData()
    }
  }, [isAuthenticated])
  
  const loadReportsData = async () => {
    setLoading(true)
    try {
      // Fetch incidents
      const incidentsRes = await fetch('/api/analytics?type=recent-incidents&limit=20')
      const incidentsData = await incidentsRes.json()
      setIncidents(incidentsData.data || [])
      
      // Fetch training records
      const trainingRes = await fetch('/api/analytics?type=training')
      const trainingData = await trainingRes.json()
      setTraining(trainingData.data || [])
    } catch (error) {
      console.error('Error loading reports data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Format time helper
  const formatTime = (minutes?: number) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes.toFixed(0)}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  // Severity color helper
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500'
    }
  }
  
  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'investigating':
      case 'in_progress': return 'bg-blue-500/20 text-blue-400'
      case 'open': return 'bg-yellow-500/20 text-yellow-400'
      case 'expired': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }
  
  if (authLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading reports...
          </p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) return null
  
  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b p-6 transition-colors ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              📊 Reports & Analytics
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Comprehensive incident analysis and team performance tracking
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
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'incidents'
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🚨 Incident Reports
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'training'
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎓 Training & Certifications
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📈 Analytics Overview
          </button>
        </div>
        
        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className={`rounded-lg p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className="text-2xl font-bold mb-4">Recent Incidents</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <tr>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        ID
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title
                      </th>
                      <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Severity
                      </th>
                      <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </th>
                      <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Assigned To
                      </th>
                      <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Detection Time
                      </th>
                      <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Response Time
                      </th>
                      <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident) => (
                      <tr 
                        key={incident.id}
                        className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}
                      >
                        <td className="py-3 px-4">
                          <span className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            #{incident.id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>
                            {incident.title}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {incident.assigned_to_name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTime(incident.detection_time)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTime(incident.response_time)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedIncident(incident)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              isDark
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className={`rounded-lg p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className="text-2xl font-bold mb-4">Training & Certifications</h2>
              
              <div className="grid gap-4">
                {training.map((record) => (
                  <div 
                    key={record.id}
                    className={`p-4 rounded-lg border ${
                      isDark ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {record.user_name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <strong>Course:</strong> {record.course_name}
                        </p>
                        
                        {record.certification_name && (
                          <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Certification:</strong> {record.certification_name}
                          </p>
                        )}
                        
                        {record.score && (
                          <p className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <strong>Score:</strong> {record.score}%
                          </p>
                        )}
                        
                        <div className="flex gap-4 mt-2 text-xs">
                          {record.completed_at && (
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              ✅ Completed: {formatDate(record.completed_at)}
                            </span>
                          )}
                          {record.expires_at && (
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                              ⏰ Expires: {formatDate(record.expires_at)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {record.score && (
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${
                            record.score >= 90 ? 'text-green-400' :
                            record.score >= 75 ? 'text-blue-400' :
                            'text-yellow-400'
                          }`}>
                            {record.score}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className={`rounded-lg p-6 ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className="text-2xl font-bold mb-4">Coming Soon: Advanced Analytics</h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Line charts, trend analysis, and comparative metrics will be displayed here.
              </p>
            </div>
          </div>
        )}
      </main>
      
      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-lg p-6 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">Incident Details</h2>
              <button
                onClick={() => setSelectedIncident(null)}
                className={`px-3 py-1 rounded ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Title
                </span>
                <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedIncident.title}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Severity
                  </span>
                  <p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </p>
                </div>
                
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Status
                  </span>
                  <p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIncident.status)}`}>
                      {selectedIncident.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Timeline
                </span>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">🔍</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      Detected: {formatDate(selectedIncident.detected_at)}
                    </span>
                  </div>
                  {selectedIncident.responded_at && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⚡</span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Responded: {formatDate(selectedIncident.responded_at)}
                      </span>
                    </div>
                  )}
                  {selectedIncident.resolved_at && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                        Resolved: {formatDate(selectedIncident.resolved_at)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Detection Time
                  </span>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(selectedIncident.detection_time)}
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Response Time
                  </span>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(selectedIncident.response_time)}
                  </p>
                </div>
                
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Resolution Time
                  </span>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(selectedIncident.resolution_time)}
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedIncident(null)}
              className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}