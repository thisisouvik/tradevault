'use client'
import { useEffect, useRef } from 'react'
import { Users, Truck, Calendar } from 'lucide-react'

export function StatsBannerSection() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('animate-in-view') },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img src="/feedbackBG.svg" alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1A458F]/70" />
      </div>

      <div ref={ref} className="section-fade-in relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">

          {[
            { icon: <Users className="w-8 h-8 text-white" />, value: '100+', label: 'Happy Clients' },
            { icon: <Truck className="w-8 h-8 text-white" />, value: '150+', label: 'Happy Drivers', delay: 'delay-150' },
            { icon: <Calendar className="w-8 h-8 text-white" />, value: '10+', label: 'Years Experience', delay: 'delay-300' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl w-52 transition-all duration-500 hover:-translate-y-3 hover:shadow-blue-200/60 ${i === 1 ? 'md:translate-y-10' : ''}`}
            >
              <div className="bg-[#1A458F] rounded-2xl p-4 mb-4 shadow-lg">
                {stat.icon}
              </div>
              <h4 className="text-2xl font-extrabold text-[#05445E]">{stat.value}</h4>
              <p className="text-xs text-[#189AB4] font-semibold uppercase tracking-widest mt-1 text-center">{stat.label}</p>
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}

