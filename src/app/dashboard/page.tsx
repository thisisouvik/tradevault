import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { WalletConnect } from '@/components/WalletConnect'
import { 
  Shield, Search, Bell, Mail,
  LayoutDashboard, FileText, Settings, HelpCircle, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Plus
} from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
}

const STATUS_COLORS: Record<string, string> = {
  PROPOSED: '#9CA3AF',
  ACCEPTED: '#3B82F6',
  FUNDED: '#8B5CF6',
  DELIVERED: '#F59E0B',
  COMPLETED: '#10B981',
  DISPUTED: '#EF4444',
  RESOLVED: '#0EA5E9',
  CANCELLED: '#6B7280'
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch deals
  const { data: sellerDeals } = await supabase
    .from('deals')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const { data: buyerDeals } = await supabase
    .from('deals')
    .select('*')
    .eq('buyer_email', user.email)
    .order('created_at', { ascending: false })

  const allDeals = sellerDeals || []
  const allBuyerDeals = buyerDeals || []

  // Combine and sort by date for recent transactions
  const allTransactions = [...allDeals, ...allBuyerDeals]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Data aggregations
  const totalVolume = allTransactions
    .filter(d => d.status === 'COMPLETED' || d.status === 'RESOLVED')
    .reduce((acc, d) => acc + d.amount_usdc, 0)

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden text-[#6B7280]">
      
      {/* 1. Fixed Left Sidebar */}
      <aside className="w-[240px] bg-[#1A1D23] flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Shield className="w-5 h-5 text-[#2563EB] mr-2" />
          <span className="text-white font-semibold text-lg">TrustEscrow</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-6">
            <p className="px-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Main Menu</p>
            <nav className="space-y-1">
              <Link href="/dashboard" className="flex items-center px-2 py-2 rounded-lg bg-[#2C2F36] text-white">
                <LayoutDashboard className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">Dashboard</span>
              </Link>
              <Link href="/deal/new" className="flex items-center px-2 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white transition-colors">
                <FileText className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">Contracts</span>
              </Link>
            </nav>
          </div>
          
          <div>
            <p className="px-2 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Settings</p>
            <nav className="space-y-1">
              <Link href="#" className="flex items-center px-2 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white transition-colors">
                <Settings className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">Preferences</span>
              </Link>
              <Link href="#" className="flex items-center px-2 py-2 rounded-lg text-[#9CA3AF] hover:bg-[#2C2F36] hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">Support</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* User profile brief at bottom */}
        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs">
              {profile?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.name || 'User'}</p>
              <form action="/auth/signout" method="post">
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
        
        {/* 2. Top Bar */}
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
          
          <div className="flex items-center gap-4">
            {!profile?.wallet_address && (
               <WalletConnect />
            )}
            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Mail className="w-5 h-5" />
            </button>
            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white"></span>
            </button>
            <Link href="/deal/new" className="bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ml-2">
              <Plus className="w-4 h-4" />
              New Contract
            </Link>
          </div>
        </header>

        {/* 3. Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="saas-card relative overflow-hidden">
                <p className="text-sm font-medium text-[#6B7280] mb-2">Total Deals</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-semibold text-[#111827]">{allTransactions.length}</h3>
                  <div className="flex items-center text-sm font-semibold text-[#0EA5E9]">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Pending
                  </div>
                </div>
              </div>
              
              <div className="saas-card relative overflow-hidden">
                <p className="text-sm font-medium text-[#6B7280] mb-2">Total Volume</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-semibold text-[#111827]">${totalVolume.toLocaleString()}</h3>
                  <div className="flex items-center text-sm font-semibold text-[#2563EB]">
                     Processed
                  </div>
                </div>
              </div>

              {/* Client Contact Profile Card Spec */}
              <div className="saas-card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-lg">
                    {allDeals[0]?.buyer_email?.charAt(0)?.toUpperCase() || 'R'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">Recent Contact</h4>
                    <p className="text-xs text-[#6B7280]">{allDeals[0]?.buyer_email || 'No recent contacts'}</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 border border-[#2563EB] text-[#2563EB] rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors">
                  Contact
                </button>
              </div>
            </div>

            {/* 2-Column Grid (60% / 40%) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Main Contracts List (Left - 60%) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Active Contracts Card */}
                <div className="saas-card p-0 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[#111827] inline-flex items-center gap-2">
                        Active Contracts
                        <span className="bg-gray-100 text-[#6B7280] px-2 py-0.5 rounded-full text-xs font-medium">{allTransactions.length}</span>
                      </h3>
                    </div>
                    <button className="text-[#9CA3AF] hover:text-[#111827]">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {allTransactions.length === 0 ? (
                      <div className="p-8 text-center text-[#6B7280] text-sm">No active contracts found.</div>
                    ) : (
                      allTransactions.slice(0, 5).map(deal => (
                        <Link href={`/deal/${deal.id}`} key={deal.id} className="block hover:bg-[#F9FAFB] transition-colors">
                          <div className="px-6 py-4 flex items-center justify-between">
                            {/* Left Col */}
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full flex justify-center items-center text-white text-xs font-bold" style={{backgroundColor: STATUS_COLORS[deal.status] || '#9CA3AF'}}>
                                {deal.item_name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111827] mb-0.5 line-clamp-1">{deal.item_name}</h4>
                                <div className="flex gap-4 text-xs">
                                  <span className="text-[#9CA3AF]">
                                    {deal.seller_id === user.id ? `To: ${deal.buyer_email}` : `From: ${deal.seller_id.substring(0,6)}`}
                                  </span>
                                  <span className="text-[#9CA3AF]">• {deal.delivery_days} days</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Col */}
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#2563EB]">${deal.amount_usdc} USDC</p>
                              <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: STATUS_COLORS[deal.status] || '#9CA3AF' }}>
                                {deal.status}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  {allTransactions.length > 5 && (
                    <div className="px-6 py-3 bg-[#F9FAFB] border-t border-gray-100 text-center">
                       <span className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] cursor-pointer">View All Contracts</span>
                    </div>
                  )}
                </div>

                {/* Chart placeholder (Bar chart spec) */}
                <div className="saas-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-[#111827]">Volume Statistics</h3>
                    <div className="flex gap-4 text-sm font-medium">
                      <span className="text-[#9CA3AF] cursor-pointer hover:text-[#111827]">1m</span>
                      <span className="text-[#9CA3AF] cursor-pointer hover:text-[#111827]">3m</span>
                      <span className="text-[#2563EB] cursor-pointer border-b-2 border-[#2563EB]">6m</span>
                      <span className="text-[#9CA3AF] cursor-pointer hover:text-[#111827]">1y</span>
                    </div>
                  </div>
                  <div className="h-48 flex items-end justify-between px-2 pb-2 gap-4">
                    {/* Simulated bars */}
                    <div className="w-full bg-[#E5E7EB] rounded-t-md relative h-[30%] group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 opacity-0 group-hover:opacity-100">Oct</span></div>
                    <div className="w-full bg-[#E5E7EB] rounded-t-md relative h-[50%] group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 opacity-0 group-hover:opacity-100">Nov</span></div>
                    <div className="w-full bg-[#E5E7EB] rounded-t-md relative h-[40%] group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 opacity-0 group-hover:opacity-100">Dec</span></div>
                    <div className="w-full bg-[#E5E7EB] rounded-t-md relative h-[70%] group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 opacity-0 group-hover:opacity-100">Jan</span></div>
                    <div className="w-full bg-[#E5E7EB] rounded-t-md relative h-[25%] group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 opacity-0 group-hover:opacity-100">Feb</span></div>
                    <div className="w-full bg-[#2563EB] rounded-t-md relative h-[85%] group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-[#2563EB]">Mar</span></div>
                  </div>
                </div>

              </div>

              {/* Updates & Transactions (Right - 40%) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Updates Panel spec */}
                <div className="saas-card p-0 flex flex-col h-full min-h-[500px]">
                  <div className="flex border-b border-gray-100 px-2 mt-2">
                    <button className="px-4 py-3 text-sm font-semibold border-b-2 border-[#2563EB] text-[#2563EB]">Updates</button>
                    <button className="px-4 py-3 text-sm font-semibold border-b-2 border-transparent text-[#9CA3AF] hover:text-[#111827]">Transactions</button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {allTransactions.length === 0 ? (
                       <div className="p-8 text-center text-[#6B7280] text-sm">No recent activity.</div>
                    ) : (
                      <div className="p-2">
                        {allTransactions.slice(0, 7).map(deal => (
                          <div key={deal.id} className="p-4 hover:bg-[#F9FAFB] rounded-lg transition-colors flex items-start gap-4">
                            <div className="mt-0.5">
                              {deal.status === 'COMPLETED' ? (
                                <ArrowUpRight className="w-4 h-4 text-[#0EA5E9]" />
                              ) : deal.status === 'DISPUTED' ? (
                                <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-[#2563EB]" />
                              )}
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-semibold text-[#111827] mb-1">{deal.item_name}</p>
                               <div className="flex items-center justify-between">
                                  <p className="text-xs text-[#9CA3AF]">
                                    {new Date(deal.created_at).toLocaleDateString()}
                                  </p>
                                  <span className="text-xs font-bold" style={{ color: deal.status === 'DISPUTED' ? '#EF4444' : '#111827' }}>
                                    ${deal.amount_usdc}
                                  </span>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
