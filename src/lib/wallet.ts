'use client'

import { NetworkId, WalletId, WalletManager } from '@txnlab/use-wallet'

let walletManagerInstance: WalletManager | null = null

export function getWalletManager(): WalletManager {
  if (typeof window === 'undefined') {
    // Return a dummy/empty manager for SSR
    return new WalletManager({
      wallets: [],
      defaultNetwork: NetworkId.TESTNET,
    })
  }
  
  if (!walletManagerInstance) {
    walletManagerInstance = new WalletManager({
      wallets: [
        WalletId.DEFLY,
        WalletId.LUTE,
      ],
      defaultNetwork: NetworkId.TESTNET,
    })
  }
  
  return walletManagerInstance
}
