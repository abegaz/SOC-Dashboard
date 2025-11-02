// src/lib/init-db.ts
import { initializeDatabase } from './db'

// This script initializes the database
// It will be called when the server starts

console.log('🚀 Initializing database...')
initializeDatabase()
console.log('✅ Database initialization complete!')

export {}