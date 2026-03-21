export function StatsSection() {
  return (
    <section className="bg-[#0A2540] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <dl className="grid grid-cols-1 gap-y-16 lg:grid-cols-3 gap-x-8 text-center lg:text-left">
            <div className="flex flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-300">trade finance gap</dt>
              <dd className="order-first text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                $5.2T
              </dd>
            </div>
            <div className="flex flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-300">per transaction</dt>
              <dd className="order-first text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                0.001¢
              </dd>
            </div>
            <div className="flex flex-col gap-y-4">
              <dt className="text-base leading-7 text-slate-300">to release</dt>
              <dd className="order-first text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                4 seconds
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
