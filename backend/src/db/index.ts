import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool)

// Run migrations on startup
export async function runMigrations() {
  try {
    console.log('Running database migrations...')
    await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  }
}
