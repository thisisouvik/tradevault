'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, MapPin, CheckCircle2, Clock, Truck, RefreshCw, ExternalLink, Hash } from 'lucide-react'

interface Checkpoint {
  time: string
  location: string
  status: string
  details: string
}

interface TrackingTimelineProps {
  dealId: string
  trackingId: string
  courier: string
  trackingHash?: string
  appId?: number
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  'Delivered': <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />,
  'In Transit': <Truck className="w-4 h-4 text-[#3b91e8]" />,
  'Pending': <Clock className="w-4 h-4 text-[#8ca0b3]" />,
}

export function TrackingTimeline({ dealId, trackingId, courier, trackingHash, appId }: TrackingTimelineProps) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchStatus() {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/tracking-status?dealId=${dealId}`)
      const data = await res.json()
      if (data.checkpoints) {
        setCheckpoints(data.checkpoints)
        setStatus(data.status || 'In Transit')
        setLastUpdated(new Date())
      }
    } catch (e) {
      console.error('Failed to fetch tracking', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    // Polling every 2 hours in production, every 30s in dev
    const interval = setInterval(fetchStatus, process.env.NODE_ENV === 'development' ? 30000 : 7200000)
    return () => clearInterval(interval)
  }, [dealId]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#4ade80]" />
          <span className="text-sm font-semibold text-white">Shipment Tracking</span>
        </div>
        <button
          onClick={fetchStatus}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#8ca0b3] hover:text-white hover:bg-white/5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tracking info */}
      <div
        className="flex flex-wrap items-center gap-3 p-3 rounded-xl text-xs"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="text-[#8ca0b3]">Carrier:</span>
        <span className="text-white font-semibold uppercase">{courier}</span>
        <span className="text-[#8ca0b3]">·</span>
        <span className="text-[#8ca0b3]">Tracking:</span>
        <span className="text-white font-mono">{trackingId}</span>
        {lastUpdated && (
          <>
            <span className="text-[#8ca0b3] ml-auto">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          </>
        )}
      </div>

      {/* On-chain proof */}
      {trackingHash && (
        <div
          className="p-3 rounded-xl"
          style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Hash className="w-3.5 h-3.5 text-[#4ade80]" />
            <span className="text-xs font-semibold text-[#4ade80]">On-chain proof</span>
            {appId && (
              <a
                href={`https://testnet.algoexplorer.io/application/${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-xs text-[#4ade80]/70 hover:text-[#4ade80] flex items-center gap-1"
              >
                Verify <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <p className="text-xs font-mono text-[#8ca0b3] break-all">{trackingHash}</p>
          <p className="text-xs text-[#8ca0b3]/60 mt-1">SHA256 of tracking number — stored permanently on Algorand</p>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-4 h-4 rounded-full bg-white/10 mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-white/10 rounded w-2/3" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : checkpoints.length === 0 ? (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-[#8ca0b3] mx-auto mb-2" />
          <p className="text-sm text-[#8ca0b3]">Tracking info not yet available.</p>
          <p className="text-xs text-[#8ca0b3]/60 mt-1">Usually available within 2 hours of shipment pickup.</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div
            className="absolute left-[9px] top-4 bottom-4 w-px"
            style={{ background: 'linear-gradient(to bottom, rgba(74,222,128,0.4), rgba(255,255,255,0.05))' }}
          />
          {checkpoints.map((cp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 pb-4 relative"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 z-10"
                style={{ background: i === 0 ? '#04101f' : 'rgba(255,255,255,0.05)', border: `2px solid ${i === 0 ? '#4ade80' : 'rgba(255,255,255,0.1)'}` }}>
                {i === 0 ? <div className="w-2 h-2 rounded-full bg-[#4ade80]" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white">{cp.status}</p>
                {cp.location && (
                  <p className="text-xs text-[#8ca0b3] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{cp.location}
                  </p>
                )}
                <p className="text-xs text-[#8ca0b3]/60 mt-0.5">
                  {new Date(cp.time).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
