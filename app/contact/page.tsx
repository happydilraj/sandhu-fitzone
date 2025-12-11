"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Award,
  Dumbbell,
  Target,
  Clock,
  Loader2,
  CheckCircle,
} from "lucide-react"
import trainerImg from '@/images/trainer.jpg'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess(true)
        setFormData({ name: "", email: "", message: "" })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to send message")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const contactInfo = [
    { icon: MapPin, label: "Address", value: "SANDHU FITZONE, Near Bharat Petroleum, Dodewala, Punjab" },
    { icon: Phone, label: "Phone", value: "+91 9999999999" },
    { icon: Mail, label: "Email", value: "hello@futurefit.gym" },
  ]

  const socialLinks = [
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Youtube, label: "YouTube", href: "#" },
  ]

  const trainer = {
    name: "Dilpreet Sandhu",
    role: "Head Trainer & Fitness Coach",
    image: trainerImg,
    experience: "8+ Years",
    certifications: ["ISSA Certified Personal Trainer", "ACE Fitness Nutrition Specialist", "CrossFit Level 2 Trainer"],
    specialties: ["Strength Training", "Weight Loss", "Sports Conditioning", "Muscle Building"],
    bio: "Vikram brings over 8 years of experience in transforming lives through fitness. Having trained 500+ clients, he specializes in creating personalized workout and nutrition plans that deliver real results. His approach combines scientific training methods with motivational coaching.",
  }

  const trainerStats = [
    { icon: Clock, label: "Experience", value: "8+ Years" },
    { icon: Target, label: "Clients Trained", value: "500+" },
    { icon: Award, label: "Certifications", value: "5+" },
    { icon: Dumbbell, label: "Specializations", value: "4" },
  ]

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Get In <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-gym-gray max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Trainer Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Meet Your <span className="gradient-text">Trainer</span>
            </h2>
            <p className="text-gym-gray">Your fitness journey is guided by the best</p>
          </div>

          <div className="glass rounded-2xl p-8 lg:p-10">
            <div className="grid lg:grid-cols-5 gap-8 items-center">
              <div className="lg:col-span-2 flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border-2 border-gym-primary/30 neon-glow">
                    <Image
                      src={trainer.image}
                      alt={trainer.name}
                      width={288}
                      height={288}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-gym-primary to-gym-secondary rounded-xl -z-10 opacity-50" />
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">{trainer.name}</h3>
                  <p className="text-gym-primary font-medium">{trainer.role}</p>
                </div>

                <p className="text-gym-gray leading-relaxed">{trainer.bio}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {trainerStats.map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-xl bg-white/5">
                      <stat.icon className="w-5 h-5 text-gym-primary mx-auto mb-1" />
                      <p className="text-white font-bold">{stat.value}</p>
                      <p className="text-gym-gray text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {trainer.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-3 py-1 text-xs rounded-full bg-gym-primary/10 text-gym-primary border border-gym-primary/30"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {trainer.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 text-xs rounded-full bg-gym-secondary/10 text-gym-secondary border border-gym-secondary/30"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>

              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gym-primary/20 to-gym-secondary/20 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-gym-primary" />
                    </div>
                    <div>
                      <p className="text-gym-gray text-sm">{info.label}</p>
                      <p className="text-white font-medium">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-12 h-12 rounded-xl glass flex items-center justify-center text-gym-gray hover:text-gym-primary hover:border-gym-primary transition-all duration-300"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Operating Hours</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gym-gray">Monday - Friday</span>
                  <span className="text-white">5:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gym-gray">Saturday</span>
                  <span className="text-white">6:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gym-gray">Sunday</span>
                  <span className="text-white">7:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send a Message</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gym-gray text-sm mb-2">Your Name *</label>
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
                <label className="block text-gym-gray text-sm mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gym-gray/50 focus:border-gym-primary focus:outline-none transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 neon-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
