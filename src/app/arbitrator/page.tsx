import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, Scale, ArrowRight, Clock, AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dispute Queue' }

const STATUS_COLORS: Record<string, string> = {
  DISPUTED: '#EF4444',
}

export default async function ArbitratorIndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  // Verify arbitrator role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'arbitrator') {
    redirect('/dashboard')
  }

  const { data: disputes } = await supabase
    .from('deals')
    .select(`*, profiles:seller_id (name, email)`)
    .eq('status', 'DISPUTED')
    .order('created_at', { ascending: false })

  const deals = disputes || []

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">

      {/* Sidebar */}
      <aside className="w-[240px] bg-[#1A1D23] flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Shield className="w-5 h-5 text-[#2563EB] mr-2" />
          <span className="text-white font-bold text-lg">TradeVault</span>
        </div>
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-orange-500/10 text-orange-400">
            <Scale className="w-4 h-4" />
            Arbitrator
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/dashboard" className="flex items-center px-2 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white transition-colors">
            <Shield className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          <Link href="/arbitrator" className="flex items-center px-2 py-2 rounded-lg bg-[#2C2F36] text-white">
            <Scale className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Dispute Queue</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
              {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.name}</p>
              <form action="/api/auth/signout" method="post">
                <button formAction="/api/auth/signout" type="submit" className="text-xs text-[#9CA3AF] hover:text-white">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-[#111827]">Dispute Queue</h1>
            <p className="text-xs text-[#6B7280]">{deals.length} open dispute{deals.length !== 1 ? 's' : ''} awaiting review</p>
          </div>
          {deals.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444] bg-red-50 px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              {deals.length} Pending
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {deals.length === 0 ? (
            <div className="max-w-md mx-auto mt-24 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-[#9CA3AF]" />
              </div>
              <h2 className="text-lg font-semibold text-[#111827] mb-2">No open disputes</h2>
              <p className="text-sm text-[#6B7280]">All disputes have been resolved. Check back later.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {deals.map(deal => {
                const seller = deal.profiles as { name: string; email: string }
                const daysOpen = Math.floor(
                  (Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={deal.id} className="saas-card border-l-4 border-[#EF4444] hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-[#111827]">{deal.item_name}</h3>
                            <p className="text-xs text-[#6B7280] font-mono">ID: {deal.id.slice(0, 12)}...</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Amount</p>
                            <p className="text-sm font-bold text-[#2563EB]">${deal.amount_usdc} USDC</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Seller</p>
                            <p className="text-sm font-semibold text-[#111827] truncate">{seller?.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Buyer</p>
                            <p className="text-sm font-semibold text-[#111827] truncate">{deal.buyer_email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Days Open</p>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <p className={`text-sm font-bold ${daysOpen > 3 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                                {daysOpen}d
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/arbitrator/${deal.id}`}
                        className="flex-shrink-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Review
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
