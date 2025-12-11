# 📧📱 Email & Phone Verification Setup Guide

## ✅ What's Implemented

Your gym app now has a complete **OTP-based verification system** for both email and phone numbers!

### Features:
- ✅ 6-digit OTP generation
- ✅ 10-minute OTP expiration
- ✅ Email verification
- ✅ Phone verification
- ✅ Beautiful verification UI
- ✅ Verification status badges
- ✅ Auto-verification for admin-created users
- ✅ Verification prompts in dashboard

---

## 🗄️ Database Setup

### Step 1: Run the Migration

Run this command to add verification fields to your database:

```bash
node scripts/add-verification.js
```

This will:
- Add `email_verified` column to users table
- Add `phone_verified` column to users table
- Create `verification_tokens` table for OTP storage
- Mark existing users as verified (backward compatibility)

---

## 🔧 Current Implementation (Mock Services)

Right now, the verification system uses **mock implementations** that log OTPs to the console:

```typescript
// lib/otp.ts
console.log(`📧 Sending OTP to ${email}: ${otp}`)
console.log(`📱 Sending OTP to ${phone}: ${otp}`)
```

**This is perfect for development and testing!** ✅

---

## 🚀 Production Setup (Real Email & SMS)

To enable **real email and SMS** in production, you need to integrate third-party services:

### Option 1: Email Verification (Recommended Services)

#### **A. Resend** (Recommended - Modern & Easy)
```bash
npm install resend
```

Update `lib/otp.ts`:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'FutureFit Gym <noreply@yourdomain.com>',
      to: email,
      subject: 'Verify Your Email - FutureFit Gym',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `
    })
    return true
  } catch (error) {
    console.error("Error sending email OTP:", error)
    return false
  }
}
```

Add to `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
```

**Get API Key:** https://resend.com/api-keys

---

#### **B. SendGrid** (Popular Alternative)
```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  try {
    await sgMail.send({
      to: email,
      from: 'noreply@yourdomain.com', // Must be verified in SendGrid
      subject: 'Verify Your Email - FutureFit Gym',
      html: `<p>Your verification code is: <strong>${otp}</strong></p>`
    })
    return true
  } catch (error) {
    console.error("Error sending email OTP:", error)
    return false
  }
}
```

**Get API Key:** https://sendgrid.com/

---

### Option 2: Phone Verification (SMS Services)

#### **A. Twilio** (Most Popular)
```bash
npm install twilio
```

Update `lib/otp.ts`:
```typescript
import twilio from 'twilio'
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendPhoneOTP(phone: string, otp: string): Promise<boolean> {
  try {
    await client.messages.create({
      body: `Your FutureFit Gym verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })
    return true
  } catch (error) {
    console.error("Error sending phone OTP:", error)
    return false
  }
}
```

Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Get Credentials:** https://www.twilio.com/console

---

#### **B. AWS SNS** (If using AWS)
```bash
npm install @aws-sdk/client-sns
```

```typescript
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
const snsClient = new SNSClient({ region: process.env.AWS_REGION })

export async function sendPhoneOTP(phone: string, otp: string): Promise<boolean> {
  try {
    await snsClient.send(new PublishCommand({
      Message: `Your FutureFit Gym verification code is: ${otp}`,
      PhoneNumber: phone
    }))
    return true
  } catch (error) {
    console.error("Error sending phone OTP:", error)
    return false
  }
}
```

---

## 📋 User Flows

### 1. **New Member Registration** (via `/register`)
```
1. User fills membership form
2. Account created with email_verified = false, phone_verified = false
3. User logs in with default password
4. Dashboard shows verification alert
5. User clicks "Verify Now" → goes to /verify
6. User verifies email and phone
```

### 2. **Admin-Created Users** (via `/admin/users`)
```
1. Admin creates user account
2. Account created with email_verified = true, phone_verified = true
3. User can login immediately without verification
```

### 3. **Verification Page** (`/verify`)
```
1. User selects Email or Phone tab
2. Clicks "Send OTP"
3. Receives 6-digit code via email/SMS
4. Enters code in OTP input
5. Clicks "Verify OTP"
6. Status updated in database
7. Can proceed to dashboard
```

---

## 🎨 UI Components

### Verification Badge
```tsx
import { VerificationBadge } from "@/components/verification-badge"

<VerificationBadge verified={user.emailVerified} type="email" />
```

### OTP Input
```tsx
import { OTPInput } from "@/components/otp-input"

<OTPInput value={otp} onChange={setOtp} />
```

---

## 🔐 API Endpoints

### Email Verification
- `POST /api/verify/email/send` - Send OTP to email
- `POST /api/verify/email/verify` - Verify email OTP

### Phone Verification
- `POST /api/verify/phone/send` - Send OTP to phone
- `POST /api/verify/phone/verify` - Verify phone OTP

---

## 🧪 Testing (Development Mode)

Since we're using mock implementations, you can test like this:

1. **Register a new member** at `/register`
2. **Login** with the credentials
3. **Check terminal/console** for OTP codes:
   ```
   📧 Sending OTP to user@example.com: 123456
   📱 Sending OTP to +1234567890: 654321
   ```
4. **Go to `/verify`** page
5. **Enter the OTP** from console
6. **Verify successfully!**

---

## 🛡️ Security Features

- ✅ OTPs expire after 10 minutes
- ✅ One-time use (marked as verified after use)
- ✅ Tokens stored securely in database
- ✅ Rate limiting via countdown (60 seconds between sends)
- ✅ Admin-created users auto-verified
- ✅ Verification status checked on login

---

## 📊 Database Schema

### `users` table additions:
```sql
email_verified BOOLEAN DEFAULT false
phone_verified BOOLEAN DEFAULT false
```

### `verification_tokens` table:
```sql
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('email', 'phone')),
  token VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🎯 Next Steps

1. ✅ **Run the migration** to add verification fields
2. ✅ **Test in development** using console logs
3. 🔄 **Choose email service** (Resend recommended)
4. 🔄 **Choose SMS service** (Twilio recommended)
5. 🔄 **Add API keys** to `.env.local`
6. 🔄 **Update `lib/otp.ts`** with real implementations
7. 🔄 **Test in production**

---

## 💡 Pro Tips

1. **Email Templates**: Create beautiful HTML email templates with your gym branding
2. **SMS Cost**: SMS can be expensive - consider email-only verification initially
3. **Verification Rewards**: Offer a discount or free session for verified accounts
4. **Reminder System**: Send periodic reminders to unverified users
5. **Analytics**: Track verification completion rates

---

## 🚨 Important Notes

- **Mock mode is safe for development** - OTPs only log to console
- **Don't commit API keys** - Keep them in `.env.local` (already in `.gitignore`)
- **Test thoroughly** before going live with real services
- **Monitor costs** - SMS services charge per message
- **Verify sender domains** - Email services require domain verification

---

## 📞 Support

If you need help:
1. Check service documentation (Resend, Twilio, etc.)
2. Test with mock implementation first
3. Verify environment variables are loaded
4. Check console logs for errors

---

**Your verification system is ready to go! 🎉**

Start with mock mode for development, then switch to real services when you're ready for production.
