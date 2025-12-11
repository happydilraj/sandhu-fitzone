import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, "../.env.local") })

const sql = neon(process.env.DATABASE_URL)

async function addVerification() {
  try {
    console.log("🔄 Adding verification fields to database...")

    // Read the SQL file
    const migrationSQL = readFileSync(join(__dirname, "003-add-verification.sql"), "utf-8")

    // Split by semicolons and filter out empty statements and comments
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => {
        // Remove empty statements
        if (s.length === 0) return false
        // Remove comment-only lines
        const lines = s.split('\n').filter(line => {
          const trimmed = line.trim()
          return trimmed.length > 0 && !trimmed.startsWith('--')
        })
        return lines.length > 0
      })

    // Execute each statement
    for (const statement of statements) {
      await sql.query(statement)
      console.log("✅ Executed:", statement.substring(0, 50) + "...")
    }

    console.log("\n✅ Verification fields added successfully!")
    console.log("\n📋 Added:")
    console.log("  - email_verified column to users table")
    console.log("  - phone_verified column to users table")
    console.log("  - verification_tokens table for OTP storage")
    console.log("  - Indexes for performance")
    console.log("  - Existing users marked as verified")
  } catch (error) {
    console.error("❌ Error adding verification:", error)
    process.exit(1)
  }
}

addVerification()
