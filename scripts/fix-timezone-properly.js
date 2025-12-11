require('dotenv').config({ path: '.env.local' })
const { neon } = require('@neondatabase/serverless')

async function fixTimezone() {
  const sql = neon(process.env.DATABASE_URL)
  
  try {
    console.log('🔧 Fixing timezone issue properly...\n')
    
    // Step 1: Check current data
    console.log('Current messages:')
    const before = await sql`SELECT id, name, created_at FROM contact_messages ORDER BY id DESC LIMIT 3`
    before.forEach(msg => {
      console.log(`  ${msg.id}: ${msg.name} - ${msg.created_at}`)
    })
    
    // Step 2: The column is already TIMESTAMPTZ, but data was stored as IST
    // We need to adjust the stored values by adding 5.5 hours to convert IST to UTC
    console.log('\n🔄 Converting IST timestamps to UTC...')
    await sql`
      UPDATE contact_messages 
      SET created_at = created_at + INTERVAL '5 hours 30 minutes'
    `
    
    // Step 3: Verify the fix
    console.log('\n✅ After conversion:')
    const after = await sql`SELECT id, name, created_at FROM contact_messages ORDER BY id DESC LIMIT 3`
    after.forEach(msg => {
      console.log(`  ${msg.id}: ${msg.name} - ${msg.created_at}`)
    })
    
    console.log('\n✅ Timezone fix complete!')
    console.log('New messages will now be stored in UTC automatically.')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixTimezone()
