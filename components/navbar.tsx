"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Home, Users, CreditCard, Dumbbell, Phone, LogIn, LogOut, Shield, UserCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()

  console.log("user", user)

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/members", label: "Members", icon: Users },
    { href: "/plans", label: "Plans", icon: CreditCard },
    { href: "/equipment", label: "Equipment", icon: Dumbbell },
    { href: "/contact", label: "Contact", icon: Phone },
  ]

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center neon-glow">
              <span className="text-gym-dark font-bold text-xl">SF</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">Sandhu Fitzone</h1>
              <p className="text-xs text-gym-gray">Train for tomorrow</p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 transition-colors duration-300 text-sm font-medium group ${
                    isActive 
                      ? "text-gym-primary" 
                      : "text-gym-gray hover:text-gym-primary"
                  }`}
                >
                  <link.icon className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                    isActive ? "text-gym-primary" : ""
                  }`} />
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    {user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-gym-secondary hover:text-gym-secondary/80 transition-colors text-sm font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gym-primary hover:text-gym-primary/80 transition-colors text-sm font-medium"
                      >
                        <UserCircle className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}
                    <span className="text-gym-gray text-sm">Hi, {user.fullName.split(" ")[0]}</span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 glass text-gym-gray hover:text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-gym-gray hover:text-white transition-colors text-sm font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      Member Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 neon-glow text-sm"
                    >
                      Get Membership
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden glass border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 transition-colors duration-300 py-2 ${
                    isActive 
                      ? "text-gym-primary" 
                      : "text-gym-gray hover:text-gym-primary"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <p className="text-gym-gray text-sm">Signed in as {user.fullName}</p>
                      {user.role === "ADMIN" ? (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 text-gym-secondary hover:text-gym-secondary/80 py-2"
                        >
                          <Shield className="w-5 h-5" />
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 text-gym-primary hover:text-gym-primary/80 py-2"
                        >
                          <UserCircle className="w-5 h-5" />
                          My Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-gym-gray hover:text-white py-2 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-gym-gray hover:text-white py-2"
                      >
                        <LogIn className="w-5 h-5" />
                        Member Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold text-center hover:opacity-90 transition-all duration-300"
                      >
                        Get Membership
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
