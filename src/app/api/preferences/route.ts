// src/app/api/preferences/route.ts
import { NextResponse } from 'next/server'
import { getUserPreferences, saveUserPreferences } from '@/lib/db'

// ============================================
// GET /api/preferences - Get user preferences
// ============================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const preferences = getUserPreferences(parseInt(userId))
    
    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ preferences })
    
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/preferences - Save user preferences
// ============================================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, preferences } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const success = saveUserPreferences({
      user_id: userId,
      ...preferences
    })
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Preferences saved successfully'
    })
    
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}