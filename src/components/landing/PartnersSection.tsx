export function PartnersSection() {
  return (
    <section className="bg-slate-50 py-12 border-t border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-widest">
          Trusted by global logistics leaders
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 lg:gap-x-24 items-center">
          <div className="text-2xl font-black text-slate-300 italic tracking-tighter">DHL</div>
          <div className="text-2xl font-bold text-slate-300 tracking-tight">FedEx</div>
          <div className="text-2xl font-bold text-slate-300">aramex</div>
          <div className="text-2xl font-bold text-slate-300 italic">BlueDart</div>
        </div>
      </div>
    </section>
  );
}
