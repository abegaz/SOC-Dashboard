// src/components/Analytics/TeamPerformance.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// ============================================
// TYPE DEFINITIONS
// ============================================
interface AnalystMetric {
  analyst_name: string
  total_incidents: number
  avg_response_time: number
  incidents_closed: number
  performance_score: number
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function TeamPerformance() {
  const { isDark } = useTheme()
  const [data, setData] = useState<AnalystMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // FETCH TEAM PERFORMANCE DATA ON MOUNT
  // ============================================
  useEffect(() => {
    fetchTeamPerformance()
  }, [])

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics?type=analyst-performance')
      
      if (!response.ok) {
        throw new Error('Failed to fetch team performance')
      }
      
      const result = await response.json()
      
      // Add null checks and default values for safety
      const safeData = result.data.map((analyst: AnalystMetric) => ({
        ...analyst,
        avg_response_time: analyst.avg_response_time ?? 0,
        performance_score: analyst.performance_score ?? 0
      }))
      
      setData(safeData)
      setError(null)
    } catch (err) {
      console.error('Error fetching team performance:', err)
      setError('Failed to load team performance data')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error || !data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{error || 'No team data available'}</p>
      </div>
    )
  }

  // ============================================
  // CUSTOM TOOLTIP FOR CHART
  // ============================================
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const avgResponseTime = payload[0].payload.avg_response_time
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-bold mb-1">{payload[0].payload.analyst_name}</p>
          <p className="text-sm">
            <span className="text-blue-500">● </span>
            Incidents: {payload[0].value}
          </p>
          <p className="text-sm">
            <span className="text-green-500">● </span>
            Closed: {payload[1].value}
          </p>
          <p className="text-sm">
            <span className="text-purple-500">● </span>
            Score: {payload[0].payload.performance_score || 0}
          </p>
          <p className="text-sm text-gray-500">
            Avg Response: {avgResponseTime != null ? avgResponseTime.toFixed(1) : 'N/A'}m
          </p>
        </div>
      )
    }
    return null
  }

  // ============================================
  // RENDER CHART
  // ============================================
  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#374151' : '#e5e7eb'}
            />
            <XAxis 
              dataKey="analyst_name" 
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              stroke={isDark ? '#4b5563' : '#d1d5db'}
            />
            <YAxis 
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              stroke={isDark ? '#4b5563' : '#d1d5db'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}
            />
            <Bar 
              dataKey="total_incidents" 
              name="Total Incidents"
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="incidents_closed" 
              name="Incidents Closed"
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Summary Table */}
      <div className={`rounded-lg border overflow-hidden ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <table className="w-full text-sm">
          <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-3 py-2 text-left font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Analyst
              </th>
              <th className={`px-3 py-2 text-center font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Score
              </th>
              <th className={`px-3 py-2 text-center font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Avg Response
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((analyst, index) => {
              const avgResponseTime = analyst.avg_response_time
              const performanceScore = analyst.performance_score || 0
              
              return (
                <tr 
                  key={analyst.analyst_name}
                  className={`border-t ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <td className={`px-3 py-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {analyst.analyst_name}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      performanceScore >= 90 
                        ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                        : performanceScore >= 75
                        ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        : isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {performanceScore}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-center ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {avgResponseTime != null ? avgResponseTime.toFixed(1) : 'N/A'}m
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
        <p>
          <span className="font-medium">Performance Score:</span> Based on incidents handled, response time, and closure rate
        </p>
      </div>
    </div>
  )
}