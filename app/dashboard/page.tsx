"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Activity, Calendar, TrendingUp, Utensils, User, Dumbbell, Target, Award, AlertCircle } from "lucide-react"

export default function MemberDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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

  const quickStats = [
    { icon: Activity, label: "Workouts This Month", value: "12", color: "from-gym-primary to-gym-secondary" },
    { icon: TrendingUp, label: "Progress", value: "+5%", color: "from-green-500 to-emerald-500" },
    { icon: Target, label: "Goals Achieved", value: "3/5", color: "from-orange-500 to-red-500" },
    { icon: Award, label: "Streak", value: "7 days", color: "from-purple-500 to-pink-500" },
  ]

  const upcomingFeatures = [
    { icon: Activity, title: "Workout Tracking", description: "Log your daily workouts and exercises" },
    { icon: TrendingUp, title: "Progress Analytics", description: "Track your fitness journey with detailed charts" },
    { icon: Utensils, title: "Diet Plans", description: "Personalized nutrition plans from our experts" },
    { icon: Calendar, title: "Class Booking", description: "Book group classes and PT sessions" },
    { icon: Target, title: "Goal Setting", description: "Set and track your fitness goals" },
    { icon: Dumbbell, title: "Workout Programs", description: "Custom workout programs tailored for you" },
  ]

  const needsVerification = !user.emailVerified || !user.phoneVerified

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome Back, <span className="gradient-text">{user.fullName.split(" ")[0]}</span>
          </h1>
          <p className="text-gym-gray">Track your fitness journey and achieve your goals</p>
        </div>

        {/* Verification Alert */}
        {needsVerification && (
          <div className="glass rounded-xl p-6 mb-8 border-2 border-orange-500/30">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Verify Your Account</h3>
                <p className="text-gym-gray text-sm mb-4">
                  Please verify your {!user.emailVerified && "email"}
                  {!user.emailVerified && !user.phoneVerified && " and "}
                  {!user.phoneVerified && "phone number"} to secure your account and access all features.
                </p>
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 text-sm"
                >
                  Verify Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="glass rounded-xl p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gym-gray">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="glass rounded-2xl p-8 mb-8 border-2 border-gym-primary/30">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gym-dark" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Member Dashboard <span className="gradient-text">Coming Soon</span>
            </h2>
            <p className="text-gym-gray max-w-2xl mx-auto">
              We're building an amazing dashboard where you can track your progress, manage your diet plans, book
              classes, and much more!
            </p>
          </div>

          {/* Upcoming Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <feature.icon className="w-6 h-6 text-gym-primary mb-2" />
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-gym-gray text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Membership Info */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gym-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-gym-primary" />
              </div>
              <div>
                <p className="text-gym-gray text-sm">Full Name</p>
                <p className="text-white font-medium">{user.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gym-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-gym-primary" />
              </div>
              <div>
                <p className="text-gym-gray text-sm">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gym-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-gym-primary" />
              </div>
              <div>
                <p className="text-gym-gray text-sm">Phone</p>
                <p className="text-white font-medium">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gym-primary/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-gym-primary" />
              </div>
              <div>
                <p className="text-gym-gray text-sm">Member Since</p>
                <p className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 text-center">
          <p className="text-gym-gray text-sm mb-4">Need help or want to upgrade your membership?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 neon-glow"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
