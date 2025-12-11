"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Membership {
  id: string
  user_name: string
  user_email: string
  plan_name: string
  shift: string
  status: string
  start_date: string
  end_date: string
}

export default function AdminMembershipsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await fetch("/api/admin/memberships")
        if (res.ok) {
          const response = await res.json()
          setMemberships(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch memberships:", error)
      } finally {
        setFetching(false)
      }
    }

    if (user?.role === "ADMIN") {
      fetchMemberships()
    }
  }, [user])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/memberships/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setMemberships(memberships.map((m) => (m.id === id ? { ...m, status } : m)))
      }
    } catch (error) {
      console.error("Failed to update membership:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this membership?")) return

    try {
      const res = await fetch(`/api/admin/memberships/${id}`, { method: "DELETE" })
      if (res.ok) {
        setMemberships(memberships.filter((m) => m.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete membership:", error)
    }
  }

  const filteredMemberships = memberships.filter((m) => {
    const matchesSearch =
      m.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.user_email?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || m.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "expired":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

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
          <h1 className="text-3xl font-bold text-white">
            Manage <span className="gradient-text">Memberships</span>
          </h1>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gym-gray" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "pending", "expired"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                    filter === status
                      ? "bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark"
                      : "glass text-gym-gray hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Memberships List */}
        <div className="space-y-4">
          {filteredMemberships.map((membership) => (
            <div key={membership.id} className="glass rounded-xl p-5 hover:border-gym-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    {membership.user_name || "Unknown User"}
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${
                        membership.status === "active"
                          ? "bg-green-500/20 text-green-500"
                          : membership.status === "expired"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-yellow-500/20 text-yellow-500"
                      }`}
                    >
                      {getStatusIcon(membership.status)}
                      {membership.status}
                    </span>
                  </h3>
                  <p className="text-gym-gray text-sm mt-1">{membership.user_email}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gym-gray mt-2">
                    <span className="text-gym-primary font-medium">{membership.plan_name}</span>
                    <span className="capitalize">{membership.shift} shift</span>
                    <span>
                      {new Date(membership.start_date).toLocaleDateString()} -{" "}
                      {new Date(membership.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={membership.status}
                    onChange={(e) => handleStatusChange(membership.id, e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-gym-primary focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleDelete(membership.id)}
                    className="p-2 text-gym-gray hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredMemberships.length === 0 && (
            <div className="text-center py-12 text-gym-gray">No memberships found</div>
          )}
        </div>
      </div>
    </div>
  )
}
