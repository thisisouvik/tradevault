import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32 sm:pt-32 sm:pb-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-[#0A2540] sm:text-7xl">
          Get paid. Every time.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
          Paxvault locks buyer funds before shipment and releases them automatically on delivery — no bank, no paperwork, no risk.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg" className="rounded-full text-base font-semibold px-8 py-6">
            Start your first trade
          </Button>
          <Button variant="ghost" size="lg" className="rounded-full text-base font-semibold px-8 py-6 text-[#0A2540]">
            Contact sales <span aria-hidden="true" className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
