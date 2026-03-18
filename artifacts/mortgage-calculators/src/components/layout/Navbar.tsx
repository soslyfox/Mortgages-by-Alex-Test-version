import { Link, useLocation } from "wouter";
import { Calculator, Menu, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Mortgage", path: "/mortgage-calculator" },
  { name: "Affordability", path: "/affordability-calculator" },
  { name: "Refinance", path: "/refinance-calculator" },
  { name: "Amortization", path: "/amortization-calculator" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Grant<span className="text-primary">Mortgage</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    location === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" className="hidden lg:flex">Current Rates</Button>
            <Button>Get Pre-Approved</Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        className={cn(
          "md:hidden absolute w-full bg-background border-b border-border transition-all duration-300 ease-in-out shadow-lg",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible h-0 overflow-hidden"
        )}
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-3 text-base font-medium",
                location === link.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.name}
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-center">Current Rates</Button>
            <Button className="w-full justify-center">Get Pre-Approved</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
