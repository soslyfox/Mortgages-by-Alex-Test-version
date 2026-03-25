import { Link, useLocation } from "wouter";
import { Menu, X, ChevronRight, Globe, Send, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SOCIALS = [
  { href: "https://www.facebook.com/garinalek", label: "Facebook", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  )},
  { href: "https://www.instagram.com/oleksii.harin/", label: "Instagram", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )},
  { href: "https://www.tiktok.com/@oleksii.harin", label: "TikTok", icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
  )},
  { href: "https://t.me/garinalek", label: "Telegram", icon: <Send className="w-3.5 h-3.5" /> },
  { href: "mailto:alex@ab-mortgage.ca", label: "Email", icon: <Mail className="w-3.5 h-3.5" /> },
];

const LANGUAGES: { code: Language; label: string; flag: string; short: string }[] = [
  { code: 'uk', label: 'Українська', flag: '🇺🇦', short: 'УКР' },
  { code: 'en', label: 'English',    flag: '🇨🇦', short: 'EN'  },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺', short: 'РУС' },
];

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const navLinks = [
    { name: t.nav.mortgage,      path: "/mortgage-calculator" },
    { name: t.nav.affordability, path: "/affordability-calculator" },
    { name: t.nav.refinance,     path: "/refinance-calculator" },
    { name: t.nav.amortization,  path: "/amortization-calculator" },
  ];

  const currentLang = LANGUAGES.find(l => l.code === language)!;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#003d2b] text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
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
            {/* Social icons */}
            <div className="flex items-center gap-1.5">
              {SOCIALS.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 px-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentLang.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn("cursor-pointer", language === lang.code && "font-semibold bg-primary/10 text-primary")}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="https://calendly.com/garinalek/60-minute-call" target="_blank" rel="noopener noreferrer">
              <Button className="bg-white text-[#003d2b] hover:bg-green-50 font-semibold">
                {t.nav.preApproved}
              </Button>
            </a>
          </div>

          {/* Mobile: lang + menu */}
          <div className="flex md:hidden items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 gap-1 px-2">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={cn("cursor-pointer", language === lang.code && "font-semibold bg-primary/10 text-primary")}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
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
          <div className="pt-4 flex flex-col gap-3">
            {/* Social icons in mobile menu */}
            <div className="flex gap-2 justify-center">
              {SOCIALS.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
            <a href="https://calendly.com/garinalek/60-minute-call" target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className="w-full justify-center bg-white text-[#003d2b] hover:bg-green-50 font-semibold">
                {t.nav.preApproved}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
