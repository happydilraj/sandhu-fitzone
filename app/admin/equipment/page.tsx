"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Edit, X, Save, Upload, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Equipment {
  id: string
  name: string
  category: string
  description: string
  quantity: number
  status: string
  imageUrl?: string
}

export default function AdminEquipmentPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Cardio",
    description: "",
    quantity: 1,
    status: "available",
    imageUrl: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/admin/equipment")
        if (res.ok) {
          const response = await res.json()
          setEquipment(response.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch equipment:", error)
      } finally {
        setFetching(false)
      }
    }

    if (user?.role === "ADMIN") {
      fetchEquipment()
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
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
      let imageUrl = formData.imageUrl

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

      const dataToSend = {
        ...formData,
        imageUrl: imageUrl || null,
      }

      if (editingItem) {
        const res = await fetch(`/api/admin/equipment/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })
        if (res.ok) {
          const response = await res.json()
          setEquipment(equipment.map((eq) => (eq.id === editingItem.id ? response.data : eq)))
        }
      } else {
        const res = await fetch("/api/admin/equipment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        })
        if (res.ok) {
          const response = await res.json()
          setEquipment([...equipment, response.data])
        }
      }
      closeModal()
    } catch (error) {
      console.error("Failed to save equipment:", error)
      alert("Failed to save equipment. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return

    try {
      const res = await fetch(`/api/admin/equipment/${id}`, { method: "DELETE" })
      if (res.ok) {
        setEquipment(equipment.filter((eq) => eq.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete equipment:", error)
    }
  }

  const openModal = (item?: Equipment) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        status: item.status,
        imageUrl: item.imageUrl || "",
      })
      setPreviewUrl(item.imageUrl || "")
    } else {
      setEditingItem(null)
      setFormData({ name: "", category: "Cardio", description: "", quantity: 1, status: "available", imageUrl: "" })
      setPreviewUrl("")
    }
    setSelectedFile(null)
    setUploadMethod("file")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setSelectedFile(null)
    setPreviewUrl("")
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
              Manage <span className="gradient-text">Equipment</span>
            </h1>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        </div>

        {/* Equipment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div key={item.id} className="glass rounded-xl overflow-hidden hover:border-gym-primary/30 transition-all group">
              {/* Equipment Image */}
              <div className="aspect-video bg-gradient-to-br from-gym-primary/20 to-gym-secondary/20 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gym-gray/30" />
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <span className="px-2 py-0.5 bg-gym-primary/20 text-gym-primary text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 text-gym-gray hover:text-gym-primary transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gym-gray hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gym-gray text-sm mb-3">{item.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gym-gray">Qty: {item.quantity}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      item.status === "available" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{editingItem ? "Edit Equipment" : "Add Equipment"}</h2>
                <button onClick={closeModal} className="text-gym-gray hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gym-gray text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-gym-gray text-sm mb-2">Equipment Image</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setUploadMethod("file")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                        uploadMethod === "file"
                          ? "bg-gym-primary text-gym-dark"
                          : "bg-white/5 text-gym-gray hover:bg-white/10"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod("url")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                        uploadMethod === "url"
                          ? "bg-gym-primary text-gym-dark"
                          : "bg-white/5 text-gym-gray hover:bg-white/10"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {uploadMethod === "file" ? (
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-gym-primary/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gym-gray mb-2" />
                          <p className="text-sm text-gym-gray">
                            {selectedFile ? selectedFile.name : "Click to upload equipment image"}
                          </p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                      {previewUrl && (
                        <div className="mt-3">
                          <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-gym-gray text-sm mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Functional">Functional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gym-gray text-sm mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gym-gray text-sm mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gym-gray text-sm mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-gym-primary focus:outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 bg-gradient-to-r from-gym-primary to-gym-secondary text-gym-dark rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gym-dark border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingItem ? "Update" : "Add"} Equipment
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
