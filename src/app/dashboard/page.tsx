import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WalletConnect } from '@/components/WalletConnect'
import {
  Shield, Search, Bell, Mail,
  LayoutDashboard, FileText, Settings, HelpCircle,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Plus,
  Scale, Package, ShoppingBag, Star, AlertTriangle, CheckCircle
} from 'lucide-react'

export const metadata = { title: 'Dashboard' }

const STATUS_COLORS: Record<string, string> = {
  PROPOSED:  '#9CA3AF',
  ACCEPTED:  '#3B82F6',
  FUNDED:    '#8B5CF6',
  DELIVERED: '#F59E0B',
  COMPLETED: '#10B981',
  DISPUTED:  '#EF4444',
  RESOLVED:  '#0EA5E9',
  CANCELLED: '#6B7280',
}

const ROLE_ICON: Record<string, React.ReactNode> = {
  seller:     <Package className="w-4 h-4" />,
  buyer:      <ShoppingBag className="w-4 h-4" />,
  arbitrator: <Scale className="w-4 h-4" />,
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'seller'

  // Fetch deals based on role
  let deals: any[] = []

  if (role === 'seller') {
    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
    deals = data || []
  } else if (role === 'buyer') {
    const { data } = await supabase
      .from('deals')
      .select('*')
      .eq('buyer_email', user.email)
      .order('created_at', { ascending: false })
    deals = data || []
  } else if (role === 'arbitrator') {
    // Arbitrators see disputed deals
    const { data } = await supabase
      .from('deals')
      .select('*')
      .in('status', ['DISPUTED'])
      .order('created_at', { ascending: false })
    deals = data || []
  }

  const totalVolume = deals
    .filter(d => d.status === 'COMPLETED' || d.status === 'RESOLVED')
    .reduce((acc, d) => acc + d.amount_usdc, 0)

  const activeDeals = deals.filter(d => !['COMPLETED', 'RESOLVED', 'CANCELLED'].includes(d.status))
  const completedDeals = deals.filter(d => d.status === 'COMPLETED' || d.status === 'RESOLVED')
  const disputedDeals = deals.filter(d => d.status === 'DISPUTED')

  // Role-specific sidebar links
  const navLinks = role === 'arbitrator'
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
        { href: '/arbitrator', label: 'Disputes Queue', icon: Scale },
      ]
    : role === 'buyer'
      ? [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
          { href: '#', label: 'My Deals', icon: ShoppingBag },
        ]
      : [
          { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
          { href: '/deal/new', label: 'New Contract', icon: FileText },
        ]

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden text-[#6B7280]">

      {/* Sidebar */}
      <aside className="w-[240px] bg-[#1A1D23] flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Shield className="w-5 h-5 text-[#2563EB] mr-2" />
          <span className="text-white font-bold text-lg">TradeVault</span>
        </div>

        {/* Role Badge */}
        <div className="px-4 pt-4 pb-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider ${
            role === 'seller' ? 'bg-green-500/10 text-green-400'
            : role === 'buyer' ? 'bg-blue-500/10 text-blue-400'
            : 'bg-orange-500/10 text-orange-400'
          }`}>
            {ROLE_ICON[role]}
            {role}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4">
          <p className="px-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1 mb-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-2 py-2 rounded-lg transition-colors ${
                  link.active
                    ? 'bg-[#2C2F36] text-white'
                    : 'text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white'
                }`}
              >
                <link.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            ))}
          </nav>

          <p className="px-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Account</p>
          <nav className="space-y-1">
            <Link href="/profile" className="flex items-center px-2 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white transition-colors">
              <Star className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">Reputation</span>
            </Link>
            <Link href="#" className="flex items-center px-2 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white transition-colors">
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">Settings</span>
            </Link>
            <Link href="#" className="flex items-center px-2 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">Support</span>
            </Link>
          </nav>
        </div>

        {/* User profile at bottom */}
        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.name || 'User'}</p>
              <form action="/api/auth/signout" method="post">
                <button formAction="/api/auth/signout" type="submit" className="text-xs text-[#9CA3AF] hover:text-white transition-colors">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Top Bar */}
        <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
          <div className="max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search contracts..."
                className="w-full bg-[#F0F2F5] text-sm text-[#111827] rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:bg-white border border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!profile?.wallet_address && <WalletConnect />}
            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Mail className="w-5 h-5" />
            </button>
            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              {activeDeals.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
              )}
            </button>
            {role === 'seller' && (
              <Link
                href="/deal/new"
                className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ml-2"
              >
                <Plus className="w-4 h-4" />
                New Contract
              </Link>
            )}
            {role === 'arbitrator' && (
              <Link
                href="/arbitrator"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ml-2"
              >
                <Scale className="w-4 h-4" />
                Dispute Queue
              </Link>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Welcome banner */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#111827]">
                  Welcome back, {profile?.name?.split(' ')[0] || 'User'} 👋
                </h1>
                <p className="text-sm text-[#6B7280] mt-1">
                  {role === 'seller' && 'Manage your escrow contracts and track shipments.'}
                  {role === 'buyer' && 'Review deals assigned to you and confirm receipts.'}
                  {role === 'arbitrator' && 'Review open disputes and submit your verdicts.'}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="saas-card">
                <p className="text-sm font-medium text-[#6B7280] mb-2">
                  {role === 'arbitrator' ? 'Open Disputes' : 'Total Deals'}
                </p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-semibold text-[#111827]">{deals.length}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-[#2563EB]">
                    {activeDeals.length} Active
                  </span>
                </div>
              </div>

              <div className="saas-card">
                <p className="text-sm font-medium text-[#6B7280] mb-2">
                  {role === 'arbitrator' ? 'Resolved' : 'Completed Volume'}
                </p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-semibold text-[#111827]">
                    {role === 'arbitrator' ? completedDeals.length : `$${totalVolume.toLocaleString()}`}
                  </h3>
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                </div>
              </div>

              <div className="saas-card">
                <p className="text-sm font-medium text-[#6B7280] mb-2">Disputes</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-semibold text-[#111827]">{disputedDeals.length}</h3>
                  <AlertTriangle className={`w-5 h-5 ${disputedDeals.length > 0 ? 'text-[#EF4444]' : 'text-[#9CA3AF]'}`} />
                </div>
              </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Main Deals List */}
              <div className="lg:col-span-3 space-y-6">
                <div className="saas-card p-0 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#111827] flex items-center gap-2">
                      {role === 'seller' ? 'My Contracts'
                        : role === 'buyer' ? 'Deals I\'m In'
                        : 'Open Disputes'}
                      <span className="bg-gray-100 text-[#6B7280] px-2 py-0.5 rounded-full text-xs font-medium">
                        {deals.length}
                      </span>
                    </h3>
                    <button className="text-[#9CA3AF] hover:text-[#111827]">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {deals.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                          {role === 'seller' ? <FileText className="w-6 h-6 text-[#9CA3AF]" />
                            : role === 'buyer' ? <ShoppingBag className="w-6 h-6 text-[#9CA3AF]" />
                            : <Scale className="w-6 h-6 text-[#9CA3AF]" />}
                        </div>
                        <p className="text-[#6B7280] text-sm font-medium">
                          {role === 'seller' ? 'No contracts yet. Create your first one!'
                            : role === 'buyer' ? 'No deals assigned to your email yet.'
                            : 'No open disputes in the queue.'}
                        </p>
                        {role === 'seller' && (
                          <Link href="/deal/new" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline">
                            <Plus className="w-4 h-4" /> Create contract
                          </Link>
                        )}
                      </div>
                    ) : (
                      deals.slice(0, 8).map(deal => (
                        <Link
                          href={role === 'arbitrator' ? `/arbitrator/${deal.id}` : `/deal/${deal.id}`}
                          key={deal.id}
                          className="block hover:bg-[#F9FAFB] transition-colors"
                        >
                          <div className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div
                                className="w-10 h-10 rounded-full flex justify-center items-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: STATUS_COLORS[deal.status] || '#9CA3AF' }}
                              >
                                {deal.item_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111827] mb-0.5 line-clamp-1">{deal.item_name}</h4>
                                <div className="flex gap-3 text-xs text-[#9CA3AF]">
                                  {role !== 'buyer' && <span>→ {deal.buyer_email}</span>}
                                  <span>• {deal.delivery_days}d deadline</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-[#2563EB]">${deal.amount_usdc} USDC</p>
                              <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: STATUS_COLORS[deal.status] }}>
                                {deal.status}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>

                {/* Volume chart */}
                <div className="saas-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-[#111827]">Volume Statistics</h3>
                    <div className="flex gap-4 text-sm font-medium">
                      {['1m', '3m', '6m', '1y'].map((p, i) => (
                        <span key={p} className={`cursor-pointer ${i === 2 ? 'text-[#2563EB] border-b-2 border-[#2563EB]' : 'text-[#9CA3AF] hover:text-[#111827]'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-40 flex items-end justify-between px-2 pb-2 gap-3">
                    {[30, 50, 40, 70, 25, 85].map((h, i) => (
                      <div
                        key={i}
                        className={`w-full rounded-t-md transition-all ${i === 5 ? 'bg-[#2563EB]' : 'bg-[#E5E7EB]'}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right panel - Recent Activity */}
              <div className="lg:col-span-2">
                <div className="saas-card p-0 flex flex-col min-h-[400px]">
                  <div className="flex border-b border-gray-100 px-2 mt-2">
                    <button className="px-4 py-3 text-sm font-semibold border-b-2 border-[#2563EB] text-[#2563EB]">
                      Activity
                    </button>
                    <button className="px-4 py-3 text-sm font-semibold border-b-2 border-transparent text-[#9CA3AF] hover:text-[#111827]">
                      Stats
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2">
                    {deals.length === 0 ? (
                      <div className="p-8 text-center text-[#6B7280] text-sm">No recent activity.</div>
                    ) : (
                      deals.slice(0, 7).map(deal => (
                        <div key={deal.id} className="p-4 hover:bg-[#F9FAFB] rounded-lg transition-colors flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            {deal.status === 'COMPLETED'
                              ? <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                              : deal.status === 'DISPUTED'
                                ? <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
                                : <div className="w-4 h-4 rounded-full border-2 border-[#2563EB]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#111827] truncate">{deal.item_name}</p>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-xs text-[#9CA3AF]">{new Date(deal.created_at).toLocaleDateString()}</p>
                              <span className="text-xs font-bold text-[#111827]">${deal.amount_usdc}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
