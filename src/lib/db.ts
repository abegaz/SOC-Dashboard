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
  
  // Create incidents table
  const createIncidentsTable = `
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_to INTEGER,
      detected_at DATETIME NOT NULL,
      responded_at DATETIME,
      resolved_at DATETIME,
      detection_time INTEGER,
      response_time INTEGER,
      resolution_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `
  
  db.exec(createIncidentsTable)
  console.log('✅ Incidents table ready')
  
  // Create analyst_metrics table
  const createAnalystMetricsTable = `
    CREATE TABLE IF NOT EXISTS analyst_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      incidents_handled INTEGER DEFAULT 0,
      avg_response_time INTEGER DEFAULT 0,
      success_rate REAL DEFAULT 0,
      skill_level INTEGER DEFAULT 1,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )
  `
  
  db.exec(createAnalystMetricsTable)
  console.log('✅ Analyst metrics table ready')
  
  // Create training_records table
  const createTrainingTable = `
    CREATE TABLE IF NOT EXISTS training_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_name TEXT NOT NULL,
      certification_name TEXT,
      completed_at DATETIME,
      expires_at DATETIME,
      status TEXT DEFAULT 'in_progress',
      score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `
  
  db.exec(createTrainingTable)
  console.log('✅ Training records table ready')
  
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

// ============================================
// ANALYTICS INTERFACES
// ============================================
export interface Incident {
  id: number
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  assigned_to?: number
  detected_at: string
  responded_at?: string
  resolved_at?: string
  detection_time?: number  // Time to detect in minutes
  response_time?: number   // Time to respond in minutes
  resolution_time?: number // Time to resolve in minutes
  created_at: string
}

export interface AnalystMetrics {
  id?: number
  user_id: number
  incidents_handled: number
  avg_response_time: number
  success_rate: number
  skill_level: number
  last_updated?: string
}

export interface TrainingRecord {
  id?: number
  user_id: number
  course_name: string
  certification_name?: string
  completed_at?: string
  expires_at?: string
  status: 'in_progress' | 'completed' | 'expired'
  score?: number
  created_at?: string
}

// ============================================
// GET ANALYTICS OVERVIEW
// ============================================
export function getAnalyticsOverview() {
  try {
    // Get total incidents
    const totalResult = db.prepare(`
      SELECT COUNT(*) as total FROM incidents
    `).get() as { total: number }
    
    // Get open incidents
    const openResult = db.prepare(`
      SELECT COUNT(*) as count FROM incidents 
      WHERE status = 'open' OR status = 'investigating'
    `).get() as { count: number }
    
    // Get closed incidents
    const closedResult = db.prepare(`
      SELECT COUNT(*) as count FROM incidents 
      WHERE status = 'resolved' OR status = 'closed'
    `).get() as { count: number }
    
    // Calculate MTTD (Mean Time to Detect)
    const mttdResult = db.prepare(`
      SELECT AVG(detection_time) as avg 
      FROM incidents 
      WHERE detection_time IS NOT NULL
    `).get() as { avg: number | null }
    
    // Calculate MTTR (Mean Time to Respond)
    const mttrResult = db.prepare(`
      SELECT AVG(response_time) as avg 
      FROM incidents 
      WHERE response_time IS NOT NULL
    `).get() as { avg: number | null }
    
    // Get critical incidents
    const criticalResult = db.prepare(`
      SELECT COUNT(*) as count FROM incidents 
      WHERE severity = 'critical'
    `).get() as { count: number }
    
    return {
      totalIncidents: totalResult.total,
      openIncidents: openResult.count,
      closedIncidents: closedResult.count,
      averageMTTD: mttdResult.avg || 0,
      averageMTTR: mttrResult.avg || 0,
      criticalIncidents: criticalResult.count
    }
  } catch (error) {
    console.error('❌ Error getting analytics overview:', error)
    return {
      totalIncidents: 0,
      openIncidents: 0,
      closedIncidents: 0,
      averageMTTD: 0,
      averageMTTR: 0,
      criticalIncidents: 0
    }
  }
}

