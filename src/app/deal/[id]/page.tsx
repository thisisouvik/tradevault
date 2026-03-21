import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Shield, ExternalLink, Hash, Clock, Package, DollarSign, User,
  AlertTriangle, CheckCircle2, Truck, Scale
} from 'lucide-react'
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
    .select(`*, profiles:seller_id (id, name, email, wallet_address)`)
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; description: string }> = {
  PROPOSED:  { label: 'Proposed',  color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', description: 'Waiting for buyer to review, accept and fund.' },
  ACCEPTED:  { label: 'Accepted',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  description: 'Buyer accepted. Waiting for USDC to be locked.' },
  FUNDED:    { label: 'Funded',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  description: 'USDC locked in contract. Seller should ship now.' },
  DELIVERED: { label: 'Delivered', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  description: 'Tracking submitted. 7-day dispute window active.' },
  COMPLETED: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.1)',  description: 'Payment released to seller. Deal archived on-chain.' },
  DISPUTED:  { label: 'Disputed',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   description: 'Dispute in progress. Funds frozen. Arbitrator reviewing.' },
  RESOLVED:  { label: 'Resolved',  color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',  description: 'Verdict delivered. Funds split and distributed.' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: 'rgba(107,114,128,0.1)', description: 'Contract cancelled.' },
}

export default async function DealPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/signin?redirectTo=/deal/${id}`)

  const deal = await getDeal(id)
  if (!deal) notFound()

  // Fetch profile to get role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, wallet_address')
    .eq('id', user.id)
    .single()

  const status = STATUS_CONFIG[deal.status] || STATUS_CONFIG.PROPOSED
  const isSeller = user.id === deal.seller_id
  const isBuyer = user.email === deal.buyer_email
  const isArbitrator = profile?.role === 'arbitrator'

  const { data: evidence } = (deal.status === 'DISPUTED' || deal.status === 'RESOLVED')
    ? await supabase.from('evidence').select('*').eq('deal_id', id).order('created_at')
    : { data: [] }

  const { data: arbitration } = deal.status === 'RESOLVED'
    ? await supabase.from('arbitration').select('*').eq('deal_id', id).single()
    : { data: null }

  const dealLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deal/${id}`
  const seller = deal.profiles as { name: string; wallet_address?: string }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#6B7280]">

      {/* Header */}
      <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 border-b border-[#E5E7EB] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          <span className="text-sm font-bold text-[#111827] hidden sm:block">TradeVault</span>
        </div>
        <div className="flex items-center gap-3">
          {isArbitrator && deal.status === 'DISPUTED' && (
            <Link
              href={`/arbitrator/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            >
              <Scale className="w-3 h-3" />
              Arbitrate
            </Link>
          )}
          {deal.contract_app_id && (
            <a
              href={`https://testnet.algoexplorer.io/application/${deal.contract_app_id}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors"
            >
              On-Chain
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Status Banner */}
        <div
          className="saas-card mb-6 flex items-center gap-3 py-4"
          style={{ borderLeft: `4px solid ${status.color}` }}
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: status.color }} />
          <div className="flex-1">
            <span className="text-sm font-bold" style={{ color: status.color }}>{status.label}</span>
            <span className="text-sm text-[#6B7280] ml-2 font-medium">{status.description}</span>
          </div>
          {/* Role tag */}
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
            isSeller ? 'bg-green-50 text-green-600'
            : isBuyer ? 'bg-blue-50 text-blue-600'
            : 'bg-orange-50 text-orange-600'
          }`}>
            {isSeller ? 'You are Seller' : isBuyer ? 'You are Buyer' : 'Arbitrator View'}
          </span>
        </div>

        {/* Contract overview */}
        <div className="saas-card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#111827] mb-1">{deal.item_name}</h1>
              {deal.item_description && (
                <p className="text-[#6B7280] text-sm leading-relaxed">{deal.item_description}</p>
              )}
            </div>
            <span className="text-2xl font-bold text-[#2563EB] flex-shrink-0 ml-4">${deal.amount_usdc} USDC</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: DollarSign, label: 'Asset', value: 'USDC', color: '#2563EB' },
              { icon: Clock, label: 'Delivery', value: `${deal.delivery_days} Days`, color: '#0EA5E9' },
              { icon: Package, label: 'Dispute Window', value: `${deal.dispute_window_days} Days`, color: '#F59E0B' },
              { icon: User, label: 'Your Role', value: isSeller ? 'Seller' : isBuyer ? 'Buyer' : 'Arbitrator', color: '#10B981' },
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
              <p className="text-sm font-semibold text-[#111827]">Seller</p>
              {isSeller && <span className="ml-auto text-xs bg-green-50 text-green-600 font-semibold px-2 py-0.5 rounded-full">You</span>}
            </div>
            <p className="text-sm font-medium text-[#111827]">{seller?.name}</p>
            <p className="text-xs font-mono text-[#6B7280] break-all bg-gray-50 p-2 rounded border border-gray-100 mt-2">
              {seller?.wallet_address || 'Wallet not connected'}
            </p>
          </div>
          <div className="saas-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] font-bold text-sm">B</div>
              <p className="text-sm font-semibold text-[#111827]">Buyer</p>
              {isBuyer && <span className="ml-auto text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">You</span>}
            </div>
            <p className="text-sm font-medium text-[#111827]">{deal.buyer_email}</p>
            <p className="text-xs font-mono text-[#6B7280] break-all bg-gray-50 p-2 rounded border border-gray-100 mt-2">
              {deal.buyer_wallet}
            </p>
          </div>
        </div>

        {/* On-chain data */}
        {(deal.contract_app_id || deal.tracking_hash) && (
          <div className="saas-card mb-6">
            <h3 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2563EB]" />
              On-Chain Verification
            </h3>
            <div className="space-y-3">
              {deal.contract_app_id && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <Shield className="w-4 h-4 text-[#2563EB]" />
                    <span className="text-sm font-medium text-[#6B7280]">App ID</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-[#111827]">{deal.contract_app_id}</span>
                    <a href={`https://testnet.algoexplorer.io/application/${deal.contract_app_id}`} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:bg-blue-50 p-1.5 rounded transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
              {deal.tracking_hash && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <Hash className="w-4 h-4 text-[#10B981]" />
                    <span className="text-sm font-medium text-[#6B7280]">Tracking Hash (On-Chain)</span>
                  </div>
                  <span className="text-xs font-mono text-[#111827] break-all">{deal.tracking_hash}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Arbitration result if resolved */}
        {arbitration && (
          <div className="saas-card mb-6 border border-[#0EA5E9]/20" style={{ borderLeft: '4px solid #0EA5E9' }}>
            <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#0EA5E9]" />
              Arbitration Verdict
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Seller receives</p>
                <p className="text-xl font-bold text-[#10B981]">{(arbitration as any).seller_pct}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Buyer receives</p>
                <p className="text-xl font-bold text-[#2563EB]">{(arbitration as any).buyer_pct}%</p>
              </div>
            </div>
            {(arbitration as any).notes && (
              <p className="text-sm text-[#6B7280] mt-3 italic">"{(arbitration as any).notes}"</p>
            )}
          </div>
        )}

        {/* Action Panel — role+state aware client component */}
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
