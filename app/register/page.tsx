"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react"
import { OTPInput } from "@/components/otp-input"

interface Plan {
  id: string
  name: string
  price: number
  duration_days: number
}

type RegistrationStep = "details" | "verify-email" | "verify-phone" | "complete"

export default function RegisterPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingPlans, setFetchingPlans] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<RegistrationStep>("details")
  const [tempUserId, setTempUserId] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [phoneOtp, setPhoneOtp] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    shift: "morning",
    startDate: "",
    password: "",
  })

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans")
        if (res.ok) {
          const response = await res.json()
          setPlans(response.data || [])
          if (response.data.length > 0) {
            // Select the middle plan (usually quarterly) as default
            const defaultPlan = response.data.find((p: Plan) => p.duration_days === 90) || response.data[0]
            setSelectedPlan(defaultPlan.id)
          }
        } else {
          setError("Failed to fetch plans")
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err)
      } finally {
        setFetchingPlans(false)
      }
    }
    fetchPlans()
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
      price,
    )
  }

  const getDurationLabel = (days: number) => {
    if (days === 30) return "/month"
    if (days === 90) return "/quarter"
    if (days === 365) return "/year"
    return `/${days} days`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Don't create user yet - just move to verification
      setStep("verify-email")
      // Send OTP to the email provided in form
      await sendOTPToEmail(formData.email)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const sendOTPToEmail = async (email: string) => {
    setSendingOtp(true)
    setError("")

    try {
      const res = await fetch("/api/verify/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "email" }),
      })

      const data = await res.json()

      if (res.ok) {
        setCountdown(60)
      } else {
        setError(data.error || "Failed to send email OTP")
      }
    } catch {
      setError("Failed to send email OTP")
    } finally {
      setSendingOtp(false)
    }
  }

  const sendOTPToPhone = async (phone: string) => {
    setSendingOtp(true)
    setError("")

    try {
      const res = await fetch("/api/verify/send-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, type: "phone" }),
      })

      const data = await res.json()

      if (res.ok) {
        setCountdown(60)
      } else {
        setError(data.error || "Failed to send phone OTP")
      }
    } catch {
      setError("Failed to send phone OTP")
    } finally {
      setSendingOtp(false)
    }
  }

  const verifyEmailOTP = async (otp: string) => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP")
      return
    }

    setVerifyingOtp(true)
    setError("")

    try {
      const res = await fetch("/api/verify/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp, type: "email" }),
      })

      const data = await res.json()

      if (res.ok) {
        // Email verified, move to phone verification
        setStep("verify-phone")
        setEmailOtp("")
        // Auto-send phone OTP
        await sendOTPToPhone(formData.phone)
      } else {
        setError(data.error || "Invalid OTP")
      }
    } catch {
      setError("Failed to verify OTP")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const verifyPhoneOTP = async (otp: string) => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP")
      return
    }

    setVerifyingOtp(true)
    setError("")

    try {
      const res = await fetch("/api/verify/verify-registration-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp, type: "phone" }),
      })

      const data = await res.json()

      if (res.ok) {
        // Both verified! Now create the user
        await createUserAfterVerification()
      } else {
        setError(data.error || "Invalid OTP")
      }
    } catch {
      setError("Failed to verify OTP")
    } finally {
      setVerifyingOtp(false)
    }
  }

  const createUserAfterVerification = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: Number.parseInt(formData.age),
          planId: selectedPlan,
          startDate: formData.startDate,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStep("complete")
        setPhoneOtp("")
        // Show success and redirect
        setTimeout(() => router.push("/login"), 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Email Verification Step
  if (step === "verify-email") {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gym-primary/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gym-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-gym-gray">
              We've sent a 6-digit code to <span className="text-white">{formData.email}</span>
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-white font-medium mb-3 text-center">Enter 6-Digit OTP</label>
              <OTPInput value={emailOtp} onChange={setEmailOtp} disabled={verifyingOtp} />
            </div>

            <button
              onClick={() => verifyEmailOTP(emailOtp)}
              disabled={verifyingOtp || emailOtp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => sendOTPToEmail(formData.email)}
              disabled={sendingOtp || countdown > 0}
              className="w-full py-3 glass text-white rounded-lg font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend OTP in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </button>

            <p className="text-center text-gym-gray text-sm mt-4">OTP is valid for 10 minutes</p>
          </div>
        </div>
      </div>
    )
  }

  // Phone Verification Step
  if (step === "verify-phone") {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gym-primary/20 flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-gym-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Phone</h1>
            <p className="text-gym-gray">
              We've sent a 6-digit code to <span className="text-white">{formData.phone}</span>
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-white font-medium mb-3 text-center">Enter 6-Digit OTP</label>
              <OTPInput value={phoneOtp} onChange={setPhoneOtp} disabled={verifyingOtp} />
            </div>

            <button
              onClick={() => verifyPhoneOTP(phoneOtp)}
              disabled={verifyingOtp || phoneOtp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Complete Registration
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={() => sendOTPToPhone(formData.phone)}
              disabled={sendingOtp || countdown > 0}
              className="w-full py-3 glass text-white rounded-lg font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend OTP in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </button>

            <p className="text-center text-gym-gray text-sm mt-4">OTP is valid for 10 minutes</p>
          </div>
        </div>
      </div>
    )
  }

  // Success Step
  if (step === "complete") {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Complete!</h2>
          <p className="text-gym-gray mb-4">Your email and phone have been verified successfully.</p>
          <p className="text-gym-gray">Redirecting you to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Join <span className="gradient-text">Sandhu Fitzone</span> Today
          </h1>
          <p className="text-gym-gray max-w-2xl mx-auto">
            Select your plan and fill in your details to begin your transformation journey.
          </p>
        </div>

        {/* Plan Selection */}
        {fetchingPlans ? (
          <div className="flex justify-center mb-12">
            <Loader2 className="w-8 h-8 text-gym-primary animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`glass rounded-xl p-6 text-left transition-all duration-300 relative ${
                  selectedPlan === plan.id ? "border-gym-primary neon-glow" : "hover:border-gym-primary/50"
                }`}
              >
                {plan.duration_days === 90 && (
                  <span className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-gym-primary to-gym-secondary rounded-full text-xs font-semibold text-gym-dark">
                    POPULAR
                  </span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  {selectedPlan === plan.id && (
                    <div className="w-6 h-6 rounded-full bg-gym-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-gym-dark" />
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold gradient-text">{formatPrice(plan.price)}</span>
                  <span className="text-gym-gray text-sm">{getDurationLabel(plan.duration_days)}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gym-gray text-sm mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-gym-gray text-sm mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-gym-gray text-sm mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none transition-colors"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="block text-gym-gray text-sm mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-gym-gray text-sm mb-2">Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="16"
                max="100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none transition-colors"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-gym-gray text-sm mb-2">Gender (Optional)</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none transition-colors"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gym-gray text-sm mb-2">Preferred Shift *</label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none transition-colors"
              >
                <option value="morning">Morning (5am - 12pm)</option>
                <option value="evening">Evening (4pm - 11pm)</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-gym-gray text-sm mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedPlan}
            className="w-full mt-8 py-4 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 neon-glow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