// ============================================
// GET ANALYST PERFORMANCE
// ============================================
export function getAnalystPerformance(userId?: number) {
  try {
    let query = `
      SELECT 
        u.id,
        u.name as analyst_name,
        COALESCE(am.incidents_handled, 0) as total_incidents,
        COALESCE(am.avg_response_time, 0) as avg_response_time,
        COALESCE(
          (SELECT COUNT(*) FROM incidents WHERE assigned_to = u.id AND (status = 'resolved' OR status = 'closed')),
          0
        ) as incidents_closed,
        COALESCE(am.success_rate, 0) as performance_score
      FROM users u
      LEFT JOIN analyst_metrics am ON u.id = am.user_id
      WHERE u.role != 'admin'
    `
    
    if (userId) {
      query += ` AND u.id = ?`
      const result = db.prepare(query).get(userId)
      return result ? [result] : []
    } else {
      const results = db.prepare(query).all()
      return results
    }
  } catch (error) {
    console.error('❌ Error getting analyst performance:', error)
    return []
  }
}

// ============================================
// CREATE INCIDENT
// ============================================
export function createIncident(incident: Partial<Incident>) {
  try {
    const stmt = db.prepare(`
      INSERT INTO incidents (
        title, severity, status, assigned_to, 
        detected_at, responded_at, resolved_at,
        detection_time, response_time, resolution_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      incident.title,
      incident.severity,
      incident.status,
      incident.assigned_to || null,
      incident.detected_at,
      incident.responded_at || null,
      incident.resolved_at || null,
      incident.detection_time || null,
      incident.response_time || null,
      incident.resolution_time || null
    )
    
    console.log(`✅ Incident created: ${incident.title}`)
    return result.lastInsertRowid
  } catch (error) {
    console.error('❌ Error creating incident:', error)
    throw error
  }
}

// ============================================
// GET RECENT INCIDENTS
// ============================================
export function getRecentIncidents(limit: number = 10) {
  try {
    const stmt = db.prepare(`
      SELECT 
        i.*,
        u.name as assigned_to_name
      FROM incidents i
      LEFT JOIN users u ON i.assigned_to = u.id
      ORDER BY i.created_at DESC
      LIMIT ?
    `)
    
    return stmt.all(limit)
  } catch (error) {
    console.error('❌ Error getting recent incidents:', error)
    return []
  }
}

// ============================================
// UPDATE ANALYST METRICS
// ============================================
export function updateAnalystMetrics(metrics: AnalystMetrics) {
  try {
    const existing = db.prepare(`
      SELECT * FROM analyst_metrics WHERE user_id = ?
    `).get(metrics.user_id)
    
    if (existing) {
      // Update existing
      db.prepare(`
        UPDATE analyst_metrics
        SET incidents_handled = ?,
            avg_response_time = ?,
            success_rate = ?,
            skill_level = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        metrics.incidents_handled,
        metrics.avg_response_time,
        metrics.success_rate,
        metrics.skill_level,
        metrics.user_id
      )
    } else {
      // Insert new
      db.prepare(`
        INSERT INTO analyst_metrics (
          user_id, incidents_handled, avg_response_time, 
          success_rate, skill_level
        )
        VALUES (?, ?, ?, ?, ?)
      `).run(
        metrics.user_id,
        metrics.incidents_handled,
        metrics.avg_response_time,
        metrics.success_rate,
        metrics.skill_level
      )
    }
    
    console.log(`✅ Metrics updated for user ${metrics.user_id}`)
    return true
  } catch (error) {
    console.error('❌ Error updating analyst metrics:', error)
    return false
  }
}

// ============================================
// GET TRAINING RECORDS
// ============================================
export function getTrainingRecords(userId?: number) {
  try {
    let query = `
      SELECT 
        tr.*,
        u.name as user_name
      FROM training_records tr
      JOIN users u ON tr.user_id = u.id
    `
    
    if (userId) {
      query += ` WHERE tr.user_id = ?`
      return db.prepare(query).all(userId)
    } else {
      return db.prepare(query).all()
    }
  } catch (error) {
    console.error('❌ Error getting training records:', error)
    return []
  }
}

// Export the database instance
export default db