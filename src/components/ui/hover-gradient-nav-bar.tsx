'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';

const menuItems = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Why Algorand?", href: "/why-algorand" },
];

function HoverGradientNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      style={{
        background: scrolled || mobileMenuOpen ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled || mobileMenuOpen ? 'blur(16px)' : 'none',
        boxShadow: scrolled || mobileMenuOpen ? '0 1px 24px rgba(5,68,94,0.08)' : 'none',
        borderBottom: scrolled || mobileMenuOpen ? '1px solid rgba(24,154,180,0.12)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-extrabold text-2xl tracking-tighter text-[#05445E] hover:text-[#189AB4] transition-colors relative z-50">
          TradeVault
        </Link>

        {/* Desktop Navigation Items */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-bold text-[#05445E] hover:text-[#189AB4] transition-colors duration-200 relative group"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#189AB4] rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Search + Join Us (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#189AB4]" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-44 lg:w-52 rounded-full bg-white/80 border border-[#189AB4]/20 text-sm text-[#05445E] placeholder:text-[#189AB4]/50 focus:outline-none focus:ring-2 focus:ring-[#189AB4]/40 shadow-sm font-medium transition-all"
            />
          </div>
          <Link href="/auth/signup">
            <button className="rounded-full bg-[#05445E] hover:bg-[#189AB4] text-white px-6 py-2 text-sm font-semibold transition-all duration-200 shadow-md hover:-translate-y-px">
              Join Us
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center gap-3 relative z-50">
          <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="sm:hidden">
            <button className="rounded-full bg-[#05445E] text-white px-5 py-1.5 text-xs font-semibold shadow-sm">
              Join Us
            </button>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#05445E] p-1.5 rounded-md hover:bg-[#189AB4]/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-16 left-0 w-full bg-white border-b border-[#189AB4]/10 shadow-xl transition-all duration-300 ease-in-out overflow-hidden z-40 ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="px-6 space-y-6">
          <nav className="flex flex-col gap-5">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-[#05445E] hover:text-[#189AB4] transition-colors border-b border-[#189AB4]/10 pb-3"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#189AB4]" />
            </div>
            <input
              type="text"
              placeholder="Search features, tools..."
              className="pl-12 pr-4 py-3.5 w-full rounded-xl bg-slate-50 border border-[#189AB4]/20 text-base text-[#05445E] placeholder:text-[#189AB4]/50 focus:outline-none focus:ring-2 focus:ring-[#189AB4]/40"
            />
          </div>
        </div>
      </div>

    </header>
  );
}

export default HoverGradientNavBar;
