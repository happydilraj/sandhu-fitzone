import { NextRequest, NextResponse } from "next/server"
import { verifyRegistrationOTP } from "@/lib/temp-otp-store"

export async function POST(request: NextRequest) {
  try {
    const { email, phone, otp, type } = await request.json()

    if (!otp) {
      return NextResponse.json({ success: false, error: "OTP is required" }, { status: 400 })
    }

    if (type === "email" && !email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    if (type === "phone" && !phone) {
      return NextResponse.json({ success: false, error: "Phone is required" }, { status: 400 })
    }

    // Verify OTP
    const key = type === "email" ? email : phone
    const result = verifyRegistrationOTP(key, otp)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${type === "email" ? "Email" : "Phone"} verified successfully`,
    })
  } catch (error) {
    console.error("Error verifying registration OTP:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
