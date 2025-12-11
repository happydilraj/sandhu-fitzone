"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, X, Save, ImageIcon, Upload, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

interface GalleryImage {
  id: string
  title: string
  imageUrl: string
  caption?: string
  createdAt?: string
}

export default function AdminGalleryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ title: "", image_url: "", category: "gym" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/admin/gallery")
        if (res.ok) {
          const response = await res.json()
          setImages(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch gallery:", error)
      } finally {
        setFetching(false)
      }
    }

    if (user?.role === "ADMIN") {
      fetchImages()
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = formData.image_url

      // If file upload method, upload the file first
      if (uploadMethod === "file" && selectedFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", selectedFile)

        const uploadRes = await fetch("/api/upload/local", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image")
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      // Create gallery entry
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          imageUrl: imageUrl,
          category: formData.category,
        }),
      })

      if (res.ok) {
        const response = await res.json()
        // Refresh the images list
        const refreshRes = await fetch("/api/admin/gallery")
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          setImages(refreshData.data || [])
        }
        setShowModal(false)
        setFormData({ title: "", image_url: "", category: "gym" })
        setSelectedFile(null)
        setPreviewUrl("")
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to add image")
      }
    } catch (error) {
      console.error("Failed to add image:", error)
      alert("Failed to add image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" })
      if (res.ok) {
        setImages(images.filter((img) => img.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete image:", error)
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-gym-gray hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">
              Manage <span className="gradient-text">Gallery</span>
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Image
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="glass rounded-xl overflow-hidden group">
              <div className="aspect-video relative">
                <img src={img.imageUrl || "/placeholder.svg"} alt={img.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-white truncate">{img.title}</h3>
                {img.caption && <p className="text-xs text-gym-gray mt-1">{img.caption}</p>}
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="w-16 h-16 text-gym-gray mx-auto mb-4" />
              <p className="text-gym-gray">No images in gallery</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Image</h2>
                <button onClick={() => setShowModal(false)} className="text-gym-gray hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gym-gray text-sm mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                    placeholder="Enter image title"
                  />
                </div>

                {/* Upload Method Toggle */}
                <div>
                  <label className="block text-gym-gray text-sm mb-2">Upload Method</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMethod("file")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        uploadMethod === "file"
                          ? "bg-gym-primary text-gym-dark"
                          : "bg-white/5 text-gym-gray hover:bg-white/10"
                      }`}
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod("url")}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        uploadMethod === "url"
                          ? "bg-gym-primary text-gym-dark"
                          : "bg-white/5 text-gym-gray hover:bg-white/10"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Image URL
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                {uploadMethod === "file" && (
                  <div>
                    <label className="block text-gym-gray text-sm mb-2">Select Image</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required={!selectedFile}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-gym-primary transition-colors bg-white/5"
                      >
                        {previewUrl ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              fill
                              className="object-contain rounded-lg"
                            />
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gym-gray mb-2" />
                            <span className="text-sm text-gym-gray">Click to upload image</span>
                            <span className="text-xs text-gym-gray/50 mt-1">PNG, JPG, GIF up to 10MB</span>
                          </>
                        )}
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-xs text-gym-primary mt-2">Selected: {selectedFile.name}</p>
                    )}
                  </div>
                )}

                {/* URL Input */}
                {uploadMethod === "url" && (
                  <div>
                    <label className="block text-gym-gray text-sm mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gym-gray text-sm mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                  >
                    <option value="gym">Gym</option>
                    <option value="equipment">Equipment</option>
                    <option value="members">Members</option>
                    <option value="events">Events</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={uploading || (uploadMethod === "file" && !selectedFile) || (uploadMethod === "url" && !formData.image_url)}
                  className="w-full py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Add Image
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
