import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#003d2b] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}images/alex.png`}
                alt="Alex"
                className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
              />
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Mortgages <span className="text-green-300">by Alex</span>
              </span>
            </Link>
            <p className="text-white/65 text-sm max-w-md">
              Providing powerful, accurate, and easy-to-use financial tools to help you make informed decisions about your home buying journey.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Calculators</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mortgage-calculator" className="text-white/60 hover:text-green-300 transition-colors">Mortgage Payment</Link>
              </li>
              <li>
                <Link href="/affordability-calculator" className="text-white/60 hover:text-green-300 transition-colors">Home Affordability</Link>
              </li>
              <li>
                <Link href="/refinance-calculator" className="text-white/60 hover:text-green-300 transition-colors">Refinance</Link>
              </li>
              <li>
                <Link href="/amortization-calculator" className="text-white/60 hover:text-green-300 transition-colors">Amortization Schedule</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/60 hover:text-green-300 transition-colors">Current Rates</a></li>
              <li><a href="#" className="text-white/60 hover:text-green-300 transition-colors">Home Buying Guide</a></li>
              <li><a href="#" className="text-white/60 hover:text-green-300 transition-colors">Contact Alex</a></li>
              <li><a href="#" className="text-white/60 hover:text-green-300 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Mortgages by Alex. All rights reserved.
          </p>
          <p className="text-xs text-white/50 text-center md:text-right max-w-lg">
            Calculations are estimates for illustrative purposes only. Actual rates and payments may vary based on your specific situation.
          </p>
        </div>
      </div>
    </footer>
  );
}
