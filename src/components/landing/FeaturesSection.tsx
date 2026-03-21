import { Lock, Shuffle, ShieldCheck } from "lucide-react";

const features = [
  {
    name: "Funds locked instantly",
    description: "Buyer payments are securely held in escrow the moment a trade is agreed upon.",
    icon: Lock,
  },
  {
    name: "Auto-release on delivery",
    description: "Courier API hooks ensure funds are released to the seller the moment goods are signed for.",
    icon: Shuffle,
  },
  {
    name: "Built-in dispute protection",
    description: "If an issue arises, the escrow remains locked until a resolution is reached.",
    icon: ShieldCheck,
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col bg-white p-8 rounded-2xl shadow-sm ring-1 ring-slate-200/50">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-[#0A2540]">
                <feature.icon className="h-6 w-6 flex-none text-[#4ADE80]" aria-hidden="true" />
                {feature.name}
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                <p className="flex-auto">{feature.description}</p>
              </dd>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
