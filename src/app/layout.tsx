import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'TradeVault — Trustless Trade on Algorand',
    template: '%s | TradeVault',
  },
  description:
    'Replace a $240 bank letter of credit with a $0.002 Algorand smart contract. Trade cross-border with zero trust required — the contract holds the money.',
  keywords: ['escrow', 'algorand', 'blockchain', 'trade', 'USDC', 'DeFi', 'smart contract'],
  openGraph: {
    title: 'TradeVault — Trustless Trade on Algorand',
    description: 'Decentralized escrow for cross-border trade. No banks. No middlemen.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F0F2F5] text-[#6B7280]">
        {children}
      </body>
    </html>
  )
}
