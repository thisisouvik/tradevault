'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Copy, CheckCheck, Clock, AlertTriangle } from 'lucide-react'
import { FundEscrow } from './FundEscrow'
import { SubmitDelivery } from './SubmitDelivery'
import { ConfirmReceipt } from './ConfirmReceipt'
import { RaiseDispute } from './RaiseDispute'
import { TrackingTimeline } from './TrackingTimeline'
import { EvidenceUpload } from './EvidenceUpload'

interface DealDetailClientProps {
  deal: {
    id: string
    status: string
    amount_usdc: number
    buyer_wallet: string
    buyer_email: string
    delivery_days: number
    dispute_window_days: number
    contract_app_id?: string
    contract_address?: string
    tracking_id?: string
    courier?: string
    tracking_hash?: string
  }
  isSeller: boolean
  isBuyer: boolean
  userEmail: string
  evidence: Array<{ id: string; submitted_by: string; description: string; photo_urls: string[]; created_at: string }>
  arbitration: { seller_pct: number; buyer_pct: number; notes?: string } | null
  dealLink: string
}

export function DealDetailClient({
  deal,
  isSeller,
  isBuyer,
  evidence,
  arbitration,
  dealLink,
}: DealDetailClientProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(dealLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function refresh() {
    router.refresh()
  }

  const appId = deal.contract_app_id ? parseInt(deal.contract_app_id) : 0

  return (
    <div className="space-y-6">
      {/* Share deal link */}
      <div className="saas-card">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Share Contract Link</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 px-4 py-2 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] text-sm font-mono text-[#6B7280] truncate">
            {dealLink}
          </div>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#111827] transition-all"
          >
            {copied ? <CheckCheck className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-3 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          Send this link to the buyer so they can review and fund the contract.
        </p>
      </div>

      {/* Action panel */}
      <AnimatePresence mode="wait">
        
        {/* PROPOSED — buyer needs to fund */}
        {deal.status === 'PROPOSED' && isBuyer && appId > 0 && deal.contract_address && (
          <motion.div
            key="fund"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="saas-card bg-purple-50 border-purple-100"
          >
            <h3 className="text-base font-semibold text-[#111827] mb-1">Accept & Fund Escrow</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Review the contract terms above. By funding, you cryptographically agree to these terms.
            </p>
            <FundEscrow
              dealId={deal.id}
              appId={appId}
              appAddress={deal.contract_address}
              amountUSDC={deal.amount_usdc}
              buyerWallet={deal.buyer_wallet}
              onSuccess={refresh}
            />
          </motion.div>
        )}

        {deal.status === 'PROPOSED' && isSeller && (
          <motion.div
            key="proposed-seller"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="saas-card flex items-center gap-4 bg-gray-50 border-gray-200"
          >
            <Clock className="w-6 h-6 text-[#9CA3AF]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Waiting for buyer to fund</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Share the deal link above with {deal.buyer_email}.</p>
            </div>
          </motion.div>
        )}

        {/* FUNDED — seller needs to ship */}
        {deal.status === 'FUNDED' && isSeller && (
          <motion.div
            key="submit-delivery"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="saas-card bg-green-50 border-green-200"
          >
            <h3 className="text-base font-semibold text-[#111827] mb-1">Submit Shipping Proof</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              ${deal.amount_usdc} USDC is securely locked. Ship the goods and submit your tracking number.
            </p>
            <SubmitDelivery dealId={deal.id} onSuccess={refresh} />
          </motion.div>
        )}

        {deal.status === 'FUNDED' && isBuyer && (
          <motion.div
            key="funded-buyer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="saas-card flex items-center gap-4 bg-purple-50 border-purple-200"
          >
            <Clock className="w-6 h-6 text-[#8B5CF6]" />
            <div>
              <p className="text-sm font-semibold text-[#111827]">Escrow Funded ✓</p>
              <p className="text-xs text-[#6B7280] mt-0.5">Waiting for seller to ship and submit tracking. You'll be emailed when they do.</p>
            </div>
          </motion.div>
        )}

        {/* DELIVERED — tracking + confirm/dispute */}
        {deal.status === 'DELIVERED' && (
          <motion.div
            key="delivered"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Tracking timeline */}
            {deal.tracking_id && deal.courier && (
              <div className="saas-card">
                <TrackingTimeline
                  dealId={deal.id}
                  trackingId={deal.tracking_id}
                  courier={deal.courier}
                  trackingHash={deal.tracking_hash}
                  appId={appId}
                />
              </div>
            )}

            {isBuyer && appId > 0 && (
              <div className="saas-card">
                <h3 className="text-base font-semibold text-[#111827] mb-1">Confirm or Dispute</h3>
                <p className="text-sm text-[#6B7280] mb-4">
                  Goods arrived? Confirm receipt to release payment. Issue with goods? Raise a dispute within the {deal.dispute_window_days}-day window.
                </p>
                <div className="space-y-4">
                  <ConfirmReceipt
                    dealId={deal.id}
                    appId={appId}
                    amountUSDC={deal.amount_usdc}
                    buyerWallet={deal.buyer_wallet}
                    onSuccess={refresh}
                  />
                  <RaiseDispute
                    dealId={deal.id}
                    appId={appId}
                    buyerWallet={deal.buyer_wallet}
                    onSuccess={refresh}
                  />
                </div>
              </div>
            )}

            {isSeller && (
              <div className="saas-card flex items-center gap-4 bg-yellow-50 border-yellow-200">
                <Clock className="w-6 h-6 text-[#F59E0B]" />
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Waiting for buyer to confirm</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    If they don't confirm or dispute within {deal.dispute_window_days} days, funds auto-release to you.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* COMPLETED */}
        {deal.status === 'COMPLETED' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="saas-card bg-green-50 border-green-200 text-center py-10"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCheck className="w-8 h-8 text-[#10B981]" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">Deal Completed</h3>
            <p className="text-[#6B7280] max-w-sm mx-auto">
              ${deal.amount_usdc} USDC has been released to the seller. This deal is permanently archived on Algorand.
            </p>
          </motion.div>
        )}

        {/* DISPUTED */}
        {deal.status === 'DISPUTED' && (
          <motion.div
            key="disputed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="saas-card flex items-start gap-4 bg-red-50 border-red-200">
              <AlertTriangle className="w-6 h-6 text-[#EF4444] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#111827]">Dispute in progress</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Submit evidence below. An arbitrator will review and execute the verdict on-chain.
                </p>
              </div>
            </div>

            {/* Evidence submission */}
            <div className="saas-card">
              <h3 className="text-base font-semibold text-[#111827] mb-4">Submit Evidence</h3>
              <EvidenceUpload
                dealId={deal.id}
                role={isSeller ? 'seller' : 'buyer'}
                onSuccess={refresh}
              />
            </div>

            {/* Existing evidence */}
            {evidence.length > 0 && (
              <div className="saas-card">
                <p className="text-sm font-semibold text-[#111827] mb-4">Evidence submitted</p>
                <div className="space-y-4">
                  {evidence.map(ev => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: ev.submitted_by === 'seller' ? '#2563EB' : '#0EA5E9' }}>
                        {ev.submitted_by}
                      </p>
                      <p className="text-sm text-[#111827] leading-relaxed mb-3">{ev.description}</p>
                      {ev.photo_urls.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                          {ev.photo_urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt="Evidence" className="w-20 h-20 object-cover rounded-lg border border-[#E5E7EB] hover:opacity-90 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* RESOLVED */}
        {deal.status === 'RESOLVED' && arbitration && (
          <motion.div
            key="resolved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="saas-card bg-blue-50 border-blue-200"
          >
            <h3 className="text-base font-semibold text-[#111827] mb-4">Dispute Resolved</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl text-center bg-white border border-blue-100">
                <p className="text-xs font-semibold text-[#6B7280] mb-2 uppercase">Seller received</p>
                <p className="text-3xl font-bold text-[#111827] mb-1">{arbitration.seller_pct}%</p>
                <p className="text-sm text-[#2563EB] font-bold">${Math.floor(deal.amount_usdc * arbitration.seller_pct / 100)} USDC</p>
              </div>
              <div className="p-4 rounded-xl text-center bg-white border border-blue-100">
                <p className="text-xs font-semibold text-[#6B7280] mb-2 uppercase">Buyer received</p>
                <p className="text-3xl font-bold text-[#111827] mb-1">{arbitration.buyer_pct}%</p>
                <p className="text-sm text-[#0EA5E9] font-bold">${Math.floor(deal.amount_usdc * arbitration.buyer_pct / 100)} USDC</p>
              </div>
            </div>
            {arbitration.notes && (
              <div className="bg-white p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-[#6B7280] mb-1 uppercase">Arbitrator Notes</p>
                <p className="text-sm text-[#111827] italic">&ldquo;{arbitration.notes}&rdquo;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
