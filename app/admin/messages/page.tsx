"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Trash2, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: string
  name: string
  email: string
  message: string
  status: string
  createdAt: string
}

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  console.log("datestring", dateString)
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/admin/contact-messages")
        if (res.ok) {
          const response = await res.json()
          setMessages(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setFetching(false)
      }
    }

    if (user?.role === "ADMIN") {
      fetchMessages()
    }
  }, [user])

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      })
      if (res.ok) {
        setMessages(messages.map((m) => (m.id === id ? { ...m, status: "read" } : m)))
      }
    } catch (error) {
      console.error("Failed to update message:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return

    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, { method: "DELETE" })
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gym-gray hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Contact <span className="gradient-text">Messages</span>
          </h1>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`glass rounded-xl p-5 transition-all ${msg.status === "new" ? "border-gym-primary/50" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gym-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      {msg.name}
                      {msg.status === "new" && (
                        <span className="px-2 py-0.5 bg-gym-primary/20 text-gym-primary text-xs rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          New
                        </span>
                      )}
                    </h3>
                    <p className="text-gym-gray text-sm">{msg.email}</p>
                  </div>
                </div>
                <span className="text-gym-gray text-xs" title={new Date(msg.createdAt).toLocaleString()}>
                  {getRelativeTime(msg.createdAt)}
                </span>
              </div>

              <p className="text-gym-gray text-sm bg-white/5 rounded-lg p-4 mb-4">{msg.message}</p>

              <div className="flex items-center gap-2">
                {msg.status === "new" && (
                  <button
                    onClick={() => handleMarkRead(msg.id)}
                    className="flex items-center gap-2 px-3 py-1.5 glass text-gym-gray hover:text-green-500 rounded-lg text-sm transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="flex items-center gap-2 px-3 py-1.5 glass text-gym-gray hover:text-red-500 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {messages.length === 0 && <div className="text-center py-12 text-gym-gray">No messages yet</div>}
        </div>
      </div>
    </div>
  )
}
