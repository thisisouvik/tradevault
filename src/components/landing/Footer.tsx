'use client'

import Link from 'next/link'

function CustomArrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8FE3F2] flex-shrink-0">
      <path d="M9 1L13 5M13 5L9 9M13 5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#05445E] text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col items-center md:items-start mb-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-extrabold text-3xl tracking-wide text-white">
            <img src="/logo.png" alt="TradeVault Logo" className="w-10 h-10 object-contain" />
            TradeVault
          </Link>
          <p className="mt-2 text-[#D6EFF9] opacity-80 max-w-sm text-center md:text-left">
            Start trading globally with zero counterparty risk. Escrow-backed, no banks needed.
          </p>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-px bg-[#189AB4] opacity-30 mb-12"></div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-base font-bold mb-6 text-white tracking-wide uppercase">Products</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-sm text-[#D6EFF9] hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Features</Link></li>
              <li><Link href="#integration" className="text-sm text-[#D6EFF9] hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Integration</Link></li>
              <li><Link href="#roadmap" className="text-sm text-[#D6EFF9] hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Roadmap</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4">
            <h4 className="text-base font-bold mb-6 text-white tracking-wide uppercase">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#about" className="text-sm text-[#D6EFF9] hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> About</Link></li>
              <li><Link href="#terms" className="text-sm text-[#D6EFF9] hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Term Of Services</Link></li>
              <li><Link href="#privacy" className="text-sm text-[#D6EFF9] hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Privacy Policy</Link></li>
              <li><Link href="#licensed" className="text-sm text-[#D6EFF9] hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Licensed & Regulation</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-5">
            <h4 className="text-base font-bold mb-3 text-white tracking-wide uppercase">Stay In Touch</h4>
            <p className="text-sm text-[#D6EFF9] opacity-90 mb-5">Keep Updated with the latest news!</p>
            <form className="flex w-full drop-shadow-lg" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter Your Email" 
                className="bg-white border-none text-sm text-[#05445E] placeholder:text-slate-400 px-4 py-3.5 w-full rounded-l-lg outline-none transition-colors"
                required
              />
              <button 
                type="submit" 
                className="bg-[#189AB4] hover:bg-[#137a90] text-white font-bold text-sm px-8 py-3.5 rounded-r-lg transition-colors border-none"
              >
                Submit
              </button>
            </form>
          </div>
          
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="bg-[#032a3b] py-6 border-t border-[#189AB4]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#7BD1E0] gap-4 font-medium">
          <p>© 2026 TradeVault. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="#terms" className="hover:text-white transition-colors">Term Of Service</Link>
            <Link href="#policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

