import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArbitratorForm } from '@/components/ArbitratorForm'
import Link from 'next/link'
import { ArrowLeft, Shield, Scale, AlertTriangle, User, Package } from 'lucide-react'
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

  // Verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'arbitrator') {
    redirect(`/deal/${id}`)
  }

  const { data: deal } = await supabase
    .from('deals')
    .select(`*, profiles:seller_id (name, email, wallet_address), evidence (*)`)
    .eq('id', id)
    .single()

  if (!deal) notFound()

  if (deal.status !== 'DISPUTED') {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="saas-card text-center max-w-sm">
          <Shield className="w-10 h-10 text-[#9CA3AF] mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#111827] mb-2">Not in dispute</h2>
          <p className="text-[#6B7280] text-sm mb-4">
            This deal is currently <strong>{deal.status}</strong> — not open for arbitration.
          </p>
          <Link href="/arbitrator" className="text-[#2563EB] font-semibold text-sm hover:underline">
            Back to dispute queue
          </Link>
        </div>
      </div>
    )
  }

  const seller = deal.profiles as { name: string; email: string; wallet_address?: string }
  const evidence = (deal.evidence || []) as Array<{
    id: string; submitted_by: string; description: string; photo_urls: string[]; created_at: string
  }>

  const sellerEvidence = evidence.filter(e => e.submitted_by === 'seller')
  const buyerEvidence = evidence.filter(e => e.submitted_by === 'buyer')

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* Header */}
      <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 border-b border-[#E5E7EB] sticky top-0 z-40">
        <Link href="/arbitrator" className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Dispute Queue
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          <span className="text-sm font-bold text-[#111827]">TradeVault</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600">
          <Scale className="w-3.5 h-3.5" />
          Arbitrator View
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Issue header */}
        <div className="saas-card border-l-4 border-[#EF4444] mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#EF4444]" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#111827] mb-1">{deal.item_name}</h1>
              <p className="text-sm text-[#6B7280] mb-3">Deal #{id.slice(0, 12)}...</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#9CA3AF]">Amount</p>
                  <p className="text-base font-bold text-[#2563EB]">${deal.amount_usdc} USDC</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Seller</p>
                  <p className="text-sm font-semibold text-[#111827]">{seller?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">Buyer</p>
                  <p className="text-sm font-semibold text-[#111827] truncate">{deal.buyer_email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF]">App ID</p>
                  <p className="text-sm font-mono text-[#111827]">{deal.contract_app_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-[#EF4444] font-semibold">
            ⚠ Your verdict is irreversible. It will be executed on-chain via the platform server wallet.
          </div>
        </div>

        {/* Evidence side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">

          {/* Seller evidence */}
          <div className="saas-card border-t-4 border-green-400">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="text-sm font-semibold text-[#111827]">Seller Evidence ({sellerEvidence.length})</h2>
            </div>
            {sellerEvidence.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] italic">No evidence submitted by seller.</p>
            ) : (
              <div className="space-y-3">
                {sellerEvidence.map(ev => (
                  <div key={ev.id} className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-[#111827] mb-2">{ev.description}</p>
                    <p className="text-xs text-[#9CA3AF]">{new Date(ev.created_at).toLocaleString()}</p>
                    {ev.photo_urls.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ev.photo_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Evidence ${i + 1}`} className="w-16 h-16 rounded-lg object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buyer evidence */}
          <div className="saas-card border-t-4 border-blue-400">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-[#111827]">Buyer Evidence ({buyerEvidence.length})</h2>
            </div>
            {buyerEvidence.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] italic">No evidence submitted by buyer.</p>
            ) : (
              <div className="space-y-3">
                {buyerEvidence.map(ev => (
                  <div key={ev.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-[#111827] mb-2">{ev.description}</p>
                    <p className="text-xs text-[#9CA3AF]">{new Date(ev.created_at).toLocaleString()}</p>
                    {ev.photo_urls.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ev.photo_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt={`Evidence ${i + 1}`} className="w-16 h-16 rounded-lg object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verdict form */}
        <div className="saas-card border border-orange-200 bg-orange-50/30">
          <h2 className="text-base font-bold text-[#111827] mb-1 flex items-center gap-2">
            <Scale className="w-5 h-5 text-orange-500" />
            Submit Verdict
          </h2>
          <p className="text-sm text-[#6B7280] mb-6">
            Enter the percentage split. sellerPct + buyerPct must equal 100.
            This will execute smart contract <code className="text-xs bg-orange-100 px-1 rounded">resolve_dispute()</code> on-chain.
          </p>
          <ArbitratorForm dealId={id} amountUSDC={deal.amount_usdc} />
        </div>

      </main>
    </div>
  )
}
