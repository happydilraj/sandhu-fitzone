import { NextResponse } from "next/server"
import type { ApiResponse } from "@/lib/types"

export async function POST() {
  const response = NextResponse.json<ApiResponse>({
    success: true,
    data: { message: "Logged out successfully" },
  })

  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  })

  return response
}
