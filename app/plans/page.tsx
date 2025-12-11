import Link from "next/link"
import { Check, Star, Zap, Crown, Dumbbell, Apple } from "lucide-react"

export default function PlansPage() {
  const plans = [
    {
      id: "monthly",
      name: "Monthly Starter",
      price: "₹1,999",
      duration: "/month",
      icon: Zap,
      popular: false,
      features: [
        "Full gym access",
        "Locker facilities",
        "Free fitness assessment",
        "Basic workout plan",
        "Access to cardio zone",
      ],
    },
    {
      id: "quarterly",
      name: "Quarterly Progress",
      price: "₹4,999",
      duration: "/quarter",
      icon: Star,
      popular: true,
      features: [
        "Full gym access",
        "Locker facilities",
        "Free fitness assessment",
        "2 personal training sessions",
        "Custom workout plan",
        "Nutrition consultation",
        "Access to all zones",
      ],
    },
    {
      id: "yearly",
      name: "Yearly Transform",
      price: "₹14,999",
      duration: "/year",
      icon: Crown,
      popular: false,
      features: [
        "Full gym access",
        "Premium locker facilities",
        "Monthly fitness assessments",
        "8 personal training sessions",
        "Custom workout & diet plan",
        "Priority booking for classes",
        "Guest passes (4/year)",
        "Exclusive member events",
      ],
    },
  ]

  const addOnPlans = [
    {
      id: "personal-training",
      name: "Personal Training",
      price: "₹799",
      duration: "/session",
      icon: Dumbbell,
      description: "One-on-one training sessions with our certified trainer",
      features: [
        "1-hour dedicated session",
        "Personalized workout routine",
        "Form correction & guidance",
        "Progress tracking",
        "Flexible scheduling",
      ],
      packages: [
        { sessions: 4, price: "₹2,999", savings: "Save ₹197" },
        { sessions: 8, price: "₹5,499", savings: "Save ₹893" },
        { sessions: 12, price: "₹7,499", savings: "Save ₹2,089" },
      ],
    },
    {
      id: "diet-chart",
      name: "Diet Chart",
      price: "₹1,499",
      duration: "/month",
      icon: Apple,
      description: "Customized nutrition plan tailored to your fitness goals",
      features: [
        "Personalized meal plans",
        "Macro & calorie calculations",
        "Weekly diet adjustments",
        "Supplement recommendations",
        "WhatsApp support for queries",
      ],
      packages: [
        { sessions: 1, price: "₹1,499", savings: "1 Month" },
        { sessions: 3, price: "₹3,999", savings: "Save ₹498" },
        { sessions: 6, price: "₹6,999", savings: "Save ₹1,995" },
      ],
    },
  ]

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Membership <span className="gradient-text">Plans</span>
          </h1>
          <p className="text-gym-gray max-w-2xl mx-auto text-lg">
            Choose the plan that fits your goals and commitment level. All plans include access to our state-of-the-art
            facilities.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass rounded-2xl p-8 relative flex flex-col ${
                plan.popular ? "border-gym-primary neon-glow scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-gym-primary to-gym-secondary rounded-full text-sm font-bold text-gym-dark">
                  MOST POPULAR
                </div>
              )}

              {/* Plan Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gym-primary/20 to-gym-secondary/20 flex items-center justify-center mb-6">
                <plan.icon className="w-8 h-8 text-gym-primary" />
              </div>

              {/* Plan Name & Price */}
              <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                <span className="text-gym-gray">{plan.duration}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-gym-gray">
                    <Check className="w-5 h-5 text-gym-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={`/register?plan=${plan.id}`}
                className={`block w-full py-4 rounded-xl text-center font-semibold text-lg transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark hover:opacity-90 neon-glow"
                    : "border-2 border-gym-primary text-gym-primary hover:bg-gym-primary/10"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Add-On <span className="gradient-text">Services</span>
            </h2>
            <p className="text-gym-gray max-w-2xl mx-auto">
              Supercharge your fitness journey with personalized training and nutrition guidance
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {addOnPlans.map((addon) => (
              <div key={addon.id} className="glass rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gym-primary/20 to-gym-secondary/20 flex items-center justify-center flex-shrink-0">
                    <addon.icon className="w-7 h-7 text-gym-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{addon.name}</h3>
                    <p className="text-gym-gray text-sm">{addon.description}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold gradient-text">{addon.price}</span>
                  <span className="text-gym-gray">{addon.duration}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {addon.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gym-gray text-sm">
                      <Check className="w-4 h-4 text-gym-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Package Options */}
                <div className="border-t border-white/10 pt-6">
                  <p className="text-white font-semibold mb-3">Package Deals</p>
                  <div className="grid grid-cols-3 gap-3">
                    {addon.packages.map((pkg) => (
                      <div
                        key={pkg.sessions}
                        className="text-center p-3 rounded-lg bg-white/5 border border-white/10 hover:border-gym-primary/50 transition-colors cursor-pointer"
                      >
                        <p className="text-white font-bold">{pkg.price}</p>
                        <p className="text-gym-gray text-xs">
                          {addon.id === "diet-chart"
                            ? `${pkg.sessions} Month${pkg.sessions > 1 ? "s" : ""}`
                            : `${pkg.sessions} Sessions`}
                        </p>
                        <p className="text-gym-primary text-xs mt-1">{pkg.savings}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/register?addon=${addon.id}`}
                  className="mt-6 block w-full py-3 rounded-xl text-center font-semibold border-2 border-gym-secondary text-gym-secondary hover:bg-gym-secondary/10 transition-all duration-300"
                >
                  Add to Membership
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 glass rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Not sure which plan is right for you?</h3>
          <p className="text-gym-gray mb-6 max-w-2xl mx-auto">
            Book a free consultation with our fitness experts. We'll help you choose the perfect plan based on your
            goals and schedule.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 border border-gym-primary text-gym-primary rounded-lg font-semibold hover:bg-gym-primary/10 transition-all duration-300"
          >
            Book Free Consultation
          </Link>
        </div>
      </div>
    </div>
  )
}
