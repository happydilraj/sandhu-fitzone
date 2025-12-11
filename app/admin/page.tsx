"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, CreditCard, Dumbbell, ImageIcon, MessageSquare, ChevronRight, TrendingUp, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface DashboardStats {
  totalUsers: number
  activeMembers: number
  totalEquipment: number
  pendingMessages: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeMembers: 0,
    totalEquipment: 0,
    pendingMessages: 0,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, membershipsRes, equipmentRes, messagesRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/memberships"),
          fetch("/api/admin/equipment"),
          fetch("/api/admin/contact-messages"),
        ])

        const usersData = usersRes.ok ? await usersRes.json() : { data: [] }
        const membershipsData = membershipsRes.ok ? await membershipsRes.json() : { data: [] }
        const equipmentData = equipmentRes.ok ? await equipmentRes.json() : { data: [] }
        const messagesData = messagesRes.ok ? await messagesRes.json() : { data: [] }

        const users = usersData.data || []
        const memberships = membershipsData.data || []
        const equipment = equipmentData.data || []
        const messages = messagesData.data || []

        setStats({
          totalUsers: users.length,
          activeMembers: memberships.filter((m: any) => {
            const endDate = new Date(m.endDate)
            return endDate >= new Date()
          }).length,
          totalEquipment: equipment.length,
          pendingMessages: messages.filter((m: any) => m.status === "new").length,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }

    if (user?.role === "ADMIN") {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gym-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return null
  }

  const menuItems = [
    {
      href: "/admin/users",
      icon: Users,
      label: "Users",
      description: "Manage registered users",
      stat: stats.totalUsers,
      color: "from-blue-500 to-cyan-500",
    },
    {
      href: "/admin/memberships",
      icon: CreditCard,
      label: "Memberships",
      description: "Active memberships & plans",
      stat: stats.activeMembers,
      color: "from-gym-primary to-gym-secondary",
    },
    {
      href: "/admin/equipment",
      icon: Dumbbell,
      label: "Equipment",
      description: "Gym equipment inventory",
      stat: stats.totalEquipment,
      color: "from-orange-500 to-red-500",
    },
    {
      href: "/admin/gallery",
      icon: ImageIcon,
      label: "Gallery",
      description: "Manage gallery images",
      stat: null,
      color: "from-purple-500 to-pink-500",
    },
    {
      href: "/admin/messages",
      icon: MessageSquare,
      label: "Messages",
      description: "Contact form submissions",
      stat: stats.pendingMessages,
      color: "from-green-500 to-emerald-500",
      badge: stats.pendingMessages > 0,
    },
  ]

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-gym-gray">Welcome back, {user.fullName}. Manage your gym from here.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center">
                <Users className="w-5 h-5 text-gym-dark" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-gym-gray">Total Users</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeMembers}</p>
                <p className="text-xs text-gym-gray">Active Members</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalEquipment}</p>
                <p className="text-xs text-gym-gray">Equipment</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.pendingMessages}</p>
                <p className="text-xs text-gym-gray">New Messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass rounded-xl p-6 hover:border-gym-primary/50 transition-all duration-300 group relative"
            >
              {item.badge && (
                <span className="absolute top-4 right-4 w-3 h-3 bg-gym-secondary rounded-full animate-pulse" />
              )}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{item.label}</h3>
                  <p className="text-sm text-gym-gray">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gym-gray group-hover:text-gym-primary group-hover:translate-x-1 transition-all" />
              </div>
              {item.stat !== null && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-2xl font-bold gradient-text">{item.stat}</span>
                  <span className="text-gym-gray text-sm ml-2">total</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
