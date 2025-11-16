// src/app/api/analytics/route.tsx
import { NextResponse } from 'next/server'
import { 
  getAnalyticsOverview, 
  getAnalystPerformance,
  getRecentIncidents,
  getTrainingRecords 
} from '@/lib/db'

// ============================================
// GET /api/analytics - Get analytics data
// ============================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    
    switch (type) {
      case 'overview':
        const overview = getAnalyticsOverview()
        return NextResponse.json({ data: overview })
      
      case 'analyst-performance':
        const performance = userId 
          ? getAnalystPerformance(parseInt(userId))
          : getAnalystPerformance()
        return NextResponse.json({ data: performance })
      
      case 'recent-incidents':
        const limit = parseInt(searchParams.get('limit') || '10')
        const incidents = getRecentIncidents(limit)
        return NextResponse.json({ data: incidents })
      
      case 'training':
        const training = userId
          ? getTrainingRecords(parseInt(userId))
          : getTrainingRecords()
        return NextResponse.json({ data: training })
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}