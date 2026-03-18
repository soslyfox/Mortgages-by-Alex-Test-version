import { Link } from "wouter";
import { Calculator, Home as HomeIcon, PieChart, RefreshCw, ArrowRight, Star, Shield, Clock } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const calculators = [
  {
    title: "Mortgage Payment",
    description: "Calculate your monthly payment including principal, interest, taxes, and insurance.",
    icon: <Calculator className="h-6 w-6" />,
    path: "/mortgage-calculator",
    color: "bg-primary/10 text-primary"
  },
  {
    title: "Home Affordability",
    description: "Find out how much house you can afford based on your income and debts.",
    icon: <HomeIcon className="h-6 w-6" />,
    path: "/affordability-calculator",
    color: "bg-primary/10 text-primary"
  },
  {
    title: "Refinance Savings",
    description: "See if refinancing your current mortgage makes financial sense right now.",
    icon: <RefreshCw className="h-6 w-6" />,
    path: "/refinance-calculator",
    color: "bg-primary/10 text-primary"
  },
  {
    title: "Amortization Schedule",
    description: "View a complete breakdown of your loan payoff schedule over time.",
    icon: <PieChart className="h-6 w-6" />,
    path: "/amortization-calculator",
    color: "bg-primary/10 text-primary"
  }
];

const trustPoints = [
  { icon: <Star className="h-5 w-5" />, label: "Top-Rated Advisor", desc: "Hundreds of happy homeowners" },
  { icon: <Shield className="h-5 w-5" />, label: "Licensed & Trusted", desc: "Fully certified mortgage professional" },
  { icon: <Clock className="h-5 w-5" />, label: "Fast Pre-Approvals", desc: "Decisions within 24–48 hours" },
];

export default function Home() {
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
                Updated rates for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
                Your trusted guide <br className="hidden md:block"/>
                <span className="text-green-300">to home financing</span>
              </h1>
              <p className="text-lg text-white/70 mb-10 max-w-xl">
                Hi, I'm Alex. I help families find the right mortgage with honest advice, fast approvals, and free tools to plan your journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link href="/mortgage-calculator">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#003d2b] hover:bg-green-50 font-semibold text-base h-12 px-8 rounded-xl shadow-lg">
                    Calculate My Payment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/affordability-calculator">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white bg-transparent hover:bg-white/10 text-base h-12 px-8 rounded-xl">
                    Check Affordability
                  </Button>
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                {trustPoints.map((t) => (
                  <div key={t.label} className="flex items-center gap-2 text-white/80">
                    <span className="text-green-300">{t.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.label}</p>
                      <p className="text-xs text-white/55">{t.desc}</p>
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
                  alt="Alex — Your Mortgage Advisor"
                  className="w-64 sm:w-72 lg:w-80 xl:w-96 object-cover object-top rounded-t-2xl"
                />
                {/* floating card */}
                <div className="absolute -left-6 bottom-12 bg-white rounded-xl shadow-xl px-4 py-3 text-sm">
                  <p className="font-bold text-[#003d2b]">500+ Families Helped</p>
                  <p className="text-muted-foreground text-xs">Across the region</p>
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
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Free calculators for every step</h2>
            <p className="text-muted-foreground">
              Whether you're buying your first home, looking to refinance, or just running the numbers — these tools give you clarity instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {calculators.map((calc, i) => (
              <motion.div
                key={calc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={calc.path}>
                  <Card className="h-full cursor-pointer hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 bg-card group">
                    <CardHeader>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300", calc.color)}>
                        {calc.icon}
                      </div>
                      <CardTitle className="text-xl">{calc.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm md:text-base">
                        {calc.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Alex / CTA */}
      <section className="py-20 bg-[#003d2b] relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center gap-10">
          <img
            src={`${import.meta.env.BASE_URL}images/alex.png`}
            alt="Alex"
            className="w-36 h-36 rounded-full object-cover object-top border-4 border-white/20 shadow-2xl flex-shrink-0"
          />
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to take the next step?</h2>
            <p className="text-white/70 mb-6 max-w-xl">
              I'll personally walk you through your options and get you pre-approved fast. No pressure, no jargon — just straight answers from someone who cares.
            </p>
            <Button size="lg" className="bg-white text-[#003d2b] hover:bg-green-50 font-semibold rounded-xl px-8 h-12 shadow-lg">
              Talk to Alex Today
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
