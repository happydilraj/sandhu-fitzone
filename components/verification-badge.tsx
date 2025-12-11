"use client"

import { CheckCircle, XCircle } from "lucide-react"

interface VerificationBadgeProps {
  verified: boolean
  type: "email" | "phone"
  size?: "sm" | "md"
}

export function VerificationBadge({ verified, type, size = "sm" }: VerificationBadgeProps) {
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5"
  const textSize = size === "sm" ? "text-xs" : "text-sm"

  return (
    <div className={`inline-flex items-center gap-1 ${textSize}`}>
      {verified ? (
        <>
          <CheckCircle className={`${iconSize} text-green-500`} />
          <span className="text-green-500">Verified</span>
        </>
      ) : (
        <>
          <XCircle className={`${iconSize} text-orange-500`} />
          <span className="text-orange-500">Not Verified</span>
        </>
      )}
    </div>
  )
}
