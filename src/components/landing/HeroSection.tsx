'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, ArrowRight, Zap, Lock } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-white">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(37,99,235,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 bg-blue-50 border border-blue-100 text-[#2563EB]"
        >
          <Zap className="w-3.5 h-3.5" />
          Built on Algorand — $0.002 per transaction
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#111827] leading-[1.05] mb-6"
        >
          Trade with strangers.{' '}
          <br className="hidden sm:block" />
          <span className="text-[#2563EB]">
            Trust the contract.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-[#6B7280] leading-relaxed mb-10"
        >
          Replace a $240 bank letter of credit with a $0.002 Algorand smart contract.
          Cross-border trade — no banks, no middlemen, no risk.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold text-white bg-[#2563EB] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Start your first trade
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-base font-semibold text-[#111827] bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-all"
          >
            See how it works
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 pt-8 border-t border-gray-100"
        >
          {[
            { value: '$0.002', label: 'Per transaction fee' },
            { value: '4s', label: 'Block finality' },
            { value: '100%', label: 'Non-custodial' },
            { value: '0', label: 'Banks required' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#111827]">{stat.value}</div>
              <div className="text-xs text-[#6B7280] mt-1 font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 flex items-center justify-center gap-6 flex-wrap"
        >
          {[
            { icon: Shield, text: 'Non-custodial' },
            { icon: Lock, text: 'Smart contract secured' },
            { icon: Zap, text: 'Instant settlement' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs font-medium text-[#6B7280] bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
              {text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
