'use client'
import { useEffect, useRef } from 'react'

const partners = ['Spotify', 'Google', 'Pinterest', 'Stripe', 'Reddit', 'Spotify', 'Google']

export function ClientsSection() {
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
    <section className="relative overflow-hidden pt-20 pb-0">
      {/* Dark blue background with client SVG */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#18306e]" />
        <img src="/clientportion.svg" alt="Client Crowd" className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
      </div>

      <div ref={ref} className="section-fade-in relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center pb-24">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
          &ldquo;Our clients&rdquo;<span className="text-yellow-400 text-2xl align-super ml-1">✦</span>
        </h2>
        <div className="w-24 h-1 bg-yellow-400 mx-auto rounded mb-16" />

        <div className="flex flex-col gap-6 items-start max-w-sm mx-auto text-white">
          {[
            { value: '50+', label: 'Happy Customers' },
            { value: '20+', label: 'Partners' },
            { value: '10+', label: 'Collaborations' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-5 hover:translate-x-2 transition-transform duration-300">
              <span className="text-4xl md:text-5xl font-extrabold text-[#DDF2FD] w-28 text-right leading-tight">{stat.value}</span>
              <span className="text-xl md:text-2xl font-bold tracking-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logos strip */}
      <div className="relative z-20 bg-white py-5 border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-between items-center gap-6">
          {partners.map((name, i) => (
            <span key={i} className="text-slate-400 font-extrabold text-base md:text-lg tracking-tight hover:text-slate-600 transition-colors cursor-default">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

