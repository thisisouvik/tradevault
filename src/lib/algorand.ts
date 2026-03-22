/**
 * Algorand SDK helpers
 * Uses TestNet via Algonode (free, no API key needed)
 */
import algosdk from 'algosdk'

export const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN || '',
  process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
  parseInt(process.env.ALGOD_PORT || '443')
)

export const USDC_ASSET_ID = parseInt(
  process.env.NEXT_PUBLIC_USDC_ASSET_ID || '10458941'
)

// State machine values (must match contract)
export const CONTRACT_STATES = {
  PROPOSED: 0,
  ACCEPTED: 1,
  FUNDED: 2,
  DELIVERED: 3,
  COMPLETED: 4,
  DISPUTED: 5,
  RESOLVED: 6,
} as const

export type ContractState = keyof typeof CONTRACT_STATES

/**
 * Read the global state of an Algorand application
 */
export async function getContractState(appId: number): Promise<Record<string, string | number>> {
  try {
    const appInfo = await algodClient.getApplicationByID(appId).do()
    const state: Record<string, string | number> = {}

    const globalState = appInfo.params.globalState as Array<{
      key: Uint8Array
      value: { type: number; uint: number | bigint; bytes: Uint8Array }
    }> | undefined

    if (!globalState) return state

    for (const item of globalState) {
      const key = new TextDecoder().decode(item.key)
      if (item.value.type === 1) {
        // bytes
        state[key] = new TextDecoder().decode(item.value.bytes)
      } else {
        // uint
        state[key] = Number(item.value.uint)
      }
    }

    return state
  } catch (error) {
    console.error('Error reading contract state:', error)
    return {}
  }
}

/**
 * Map numeric state to status string
 */
export function stateToStatus(stateValue: number): ContractState {
  const entries = Object.entries(CONTRACT_STATES)
  const found = entries.find(([, v]) => v === stateValue)
  return (found?.[0] as ContractState) || 'PROPOSED'
}

/**
 * SHA256 hash of a string (for tracking number hashing)
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Parse raw Algorand errors into user-friendly UI messages
 */
export function parseAlgorandError(err: any): string {
  const msg = err?.message || String(err)
  
  if (msg.includes('below min')) {
    return 'Insufficient ALGO. Algorand requires an account minimum balance that goes up for every smart contract or asset you hold. Please fund your wallet using the Algorand Testnet Dispenser (bank.testnet.algorand.network) to continue.'
  }
  if (msg.includes('underflow on subtracting')) {
    return 'Insufficient USDC balance to cover this transaction.'
  }
  if (msg.includes('must optin') || (msg.includes('asset') && msg.includes('missing'))) {
    return 'Contract not activated. The buyer must wait for the seller to pay the setup fees before funding.'
  }
  if (msg.includes('Only buyer can')) {
    return 'Permission denied: Your connected wallet does not match the buyer address assigned to this deal.'
  }
  if (msg.includes('Only seller can')) {
    return 'Permission denied: Your connected wallet does not match the seller address assigned to this deal.'
  }
  if (msg.includes('rejected')) {
    return 'Transaction was rejected or cancelled in your wallet.'
  }
  if (msg.includes('logic eval error: assert failed')) {
    return 'Smart contract assertion failed. The current state does not allow this action.'
  }
  return msg
}

/**
 * Get platform server wallet from mnemonic
 */
export function getPlatformWallet(): algosdk.Account {
  const mnemonic = process.env.PLATFORM_MNEMONIC
  if (!mnemonic) throw new Error('PLATFORM_MNEMONIC not set')
  return algosdk.mnemonicToSecretKey(mnemonic)
}

/**
 * Call a contract method using the platform server wallet
 */
export async function callContractMethod(
  appId: number,
  method: string,
  args: (algosdk.ABIValue | Uint8Array)[] = []
): Promise<string> {
  const account = getPlatformWallet()
  const params = await algodClient.getTransactionParams().do()

  // For simple no-arg calls, use application-call transaction directly
  const encodedMethod = new TextEncoder().encode(method)
  const appArgsList = [
    encodedMethod,
    ...args.map(a => a instanceof Uint8Array ? a : algosdk.encodeUint64(a as number))
  ]

  const txn = algosdk.makeApplicationCallTxnFromObject({
    sender: account.addr,
    appIndex: appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    appArgs: appArgsList,
    foreignAssets: [USDC_ASSET_ID],
    suggestedParams: params,
  })

  const signedTxn = txn.signTxn(account.sk)
  const { txid } = await algodClient.sendRawTransaction(signedTxn).do()
  await algosdk.waitForConfirmation(algodClient, txid, 4)
  return txid
}

/**
 * Write a reputation note to Algorand
 */
export async function writeReputationNote(
  wallet: string,
  outcome: string,
  value: number,
  dealId: string
): Promise<void> {
  try {
    const account = getPlatformWallet()
    const params = await algodClient.getTransactionParams().do()
    const note = JSON.stringify({
      wallet,
      outcome,
      value,
      dealId,
      ts: Math.floor(Date.now() / 1000),
    })

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: account.addr,
      amount: 0,
      note: new TextEncoder().encode(`TradeVault:rep:${note}`),
      suggestedParams: params,
    })

    const signedTxn = txn.signTxn(account.sk)
    await algodClient.sendRawTransaction(signedTxn).do()
  } catch (error) {
    console.error('Error writing reputation note:', error)
  }
}
