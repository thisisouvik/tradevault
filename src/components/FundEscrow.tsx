'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Zap, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useWallet } from '@txnlab/use-wallet-react'
import { algodClient, USDC_ASSET_ID } from '@/lib/algorand'
import algosdk from 'algosdk'

interface FundEscrowProps {
  dealId: string
  appId: number
  appAddress: string
  amountUSDC: number
  buyerWallet: string
  onSuccess: () => void
}

export function FundEscrow({ dealId, appId, appAddress, amountUSDC, buyerWallet, onSuccess }: FundEscrowProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txId, setTxId] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const { activeAddress, signTransactions } = useWallet()

  async function handleFund() {
    setError('')
    setLoading(true)
    try {
      if (!activeAddress) {
        throw new Error('Please connect your Wallet first.')
      }

      const buyerAddr = activeAddress

      if (buyerAddr !== buyerWallet) {
        throw new Error(`This deal is assigned to wallet ${buyerWallet.slice(0,8)}... — your connected wallet doesn't match.`)
      }

      const params = await algodClient.getTransactionParams().do()

      // Transaction 1: accept() ABI call
      const acceptTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: buyerAddr,
        appIndex: appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: [new TextEncoder().encode('accept')],
        suggestedParams: params,
      })

      // Transaction 2: USDC transfer to contract address
      const fundTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: buyerAddr,
        receiver: appAddress,
        amount: amountUSDC * 1_000_000, // USDC has 6 decimals
        assetIndex: USDC_ASSET_ID,
        suggestedParams: params,
      })

      // Group atomically
      algosdk.assignGroupID([acceptTxn, fundTxn])

      // Sign via Wallet — user sees ONE approval for both txns
      const signedTxns = await signTransactions([acceptTxn.toByte(), fundTxn.toByte()])
      const validTxns = signedTxns.filter((tx): tx is Uint8Array => tx !== null)
      const { txid } = await algodClient.sendRawTransaction(validTxns).do()
      setTxId(txid)

      await algosdk.waitForConfirmation(algodClient, txid, 4)

      // Update DB status
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'FUNDED' }),
      })

      setDone(true)
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl text-[#4ade80]"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Escrow funded! ${amountUSDC} USDC locked in contract.</p>
          {txId && (
            <a href={`https://testnet.algoexplorer.io/tx/${txId}`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#4ade80]/70 hover:text-[#4ade80] flex items-center gap-1 mt-0.5">
              View transaction <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <p className="text-sm text-[#8ca0b3]">
          Clicking below will request <strong className="text-white">two atomic transactions</strong> in your Wallet:
          your acceptance signature + <strong className="text-[#a855f7]">${amountUSDC} USDC transfer</strong> to the contract address.
          Both succeed or neither does.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 p-3 rounded-xl text-sm text-red-400"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </motion.div>
      )}

      <motion.button
        onClick={handleFund}
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.99 }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-[#04101f] transition-all disabled:opacity-60"
        style={{
          background: loading ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg,#a855f7,#7c3aed)',
          boxShadow: loading ? 'none' : '0 0 30px rgba(168,85,247,0.3)',
          color: 'white',
        }}
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Waiting for Wallet...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Accept & Fund ${amountUSDC} USDC
            <Zap className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </div>
  )
}
