import Link from "next/link"
import { Users, Clock, Award, Play, MapPin, Phone, Zap, Heart, Dumbbell } from "lucide-react"
import GalleryCarousel from "@/components/gallery-carousel"

export default function HomePage() {
  const stats = [
    { icon: Users, label: "Active Members", value: "250+" },
    { icon: Clock, label: "Open Hours", value: "5am–11pm" },
    { icon: Award, label: "Certified Coaches", value: "10+" },
  ]

  const chips = ["Zones", "Coaching", "Facilities", "Shifts"]

  const facilities = [
    {
      title: "Strength Arena",
      description: "Heavy-duty powerlifting and bodybuilding equipment for serious lifters.",
      icon: Dumbbell,
    },
    {
      title: "Cardio Command",
      description: "State-of-the-art treadmills, bikes, and rowing machines.",
      icon: Heart,
    },
    {
      title: "Functional Zone",
      description: "Rigs, battle ropes, and open space for HIIT and mobility work.",
      icon: Zap,
    },
  ]

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 glass rounded-full">
                <span className="text-gym-primary text-sm font-medium">Welcome to the future of training</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
                Build the <span className="gradient-text">strongest</span> version of you.
              </h1>

              <p className="text-gym-gray text-lg max-w-xl">
                Transform your body and mind with cutting-edge equipment, expert guidance, and a community that never
                gives up. Your future self will thank you.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/plans"
                  className="px-6 py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 neon-glow"
                >
                  View Membership Plans
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 border border-gym-primary text-gym-primary rounded-lg font-semibold hover:bg-gym-primary/10 transition-all duration-300"
                >
                  Book a Free Trial
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 text-center">
                    <stat.icon className="w-6 h-6 text-gym-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gym-gray">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Video Card */}
            <div className="relative">
              <div className="glass rounded-2xl p-8 neon-glow">
                <div className="aspect-video rounded-xl overflow-hidden relative group">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  >
                    <source src="/video1.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Optional overlay for styling */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gym-dark/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Floating Chips */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="px-4 py-2 glass rounded-full text-sm text-gym-gray hover:text-gym-primary hover:border-gym-primary transition-all duration-300 cursor-pointer"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gym-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gym-secondary/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Facility Highlights Section - Kept on home page */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Facility <span className="gradient-text">Highlights</span>
            </h2>
            <p className="text-gym-gray max-w-2xl mx-auto">
              World-class equipment and spaces designed for peak performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <div
                key={facility.title}
                className="glass rounded-2xl p-6 hover:border-gym-primary/50 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gym-primary/20 to-gym-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <facility.icon className="w-7 h-7 text-gym-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{facility.title}</h3>
                <p className="text-gym-gray text-sm">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Gallery Section */}
      <GalleryCarousel />

      {/* Contact CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gym-primary/10 to-gym-secondary/10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-balance">
                Ready to start your <span className="gradient-text">transformation</span>?
              </h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 text-gym-gray">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gym-primary" />
                  <span>SANDHU FITZONE, Near Bharat Petroleum, Dodewala, Punjab</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gym-primary" />
                  <span>+91 9999999999</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all duration-300 neon-glow"
                >
                  Get Directions
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-3 border border-gym-primary text-gym-primary rounded-lg font-semibold hover:bg-gym-primary/10 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
