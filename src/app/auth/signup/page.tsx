'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    setSuccess('Account created! Check your email to verify your address, then sign in.')
    setLoading(false)
    setTimeout(() => router.push('/auth/signin'), 3000)
  }

  const passwordStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = passwordStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b91e8', '#10B981'][strength]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left Panel — Illustration (Desktop) ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 40%, #C7D9F7 100%)',
        }}
      >
        {/* Decorative blurred orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center px-8 max-w-2xl w-full"
        >
          <img
            src="/signin-illustration.png"
            alt="Team collaboration"
            className="drop-shadow-2xl"
            style={{ width: '150%', maxWidth: 'none' }}
          />
        </motion.div>
      </div>

      {/* ── Mobile Illustration ── */}
      <div
        className="lg:hidden relative overflow-hidden flex flex-col items-center justify-center px-6 pt-10 pb-6"
        style={{
          background: 'linear-gradient(135deg, #EEF4FF 0%, #DBEAFE 40%, #C7D9F7 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <img
            src="/signin-illustration.png"
            alt="Team collaboration"
            className="drop-shadow-lg"
            style={{ width: '90%', maxWidth: '360px' }}
          />
          <h2 className="mt-4 text-xl font-bold text-[#111827] text-center">Join TrustEscrow</h2>
          <p className="mt-2 text-[#4B5563] text-xs text-center max-w-xs leading-relaxed">
            Start trading cross-border with confidence. Escrow-backed, no banks needed.
          </p>
        </motion.div>
      </div>

      {/* ── Right Panel — Sign Up Form ── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:py-12 relative"
        style={{ background: 'linear-gradient(180deg, #f9f9f9 0%, #f3eff5 100%)' }}
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(37,99,235,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.8) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-[0.04] rounded-full blur-[120px]"
            style={{ background: '#2563EB' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: '#2563EB', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#111827]">
                Trade<span style={{ color: '#2563EB' }}>Vault</span>
              </span>
            </Link>
            <p className="mt-3 text-[#9ca3af] font-medium">Create your free account</p>
          </div>

          {/* Card */}
          <div
            className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-xl"
            style={{ boxShadow: '0 8px 30px rgba(37,99,235,0.08)' }}
          >
            <form onSubmit={handleSignUp} className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#111827] border outline-none transition-all"
                    style={{ background: '#f9f9f9', borderColor: '#E5E7EB' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-[#111827] border outline-none transition-all"
                    style={{ background: '#f9f9f9', borderColor: '#E5E7EB' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm text-[#111827] border outline-none transition-all"
                    style={{ background: '#f9f9f9', borderColor: '#E5E7EB' }}
                    onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] transition-colors p-1"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColor : '#E5E7EB' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
                  </div>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-[#6B7280]">
                By creating an account, you agree to our{' '}
                <Link href="#" className="text-[#2563EB] hover:underline font-medium">Terms of Service</Link>{' '}
                and{' '}
                <Link href="#" className="text-[#2563EB] hover:underline font-medium">Privacy Policy</Link>.
              </p>

              {/* Error / Success */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl text-sm text-[#EF4444] bg-red-50 border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 rounded-xl text-sm text-[#10B981] bg-green-50 border border-green-100"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {success}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: '#2563EB',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                }}
                onMouseOver={e => { if (!loading) (e.target as HTMLButtonElement).style.background = '#1d4ed8' }}
                onMouseOut={e => { if (!loading) (e.target as HTMLButtonElement).style.background = '#2563EB' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-[#9ca3af] mt-6 font-medium">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-semibold transition-colors" style={{ color: '#2563EB' }}>
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
