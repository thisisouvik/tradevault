import HoverGradientNavBar from '@/components/ui/hover-gradient-nav-bar'
import { Footer } from '@/components/landing/Footer'
import { Zap, Coins, ShieldCheck, Cpu } from 'lucide-react'

const reasons = [
  {
    icon: Zap,
    title: "Instant Finality in < 4 Seconds",
    description: "Unlike Bitcoin or Ethereum where transactions can take minutes or even hours to be officially 'final', Algorand settles trades in under 4 seconds. Once a buyer hits confirm, the seller receives their USDC instantly without waiting for network confirmations.",
    color: "#05445E"
  },
  {
    icon: Coins,
    title: "Micro-cent Transaction Fees",
    description: "Cross-border bank wire transfers can cost anywhere from $15 to $50. On Algorand, every single smart contract interaction and USDC transfer costs exactly 0.001 ALGO (less than a fraction of a penny). We pass these massive savings entirely to you.",
    color: "#189AB4"
  },
  {
    icon: ShieldCheck,
    title: "Native USDC Integration",
    description: "USDC isn't bridged or wrapped in complex layers on Algorand—it is a natively supported Algorand Standard Asset (ASA 10458941). This means absolutely zero slippage, zero bridging hacks, and 100% stable fiat value for all your trades.",
    color: "#0EA5E9"
  },
  {
    icon: Cpu,
    title: "Turing-Complete Smart Contracts",
    description: "Our escrow logic runs directly on the Algorand Virtual Machine (AVM). It enforce atomic transfers, meaning the buyer's funds aren't released unless the smart contract's immutable logic verifies the conditions are met. It's mathematically guaranteed security.",
    color: "#8B5CF6"
  }
]

export default function WhyAlgorandPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <HoverGradientNavBar />
      
      {/* Hero Section */}
      <section className="bg-[#D6EFF9] pt-32 pb-24 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wide mb-6 bg-[#189AB4]/10 border border-[#189AB4]/20 text-[#05445E]">
            TECHNOLOGY
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#05445E] leading-tight mb-6 tracking-tight">
            Why we built TradeVault on <span className="text-[#189AB4]">Algorand.</span>
          </h1>
          <p className="text-[#3a7fa0] text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            International trade requires speed, rock-solid security, and near-zero fees. We chose the only blockchain engineered specifically to solve the blockchain trilemma.
          </p>
        </div>
      </section>

      {/* Content Grid */}
      <section className="py-24 bg-[#EAF6FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div key={index} className="bg-white rounded-3xl p-10 border border-[#189AB4]/15 shadow-sm hover:shadow-[0_15px_40px_-10px_rgba(24,154,180,0.15)] transition-all">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
                    style={{ backgroundColor: `${reason.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: reason.color }} strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#05445E] mb-4">
                    {reason.title}
                  </h3>
                  <p className="text-[#3a7fa0] leading-relaxed text-[15px] font-medium">
                    {reason.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
