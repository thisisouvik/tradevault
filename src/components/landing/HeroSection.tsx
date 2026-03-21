'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="bg-[#D6EFF9] pt-16 pb-0 relative overflow-hidden min-h-[580px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-end gap-0">
          
          {/* Left — friend's original text & buttons */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="pb-16 pt-4 max-w-lg"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#05445E] leading-tight mb-3">
              TradeVault
            </h1>
            <p className="text-[#189AB4] font-semibold text-lg mb-4">
              Trade with confidence. Every single time.
            </p>
            <p className="text-[#3a7fa0] text-sm mb-10 leading-relaxed max-w-sm">
              USDC locked in a smart contract until delivery is confirmed — no bank, no middleman, no risk of fraud.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-semibold text-white bg-[#05445E] hover:bg-[#189AB4] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Get started — it's free
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Right — illustration sits flush at the bottom */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="flex items-end justify-center h-[440px]"
          >
            <img
              src="/mainScreen.svg"
              alt="Trade Illustration"
              className="w-full max-w-xl object-contain object-bottom h-full drop-shadow-2xl"
            />
          </motion.div>

        </div>
      </div>
    </section>
  )
}

