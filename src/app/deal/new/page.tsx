import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CreateDealForm from '@/components/CreateDealForm'
import { ArrowLeft, Shield } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create New Contract' }

export default async function NewDealPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?redirectTo=/deal/new')

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
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#111827] mb-2">Create new contract</h1>
          <p className="text-[#6B7280]">
            Fill in the trade terms below. Once deployed, all terms are permanent on Algorand and cannot be modified.
          </p>
        </div>

        <CreateDealForm />
      </main>
    </div>
  )
}
