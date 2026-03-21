'use client'

import Link from 'next/link'

function CustomArrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#325A73] flex-shrink-0">
      <path d="M9 1L13 5M13 5L9 9M13 5H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#050811] text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          {/* Logo */}
          <Link href="/" className="font-medium text-3xl tracking-wide text-white">
            TradeVault
          </Link>

          {/* Login / Sign Up */}
          <div className="flex items-center gap-6">
            <Link href="/auth/signin" className="text-sm text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/auth/signup" className="bg-[#8FE3F2] hover:bg-[#7BD1E0] text-[#050811] px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-px bg-slate-800/80 mb-12"></div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-sm font-bold mb-6 text-white tracking-wide">Products</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Features</Link></li>
              <li><Link href="#" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Integration</Link></li>
              <li><Link href="#" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Roadmap</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4">
            <h4 className="text-sm font-bold mb-6 text-white tracking-wide">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> About</Link></li>
              <li><Link href="#" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Term Of Services</Link></li>
              <li><Link href="#" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-3"><CustomArrow /> Licensed & Regulation</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-5">
            <h4 className="text-sm font-bold mb-3 text-white tracking-wide">Stay In Touch</h4>
            <p className="text-xs text-slate-400 mb-5">Keep Updated!!</p>
            <form className="flex w-full" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter Your Email" 
                className="bg-[#091524] border border-[#162C42] focus:border-[#325A73] text-sm text-white px-4 py-3 w-full rounded-l-lg outline-none transition-colors"
                required
              />
              <button 
                type="submit" 
                className="bg-[#8FE3F2] hover:bg-[#7BD1E0] text-[#050811] font-semibold text-sm px-7 py-3 rounded-r-lg transition-colors border border-[#8FE3F2]"
              >
                Submit
              </button>
            </form>
          </div>
          
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="bg-[#03050B] py-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#006E98] gap-4">
          <p>© 2026 All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-[#0089BE] transition-colors">Term Of Service</Link>
            <Link href="#" className="hover:text-[#0089BE] transition-colors">Policy Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
