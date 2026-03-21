'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

const stats = [
  { value: 1240, suffix: '+', label: 'Trades completed', color: '#2563EB' },
  { value: 3.2, suffix: 'M', label: 'USDC secured', color: '#0EA5E9', decimals: 1 },
  { value: 0.002, prefix: '$', label: 'Avg. tx cost', color: '#F59E0B', decimals: 3 },
  { value: 4, suffix: 's', label: 'Settlement time', color: '#10B981' },
]

function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0 }: {
  value: number; suffix?: string; prefix?: string; decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 30, stiffness: 80 })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) motionValue.set(value) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, motionValue])

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = prefix + v.toFixed(decimals) + suffix
      }
    })
  }, [spring, prefix, suffix, decimals])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

export function StatsSection() {
  return (
    <section className="py-20 relative overflow-hidden bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8 sm:p-12 bg-white border border-[#E5E7EB] shadow-sm"
        >
          <div className="text-center mb-10">
            <p className="text-[#6B7280] text-sm font-semibold uppercase tracking-widest">
              Platform Stats — TestNet
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="text-4xl sm:text-5xl font-bold mb-2 tabular-nums"
                  style={{ color: stat.color }}
                >
                  <AnimatedNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                    decimals={stat.decimals}
                  />
                </div>
                <p className="text-sm text-[#6B7280] font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
