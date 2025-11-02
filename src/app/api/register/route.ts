// src/app/api/register/route.ts
import { NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/lib/db'

// ============================================
// POST /api/register - Registration Endpoint
// ============================================
export async function POST(request: Request) {
  try {
    // Parse request body
    const { email, password, name } = await request.json()
    
    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }
    
    // Create new user
    const userId = createUser(email, password, name, 'user')
    
    // Return success (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        name,
        role: 'user'
      }
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}