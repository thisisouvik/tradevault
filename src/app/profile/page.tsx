import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WalletConnect } from '@/components/WalletConnect'
import { Shield, Star, ExternalLink, Package, ShoppingBag, Scale, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Profile' }

const ROLE_CONFIG = {
  seller:     { label: 'Seller',     icon: Package,      color: '#10B981', bg: 'bg-green-100 text-green-700' },
  buyer:      { label: 'Buyer',      icon: ShoppingBag,  color: '#2563EB', bg: 'bg-blue-100 text-blue-700' },
  arbitrator: { label: 'Arbitrator', icon: Scale,        color: '#F59E0B', bg: 'bg-orange-100 text-orange-700' },
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = (profile?.role || 'seller') as 'seller' | 'buyer' | 'arbitrator'
  const rc = ROLE_CONFIG[role]
  const RoleIcon = rc.icon

  // Fetch their deals for stats
  const { data: deals } = await supabase
    .from('deals')
    .select('status, amount_usdc')
    .or(role === 'buyer'
      ? `buyer_email.eq.${user.email}`
      : `seller_id.eq.${user.id}`)

  const allDeals = deals || []
  const completed = allDeals.filter(d => d.status === 'COMPLETED' || d.status === 'RESOLVED').length
  const disputed = allDeals.filter(d => d.status === 'DISPUTED').length
  const volume = allDeals
    .filter(d => d.status === 'COMPLETED' || d.status === 'RESOLVED')
    .reduce((acc, d) => acc + d.amount_usdc, 0)

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Header */}
      <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 border-b border-[#E5E7EB] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#2563EB]" />
          <span className="text-sm font-bold text-[#111827]">TradeVault</span>
        </div>
        <div />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Profile card */}
        <div className="saas-card mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-[#111827]">{profile?.name}</h1>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${rc.bg}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  {rc.label}
                </span>
              </div>
              <p className="text-sm text-[#6B7280]">{profile?.email}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Deals', value: allDeals.length, color: '#2563EB' },
            { label: 'Completed', value: completed, color: '#10B981' },
            { label: 'Disputes', value: disputed, color: '#EF4444' },
          ].map(stat => (
            <div key={stat.label} className="saas-card text-center">
              <p className="text-2xl font-bold text-[#111827]" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Wallet section */}
        <div className="saas-card mb-6">
          <h2 className="text-sm font-semibold text-[#111827] mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F59E0B]" />
            Algorand Wallet
          </h2>

          {profile?.wallet_address ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-[#9CA3AF] mb-1">Connected Wallet</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-[#111827] break-all flex-1">{profile.wallet_address}</p>
                  <a
                    href={`https://testnet.algoexplorer.io/address/${profile.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563EB] hover:bg-blue-50 p-1.5 rounded flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <Link
                href={`/trader/${profile.wallet_address}`}
                className="flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
              >
                <Star className="w-4 h-4" />
                View my on-chain reputation →
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-[#2563EB]" />
              </div>
              <p className="text-sm text-[#6B7280] mb-1 font-medium">No wallet connected</p>
              <p className="text-xs text-[#9CA3AF] mb-4">
                Connect your Lute or Defly wallet to sign contracts and track your on-chain reputation.
              </p>
              <WalletConnect />
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="saas-card">
          <h2 className="text-sm font-semibold text-[#111827] mb-4">Volume Statistics</h2>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Total Completed Volume</p>
              <p className="text-3xl font-bold text-[#2563EB]">${volume.toLocaleString()} USDC</p>
            </div>
            <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
