'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image, AlertCircle, CheckCircle2 } from 'lucide-react'

interface EvidenceUploadProps {
  dealId: string
  role: 'seller' | 'buyer'
  onSuccess?: () => void
}

export function EvidenceUpload({ dealId, role, onSuccess }: EvidenceUploadProps) {
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    const newFiles = Array.from(selected).filter(f => f.type.startsWith('image/'))
    const combined = [...files, ...newFiles].slice(0, 5) // max 5
    setFiles(combined)
    setPreviews(combined.map(f => URL.createObjectURL(f)))
  }

  function removeFile(i: number) {
    const newFiles = files.filter((_, idx) => idx !== i)
    const newPreviews = previews.filter((_, idx) => idx !== i)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) { setError('Please add a description.'); return }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('dealId', dealId)
      formData.append('role', role)
      formData.append('description', description)
      files.forEach(f => formData.append('photos', f))

      const res = await fetch('/api/upload-evidence', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      setDone(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl text-[#4ade80]"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-semibold">Evidence submitted successfully.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#8ca0b3] mb-1.5">Description *</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your issue with supporting details..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-[#8ca0b3]/60 outline-none focus:ring-2 focus:ring-[#4ade80] resize-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Upload area */}
      <div>
        <label className="block text-xs font-medium text-[#8ca0b3] mb-1.5">
          Photos (optional, max 5)
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-white/5"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <Upload className="w-6 h-6 text-[#8ca0b3] mx-auto mb-2" />
          <p className="text-sm text-[#8ca0b3]">Click to upload photos</p>
          <p className="text-xs text-[#8ca0b3]/60 mt-1">JPG, PNG, WebP — max 5 images</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-20 h-20 rounded-xl overflow-hidden group"
            >
              <img src={src} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          ))}
          {previews.length < 5 && (
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <Image className="w-5 h-5 text-[#8ca0b3]" />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-sm text-[#04101f] disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)' }}
      >
        {loading ? 'Uploading...' : 'Submit evidence'}
      </button>
    </form>
  )
}
