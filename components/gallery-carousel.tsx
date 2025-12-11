"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import Image from 'next/image'

interface GalleryImage {
  id: number
  title: string
  caption?: string
  imageUrl: string
}

export default function GalleryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch gallery images from database
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery')
        if (res.ok) {
          const response = await res.json()
          setGalleryImages(response.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [])

  const totalImages = galleryImages.length

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalImages)
  }, [totalImages])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages)
  }, [totalImages])

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide])

  // Get visible images (previous, current, next)
  const getVisibleImages = () => {
    const prevIndex = (currentIndex - 1 + totalImages) % totalImages
    const nextIndex = (currentIndex + 1) % totalImages
    return [
      { ...galleryImages[prevIndex], position: "left" },
      { ...galleryImages[currentIndex], position: "center" },
      { ...galleryImages[nextIndex], position: "right" },
    ]
  }

  const visibleImages = getVisibleImages()

  // Loading state
  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our <span className="gradient-text">Gallery</span>
            </h2>
          </div>
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-gym-primary animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  // No images state
  if (galleryImages.length === 0) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Our <span className="gradient-text">Gallery</span>
            </h2>
            <p className="text-gym-gray">No images available yet.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Our <span className="gradient-text">Gallery</span>
          </h2>
          <p className="text-gym-gray max-w-2xl mx-auto">
            Take a peek inside FutureFit and see where champions are made.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Images Container */}
          <div className="flex items-center justify-center gap-4 md:gap-6 py-8">
            {visibleImages.map((image, idx) => {
              const isCenter = image.position === "center"
              return (
                <div
                  key={`${image.id}-${image.position}`}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
                    isCenter
                      ? "w-[60%] md:w-[50%] aspect-[16/10] z-20 scale-100"
                      : "w-[20%] md:w-[25%] aspect-[16/10] z-10 scale-90 opacity-60"
                  } ${
                    image.position === "left"
                      ? "-translate-x-4 md:-translate-x-8"
                      : image.position === "right"
                        ? "translate-x-4 md:translate-x-8"
                        : ""
                  }`}
                >
                  {/* Image */}
                  <Image
                    src={image.imageUrl}
                    alt={image.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 60vw, 50vw"
                    priority={isCenter}
                  />

                  {/* Overlay */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isCenter ? "bg-gradient-to-t from-gym-dark/80 via-transparent to-transparent" : "bg-gym-dark/50"
                    }`}
                  />

                  {/* Neon Border for Center */}
                  {isCenter && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-gym-primary/50 neon-glow pointer-events-none" />
                  )}

                  {/* Title - Only on center image */}
                  {isCenter && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold text-white">{image.title}</h3>
                      {image.caption && (
                        <p className="text-gym-gray text-sm hidden md:block">{image.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              className="p-3 md:p-4 glass rounded-full hover:bg-gym-primary/20 transition-all duration-300 group"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gym-gray group-hover:text-gym-primary transition-colors" />
            </button>

            {/* Progress Indicators */}
            <div className="flex items-center gap-2">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-8 h-2 bg-gradient-to-r from-gym-primary to-gym-secondary"
                      : "w-2 h-2 bg-gym-gray/30 hover:bg-gym-gray/50"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 md:p-4 glass rounded-full hover:bg-gym-primary/20 transition-all duration-300 group"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gym-gray group-hover:text-gym-primary transition-colors" />
            </button>
          </div>

          {/* Image Counter */}
          <div className="text-center mt-4">
            <span className="text-gym-primary font-semibold">{currentIndex + 1}</span>
            <span className="text-gym-gray"> / {totalImages}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
