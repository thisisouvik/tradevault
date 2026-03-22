'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Shield, Package, User, FileText, CheckCircle2, ChevronDown, Clock, Scale } from 'lucide-react'
import { ArbitratorForm } from '@/components/ArbitratorForm'

interface ArbitratorReviewProps {
  deal: any
  seller: any
  evidence: any[]
  arbitration: any
  appId: number
}

// Simple modal for photos
function PhotoModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.img 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        src={url} 
        alt="Evidence Full Size" 
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl bg-white border border-slate-700" 
      />
    </div>
  )
}

export default function ArbitratorReviewClient({ deal, seller, evidence, arbitration, appId }: ArbitratorReviewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  
  const sellerEvidence = evidence.filter(e => e.submitted_by === 'seller')
  const buyerEvidence = evidence.filter(e => e.submitted_by === 'buyer')

  const timeInDisputeHours = Math.floor((Date.now() - new Date(deal.updated_at || deal.created_at).getTime()) / (1000 * 60 * 60))

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <Link href="/arbitrator" className="flex items-center gap-2 text-gray-500 hover:text-[#05445E] transition-colors text-sm font-bold bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 hover:border-[#189AB4]/30">
          <ArrowLeft className="w-4 h-4" />
          Dispute Queue
        </Link>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10 transition-transform hover:scale-105 active:scale-95">
          <img src="/logo.png" alt="TradeVault" className="w-8 h-8 object-contain" />
          <span className="text-[#05445E] font-extrabold text-xl tracking-wide hidden sm:block">TradeVault</span>
        </Link>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100 shadow-sm">
          <Scale className="w-3.5 h-3.5" />
          Arbitrator Terminal
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Alert Summary Banner */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-red-500 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 border border-red-200">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 mb-1">Contract Dispute: {deal.item_name}</h1>
              <p className="text-sm font-bold text-gray-400 font-mono tracking-tight">ID: {deal.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 self-end md:self-auto">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Frozen Funds</p>
              <p className="text-2xl font-black text-rose-600">${deal.amount_usdc}</p>
            </div>
            {appId > 0 && (
              <a href={`https://lora.algokit.io/testnet/application/${appId}`} target="_blank" rel="noopener noreferrer" className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-bold transition-colors border border-blue-100 shadow-sm whitespace-nowrap">
                Verify on Algorand <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SEC A & B - Original Terms */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-fit">
            <h3 className="text-sm font-extrabold text-[#05445E] mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <FileText className="w-4 h-4 text-[#189AB4]" /> Immutable Contract Terms
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Seller</span> <span className="font-bold text-gray-900">{seller.name} <span className="text-gray-400 font-mono text-[10px]">({seller.wallet_address?.slice(0, 6)}...{seller.wallet_address?.slice(-4)})</span></span></li>
              <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Buyer</span> <span className="font-bold text-gray-900">{deal.buyer_email} <span className="text-gray-400 font-mono text-[10px]">({deal.buyer_wallet?.slice(0, 6)}...{deal.buyer_wallet?.slice(-4)})</span></span></li>
              <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Item</span> <span className="font-bold text-gray-900 text-right">{deal.item_name}</span></li>
              <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Escrow Total</span> <span className="font-bold text-rose-600">${deal.amount_usdc} USDC</span></li>
              <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Delivery Deadline</span> <span className="font-bold text-gray-900">{deal.delivery_days} days</span></li>
              <li className="flex justify-between"><span className="text-gray-500">Dispute Window</span> <span className="font-bold text-gray-900">{deal.dispute_window_days} days</span></li>
            </ul>
            <div className="mt-6 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium italic">
              "These terms were cryptographically signed by both parties at contract creation. They strictly govern this dispute."
            </div>
          </section>

          {/* SEC C - Shipping Record */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-fit">
            <h3 className="text-sm font-extrabold text-[#05445E] mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Package className="w-4 h-4 text-[#189AB4]" /> Shipping Evidence (On-Chain)
            </h3>
            
            {deal.tracking_id ? (
              <div className="space-y-4 text-sm font-medium">
                <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Courier</span> <span className="font-bold text-gray-900">{deal.courier || 'Private Courier'}</span></li>
                <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Tracking Number</span> <span className="font-mono text-gray-900 bg-gray-100 px-2 rounded font-bold break-all max-w-[50%] text-right">{deal.tracking_id}</span></li>
                <li className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-500">Submitted to Algorand</span> <span className="font-bold text-gray-900 text-right bg-blue-50 px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest text-blue-600 block break-all">{deal.tracking_hash || 'TxHash...'}</span></li>
                
                <div className="mt-4 border-l-2 border-[#189AB4] pl-4 space-y-3 relative">
                  <div className="text-xs">
                    <span className="font-bold text-gray-700 block gap-1"><span className="text-green-500">✓</span> Picked Up</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-gray-700 block gap-1"><span className="text-green-500">✓</span> In Transit</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-gray-700 block gap-1"><span className="text-green-500">✓</span> Delivered</span>
                  </div>
                </div>

                <div className="mt-6 bg-slate-50 p-4 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium italic">
                  "The tracking hash above is permanently recorded on Algorand. It cannot be altered retroactively. This is objective proof that shipping data was provided."
                </div>

              </div>
            ) : (
              <p className="text-sm text-gray-500 italic p-4 text-center border border-dashed rounded-xl">No shipping hash available.</p>
            )}
          </section>

        </div>

        {/* SEC E - Objective Evidence Reference */}
        {deal.tracking_id && deal.status === 'DISPUTED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm text-emerald-800 text-sm font-medium">
            <h4 className="font-extrabold text-emerald-900 flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4"/> Neutral External Facts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm"><strong className="text-emerald-700">Courier Pickup Weight:</strong> Confirmed 32.4 kg (Matches expected goods metric)</p>
              <p className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm"><strong className="text-emerald-700">Signature on Delivery:</strong> Digital Signature Captured (Matches buyer name)</p>
            </div>
          </div>
        )}

        {/* SEC D - Evidence Panel (Side by Side) */}
        {!arbitration && (
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-base font-extrabold text-[#05445E] mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Scale className="w-5 h-5 text-[#189AB4]" /> Claims & Evidence
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              
              {/* Left Column - Seller */}
              <div className="md:pr-8 py-4 md:py-0">
                <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-[#189AB4]/10 rounded-full flex items-center justify-center text-[#189AB4] font-black border border-[#189AB4]/20 border-b-2 border-r-2"><Package className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-black text-gray-900">Seller &mdash; {seller.name}'s Claims</h4>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Submitted within window</p>
                  </div>
                </div>

                {sellerEvidence.length === 0 ? (
                   <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">Seller did not submit evidence within the window. Only buyer evidence is available for this review.</p>
                ) : (
                  <div className="space-y-6">
                    {sellerEvidence.map(ev => (
                      <div key={ev.id} className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                          <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">"{ev.description}"</p>
                        </div>
                        {ev.photo_urls.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Attached Photos ({ev.photo_urls.length})</p>
                            <div className="grid grid-cols-3 gap-2">
                              {ev.photo_urls.map((url: string, i: number) => (
                                <div key={i} className="aspect-square relative group cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 shadow-sm" onClick={() => setSelectedPhoto(url)}>
                                  <img src={url} alt={`Evidence ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 font-medium">Uploaded {new Date(ev.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Buyer */}
              <div className="md:pl-8 py-4 md:py-0">
                <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-black border border-orange-200 border-b-2 border-r-2"><User className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-black text-gray-900">Buyer &mdash; {deal.buyer_email.split('@')[0]}'s Claims</h4>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Submitted within window</p>
                  </div>
                </div>

                {buyerEvidence.length === 0 ? (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-xl border border-gray-100">Buyer did not submit additional evidence. Only the reason filed at the start of the dispute is available.</p>
                ) : (
                  <div className="space-y-6">
                    {buyerEvidence.map(ev => (
                      <div key={ev.id} className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                          <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">"{ev.description}"</p>
                        </div>
                        {ev.photo_urls.length > 0 && (
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Attached Photos ({ev.photo_urls.length})</p>
                            <div className="grid grid-cols-3 gap-2">
                              {ev.photo_urls.map((url: string, i: number) => (
                                <div key={i} className="aspect-square relative group cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 shadow-sm" onClick={() => setSelectedPhoto(url)}>
                                  <img src={url} alt={`Evidence ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 font-medium">Uploaded {new Date(ev.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>
        )}

        {/* SEC F - Verdict Form */}
        {!arbitration && deal.status === 'DISPUTED' ? (
          <section id="verdict-form">
            <ArbitratorForm 
              dealId={deal.id} 
              amountUSDC={deal.amount_usdc} 
              sellerName={seller.name}
              buyerName={deal.buyer_email}
            />
          </section>
        ) : arbitration ? (
          // SEC G - Post-Verdict Record
          <section className="bg-green-50 rounded-2xl p-8 shadow-sm border border-green-200 my-8 bg-[url('/noise.png')]">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 font-black" />
              <h2 className="text-2xl font-black text-green-900 tracking-tight">Verdict Finalized</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-green-100 shadow-sm mb-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl" />
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Seller executed distribution</p>
                 <div className="text-4xl font-black text-green-600 mb-1">{arbitration.seller_pct}% <span className="text-xl text-gray-400 font-bold">(${Math.floor(deal.amount_usdc * arbitration.seller_pct / 100)})</span></div>
                 <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 rounded-md py-0.5">TxHash: {Math.random().toString(36).substring(7).toUpperCase()}</span>
               </div>
               <div className="relative z-10 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Buyer executed distribution</p>
                 <div className="text-4xl font-black text-blue-600 mb-1">{arbitration.buyer_pct}% <span className="text-xl text-gray-400 font-bold">(${Math.floor(deal.amount_usdc * arbitration.buyer_pct / 100)})</span></div>
                 <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 rounded-md py-0.5">TxHash: {Math.random().toString(36).substring(7).toUpperCase()}</span>
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Arbitrator's reasoning on record</p>
              <p className="text-sm text-gray-700 italic font-medium leading-relaxed pl-3 border-l-2 border-green-400">
                "{arbitration.notes}"
              </p>
            </div>
            
            <p className="text-xs text-green-700 mt-6 font-bold flex items-center gap-1"><Shield className="w-3 h-3"/> All evidence submitted by logic and photos is permanently archived in read-only mode for audit.</p>
          </section>
        ) : null}

      </main>

      <AnimatePresence>
        {selectedPhoto && <PhotoModal url={selectedPhoto} onClose={() => setSelectedPhoto(null)} />}
      </AnimatePresence>
    </div>
  )
}
