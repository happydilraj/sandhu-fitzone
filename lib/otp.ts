import { sql } from "@/lib/db"

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Store OTP in database
 */
export async function storeOTP(userId: string, type: "email" | "phone", token: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  console.log(`📝 Storing OTP for user ${userId}, type: ${type}, token: ${token}`)
  
  await sql`
    INSERT INTO verification_tokens (user_id, type, token, expires_at)
    VALUES (${userId}, ${type}, ${token}, ${expiresAt})
  `
  
  console.log(`✅ OTP stored successfully`)
}

/**
 * Verify OTP from database
 */
export async function verifyOTP(userId: string, type: "email" | "phone", token: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM verification_tokens
    WHERE user_id = ${userId}
    AND type = ${type}
    AND token = ${token}
    AND expires_at > NOW()
    AND verified = false
    ORDER BY created_at DESC
    LIMIT 1
  `

  if (result.length === 0) {
    return false
  }

  // Mark token as verified
  await sql`
    UPDATE verification_tokens
    SET verified = true
    WHERE id = ${result[0].id}
  `

  // Update user verification status
  if (type === "email") {
    await sql`
      UPDATE users
      SET email_verified = true
      WHERE id = ${userId}
    `
  } else {
    await sql`
      UPDATE users
      SET phone_verified = true
      WHERE id = ${userId}
    `
  }

  return true
}

/**
 * Check if user has verified email/phone
 */
export async function isVerified(userId: string, type: "email" | "phone"): Promise<boolean> {
  const result = await sql`
    SELECT ${type === "email" ? sql`email_verified` : sql`phone_verified`} as verified
    FROM users
    WHERE id = ${userId}
  `

  return result.length > 0 && result[0].verified
}

/**
 * Send OTP via email (mock implementation - replace with real email service)
 */
export async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  try {
    console.log(`📧 Sending OTP to ${email}: ${otp}`)
    
    // TODO: Replace with real email service (Resend, SendGrid, etc.)
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'FutureFit Gym <noreply@futurefit.com>',
    //   to: email,
    //   subject: 'Verify Your Email - FutureFit Gym',
    //   html: `<p>Your verification code is: <strong>${otp}</strong></p>`
    // })
    
    return true
  } catch (error) {
    console.error("Error sending email OTP:", error)
    return false
  }
}

/**
 * Send OTP via SMS (mock implementation - replace with real SMS service)
 */
export async function sendPhoneOTP(phone: string, otp: string): Promise<boolean> {
  try {
    console.log(`📱 Sending OTP to ${phone}: ${otp}`)
    
    // TODO: Replace with real SMS service (Twilio, AWS SNS, etc.)
    // Example with Twilio:
    // await twilioClient.messages.create({
    //   body: `Your FutureFit Gym verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // })
    
    return true
  } catch (error) {
    console.error("Error sending phone OTP:", error)
    return false
  }
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens() {
  await sql`
    DELETE FROM verification_tokens
    WHERE expires_at < NOW()
  `
}
