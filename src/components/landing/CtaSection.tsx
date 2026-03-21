import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-white py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-[#0A2540] sm:text-4xl">
              Start your first trade in 5 minutes
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Join the future of global B2B commerce. Paxvault works out-of-the-box with your existing workflow and logistics providers.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Button size="lg" className="rounded-full text-base font-semibold px-8 py-6">
                Create free account
              </Button>
            </div>
          </div>
          
          <div className="relative isolate px-6 lg:px-8">
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
              <div 
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#4ADE80] to-[#0A2540] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
                style={{
                  clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
                }}
              />
            </div>
            
            <Card className="max-w-md mx-auto shadow-2xl ring-1 ring-slate-900/5 rotate-2 md:rotate-3">
              <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Escrow Active</span>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-sm font-medium text-slate-500">Locked Amount</span>
                    <div className="mt-1 text-4xl font-bold tracking-tight text-[#0A2540]">
                      24,500 <span className="text-xl font-medium text-slate-400">USDC</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500">Counterparty</span>
                    <div className="mt-1 text-lg font-medium text-[#0A2540]">
                      Acme Logistics Inc.
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 pt-4 border-t">
                <Button className="w-full text-base py-6" size="lg">Confirm receipt</Button>
              </CardFooter>
            </Card>
          </div>
          
        </div>
      </div>
    </section>
  );
}
