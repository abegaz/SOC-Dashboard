// src/app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { findUserByEmail, verifyPassword } from '@/lib/db'
import db from '@/lib/db'
import bcrypt from 'bcrypt'

// ============================================
// PUT /api/profile - Update user profile
// ============================================
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, currentPassword, newPassword } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Get current user
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    const user = stmt.get(userId) as any
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }
      
      const isPasswordValid = verifyPassword(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
      
      // Hash new password
      const saltRounds = 10
      const hashedPassword = bcrypt.hashSync(newPassword, saltRounds)
      
      // Update name and password
      const updateStmt = db.prepare(`
        UPDATE users 
        SET name = ?, password = ?
        WHERE id = ?
      `)
      updateStmt.run(name, hashedPassword, userId)
    } else {
      // Update only name
      const updateStmt = db.prepare(`
        UPDATE users 
        SET name = ?
        WHERE id = ?
      `)
      updateStmt.run(name, userId)
    }
    
    console.log(`✅ Profile updated for user ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}