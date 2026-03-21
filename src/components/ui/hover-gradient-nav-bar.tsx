'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

const menuItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Why Algorand?", href: "#algorand" },
];

function HoverGradientNavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 1px 24px rgba(5,68,94,0.08)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(24,154,180,0.12)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="font-extrabold text-2xl tracking-tighter text-[#05445E] hover:text-[#189AB4] transition-colors">
          TradeVault
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-bold text-[#05445E] hover:text-[#189AB4] transition-colors duration-200 relative group"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#189AB4] rounded-full transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Search + Join Us */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
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
            <button className="rounded-full bg-[#05445E] hover:bg-[#189AB4] text-white px-6 py-2 text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-px">
              Join Us
            </button>
          </Link>
        </div>

      </div>
    </header>
  );
}

export default HoverGradientNavBar;
