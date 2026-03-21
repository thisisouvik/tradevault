import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArbitratorForm } from '@/components/ArbitratorForm'
import Link from 'next/link'
import { ArrowLeft, Shield, Scale } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Arbitrator Panel' }

export default async function ArbitratorPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: deal } = await supabase
    .from('deals')
    .select(`
      *,
      profiles:seller_id (name, email, wallet_address),
      evidence (*)
    `)
    .eq('id', id)
    .single()

  if (!deal) notFound()

  if (deal.status !== 'DISPUTED') {
    return (
      <div className="min-h-screen bg-[#04101f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8ca0b3] mb-4">This deal is not in a disputed state.</p>
          <Link href="/dashboard" className="text-[#4ade80] hover:underline">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  const seller = deal.profiles as { name: string; email: string; wallet_address?: string }

  return (
    <div className="min-h-screen bg-[#04101f]">
      {/* Header */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 h-16"
        style={{ background: 'rgba(4,16,31,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}
      >
        <Link href={`/deal/${id}`} className="flex items-center gap-2 text-[#8ca0b3] hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Deal page
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-[#04101f]" />
          </div>
          <span className="text-sm font-bold text-white">Arbitrator Panel</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Dispute Arbitration</h1>
              <p className="text-xs text-[#8ca0b3]">Deal #{id.slice(0, 8)}...</p>
            </div>
          </div>
          <div
            className="rounded-xl p-3 text-xs text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            ⚠ Your verdict will be executed on-chain by the platform wallet. This is irreversible.
          </div>
        </div>

        {/* Deal info */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-sm font-bold text-white mb-3">{deal.item_name}</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[#8ca0b3]">Amount: </span><span className="text-white font-bold">${deal.amount_usdc} USDC</span></div>
            <div><span className="text-[#8ca0b3]">Seller: </span><span className="text-white">{seller.name}</span></div>
            <div><span className="text-[#8ca0b3]">Buyer: </span><span className="text-white">{deal.buyer_email}</span></div>
            <div><span className="text-[#8ca0b3]">App ID: </span><span className="text-white font-mono text-xs">{deal.contract_app_id || 'N/A'}</span></div>
          </div>
        </div>

        {/* Evidence */}
        {deal.evidence && deal.evidence.length > 0 && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h2 className="text-sm font-bold text-white mb-4">Evidence Submitted</h2>
            <div className="space-y-4">
              {(deal.evidence as Array<{id: string; submitted_by: string; description: string; photo_urls: string[]; created_at: string}>).map(ev => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: ev.submitted_by === 'seller' ? '#4ade80' : '#3b91e8' }}
                  >
                    {ev.submitted_by}
                  </p>
                  <p className="text-sm text-[#8ca0b3] mb-2">{ev.description}</p>
                  <p className="text-xs text-[#8ca0b3]/50">{new Date(ev.created_at).toLocaleString()}</p>
                  {ev.photo_urls.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {ev.photo_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Evidence ${i + 1}`} className="w-20 h-20 rounded-lg object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verdict form */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <h2 className="text-base font-bold text-white mb-4">Submit Verdict</h2>
          <ArbitratorForm dealId={id} amountUSDC={deal.amount_usdc} />
        </div>
      </div>
    </div>
  )
}
