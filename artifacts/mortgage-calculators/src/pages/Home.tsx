import { Link } from "wouter";
import { Calculator, Home as HomeIcon, PieChart, RefreshCw, ArrowRight, Star, Shield, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();

  const calculators = [
    { title: t.home.calc1Title, description: t.home.calc1Desc, icon: <Calculator className="h-6 w-6" />, path: "/mortgage-calculator" },
    { title: t.home.calc2Title, description: t.home.calc2Desc, icon: <HomeIcon className="h-6 w-6" />,  path: "/affordability-calculator" },
    { title: t.home.calc3Title, description: t.home.calc3Desc, icon: <RefreshCw className="h-6 w-6" />, path: "/refinance-calculator" },
    { title: t.home.calc4Title, description: t.home.calc4Desc, icon: <PieChart className="h-6 w-6" />,  path: "/amortization-calculator" },
  ];

  const trustPoints = [
    { icon: <Star className="h-5 w-5" />,   label: t.home.trust1Label, desc: t.home.trust1Desc },
    { icon: <Shield className="h-5 w-5" />, label: t.home.trust2Label, desc: t.home.trust2Desc },
    { icon: <Clock className="h-5 w-5" />,  label: t.home.trust3Label, desc: t.home.trust3Desc },
  ];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#003d2b] pt-16 pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-0">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 text-center lg:text-left pb-12 lg:pb-20 pt-4"
            >
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-green-200 mb-6">
                <span className="flex h-2 w-2 rounded-full bg-green-300 mr-2"></span>
                {t.home.badge} {new Date().toLocaleString(language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })}
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
                {t.home.heroTitle1} <br className="hidden md:block"/>
                <span className="text-green-300">{t.home.heroTitle2}</span>
              </h1>
              <p className="text-lg text-white/70 mb-10 max-w-xl">
                {t.home.heroDesc}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link href="/mortgage-calculator">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#003d2b] hover:bg-green-50 font-semibold text-base h-12 px-8 rounded-xl shadow-lg">
                    {t.home.ctaCalculate} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/affordability-calculator">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white bg-transparent hover:bg-white/10 text-base h-12 px-8 rounded-xl">
                    {t.home.ctaAffordability}
                  </Button>
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                {trustPoints.map((tp) => (
                  <div key={tp.label} className="flex items-center gap-2 text-white/80">
                    <span className="text-green-300">{tp.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{tp.label}</p>
                      <p className="text-xs text-white/55">{tp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Alex's photo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-shrink-0 lg:self-end"
            >
              <div className="relative">
                <img
                  src={`${import.meta.env.BASE_URL}images/alex.png`}
                  alt="Alex"
                  className="w-64 sm:w-72 lg:w-80 xl:w-96 object-cover object-top rounded-t-2xl"
                />
                <div className="absolute -left-6 bottom-12 bg-white rounded-xl shadow-xl px-4 py-3 text-sm">
                  <p className="font-bold text-[#003d2b]">{t.home.familiesHelped}</p>
                  <p className="text-muted-foreground text-xs">{t.home.familiesRegion}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="hsl(152, 30%, 98%)" />
          </svg>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">{t.home.sectionTitle}</h2>
            <p className="text-muted-foreground">{t.home.sectionDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {calculators.map((calc, i) => (
              <motion.div
                key={calc.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={calc.path}>
                  <Card className="h-full cursor-pointer hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 bg-card group">
                    <CardHeader>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 bg-primary/10 text-primary")}>
                        {calc.icon}
                      </div>
                      <CardTitle className="text-xl">{calc.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm md:text-base">{calc.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Alex */}
      <section className="py-16 md:py-24 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src={`${import.meta.env.BASE_URL}images/alex.png`}
                    alt="Alex"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Timeline badges */}
                <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg px-4 py-3 text-sm border border-border/30">
                  <p className="font-bold text-[#003d2b] text-base">2024</p>
                  <p className="text-muted-foreground text-xs">{t.home.timeline2024}</p>
                </div>
              </div>
            </motion.div>

            {/* Story */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">{t.home.aboutTitle}</h2>
              <p className="text-muted-foreground leading-relaxed">{t.home.aboutP1}</p>
              <p className="text-muted-foreground leading-relaxed">{t.home.aboutP2}</p>
              <p className="text-foreground font-medium leading-relaxed">{t.home.aboutP3}</p>

              {/* Mini timeline */}
              <div className="pt-4 space-y-4 border-t border-border/50">
                {[
                  { year: '2022', label: t.home.timeline2022, desc: t.home.timeline2022desc },
                  { year: '2023', label: t.home.timeline2023, desc: t.home.timeline2023desc },
                  { year: '2024', label: t.home.timeline2024, desc: t.home.timeline2024desc },
                ].map((item) => (
                  <div key={item.year} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#003d2b] text-white flex items-center justify-center text-sm font-bold">
                      {item.year}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#003d2b] relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center gap-10">
          <img
            src={`${import.meta.env.BASE_URL}images/alex.png`}
            alt="Alex"
            className="w-36 h-36 rounded-full object-cover object-top border-4 border-white/20 shadow-2xl flex-shrink-0"
          />
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-display font-bold text-white mb-4">{t.home.ctaTitle}</h2>
            <p className="text-white/70 mb-6 max-w-xl">{t.home.ctaDesc}</p>
            <a href="https://calendly.com/garinalek/60-minute-call" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-white text-[#003d2b] hover:bg-green-50 font-semibold rounded-xl px-8 h-12 shadow-lg">
                {t.home.ctaBtn}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
