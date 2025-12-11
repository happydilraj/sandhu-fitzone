import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { generateOTP, storeOTP, sendEmailOTP } from "@/lib/otp"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Check for authenticated user first
    const user = await getCurrentUser(request)
    
    // If not authenticated, check for x-user-id header (for registration flow)
    const userId = user?.id || request.headers.get("x-user-id")
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user email
    let email = user?.email
    if (!email) {
      const users = await sql`SELECT email FROM users WHERE id = ${userId}`
      if (users.length === 0) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }
      email = users[0].email
    }

    // Generate OTP
    const otp = generateOTP()

    // Store OTP in database
    await storeOTP(userId, "email", otp)

    // Send OTP via email
    const sent = await sendEmailOTP(email, otp)

    if (!sent) {
      return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    })
  } catch (error) {
    console.error("Error sending email OTP:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
