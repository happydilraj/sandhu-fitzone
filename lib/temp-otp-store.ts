// Shared temporary OTP storage for registration flow
// This is stored in memory and will be cleared on server restart

interface OTPData {
  otp: string
  expiresAt: Date
}

// Use global to persist across hot reloads in development
declare global {
  var tempOTPStore: Map<string, OTPData> | undefined
}

export const tempOTPStore = global.tempOTPStore || new Map<string, OTPData>()

if (process.env.NODE_ENV !== "production") {
  global.tempOTPStore = tempOTPStore
}

export function storeRegistrationOTP(key: string, otp: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  tempOTPStore.set(key, { otp, expiresAt })
  console.log(`📝 Stored registration OTP for ${key}: ${otp}`)
}

export function verifyRegistrationOTP(key: string, otp: string): { success: boolean; error?: string } {
  const stored = tempOTPStore.get(key)

  if (!stored) {
    console.log(`❌ No OTP found for ${key}`)
    return { success: false, error: "No OTP found. Please request a new one." }
  }

  // Check expiration
  if (new Date() > stored.expiresAt) {
    tempOTPStore.delete(key)
    console.log(`⏰ OTP expired for ${key}`)
    return { success: false, error: "OTP expired. Please request a new one." }
  }

  // Verify OTP
  if (stored.otp !== otp) {
    console.log(`❌ Invalid OTP for ${key}. Expected: ${stored.otp}, Got: ${otp}`)
    return { success: false, error: "Invalid OTP" }
  }

  // OTP verified - remove it
  tempOTPStore.delete(key)
  console.log(`✅ OTP verified for ${key}`)
  return { success: true }
}

export function clearRegistrationOTP(key: string) {
  tempOTPStore.delete(key)
}
