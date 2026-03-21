'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { getPeraWallet } from '@/lib/wallet'
import { algodClient } from '@/lib/algorand'
import algosdk from 'algosdk'

interface RaiseDisputeProps {
  dealId: string
  appId: number
  buyerWallet: string
  onSuccess: () => void
}

export function RaiseDispute({ dealId, appId, buyerWallet, onSuccess }: RaiseDisputeProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDispute() {
    setError('')
    setLoading(true)
    try {
      const peraWallet = getPeraWallet()
      const accounts = await peraWallet.reconnectSession()
      const buyerAddr = accounts[0]

      if (buyerAddr !== buyerWallet) {
        throw new Error('Connected wallet does not match buyer wallet for this deal.')
      }

      const params = await algodClient.getTransactionParams().do()
      const disputeTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: buyerAddr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('dispute')],
        suggestedParams: params,
      })

      const signedTxns = await peraWallet.signTransaction([[{ txn: disputeTxn, signers: [buyerAddr] }]])
      const { txid } = await algodClient.sendRawTransaction(signedTxns).do()
      await algosdk.waitForConfirmation(algodClient, txid, 4)

      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISPUTED' }),
      })

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full py-3 rounded-xl font-semibold text-sm text-red-400 transition-all hover:bg-red-500/10"
        style={{ border: '1px solid rgba(239,68,68,0.3)' }}
      >
        <AlertTriangle className="w-4 h-4 inline mr-2" />
        Raise a dispute
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 rounded-2xl"
      style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white mb-1">Open a dispute</p>
          <p className="text-xs text-[#8ca0b3]">
            This will freeze the USDC in the contract. Both parties will need to submit evidence within 48 hours.
            An arbitrator will review and decide the split.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
          className="mt-0.5 accent-red-500"
        />
        <span className="text-xs text-[#8ca0b3]">
          I understand this is serious and cannot be undone. I have a genuine issue with the goods received.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#8ca0b3] hover:text-white transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleDispute}
          disabled={loading || !confirmed}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
          style={{ background: loading ? 'rgba(239,68,68,0.5)' : '#ef4444' }}
        >
          {loading ? 'Signing...' : 'Raise dispute'}
        </button>
      </div>
    </motion.div>
  )
}
