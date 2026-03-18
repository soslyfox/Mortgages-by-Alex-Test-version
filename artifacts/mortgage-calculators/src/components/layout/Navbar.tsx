import { Link, useLocation } from "wouter";
import { Menu, X, ChevronRight } from "lucide-react";
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#003d2b] text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
              <img
                src={`${import.meta.env.BASE_URL}images/alex.png`}
                alt="Alex"
                className="h-9 w-9 rounded-full object-cover border-2 border-white/30"
              />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Mortgages <span className="text-green-300">by Alex</span>
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
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" className="hidden lg:flex border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white">
              Current Rates
            </Button>
            <Button className="bg-white text-[#003d2b] hover:bg-green-50 font-semibold">
              Get Pre-Approved
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none"
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
          "md:hidden absolute w-full bg-[#003d2b] border-b border-white/10 transition-all duration-300 ease-in-out shadow-lg",
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
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.name}
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <Button variant="outline" className="w-full justify-center border-white/30 text-white bg-transparent hover:bg-white/10">
              Current Rates
            </Button>
            <Button className="w-full justify-center bg-white text-[#003d2b] hover:bg-green-50 font-semibold">
              Get Pre-Approved
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
