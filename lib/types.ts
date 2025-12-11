// Database types for FutureFit gym

export type UserRole = "ADMIN" | "MEMBER"

export type Shift = "morning" | "evening" | "both"

export type ContactStatus = "new" | "seen" | "replied"

export interface User {
  id: string
  fullName: string
  email: string
  passwordHash: string
  phone: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}

export interface MembershipPlan {
  id: number
  name: string
  price: number
  durationDays: number
  features: string[]
  isActive: boolean
  createdAt: Date
}

export interface Membership {
  id: number
  userId: string
  planId: number
  shift: Shift
  startDate: Date
  endDate: Date
  createdAt: Date
  user?: User
  plan?: MembershipPlan
}

export interface Equipment {
  id: number
  name: string
  category: string
  description: string | null
  imageUrl: string | null
  videoUrl: string | null
  createdAt: Date
}

export interface GalleryImage {
  id: number
  title: string | null
  caption: string | null
  imageUrl: string
  createdAt: Date
}

export interface ContactMessage {
  id: number
  userId: string | null
  name: string
  email: string
  message: string
  status: ContactStatus
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, string>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number
  limit: number
  total: number
  totalPages: number
}

// JWT Payload
export interface JWTPayload {
  id: string
  role: UserRole
  email: string
}
