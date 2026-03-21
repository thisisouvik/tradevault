import Link from 'next/link'
import { Shield, Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer
      className="border-t bg-white py-12"
      style={{ borderColor: 'rgba(0,0,0,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[#111827]">
              Trust<span className="text-[#2563EB]">Escrow</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm font-medium text-[#6B7280]">
            <Link href="/auth/signin" className="hover:text-[#111827] transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-[#111827] transition-colors">Sign up</Link>
            <a href="#features" className="hover:text-[#111827] transition-colors">Features</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111827] transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#111827] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-[#9CA3AF] font-medium">
            © 2026 TrustEscrow · Algorand DeFi Track Hackathon
          </p>
        </div>
      </div>
    </footer>
  )
}
