export function FooterSection() {
  return (
    <footer className="bg-[#050D1A] py-16 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-800 pb-12 mb-8">
          
          <div>
            <div className="font-extrabold text-2xl tracking-tighter text-white mb-2">
              TradeVault
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Products</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Benefits</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Stay in Touch</h4>
            <div className="flex bg-[#0A1A2F] rounded-lg border border-[#1A3163] overflow-hidden focus-within:ring-1 focus-within:ring-[#4ADE80]">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent px-4 py-3 outline-none text-white w-full placeholder:text-slate-600 text-sm" 
              />
              <button className="bg-[#DDF2FD] text-[#05445E] px-5 font-bold hover:bg-white transition-colors text-sm">
                Submit
              </button>
            </div>
          </div>
          
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center text-xs gap-4">
          <p>&copy; 2026 TradeVault. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

