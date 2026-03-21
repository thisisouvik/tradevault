import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
export const metadata = { title: 'Dashboard' }

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
    const { data } = await supabase
      .from('deals')
      .select('*')
      .in('status', ['DISPUTED'])
      .order('created_at', { ascending: false })
    deals = data || []
  }

  return <DashboardClient user={user} profile={profile} deals={deals} />
}
