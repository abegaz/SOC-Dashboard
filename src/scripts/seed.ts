// src/scripts/seed.ts
import { initializeDatabase } from '../lib/db'
import { seedMockData } from '../lib/seedData'

console.log('🚀 Starting database setup...')

initializeDatabase()
seedMockData()

console.log('✅ Database setup complete!')
process.exit(0)