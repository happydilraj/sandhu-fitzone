"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { OTPInput } from "@/components/otp-input"
import { VerificationBadge } from "@/components/verification-badge"
import { Mail, Phone, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email")
  const [otp, setOtp] = useState("")
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  if (loading) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gym-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSendOTP = async () => {
    setSending(true)
    setMessage(null)
    setOtp("")

    try {
      const res = await fetch(`/api/verify/${activeTab}/send`, {
        method: "POST",
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        setCountdown(60) // 60 seconds cooldown
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send OTP" })
    } finally {
      setSending(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setMessage({ type: "error", text: "Please enter a 6-digit OTP" })
      return
    }

    setVerifying(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/verify/${activeTab}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        setOtp("")
        // Refresh user data to get updated verification status
        await refreshUser()
      } else {
        setMessage({ type: "error", text: data.error })
      }
    } catch {
      setMessage({ type: "error", text: "Failed to verify OTP" })
    } finally {
      setVerifying(false)
    }
  }

  const isEmailVerified = user.emailVerified
  const isPhoneVerified = user.phoneVerified
  const allVerified = isEmailVerified && isPhoneVerified

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Verify Your <span className="gradient-text">Account</span>
          </h1>
          <p className="text-gym-gray">Secure your account by verifying your email and phone number</p>
        </div>

        {/* All Verified Message */}
        {allVerified && (
          <div className="glass rounded-xl p-6 mb-6 border-2 border-green-500/30">
            <div className="flex items-center gap-3 text-green-500">
              <CheckCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Account Fully Verified</h3>
                <p className="text-sm text-gym-gray">Your email and phone number are both verified</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification Status Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-gym-primary" />
              <span className="text-white font-medium">Email</span>
            </div>
            <p className="text-gym-gray text-sm mb-2">{user.email}</p>
            <VerificationBadge verified={isEmailVerified} type="email" size="md" />
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-gym-primary" />
              <span className="text-white font-medium">Phone</span>
            </div>
            <p className="text-gym-gray text-sm mb-2">{user.phone}</p>
            <VerificationBadge verified={isPhoneVerified} type="phone" size="md" />
          </div>
        </div>

        {/* Verification Form */}
        {!allVerified && (
          <div className="glass rounded-xl p-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  setActiveTab("email")
                  setOtp("")
                  setMessage(null)
                }}
                disabled={isEmailVerified}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "email"
                    ? "bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark"
                    : "bg-white/5 text-gym-gray hover:bg-white/10"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email {isEmailVerified && "✓"}
              </button>
              <button
                onClick={() => {
                  setActiveTab("phone")
                  setOtp("")
                  setMessage(null)
                }}
                disabled={isPhoneVerified}
                className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "phone"
                    ? "bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark"
                    : "bg-white/5 text-gym-gray hover:bg-white/10"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Phone {isPhoneVerified && "✓"}
              </button>
            </div>

            {/* Send OTP */}
            <div className="mb-6">
              <button
                onClick={handleSendOTP}
                disabled={sending || countdown > 0 || (activeTab === "email" ? isEmailVerified : isPhoneVerified)}
                className="w-full py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 neon-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  `Send OTP to ${activeTab === "email" ? "Email" : "Phone"}`
                )}
              </button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-500/10 border border-green-500/30 text-green-500"
                    : "bg-red-500/10 border border-red-500/30 text-red-500"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3 text-center">Enter 6-Digit OTP</label>
              <OTPInput value={otp} onChange={setOtp} disabled={verifying} />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOTP}
              disabled={verifying || otp.length !== 6}
              className="w-full py-3 glass text-white rounded-lg font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            {/* Info */}
            <div className="mt-6 text-center text-gym-gray text-sm">
              <p>OTP is valid for 10 minutes</p>
              <p className="mt-1">
                Check your {activeTab === "email" ? "email inbox" : "phone messages"} for the verification code
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 text-center">
          {allVerified ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 neon-glow"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gym-gray text-sm hover:text-white transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
