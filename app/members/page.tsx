"use client"

import { useState, useEffect } from "react"
import { User, Clock, Sun, Moon, Users, Loader2 } from "lucide-react"

interface Member {
  id: string
  fullName: string
  planName: string
  shift: string
  startDate: string
}

export default function MembersPage() {
  const [activeShift, setActiveShift] = useState<"morning" | "evening">("morning")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/members?shift=${activeShift}`)
        if (res.ok) {
          const response = await res.json()
          setMembers(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch members:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [activeShift])

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Active <span className="gradient-text">Members</span>
          </h1>
          <p className="text-gym-gray max-w-2xl mx-auto">
            Meet our community of dedicated fitness enthusiasts training at FutureFit.
          </p>
        </div>

        {/* Shift Toggle */}
        <div className="flex justify-center mb-12">
          <div className="glass rounded-2xl p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveShift("morning")}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeShift === "morning"
                  ? "bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark"
                  : "text-gym-gray hover:text-white"
              }`}
            >
              <Sun className="w-5 h-5" />
              <div className="text-left">
                <div>Morning Shift</div>
                <div className={`text-xs ${activeShift === "morning" ? "text-gym-dark/70" : "text-gym-gray"}`}>
                  5:00 AM - 12:00 PM
                </div>
              </div>
            </button>
            <button
              onClick={() => setActiveShift("evening")}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeShift === "evening"
                  ? "bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark"
                  : "text-gym-gray hover:text-white"
              }`}
            >
              <Moon className="w-5 h-5" />
              <div className="text-left">
                <div>Evening Shift</div>
                <div className={`text-xs ${activeShift === "evening" ? "text-gym-dark/70" : "text-gym-gray"}`}>
                  4:00 PM - 11:00 PM
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="glass rounded-xl p-4 mb-8 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gym-primary" />
            <span className="text-white font-semibold">{members.length}</span>
            <span className="text-gym-gray">Active Members</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gym-secondary" />
            <span className="text-gym-gray">
              {activeShift === "morning" ? "5:00 AM - 12:00 PM" : "4:00 PM - 11:00 PM"}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-gym-primary animate-spin" />
          </div>
        )}

        {/* Members Grid */}
        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="glass rounded-xl p-5 hover:border-gym-primary/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-gym-dark font-bold">{getInitials(member.fullName)}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{member.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.planName?.includes("Yearly")
                            ? "bg-gym-primary/20 text-gym-primary"
                            : member.planName?.includes("Quarterly")
                              ? "bg-gym-secondary/20 text-gym-secondary"
                              : "bg-white/10 text-gym-gray"
                        }`}
                      >
                        {member.planName || "Member"}
                      </span>
                    </div>
                    <p className="text-xs text-gym-gray mt-1">
                      Since{" "}
                      {new Date(member.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && members.length === 0 && (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-gym-gray mx-auto mb-4" />
            <p className="text-gym-gray text-lg">No active members in this shift.</p>
          </div>
        )}
      </div>
    </div>
  )
}
