import { Link } from "wouter";
import { Calculator } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Grant<span className="text-primary">Mortgage</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Providing powerful, accurate, and easy-to-use financial tools to help you make informed decisions about your home buying journey.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Calculators</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mortgage-calculator" className="text-muted-foreground hover:text-primary transition-colors">Mortgage Payment</Link>
              </li>
              <li>
                <Link href="/affordability-calculator" className="text-muted-foreground hover:text-primary transition-colors">Home Affordability</Link>
              </li>
              <li>
                <Link href="/refinance-calculator" className="text-muted-foreground hover:text-primary transition-colors">Refinance</Link>
              </li>
              <li>
                <Link href="/amortization-calculator" className="text-muted-foreground hover:text-primary transition-colors">Amortization Schedule</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Current Rates</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Home Buying Guide</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GrantMortgage Calculators. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center md:text-right max-w-lg">
            Calculations are estimates for illustrative purposes only. Actual rates and payments may vary based on your specific situation.
          </p>
        </div>
      </div>
    </footer>
  );
}
