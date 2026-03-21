'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Scale } from 'lucide-react'

interface ArbitratorFormProps {
  dealId: string
  amountUSDC: number
}

export function ArbitratorForm({ dealId, amountUSDC }: ArbitratorFormProps) {
  const router = useRouter()
  const [sellerPct, setSellerPct] = useState(50)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const buyerPct = 100 - sellerPct

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/resolve-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId, sellerPct, buyerPct, notes }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit verdict')

      setDone(true)
      setTimeout(() => router.push(`/deal/${dealId}`), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl text-[#4ade80]"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-semibold">Verdict submitted! Funds distributed on-chain.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Split slider */}
      <div>
        <label className="block text-sm font-semibold text-white mb-4">
          <Scale className="w-4 h-4 inline mr-2 text-[#4ade80]" />
          USDC distribution
        </label>

        {/* Visual split */}
        <div className="flex rounded-xl overflow-hidden h-10 mb-3">
          <div
            className="flex items-center justify-center text-xs font-bold text-[#04101f] transition-all duration-200"
            style={{ width: `${sellerPct}%`, background: '#4ade80', minWidth: '30px' }}
          >
            {sellerPct > 20 ? `${sellerPct}%` : ''}
          </div>
          <div
            className="flex items-center justify-center text-xs font-bold text-white transition-all duration-200"
            style={{ width: `${buyerPct}%`, background: '#3b91e8', minWidth: '30px' }}
          >
            {buyerPct > 20 ? `${buyerPct}%` : ''}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={sellerPct}
          onChange={e => setSellerPct(parseInt(e.target.value))}
          className="w-full accent-[#4ade80]"
        />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
          >
            <p className="text-xs text-[#8ca0b3] mb-1">Seller receives</p>
            <p className="text-lg font-black text-[#4ade80]">{sellerPct}%</p>
            <p className="text-xs text-[#8ca0b3]">${Math.floor(amountUSDC * sellerPct / 100)} USDC</p>
          </div>
          <div
            className="p-3 rounded-xl text-center"
            style={{ background: 'rgba(59,145,232,0.08)', border: '1px solid rgba(59,145,232,0.2)' }}
          >
            <p className="text-xs text-[#8ca0b3] mb-1">Buyer receives</p>
            <p className="text-lg font-black text-[#3b91e8]">{buyerPct}%</p>
            <p className="text-xs text-[#8ca0b3]">${Math.floor(amountUSDC * buyerPct / 100)} USDC</p>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[[100, 0], [80, 20], [50, 50], [20, 80], [0, 100]].map(([s, b]) => (
            <button
              key={`${s}-${b}`}
              type="button"
              onClick={() => setSellerPct(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sellerPct === s ? 'text-[#04101f]' : 'text-[#8ca0b3] hover:text-white'}`}
              style={{
                background: sellerPct === s ? '#4ade80' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {s}/{b}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-[#8ca0b3] mb-1.5">Arbitrator notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Explain your reasoning for the split..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-[#8ca0b3]/60 outline-none focus:ring-2 focus:ring-[#4ade80] resize-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
        style={{
          background: loading ? 'rgba(239,68,68,0.5)' : '#ef4444',
          boxShadow: loading ? 'none' : '0 0 20px rgba(239,68,68,0.3)',
        }}
      >
        {loading ? 'Submitting verdict...' : `Submit verdict: Seller ${sellerPct}% / Buyer ${buyerPct}%`}
      </motion.button>

      <p className="text-center text-xs text-[#8ca0b3]">
        This will execute the split on Algorand immediately. Cannot be undone.
      </p>
    </form>
  )
}
