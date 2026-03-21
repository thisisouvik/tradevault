export function HowItWorksSection() {
  return (
    <section className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-[#4ADE80]">How it works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#0A2540] sm:text-4xl">
            A frictionless flow
          </p>
        </div>
        
        <div className="relative mx-auto max-w-5xl">
          {/* Connecting line for desktop */}
          <div className="absolute top-12 left-0 w-full h-0.5 border-t-2 border-dashed border-slate-200 hidden md:block" />
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 relative">
            <div className="relative flex flex-col items-center text-center">
              <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
                <span className="text-2xl font-bold text-[#0A2540]">1</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0A2540]">Buyer locks funds</h3>
              <p className="mt-2 text-sm text-slate-600">The agreed amount is safely placed into the Paxvault escrow.</p>
            </div>
            
            <div className="relative flex flex-col items-center text-center">
              <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
                <span className="text-2xl font-bold text-[#0A2540]">2</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0A2540]">Seller ships</h3>
              <p className="mt-2 text-sm text-slate-600">With funds verified, the seller dispatches the goods through a linked courier.</p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
                <span className="text-2xl font-bold text-[#0A2540]">3</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#0A2540]">Money releases</h3>
              <p className="mt-2 text-sm text-slate-600">Upon confirmed delivery, funds unlock automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
