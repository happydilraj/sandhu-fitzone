import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { verifyOTP } from "@/lib/otp"

export async function POST(request: NextRequest) {
  try {
    // Check for authenticated user first
    const user = await getCurrentUser(request)
    
    // If not authenticated, check for x-user-id header (for registration flow)
    const userId = user?.id || request.headers.get("x-user-id")
    
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { otp } = await request.json()

    if (!otp) {
      return NextResponse.json({ success: false, error: "OTP is required" }, { status: 400 })
    }

    // Verify OTP
    const verified = await verifyOTP(userId, "phone", otp)

    if (!verified) {
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Phone verified successfully",
    })
  } catch (error) {
    console.error("Error verifying phone OTP:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
