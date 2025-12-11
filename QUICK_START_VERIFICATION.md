# 🚀 Quick Start: Email & Phone Verification

## ⚡ Get Started in 3 Steps

### Step 1: Run Database Migration
```bash
node scripts/add-verification.js
```

### Step 2: Test in Development
The system is **already working** with mock implementations!

1. Register a new member at `/register`
2. Login with the credentials
3. Go to `/verify` page
4. Check your **terminal/console** for OTP codes:
   ```
   📧 Sending OTP to user@example.com: 123456
   📱 Sending OTP to +1234567890: 654321
   ```
5. Enter the OTP and verify!

### Step 3: Production Setup (When Ready)

#### For Email (Resend - Recommended):
```bash
npm install resend
```

Add to `.env.local`:
```env
RESEND_API_KEY=re_your_api_key_here
```

Update `lib/otp.ts` → `sendEmailOTP()` function with Resend code.

Get API key: https://resend.com/api-keys

---

#### For SMS (Twilio - Recommended):
```bash
npm install twilio
```

Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

Update `lib/otp.ts` → `sendPhoneOTP()` function with Twilio code.

Get credentials: https://www.twilio.com/console

---

## 📖 Full Documentation

See `VERIFICATION_SETUP.md` for:
- Complete setup instructions
- All service options (SendGrid, AWS SNS, etc.)
- Security features
- API endpoints
- Troubleshooting

---

## ✅ What's Already Working

- ✅ Database schema with verification fields
- ✅ OTP generation (6-digit codes)
- ✅ OTP expiration (10 minutes)
- ✅ Verification API endpoints
- ✅ Beautiful verification UI at `/verify`
- ✅ Verification badges
- ✅ Dashboard alerts for unverified users
- ✅ Admin-created users auto-verified

---

## 🎯 User Experience

### New Members:
```
Register → Login → See Alert → Verify → Full Access
```

### Admin-Created Users:
```
Admin Creates → User Logs In → Already Verified ✅
```

---

## 🧪 Testing Commands

```bash
# Run migration
node scripts/add-verification.js

# Check database
node scripts/check-db.js

# Start dev server
npm run dev
```

Then visit:
- `/register` - Create account
- `/login` - Login
- `/verify` - Verify email/phone
- `/dashboard` - See verification status

---

**That's it! Your verification system is ready to use! 🎉**

For production, just add your email/SMS service API keys and update the functions in `lib/otp.ts`.
