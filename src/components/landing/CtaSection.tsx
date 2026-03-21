'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-white">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-10 sm:p-16 relative overflow-hidden bg-white border border-blue-100 shadow-xl shadow-blue-900/5"
        >
          {/* Corner glow */}
          <div
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)' }}
          />

          {/* Icon */}
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6 bg-[#2563EB] shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-[#111827] mb-4">
            Ready to trade{' '}
            <span className="text-[#2563EB]">
              without fear?
            </span>
          </h2>

          <p className="text-lg text-[#6B7280] mb-10 max-w-xl mx-auto">
            Create your first contract in under 2 minutes. No credit card. No bank account. Just a wallet and an agreement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold text-white bg-[#2563EB] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
            >
              Get started — it's free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-all"
            >
              Sign in
            </Link>
          </div>

          <p className="text-xs text-[#9CA3AF] mt-8 font-medium">
            Running on Algorand TestNet · USDC ASA ID: 10458941 · Non-custodial · Open source
          </p>
        </motion.div>
      </div>
    </section>
  )
}
