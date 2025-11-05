// src/lib/db.ts
import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import path from 'path'

// ============================================
// DATABASE CONNECTION
// ============================================
// Create or connect to the database file
// The database will be stored in the project root as 'soc-dashboard.db'
const dbPath = path.join(process.cwd(), 'soc-dashboard.db')
const db = new Database(dbPath)

// Enable foreign keys (helps with data integrity)
db.pragma('foreign_keys = ON')

console.log('✅ Database connected:', dbPath)

// ============================================
// INITIALIZE DATABASE TABLES
// ============================================
// This function creates the tables if they don't exist
export function initializeDatabase() {
  // Create users table
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  db.exec(createUsersTable)
  console.log('✅ Users table ready')
  
  // Create user_preferences table
  const createPreferencesTable = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      dashboard_layout TEXT,
      visible_widgets TEXT,
      theme TEXT DEFAULT 'dark',
      refresh_interval INTEGER DEFAULT 3000,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )
  `
  
  db.exec(createPreferencesTable)
  console.log('✅ User preferences table ready')
  
  // Check if we have any users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  
  // If no users exist, create a default admin user
  if (userCount.count === 0) {
    console.log('📝 Creating default admin user...')
    createUser('admin@socdashboard.com', 'admin123', 'Admin User', 'admin')
    console.log('✅ Default user created!')
    console.log('   Email: admin@socdashboard.com')
    console.log('   Password: admin123')
  }
}

// ============================================
// USER INTERFACE
// ============================================
// Define what a user object looks like
export interface User {
  id: number
  email: string
  password: string
  name: string
  role: string
  created_at: string
}

// User without sensitive data (for returning to frontend)
export interface SafeUser {
  id: number
  email: string
  name: string
  role: string
}

// ============================================
// CREATE USER
// ============================================
// Add a new user to the database
export function createUser(email: string, password: string, name: string, role: string = 'user') {
  try {
    // Hash the password for security
    // NEVER store plain text passwords!
    const saltRounds = 10
    const hashedPassword = bcrypt.hashSync(password, saltRounds)
    
    // Prepare SQL statement
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `)
    
    // Execute the insert
    const result = stmt.run(email, hashedPassword, name, role)
    
    console.log(`✅ User created: ${email}`)
    return result.lastInsertRowid
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  }
}

// ============================================
// FIND USER BY EMAIL
// ============================================
// Look up a user by their email address
export function findUserByEmail(email: string): User | undefined {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    const user = stmt.get(email) as User | undefined
    return user
  } catch (error) {
    console.error('❌ Error finding user:', error)
    return undefined
  }
}

// ============================================
// VERIFY PASSWORD
// ============================================
// Check if a password matches the hashed password in the database
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  try {
    return bcrypt.compareSync(plainPassword, hashedPassword)
  } catch (error) {
    console.error('❌ Error verifying password:', error)
    return false
  }
}

// ============================================
// AUTHENTICATE USER
// ============================================
// Complete authentication: find user and verify password
export function authenticateUser(email: string, password: string): SafeUser | null {
  try {
    // Find user by email
    const user = findUserByEmail(email)
    
    if (!user) {
      console.log('❌ User not found:', email)
      return null
    }
    
    // Verify password
    const isPasswordValid = verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email)
      return null
    }
    
    console.log('✅ Authentication successful:', email)
    
    // Return user without password (safe to send to frontend)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('❌ Authentication error:', error)
    return null
  }
}

// ============================================
// GET ALL USERS (for admin dashboard later)
// ============================================
export function getAllUsers(): SafeUser[] {
  try {
    const stmt = db.prepare('SELECT id, email, name, role FROM users')
    const users = stmt.all() as SafeUser[]
    return users
  } catch (error) {
    console.error('❌ Error getting users:', error)
    return []
  }
}

// ============================================
// DELETE USER
// ============================================
export function deleteUser(id: number): boolean {
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    return false
  }
}

// ============================================
// USER PREFERENCES INTERFACE
// ============================================
export interface UserPreferences {
  id?: number
  user_id: number
  dashboard_layout?: string
  visible_widgets?: string
  theme: string
  refresh_interval: number
  updated_at?: string
}

// ============================================
// GET USER PREFERENCES
// ============================================
export function getUserPreferences(userId: number): UserPreferences | null {
  try {
    const stmt = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?')
    const prefs = stmt.get(userId) as UserPreferences | undefined
    
    if (!prefs) {
      // Return default preferences if none exist
      return {
        user_id: userId,
        theme: 'dark',
        refresh_interval: 3000,
        visible_widgets: JSON.stringify(['metrics', 'systemHealth', 'alerts']),
        dashboard_layout: JSON.stringify([])
      }
    }
    
    return prefs
  } catch (error) {
    console.error('❌ Error getting preferences:', error)
    return null
  }
}

// ============================================
// SAVE USER PREFERENCES
// ============================================
export function saveUserPreferences(prefs: UserPreferences): boolean {
  try {
    // Check if preferences exist
    const existing = getUserPreferences(prefs.user_id)
    
    if (existing && existing.id) {
      // Update existing preferences
      const stmt = db.prepare(`
        UPDATE user_preferences 
        SET dashboard_layout = ?,
            visible_widgets = ?,
            theme = ?,
            refresh_interval = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `)
      
      stmt.run(
        prefs.dashboard_layout || null,
        prefs.visible_widgets || null,
        prefs.theme,
        prefs.refresh_interval,
        prefs.user_id
      )
    } else {
      // Insert new preferences
      const stmt = db.prepare(`
        INSERT INTO user_preferences (user_id, dashboard_layout, visible_widgets, theme, refresh_interval)
        VALUES (?, ?, ?, ?, ?)
      `)
      
      stmt.run(
        prefs.user_id,
        prefs.dashboard_layout || null,
        prefs.visible_widgets || null,
        prefs.theme,
        prefs.refresh_interval
      )
    }
    
    console.log('✅ Preferences saved for user:', prefs.user_id)
    return true
  } catch (error) {
    console.error('❌ Error saving preferences:', error)
    return false
  }
}

// Export the database instance
export default db