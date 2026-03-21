'use client'

import { PeraWalletConnect } from '@perawallet/connect'

let peraWallet: PeraWalletConnect | null = null

export function getPeraWallet(): PeraWalletConnect {
  if (!peraWallet) {
    peraWallet = new PeraWalletConnect({
      chainId: 416002, // TestNet
    })
  }
  return peraWallet
}

export async function connectWallet(): Promise<string> {
  const wallet = getPeraWallet()
  const accounts = await wallet.connect()
  if (!accounts[0]) throw new Error('No accounts returned from Pera Wallet')
  return accounts[0]
}

export async function disconnectWallet(): Promise<void> {
  const wallet = getPeraWallet()
  await wallet.disconnect()
}

export function isWalletConnected(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('PeraWallet.Wallet')
}
