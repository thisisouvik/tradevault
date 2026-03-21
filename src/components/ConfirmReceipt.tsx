'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { algodClient } from '@/lib/algorand'
import algosdk from 'algosdk'

interface ConfirmReceiptProps {
  dealId: string
  appId: number
  amountUSDC: number
  buyerWallet: string
  onSuccess: () => void
}

export function ConfirmReceipt({ dealId, appId, amountUSDC, buyerWallet, onSuccess }: ConfirmReceiptProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [txId, setTxId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const { activeAddress, signTransactions } = useWallet()

  async function handleConfirm() {
    if (!confirmed) return
    setError('')
    setLoading(true)

    try {
      if (!activeAddress) {
        throw new Error('Please connect your Wallet first.')
      }

      const buyerAddr = activeAddress

      if (buyerAddr !== buyerWallet) {
        throw new Error('Connected wallet does not match buyer wallet for this deal.')
      }

      const params = await algodClient.getTransactionParams().do()
      const confirmTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: buyerAddr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('confirm')],
        suggestedParams: params,
      })

      const signedTxns = await signTransactions([confirmTxn.toByte()])
      const validTxns = signedTxns.filter((tx): tx is Uint8Array => tx !== null)
      const { txid } = await algodClient.sendRawTransaction(validTxns).do()
      setTxId(txid)
      await algosdk.waitForConfirmation(algodClient, txid, 4)

      // Update DB
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      setDone(true)
      setTimeout(() => onSuccess(), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl text-[#4ade80]"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Payment released! ${amountUSDC} USDC sent to seller.</p>
          {txId && (
            <a href={`https://testnet.algoexplorer.io/tx/${txId}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#4ade80]/70 hover:text-[#4ade80] flex items-center gap-1 mt-1">
              View on Algorand <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
        <p className="text-sm text-[#8ca0b3]">
          Confirming receipt will trigger the smart contract to release{' '}
          <strong className="text-[#4ade80]">${amountUSDC} USDC</strong> to the seller&apos;s wallet instantly.
          This action is irreversible.
        </p>
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => setConfirmed(!confirmed)}
          className="mt-0.5 w-4.5 h-4.5 rounded flex-shrink-0 flex items-center justify-center border transition-all cursor-pointer"
          style={{
            background: confirmed ? '#4ade80' : 'transparent',
            borderColor: confirmed ? '#4ade80' : 'rgba(255,255,255,0.2)',
            width: '18px',
            height: '18px',
            minWidth: '18px',
          }}
        >
          {confirmed && <CheckCircle2 className="w-3 h-3 text-[#04101f]" />}
        </div>
        <span className="text-sm text-[#8ca0b3]">
          I confirm I have received the goods in the agreed condition and I am releasing payment to the seller.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <motion.button
        onClick={handleConfirm}
        disabled={loading || !confirmed}
        whileHover={{ scale: loading || !confirmed ? 1 : 1.01 }}
        className="w-full py-4 rounded-xl font-bold text-[#04101f] text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg,#4ade80,#22c55e)',
          boxShadow: confirmed && !loading ? '0 0 30px rgba(74,222,128,0.3)' : 'none',
        }}
      >
        {loading ? 'Signing...' : `✓ Confirm receipt & release $${amountUSDC} USDC`}
      </motion.button>
    </div>
  )
}
