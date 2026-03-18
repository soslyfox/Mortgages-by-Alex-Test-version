import { Link } from "wouter";
import { Calculator, Home as HomeIcon, PieChart, RefreshCw, ArrowRight } from "lucide-react";
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
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  {
    title: "Home Affordability",
    description: "Find out how much house you can afford based on your income and debts.",
    icon: <HomeIcon className="h-6 w-6" />,
    path: "/affordability-calculator",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  },
  {
    title: "Refinance Savings",
    description: "See if refinancing your current mortgage makes financial sense right now.",
    icon: <RefreshCw className="h-6 w-6" />,
    path: "/refinance-calculator",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
  },
  {
    title: "Amortization Schedule",
    description: "View a complete breakdown of your loan payoff schedule over time.",
    icon: <PieChart className="h-6 w-6" />,
    path: "/amortization-calculator",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
  }
];

export default function Home() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 z-0">
          {/* Abstract background image from requirements.yaml */}
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-modern-finance.png`} 
            alt="Modern Financial Background" 
            className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Updated rates for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-6">
              Smarter tools for your <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">home buying journey</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Make confident financial decisions with our suite of professional, highly accurate mortgage calculators. Free, fast, and secure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/mortgage-calculator">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all">
                  Calculate Mortgage <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/affordability-calculator">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8 rounded-xl bg-background/50 backdrop-blur-sm">
                  Check Affordability
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Everything you need to plan</h2>
            <p className="text-muted-foreground">
              Whether you're buying your first home, looking to refinance, or just curious about the math, we have the right tool for you.
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
                  <Card className="h-full cursor-pointer hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 bg-card group">
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
      
      {/* Mini CTA */}
      <section className="py-20 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
          <h2 className="text-3xl font-display font-bold mb-6">Ready to take the next step?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get pre-approved in minutes and see exactly what you qualify for with actual market rates.
          </p>
          <Button size="lg" className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20">
            Start Pre-Approval Process
          </Button>
        </div>
      </section>
    </AppLayout>
  );
}
