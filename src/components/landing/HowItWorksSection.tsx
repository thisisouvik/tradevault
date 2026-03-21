'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    actor: 'Seller',
    actorColor: '#05445E',
    title: 'Create the contract',
    description:
      'Fill in trade terms — item, price in USDC, delivery deadline, dispute window, buyer wallet. Deploy to Algorand with one tap in Lute Wallet. Terms are permanent from this moment.',
    tag: 'PROPOSED',
    tagColor: '#189AB4',
  },
  {
    number: '02',
    actor: 'Buyer',
    actorColor: '#8B5CF6',
    title: 'Accept and fund atomically',
    description:
      "Open the contract link, connect Lute Wallet, click 'Accept & Fund.' Two transactions grouped atomically — your acceptance signature and USDC transfer. Contract state → FUNDED.",
    tag: 'FUNDED',
    tagColor: '#8B5CF6',
  },
  {
    number: '03',
    actor: 'Seller',
    actorColor: '#05445E',
    title: 'Ship and submit tracking',
    description:
      'Ship the goods. Paste tracking number and select carrier. Platform verifies it with TrackingMore API, stores SHA256 hash permanently on-chain. Dispute window starts.',
    tag: 'DELIVERED',
    tagColor: '#F59E0B',
  },
  {
    number: '04',
    actor: 'Buyer',
    actorColor: '#8B5CF6',
    title: 'Confirm receipt',
    description:
      'Goods arrive. Click Confirm. Smart contract inner transaction sends full USDC to seller wallet instantly. Algorand fee: $0.002. Contract permanently archived on-chain.',
    tag: 'COMPLETED',
    tagColor: '#10B981',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative overflow-hidden bg-white border-b border-[#189AB4]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4 bg-[#189AB4]/10 border border-[#189AB4]/20 text-[#05445E]"
          >
            How it works
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-[#05445E] mb-4"
          >
            From proposal to payment{' '}
            <span className="text-[#189AB4]">in 4 steps.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-[#3a7fa0] text-lg"
          >
            No bank account needed. No wire transfers. No waiting 3–5 business days.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col sm:flex-row gap-6 items-start bg-white border border-[#189AB4]/15 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#189AB4]/30 transition-all"
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl"
                    style={{ background: `${step.actorColor}10`, color: step.actorColor }}
                  >
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      style={{ background: `${step.actorColor}10`, color: step.actorColor }}
                    >
                      {step.actor}
                    </span>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                      style={{ background: `${step.tagColor}10`, color: step.tagColor, border: `1px solid ${step.tagColor}30` }}
                    >
                      {step.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#05445E] mb-2">{step.title}</h3>
                  <p className="text-[#3a7fa0] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dispute note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 max-w-4xl mx-auto rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#FEF2F2] border border-red-100"
        >
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-red-100 flex items-center justify-center text-red-500 font-bold text-lg">
            !
          </div>
          <div>
            <p className="text-[#05445E] font-semibold mb-1">What if there's a dispute?</p>
            <p className="text-[#3a7fa0] text-sm">
              Buyer can raise a dispute within the window. Both parties submit photo evidence. An arbitrator reviews and submits a split verdict (e.g. 80/20). Smart contract executes the proportional USDC payout instantly.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

