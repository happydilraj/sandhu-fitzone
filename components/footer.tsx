import Link from "next/link"
import { Instagram, Facebook, Youtube } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gym-dark border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center">
                <span className="text-gym-dark font-bold">FF</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">FutureFit</h3>
                <p className="text-xs text-gym-gray">Train for tomorrow</p>
              </div>
            </div>
            <p className="text-gym-gray text-sm max-w-md">
              Experience the future of fitness with state-of-the-art equipment, expert coaches, and a community that
              pushes you to be your best.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Equipment", "Members", "Contact"].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link.toLowerCase() === "home" ? "" : link.toLowerCase()}`}
                    className="text-gym-gray hover:text-gym-primary transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gym-gray hover:text-gym-primary hover:border-gym-primary transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gym-gray hover:text-gym-primary hover:border-gym-primary transition-all duration-300"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gym-gray hover:text-gym-primary hover:border-gym-primary transition-all duration-300"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gym-gray text-sm">© {currentYear} FutureFit Gym. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
