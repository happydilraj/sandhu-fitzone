import { type NextRequest } from "next/server"
import { cookies } from "next/headers"
import { getTokenFromHeader, verifyToken } from "./auth"

export async function verifyAdmin(request: NextRequest) {
  // Try to get token from Authorization header first, then from cookie
  const authHeader = request.headers.get("authorization")
  let token = getTokenFromHeader(authHeader)

  // If no token in header, check cookie
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get("auth-token")?.value || null
  }

  if (!token) {
    return { error: "No token provided", status: 401 }
  }

  const payload = await verifyToken(token)

  if (!payload) {
    return { error: "Invalid token", status: 401 }
  }

  if (payload.role !== "ADMIN") {
    return { error: "Admin access required", status: 403 }
  }

  return { payload }
}
