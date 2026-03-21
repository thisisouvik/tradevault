'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, Shield, AlertCircle, CheckCircle2, KeyRound, ShoppingBag, Package, Scale } from 'lucide-react'

type Role = 'seller' | 'buyer' | 'arbitrator'

const ROLES: { value: Role; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'seller',
    label: 'Seller',
    icon: <Package className="w-5 h-5" />,
    description: 'I ship goods and get paid when delivered',
  },
  {
    value: 'buyer',
    label: 'Buyer',
    icon: <ShoppingBag className="w-5 h-5" />,
    description: 'I fund deals and confirm receipt of goods',
  },
  {
    value: 'arbitrator',
    label: 'Arbitrator',
    icon: <Scale className="w-5 h-5" />,
    description: 'I resolve disputes between parties',
  },
]

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('seller')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Step 1: Request OTP
  async function handleGetOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { name, role },
      },
    })

    if (error) {
      setError(error.message.includes('rate limit')
        ? 'Too many requests. Please wait a moment and try again.'
        : error.message)
      setLoading(false)
      return
    }

    setSuccess('Verification token sent to your email!')
    setStep(2)
    setLoading(false)
  }

  // Step 2: Verify OTP and Set Password
  async function handleVerifyAndCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    // 1. Verify token
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (verifyError || !verifyData.session) {
      setError(verifyError?.message || 'Invalid or expired token. Please try again.')
      setLoading(false)
      return
    }

    // 2. Set password
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError('Could not set password: ' + updateError.message)
      setLoading(false)
      return
    }

    setSuccess('Account created! Redirecting to dashboard...')
    setLoading(false)
    setTimeout(() => { window.location.href = '/dashboard' }, 1500)
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(37,99,235,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.8) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#2563EB] opacity-[0.05] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#111827]">
              Trade<span className="text-[#2563EB]">Vault</span>
            </span>
          </Link>
          <p className="mt-3 text-[#6B7280] font-medium">
            {step === 1 ? 'Create your account' : 'Secure your account'}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6 px-1">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-[#2563EB] text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              <div className={`h-0.5 flex-1 ${s < 2 ? (step > s ? 'bg-[#2563EB]' : 'bg-gray-200') : 'hidden'} transition-all`} />
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-xl shadow-gray-200/50 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleGetOtp}
                className="space-y-5"
              >
                {/* Name */}
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
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
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
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                  </div>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">I am a...</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {role === 'seller'
                        ? <Package className="w-4 h-4 text-[#9CA3AF]" />
                        : role === 'buyer'
                          ? <ShoppingBag className="w-4 h-4 text-[#9CA3AF]" />
                          : <Scale className="w-4 h-4 text-[#9CA3AF]" />}
                    </div>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as Role)}
                      className="w-full pl-10 pr-10 py-3 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all appearance-none cursor-pointer"
                    >
                      {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    {/* Chevron */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {/* Hint below */}
                  <p className="text-xs text-[#9CA3AF] mt-1.5 ml-1">
                    {ROLES.find(r => r.value === role)?.description}
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg text-sm text-[#EF4444] bg-red-50 border border-red-100"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !name}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-[#2563EB] hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                >
                  {loading ? 'Sending OTP...' : 'Get Verification Token →'}
                </button>

                <p className="text-center text-xs text-[#6B7280]">
                  By proceeding, you agree to our Terms of Service.
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyAndCreate}
                className="space-y-4"
              >
                {/* Selected role badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-[#2563EB]">{ROLES.find(r => r.value === role)?.icon}</span>
                  <span className="text-sm font-semibold text-[#2563EB] capitalize">{role}</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="ml-auto text-xs text-[#6B7280] hover:text-[#2563EB] font-medium"
                  >
                    Change
                  </button>
                </div>

                {/* OTP Token */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">
                    Verification Token
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit code from email"
                      required
                      maxLength={6}
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] tracking-widest font-mono transition-all"
                    />
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1.5 ml-1">
                    Sent to <span className="font-semibold text-[#111827]">{email}</span>
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full pl-10 pr-12 py-3 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] p-1">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= strength ? strengthColor : '#E5E7EB' }} />
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-[#111827] mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className={`w-full pl-10 pr-12 py-3 rounded-lg text-sm text-[#111827] bg-[#F9FAFB] border placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-[#EF4444] focus:border-[#EF4444]'
                          : 'border-[#E5E7EB] focus:border-[#2563EB]'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] p-1">
                      {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-[#EF4444] mt-1 ml-1">Passwords do not match</p>
                  )}
                </div>

                {/* Error / Success */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg text-sm text-[#EF4444] bg-red-50 border border-red-100">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg text-sm text-[#10B981] bg-green-50 border border-green-100">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length < 6 || password.length < 8 || password !== confirmPassword}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-[#2563EB] hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
                >
                  {loading ? 'Creating Account...' : 'Verify & Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="border-t border-gray-100 mt-6 pt-5">
            <p className="text-center text-sm text-[#6B7280] font-medium">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-[#2563EB] hover:text-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
