'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-[#EAF6FB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-[2.5rem] sm:rounded-[3.5rem] p-12 sm:p-24 relative overflow-hidden bg-white shadow-[0_20px_80px_-15px_rgba(24,154,180,0.15)] max-w-4xl mx-auto"
        >
          {/* Icon */}
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-8 bg-[#05445E] shadow-sm">
            <Shield className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#05445E] mb-6 tracking-tight">
            Ready to trade <span className="text-[#189AB4]">without fear?</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#3a7fa0] mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Create your first contract in under 2 minutes. No credit card. No bank account. Just a wallet and an agreement.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-[#05445E] hover:bg-[#033144] transition-colors w-full sm:w-auto"
            >
              Get started — it's free
              <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl text-base font-bold text-[#05445E] bg-white border border-[#189AB4]/20 hover:bg-[#EAF6FB] transition-colors w-full sm:w-auto"
            >
              Sign in
            </Link>
          </div>

          {/* Bottom text */}
          <p className="text-xs sm:text-sm text-[#189AB4]/70 mt-12 font-semibold tracking-wide">
            Running on Algorand TestNet · <span className="opacity-80">USDC ASA ID: 10458941</span> · Non-custodial · Open source
          </p>
        </motion.div>

      </div>
    </section>
  )
}

