'use client'
import { useEffect, useRef } from 'react'

export function WorkSection() {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = [leftRef.current, rightRef.current]
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('animate-in-view') }),
      { threshold: 0.15 }
    )
    els.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div ref={leftRef} className="section-fade-in-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#189AB4] mb-2 leading-tight">
              Introducing Our Work
            </h2>
            <div className="w-16 h-1 bg-[#05445E] rounded mb-6 mt-3" />
            <h3 className="text-lg font-bold text-[#05445E] mb-6 leading-snug">
              Tailoring services for global exporters<br />with personalized attention.
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Our comprehensive supply chain solutions are designed to support your business requirements from origin to destination and ensure reliable distribution globally.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              We focus on cost-efficient handling through a network of robust partnerships worldwide to assure schedule-driven product transport and delivery.
            </p>
          </div>
          {/* Right illustration */}
          <div ref={rightRef} className="section-fade-in-right flex items-center justify-center">
            <img
              src="/introducingOurWork.svg"
              alt="Introducing Our Work"
              className="w-full max-w-md object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

