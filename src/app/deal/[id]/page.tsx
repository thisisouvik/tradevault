import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, ExternalLink, Hash, Clock, Package, DollarSign, User } from 'lucide-react'
import { DealDetailClient } from '@/components/DealDetail'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return { title: `Contract ${id.slice(0, 8)}...` }
}

async function getDeal(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      profiles:seller_id (
        id,
        name,
        email,
        wallet_address
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; description: string }> = {
  PROPOSED:  { label: 'Proposed',  color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', description: 'Waiting for buyer to accept and fund.' },
  ACCEPTED:  { label: 'Accepted',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  description: 'Buyer accepted. Waiting for USDC funding.' },
  FUNDED:    { label: 'Funded',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  description: 'USDC locked in contract. Seller should ship.' },
  DELIVERED: { label: 'Delivered', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  description: 'Shipment proof submitted. Dispute window active.' },
  COMPLETED: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.1)',  description: 'Payment released to seller. Deal archived.' },
  DISPUTED:  { label: 'Disputed',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   description: 'Dispute in progress. Arbitrator reviewing.' },
  RESOLVED:  { label: 'Resolved',  color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',   description: 'Dispute resolved. Funds distributed.' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: 'rgba(107,114,128,0.1)', description: 'Contract cancelled.' },
}

export default async function DealPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/signin?redirectTo=/deal/${id}`)

  const deal = await getDeal(id)
  if (!deal) notFound()

  const status = STATUS_CONFIG[deal.status] || STATUS_CONFIG.PROPOSED
  const isSeller = user.id === deal.seller_id
  const isBuyer = user.email === deal.buyer_email

  // Fetch evidence if disputed
  const { data: evidence } = deal.status === 'DISPUTED' || deal.status === 'RESOLVED'
    ? await supabase.from('evidence').select('*').eq('deal_id', id).order('created_at')
    : { data: [] }

  // Fetch arbitration result if resolved
  const { data: arbitration } = deal.status === 'RESOLVED'
    ? await supabase.from('arbitration').select('*').eq('deal_id', id).single()
    : { data: null }

  const dealLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deal/${id}`

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#6B7280]">
      {/* Header */}
      <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-[#E5E7EB] sticky top-0 z-40">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          <span className="text-sm font-bold text-[#111827] hidden sm:block">TrustEscrow</span>
        </div>
        <div>
           {deal.contract_app_id && (
            <a
              href={`https://testnet.algoexplorer.io/application/${deal.contract_app_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
            >
              App #{deal.contract_app_id}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Status banner */}
        <div
          className="saas-card mb-6 flex items-center gap-3 py-4"
          style={{ borderLeft: `4px solid ${status.color}` }}
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: status.color }} />
          <div>
            <span className="text-sm font-bold" style={{ color: status.color }}>{status.label}</span>
            <span className="text-sm text-[#6B7280] ml-2 font-medium">{status.description}</span>
          </div>
        </div>

        {/* Contract overview */}
        <div className="saas-card mb-6">
          <div className="flex items-center justify-between mb-4">
             <h1 className="text-2xl font-semibold text-[#111827]">{deal.item_name}</h1>
             <span className="text-2xl font-bold text-[#2563EB]">${deal.amount_usdc}</span>
          </div>
          {deal.item_description && (
            <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">{deal.item_description}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: DollarSign, label: 'Asset', value: 'USDC', color: '#2563EB' },
              { icon: Clock, label: 'Delivery', value: `${deal.delivery_days} Days`, color: '#0EA5E9' },
              { icon: Package, label: 'Dispute', value: `${deal.dispute_window_days} Days`, color: '#F59E0B' },
              { icon: User, label: 'Your Role', value: isSeller ? 'Seller' : 'Buyer', color: '#10B981' },
            ].map(item => (
              <div key={item.label} className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                <div className="flex items-center gap-2 mb-2">
                   <item.icon className="w-4 h-4" style={{ color: item.color }} />
                   <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{item.label}</p>
                </div>
                <p className="text-lg font-bold text-[#111827]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="saas-card">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-[#10B981] font-bold text-sm">S</div>
               <p className="text-sm font-semibold text-[#111827]">Seller Details</p>
            </div>
            <p className="text-sm font-medium text-[#111827] mb-1">{(deal.profiles as { name: string })?.name}</p>
            <p className="text-xs font-mono text-[#6B7280] break-all bg-gray-50 p-2 rounded border border-gray-100 mt-2">
              {(deal.profiles as { wallet_address?: string })?.wallet_address || 'Wallet not connected'}
            </p>
          </div>
          <div className="saas-card">
             <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] font-bold text-sm">B</div>
               <p className="text-sm font-semibold text-[#111827]">Buyer Details</p>
            </div>
            <p className="text-sm font-medium text-[#111827] mb-1">{deal.buyer_email}</p>
            <p className="text-xs font-mono text-[#6B7280] break-all bg-gray-50 p-2 rounded border border-gray-100 mt-2">{deal.buyer_wallet}</p>
          </div>
        </div>

        {/* On-chain data */}
        {(deal.contract_app_id || deal.tracking_hash) && (
          <div className="saas-card mb-6">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">On-Chain Verification</h3>
            <div className="space-y-4">
              {deal.contract_app_id && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <Shield className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-sm font-medium text-[#6B7280]">App ID</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-[#111827]">{deal.contract_app_id}</span>
                    <a
                      href={`https://testnet.algoexplorer.io/application/${deal.contract_app_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:bg-blue-50 p-1.5 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
              {deal.tracking_hash && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <Hash className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-sm font-medium text-[#6B7280]">Tracking Hash</span>
                  </div>
                  <span className="text-sm font-mono text-[#111827] break-all">{deal.tracking_hash}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action panel — client component for interactivity */}
        <DealDetailClient
          deal={{
            id: deal.id,
            status: deal.status,
            amount_usdc: deal.amount_usdc,
            buyer_wallet: deal.buyer_wallet,
            buyer_email: deal.buyer_email,
            delivery_days: deal.delivery_days,
            dispute_window_days: deal.dispute_window_days,
            contract_app_id: deal.contract_app_id,
            contract_address: deal.contract_address,
            tracking_id: deal.tracking_id,
            courier: deal.courier,
            tracking_hash: deal.tracking_hash,
          }}
          isSeller={isSeller}
          isBuyer={isBuyer}
          userEmail={user.email || ''}
          evidence={evidence || []}
          arbitration={arbitration}
          dealLink={dealLink}
        />
      </main>
    </div>
  )
}
