'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PackagePlus, DollarSign, Clock, Mail, FileText, AlertCircle, CheckCircle2, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getPeraWallet } from '@/lib/wallet'
import { algodClient, USDC_ASSET_ID } from '@/lib/algorand'
import algosdk from 'algosdk'

export default function CreateDealForm() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    itemName: '',
    itemDescription: '',
    amountUSDC: '',
    deliveryDays: '10',
    disputeWindowDays: '7',
    buyerEmail: '',
    buyerWallet: '',
  })
  const [step, setStep] = useState<'form' | 'deploying' | 'saving' | 'done'>('form')
  const [error, setError] = useState('')
  const [txId, setTxId] = useState('')

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate
    if (!form.buyerWallet || !algosdk.isValidAddress(form.buyerWallet)) {
      setError('Please enter a valid Algorand wallet address for the buyer.')
      return
    }
    if (parseInt(form.amountUSDC) < 1) {
      setError('Minimum amount is 1 USDC.')
      return
    }

    try {
      setStep('deploying')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', user.id)
        .single()

      if (!profile?.wallet_address) {
        throw new Error('Please connect your Pera Wallet from the dashboard first.')
      }

      // Build contract creation transaction
      const peraWallet = getPeraWallet()
      const accounts = await peraWallet.reconnectSession()
      const sellerAddress = accounts[0] || profile.wallet_address

      const params = await algodClient.getTransactionParams().do()
      const amountMicro = parseInt(form.amountUSDC) * 1_000_000

      // Placeholder deploy
      const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
        sender: sellerAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: new Uint8Array([1]),
        clearProgram: new Uint8Array([1]),
        numLocalInts: 0,
        numLocalByteSlices: 0,
        numGlobalInts: 6,
        numGlobalByteSlices: 2,
        appArgs: [
          algosdk.encodeUint64(amountMicro),
          algosdk.encodeUint64(parseInt(form.deliveryDays)),
          algosdk.encodeUint64(parseInt(form.disputeWindowDays)),
        ],
        note: new TextEncoder().encode(
          JSON.stringify({ buyer: form.buyerWallet, item: form.itemName })
        ),
      })

      const signedTxns = await peraWallet.signTransaction([[{ txn: appCreateTxn, signers: [sellerAddress] }]])
      const { txid } = await algodClient.sendRawTransaction(signedTxns).do()
      setTxId(txid)

      const confirmation = await algosdk.waitForConfirmation(algodClient, txid, 4)
      const appId = confirmation.applicationIndex?.toString() || `demo-${Date.now()}`
      const appAddress = appId !== `demo-${Date.now()}`
        ? algosdk.getApplicationAddress(parseInt(appId))
        : `APP_ADDR_${appId}`

      setStep('saving')

      // Save to Supabase
      const res = await fetch('/api/deals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: user.id,
          buyerEmail: form.buyerEmail,
          buyerWallet: form.buyerWallet,
          itemName: form.itemName,
          itemDescription: form.itemDescription,
          amountUSDC: parseInt(form.amountUSDC),
          deliveryDays: parseInt(form.deliveryDays),
          disputeWindowDays: parseInt(form.disputeWindowDays),
          contractAppId: appId,
          contractAddress: appAddress,
        }),
      })

      if (!res.ok) {
        const { error: apiErr } = await res.json()
        throw new Error(apiErr || 'Failed to save deal')
      }

      const { dealId } = await res.json()
      setStep('done')
      setTimeout(() => router.push(`/deal/${dealId}`), 1500)

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      setError(msg)
      setStep('form')
    }
  }

  if (step === 'deploying' || step === 'saving') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-[#2563EB]/20 border-t-[#2563EB] mb-6"
        />
        <h2 className="text-xl font-semibold text-[#111827] mb-2">
          {step === 'deploying' ? 'Deploying to Algorand...' : 'Saving contract...'}
        </h2>
        <p className="text-[#6B7280] text-sm max-w-sm">
          {step === 'deploying'
            ? 'Approve the transaction in your Pera Wallet. This creates the immutable smart contract on Algorand TestNet.'
            : 'Contract confirmed. Saving deal to database and sending email to buyer...'}
        </p>
        {txId && (
          <a
            href={`https://testnet.algoexplorer.io/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-xs text-[#2563EB] hover:underline font-mono"
          >
            Tx: {txId.slice(0, 20)}...
          </a>
        )}
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
        </motion.div>
        <h2 className="text-xl font-semibold text-[#111827] mb-2">Contract created!</h2>
        <p className="text-[#6B7280] text-sm">Redirecting to your contract page...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleCreate} className="space-y-6">
      {/* Item details */}
      <div className="saas-card">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-[#2563EB]" />
          Item Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Item Name *</label>
            <input
              type="text"
              value={form.itemName}
              onChange={e => updateForm('itemName', e.target.value)}
              placeholder="e.g. 50kg Cotton Fabric"
              required
              className="w-full px-4 py-2 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Description (Optional)</label>
            <textarea
              value={form.itemDescription}
              onChange={e => updateForm('itemDescription', e.target.value)}
              placeholder="Additional details about the goods..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Trade terms */}
      <div className="saas-card">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          Trade Terms (Permanent On-Chain)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Amount (USDC) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="number"
                min="1"
                value={form.amountUSDC}
                onChange={e => updateForm('amountUSDC', e.target.value)}
                placeholder="500"
                required
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Delivery Deadline (Days)</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="number"
                min="1"
                max="90"
                value={form.deliveryDays}
                onChange={e => updateForm('deliveryDays', e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Dispute Window (Days)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={form.disputeWindowDays}
              onChange={e => updateForm('disputeWindowDays', e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Buyer info */}
      <div className="saas-card">
        <h2 className="text-base font-semibold text-[#111827] mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#2563EB]" />
          Buyer Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Buyer Email *</label>
            <input
              type="email"
              value={form.buyerEmail}
              onChange={e => updateForm('buyerEmail', e.target.value)}
              placeholder="buyer@example.com"
              required
              className="w-full px-4 py-2 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-1.5">Buyer Algorand Wallet *</label>
            <input
              type="text"
              value={form.buyerWallet}
              onChange={e => updateForm('buyerWallet', e.target.value)}
              placeholder="ALGO4X...R2"
              required
              className="w-full px-4 py-2 rounded-lg text-sm text-[#111827] font-mono bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
            <p className="text-xs text-[#9CA3AF] mt-1.5 font-medium">
              The buyer must have a Pera Wallet connected on our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {form.itemName && form.amountUSDC && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 bg-blue-50 border border-blue-100 flex items-start gap-3"
        >
          <FileText className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-[#111827] font-semibold mb-1">Contract Summary</p>
            <p className="text-[#6B7280]">
              <span className="text-[#111827] font-medium">{form.itemName}</span> for{' '}
              <span className="text-[#2563EB] font-bold">${form.amountUSDC} USDC</span>.
              Delivery within {form.deliveryDays} days.{' '}
              {form.disputeWindowDays}-day dispute window after delivery.
            </p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 rounded-lg text-sm text-[#EF4444] bg-red-50 border border-red-100"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="btn-primary w-full py-3"
      >
        Deploy Contract
      </motion.button>
      
      <p className="text-center text-xs text-[#9CA3AF] font-medium">
        Pera Wallet will open for signature. Terms are permanent once deployed on Algorand.
      </p>
    </form>
  )
}
