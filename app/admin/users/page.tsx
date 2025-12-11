"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Plus,
  X,
  Eye,
  EyeOff,
  CreditCard,
  Clock,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface UserData {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: string
  createdAt: string
  isActive: boolean
  membership?: {
    id: number
    shift: string
    startDate: string
    endDate: string
    planName: string
    price: string
  } | null
}

interface Plan {
  id: number
  name: string
  price: number
  durationDays: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [users, setUsers] = useState<UserData[]>([])
  const [search, setSearch] = useState("")
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [plans, setPlans] = useState<Plan[]>([])
  const [addMembership, setAddMembership] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "MEMBER",
    isActive: true,
    membership: {
      planId: "",
      shift: "morning",
      startDate: new Date().toISOString().split("T")[0],
    },
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans")
        if (res.ok) {
          const response = await res.json()
          setPlans(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error)
      }
    }
    fetchPlans()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users")
        if (res.ok) {
          const response = await res.json()
          setUsers(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setFetching(false)
      }
    }

    if (user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [user])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const payload = {
        ...formData,
        membership: addMembership ? formData.membership : null,
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setUsers([data.data, ...users])
        setShowModal(false)
        setAddMembership(false)
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          password: "",
          role: "MEMBER",
          isActive: true,
          membership: {
            planId: "",
            shift: "morning",
            startDate: new Date().toISOString().split("T")[0],
          },
        })
      } else {
        setError(data.error || "Failed to create user")
      }
    } catch (error) {
      setError("Something went wrong")
      console.error("Failed to create user:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith("membership.")) {
      const field = name.split(".")[1]
      setFormData({
        ...formData,
        membership: {
          ...formData.membership,
          [field]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      })
    }
  }

  const filteredUsers = users.filter(
    (u) => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading || fetching) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gym-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gym-gray hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">
              Manage <span className="gradient-text">Users</span>
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 neon-glow"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gym-gray" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((userData) => (
            <div key={userData.id} className="glass rounded-xl p-5 hover:border-gym-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center">
                    {userData.role === "ADMIN" ? (
                      <Shield className="w-6 h-6 text-gym-dark" />
                    ) : (
                      <User className="w-6 h-6 text-gym-dark" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      {userData.fullName}
                      {userData.role === "ADMIN" && (
                        <span className="px-2 py-0.5 bg-gym-secondary/20 text-gym-secondary text-xs rounded-full">
                          Admin
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gym-gray mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {userData.email}
                      </span>
                      {userData.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {userData.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {userData.membership && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-gym-primary">
                            <CreditCard className="w-3 h-3" />
                            {userData.membership.planName}
                          </span>
                          <span className="flex items-center gap-1 text-gym-gray">
                            <Clock className="w-3 h-3" />
                            {userData.membership.shift}
                          </span>
                          <span className="text-gym-gray">
                            Until {new Date(userData.membership.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {userData.role !== "ADMIN" && (
                  <button
                    onClick={() => handleDelete(userData.id)}
                    className="p-2 text-gym-gray hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && <div className="text-center py-12 text-gym-gray">No users found</div>}
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add New User</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setError("")
                }}
                className="text-gym-gray hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gym-gray text-sm mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-gym-gray text-sm mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-gym-gray text-sm mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label className="block text-gym-gray text-sm mb-2">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gym-gray hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gym-gray text-sm mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-gym-primary focus:ring-gym-primary"
                />
                <label htmlFor="isActive" className="text-gym-gray text-sm">
                  Active Account
                </label>
              </div>

              {/* Add Membership Section */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="addMembership"
                    checked={addMembership}
                    onChange={(e) => setAddMembership(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-gym-primary focus:ring-gym-primary"
                  />
                  <label htmlFor="addMembership" className="text-white text-sm font-medium">
                    Add Membership
                  </label>
                </div>

                {addMembership && (
                  <div className="space-y-4 pl-6 border-l-2 border-gym-primary/30">
                    <div>
                      <label className="block text-gym-gray text-sm mb-2">Plan *</label>
                      <select
                        name="membership.planId"
                        value={formData.membership.planId}
                        onChange={handleChange}
                        required={addMembership}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                      >
                        <option value="">Select Plan</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} - ₹{plan.price}/{plan.durationDays} days
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gym-gray text-sm mb-2">Shift *</label>
                      <select
                        name="membership.shift"
                        value={formData.membership.shift}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                      >
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gym-gray text-sm mb-2">Start Date *</label>
                      <input
                        type="date"
                        name="membership.startDate"
                        value={formData.membership.startDate}
                        onChange={handleChange}
                        required={addMembership}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setError("")
                  }}
                  className="flex-1 px-4 py-3 glass text-gym-gray hover:text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
