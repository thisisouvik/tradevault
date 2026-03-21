'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Lock, Eye, Clock } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Non-Custodial Security',
    description:
      'Funds are locked in the Algorand smart contract — not on our servers. Nobody, including us, can access the money outside the agreed rules.',
    color: '#2563EB',
    glow: 'rgba(37,99,235,0.05)',
  },
  {
    icon: Zap,
    title: 'Atomic Transactions',
    description:
      'Accept and fund happen in a single atomic group. Either both succeed or neither does. No intermediate state where either party is exposed.',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.05)',
  },
  {
    icon: Globe,
    title: 'Cross-Border Ready',
    description:
      'USDC is native on Algorand — no wrapping, no bridging, no slippage. Trade between Mumbai and Berlin the same way you trade locally.',
    color: '#8B5CF6',
    glow: 'rgba(139,92,246,0.05)',
  },
  {
    icon: Lock,
    title: 'Immutable Terms',
    description:
      'Every deal term — price, deadline, dispute window — is baked permanently into the contract at creation. No one can change them after.',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.05)',
  },
  {
    icon: Eye,
    title: 'On-Chain Proof',
    description:
      "SHA256 hash of the tracking number is stored on Algorand permanently. Anyone can verify delivery proof on the blockchain — forever.",
    color: '#0EA5E9',
    glow: 'rgba(14,165,233,0.05)',
  },
  {
    icon: Clock,
    title: 'Auto-Release Timeout',
    description:
      "Seller protected from silent buyers: if the buyer doesn't confirm or dispute within 7 days, funds auto-release to seller. No action needed.",
    color: '#EF4444',
    glow: 'rgba(239,68,68,0.05)',
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 relative overflow-hidden bg-[#F9FAFB] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4 bg-blue-50 border border-blue-100 text-[#2563EB]"
          >
            Why TrustEscrow
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-[#111827] mb-4"
          >
            Built differently.{' '}
            <span className="text-[#2563EB]">
              Secured by math.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-[#6B7280] text-lg"
          >
            Every safeguard is enforced by the Algorand Virtual Machine — not by policy, not by trust in us.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(feature => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl p-8 cursor-default bg-white border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: feature.glow }}
                />
                {/* Icon */}
                <div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${feature.color}10`, border: `1px solid ${feature.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="relative text-lg font-bold text-[#111827] mb-3">{feature.title}</h3>
                <p className="relative text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
