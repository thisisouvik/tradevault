'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Wallet, LogOut, Copy, CheckCheck, ExternalLink } from 'lucide-react'
import { getPeraWallet } from '@/lib/wallet'
import { createClient } from '@/lib/supabase/client'

interface WalletConnectProps {
  onConnect?: (address: string) => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const shortAddr = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const saveWalletToProfile = useCallback(async (addr: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ wallet_address: addr })
      .eq('id', user.id)
  }, [supabase])

  useEffect(() => {
    // Reconnect existing session
    const peraWallet = getPeraWallet()
    peraWallet.reconnectSession().then((accounts) => {
      if (accounts[0]) {
        setAddress(accounts[0])
        peraWallet.connector?.on('disconnect', () => setAddress(null))
      }
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function connect() {
    setError('')
    setLoading(true)
    try {
      const peraWallet = getPeraWallet()
      const accounts = await peraWallet.connect()
      const addr = accounts[0]
      setAddress(addr)
      peraWallet.connector?.on('disconnect', () => setAddress(null))
      await saveWalletToProfile(addr)
      onConnect?.(addr)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet'
      if (!msg.includes('closed')) setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function disconnect() {
    const peraWallet = getPeraWallet()
    await peraWallet.disconnect()
    setAddress(null)
  }

  function copyAddress() {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (address) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
      >
        <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
        <span className="text-sm font-mono text-[#4ade80]">{shortAddr(address)}</span>
        <div className="flex items-center gap-1 ml-1">
          <button
            onClick={copyAddress}
            className="p-1 rounded-lg text-[#8ca0b3] hover:text-[#4ade80] transition-colors"
            title="Copy address"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={`https://testnet.algoexplorer.io/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-lg text-[#8ca0b3] hover:text-[#4ade80] transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={disconnect}
            className="p-1 rounded-lg text-[#8ca0b3] hover:text-red-400 transition-colors"
            title="Disconnect"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <motion.button
        onClick={connect}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#04101f] transition-all disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #4ade80, #22c55e)',
          boxShadow: '0 0 20px rgba(74,222,128,0.25)',
        }}
      >
        <Wallet className="w-4 h-4" />
        {loading ? 'Connecting...' : 'Connect Pera Wallet'}
      </motion.button>
      {error && (
        <p className="text-xs text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  )
}
