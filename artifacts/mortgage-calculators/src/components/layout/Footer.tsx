import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { SOCIALS } from "@/components/layout/Navbar";

export function Footer() {
  const { t, language } = useLanguage();
  const [location, navigate] = useLocation();
  const guideUrl = language === 'uk'
    ? '/home-buyers-guide-uk.pdf'
    : '/home-buyers-guide-en.pdf';

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const doScroll = () =>
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
    if (location === '/') {
      doScroll();
    } else {
      navigate('/');
      // Wait for the home page to render, then scroll
      setTimeout(doScroll, 150);
    }
  };

  return (
    <footer className="bg-[#003d2b] text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Mortgages <span className="text-green-300">by Alex</span>
              </span>
            </Link>
            <p className="text-white/65 text-sm max-w-md">{t.footer.desc}</p>
            {/* Social icons */}
            <div className="flex gap-2 pt-1">
              {SOCIALS.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-white/20 text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t.footer.calculators}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/mortgage-calculator" className="text-white/60 hover:text-green-300 transition-colors">{t.footer.mortgagePayment}</Link></li>
              <li><Link href="/affordability-calculator" className="text-white/60 hover:text-green-300 transition-colors">{t.footer.homeAffordability}</Link></li>
              <li><Link href="/refinance-calculator" className="text-white/60 hover:text-green-300 transition-colors">{t.footer.refinance}</Link></li>
              <li><Link href="/amortization-calculator" className="text-white/60 hover:text-green-300 transition-colors">{t.footer.amortization}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{t.footer.resources}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href={guideUrl} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-green-300 transition-colors">{t.footer.buyingGuide}</a></li>
              <li><a href="/#contact-form" onClick={scrollToContact} className="text-white/60 hover:text-green-300 transition-colors cursor-pointer">{t.footer.contactAlex}</a></li>
              <li><a href="#" className="text-white/60 hover:text-green-300 transition-colors">{t.footer.privacy}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 space-y-3">
          <p className="text-xs text-white/60 font-medium">
            Alex Harin &nbsp;|&nbsp; BRX Mortgage &nbsp;|&nbsp; Ontario Mortgage Agent License&nbsp;#M24003304
          </p>
          <div className="grid gap-2 md:grid-cols-[auto,minmax(0,1fr)] md:items-start">
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} Mortgages by Alex. {t.footer.copyright}
            </p>
            <p className="text-xs text-white/50 text-left md:text-right md:justify-self-end max-w-lg">
              {t.footer.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
