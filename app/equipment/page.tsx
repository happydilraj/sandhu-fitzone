"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface Equipment {
  id: string
  name: string
  category: string
  description: string
  imageUrl?: string
}

export default function EquipmentPage() {
  const [filter, setFilter] = useState("all")
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/equipment")
        if (res.ok) {
          const response = await res.json()
          setEquipment(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch equipment:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEquipment()
  }, [])

  const categories = [
    { id: "all", label: "All" },
    { id: "Cardio", label: "Cardio" },
    { id: "Strength", label: "Strength" },
    { id: "Free Weights", label: "Free Weights" },
    { id: "Functional", label: "Functional" },
  ]

  const filteredEquipment = equipment.filter((item) => (filter === "all" ? true : item.category === filter))

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Equipment <span className="gradient-text">Gallery</span>
          </h1>
          <p className="text-gym-gray max-w-2xl mx-auto">
            Explore our state-of-the-art equipment designed for every fitness goal.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                filter === cat.id
                  ? "bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark"
                  : "glass text-gym-gray hover:text-gym-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-gym-primary animate-spin" />
          </div>
        )}

        {/* Equipment Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl overflow-hidden hover:border-gym-primary/50 transition-all duration-300 group"
              >
                <div className="aspect-video bg-gradient-to-br from-gym-primary/20 to-gym-secondary/20 flex items-center justify-center group-hover:from-gym-primary/30 group-hover:to-gym-secondary/30 transition-all duration-300 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-gym-gray/50 text-sm">{item.category}</span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <span className="px-2 py-1 bg-gym-primary/20 text-gym-primary text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gym-gray text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEquipment.length === 0 && (
          <div className="text-center py-12 text-gym-gray">No equipment found in this category.</div>
        )}
      </div>
    </div>
  )
}
