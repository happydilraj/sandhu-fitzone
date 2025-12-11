import { NextRequest, NextResponse } from "next/server"
import { generateOTP, sendEmailOTP, sendPhoneOTP } from "@/lib/otp"
import { storeRegistrationOTP } from "@/lib/temp-otp-store"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, phone, type } = await request.json()

    if (type === "email" && !email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    if (type === "phone" && !phone) {
      return NextResponse.json({ success: false, error: "Phone is required" }, { status: 400 })
    }

    // Check if email/phone already exists
    if (type === "email") {
      const existing = await sql`SELECT id FROM users WHERE email = ${email}`
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 })
      }
    } else {
      const existing = await sql`SELECT id FROM users WHERE phone = ${phone}`
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: "Phone already registered" }, { status: 409 })
      }
    }

    // Generate OTP
    const otp = generateOTP()

    // Store temporarily
    const key = type === "email" ? email : phone
    storeRegistrationOTP(key, otp)

    // Send OTP
    const sent = type === "email" 
      ? await sendEmailOTP(email, otp)
      : await sendPhoneOTP(phone, otp)

    if (!sent) {
      return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to your ${type}`,
    })
  } catch (error) {
    console.error("Error sending registration OTP:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
