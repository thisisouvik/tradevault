'use client'
import { useEffect, useRef } from 'react'

export function AboutSection() {
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
          {/* Left illustration */}
          <div ref={leftRef} className="section-fade-in-left flex items-center justify-center">
            <img
              src="/about.svg"
              alt="About TradeLinkGlobal"
              className="w-full max-w-md object-contain"
            />
          </div>
          {/* Right text */}
          <div ref={rightRef} className="section-fade-in-right">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#05445E] mb-2 leading-tight">
              About<br />TradeLinkGlobal
            </h2>
            <div className="w-16 h-1 bg-[#189AB4] rounded mb-6 mt-3" />
            <h3 className="text-base font-bold text-[#05445E] mb-4">
              Insights and Resources to help drive your Business Forward Faster.
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              We build connections that last, helping small and medium enterprises navigate international markets with confidence. Our experienced team provides tailored strategies to help you reach the best trading partners across the world.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              From logistics to compliance, we are your one-stop platform for stress-free cross-border growth.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

