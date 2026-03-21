'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Hash, AlertCircle, CheckCircle2 } from 'lucide-react'
import { COURIERS } from '@/lib/tracking'

interface SubmitDeliveryProps {
  dealId: string
  onSuccess: () => void
}

export function SubmitDelivery({ dealId, onSuccess }: SubmitDeliveryProps) {
  const [courier, setCourier] = useState('')
  const [trackingId, setTrackingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [trackingHash, setTrackingHash] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/submit-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, courier, trackingId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit delivery')

      setTrackingHash(data.trackingHash || '')
      setDone(true)
      setTimeout(() => onSuccess(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 rounded-xl text-[#4ade80]"
          style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Delivery submitted! Dispute window started.</p>
            <p className="text-xs text-[#8ca0b3] mt-1">Buyer has been notified via email.</p>
          </div>
        </div>
        {trackingHash && (
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-[#8ca0b3] mb-1 flex items-center gap-1"><Hash className="w-3 h-3" />On-chain tracking hash:</p>
            <p className="text-xs font-mono text-[#4ade80] break-all">{trackingHash}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#8ca0b3]">
        Enter your shipment tracking details. We&apos;ll verify the tracking number via TrackingMore API
        and store the SHA256 hash permanently on Algorand.
      </p>

      <div>
        <label className="block text-xs font-medium text-[#8ca0b3] mb-1.5">Courier *</label>
        <select
          value={courier}
          onChange={e => setCourier(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-[#4ade80]"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="" style={{ background: '#04101f' }}>Select carrier...</option>
          {COURIERS.map(c => (
            <option key={c.code} value={c.code} style={{ background: '#04101f' }}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#8ca0b3] mb-1.5">Tracking number *</label>
        <div className="relative">
          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8ca0b3]" />
          <input
            type="text"
            value={trackingId}
            onChange={e => setTrackingId(e.target.value.trim())}
            placeholder="e.g. DHL-994821BOM"
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white font-mono placeholder:text-[#8ca0b3]/60 outline-none focus:ring-2 focus:ring-[#4ade80]"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !courier || !trackingId}
        className="w-full py-4 rounded-xl font-bold text-sm text-[#04101f] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', boxShadow: '0 0 20px rgba(74,222,128,0.25)' }}
      >
        {loading ? 'Verifying & submitting...' : 'Submit tracking proof'}
      </button>
    </form>
  )
}
