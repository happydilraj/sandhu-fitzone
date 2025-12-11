// Database connection using Neon serverless
// Replace this with your actual database connection when you set up Neon

import { neon } from "@neondatabase/serverless"

// This will use the DATABASE_URL environment variable
// Make sure to add Neon integration from the sidebar
export const sql = neon(process.env.DATABASE_URL!)

// Helper to check if database is connected
export async function checkDatabaseConnection() {
  try {
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
