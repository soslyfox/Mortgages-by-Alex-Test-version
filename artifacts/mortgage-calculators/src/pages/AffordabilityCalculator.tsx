import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function AffordabilityCalculator() {
  const [annualIncome, setAnnualIncome] = useState<number>(100000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(500); // car loans, student loans, credit cards
  const [downPayment, setDownPayment] = useState<number>(40000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [dtiTarget, setDtiTarget] = useState<number>(0.36); // Conservative 36% DTI

  const calculations = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    
    // Max allowable monthly payment for housing based on DTI
    const maxTotalMonthlyDebt = monthlyIncome * dtiTarget;
    const maxMonthlyHousingPayment = Math.max(0, maxTotalMonthlyDebt - monthlyDebts);
    
    // Assume property taxes are roughly 1.2% annually, Insurance 0.5% annually
    // This is a simplification to back-calculate loan amount
    const monthlyInterestRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Mortgage factor: Payment = Loan * factor
    let mortgageFactor = 0;
    if (monthlyInterestRate > 0) {
      mortgageFactor = (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                       (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
      mortgageFactor = 1 / numberOfPayments;
    }

    // Rough estimation factors per $1 of loan/price
    // Assuming taxes+insurance roughly scales with price. 
    // Let's estimate taxes+ins = 1.7% of price annually -> 0.14% monthly
    const taxInsFactor = 0.017 / 12; 
    
    // We want: maxMonthlyHousingPayment = (Price - Down) * mortgageFactor + Price * taxInsFactor
    // maxMonthlyHousingPayment = Price * mortgageFactor - Down * mortgageFactor + Price * taxInsFactor
    // maxMonthlyHousingPayment + Down * mortgageFactor = Price * (mortgageFactor + taxInsFactor)
    
    let maxHomePrice = 0;
    if (mortgageFactor + taxInsFactor > 0) {
      maxHomePrice = (maxMonthlyHousingPayment + (downPayment * mortgageFactor)) / (mortgageFactor + taxInsFactor);
    }

    const loanAmount = Math.max(0, maxHomePrice - downPayment);
    const estimatedPITI = maxMonthlyHousingPayment; // Principal, Interest, Taxes, Insurance
    
    const currentDti = ((monthlyDebts + maxMonthlyHousingPayment) / monthlyIncome) * 100;

    return {
      maxHomePrice,
      loanAmount,
      maxMonthlyHousingPayment,
      currentDti,
      monthlyIncome
    };
  }, [annualIncome, monthlyDebts, downPayment, interestRate, loanTerm, dtiTarget]);

  return (
    <AppLayout>
      <div className="bg-emerald-500/5 py-8 md:py-12 border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/20 text-emerald-600 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Home Affordability</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">
            See how much house you can afford based on your income, debts, and comfortable debt-to-income ratio.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-col-reverse lg:flex-row">
          
          <div className="lg:col-span-5 order-first lg:order-last">
            <motion.div 
              className="sticky top-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-xl border-emerald-500/20 bg-card overflow-hidden">
                <div className="bg-emerald-500/10 p-8 text-center border-b border-border/50">
                  <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-300 mb-2">You can afford a home up to</h3>
                  <div className="text-5xl md:text-6xl font-display font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(calculations.maxHomePrice)}
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Monthly Payment</span>
                      <span className="font-bold">{formatCurrency(calculations.maxMonthlyHousingPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Loan Amount</span>
                      <span className="font-bold">{formatCurrency(calculations.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Down Payment</span>
                      <span className="font-bold">{formatCurrency(downPayment)}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium">Debt-to-Income (DTI)</span>
                      <span className="text-sm font-bold">{calculations.currentDti.toFixed(1)}%</span>
                    </div>
                    <Progress value={calculations.currentDti} className="h-2 bg-muted" indicatorClassName={calculations.currentDti > 43 ? "bg-destructive" : calculations.currentDti > 36 ? "bg-orange-500" : "bg-emerald-500"} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Lenders typically prefer a DTI under 36%, though some allow up to 43% or higher.
                    </p>
                  </div>
                  
                  {dtiTarget > 0.36 && (
                    <div className="p-4 bg-orange-500/10 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Using an aggressive DTI ratio. This means a larger portion of your income goes to debt, which leaves less room for emergencies.
                      </p>
                    </div>
                  )}
                  {dtiTarget <= 0.36 && (
                    <div className="p-4 bg-emerald-500/10 rounded-xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        You're using a conservative DTI. This is a safe approach that leaves healthy room in your budget for other expenses.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Profile</CardTitle>
                <CardDescription>Enter your income and current debts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Annual Gross Income (Before Taxes)</Label>
                  <InputWithAddon 
                    type="number"
                    addonLeft="$"
                    value={annualIncome.toString()}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="font-semibold text-lg"
                  />
                  <p className="text-xs text-muted-foreground">Monthly: {formatCurrency(calculations.monthlyIncome)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Debts</Label>
                  <InputWithAddon 
                    type="number"
                    addonLeft="$"
                    value={monthlyDebts.toString()}
                    onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Include car loans, student loans, minimum credit card payments. Do not include current rent/utilities.</p>
                </div>
                <div className="space-y-2 pt-2">
                  <Label>Available Down Payment</Label>
                  <InputWithAddon 
                    type="number"
                    addonLeft="$"
                    value={downPayment.toString()}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Assumptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Interest Rate</Label>
                    <InputWithAddon 
                      type="number"
                      addonRight="%"
                      value={interestRate.toString()}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      step="0.125"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Loan Term</Label>
                    <Select value={loanTerm.toString()} onValueChange={(v) => setLoanTerm(Number(v))}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Years Fixed</SelectItem>
                        <SelectItem value="15">15 Years Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Aggressiveness (DTI Target)</Label>
                    <Select value={dtiTarget.toString()} onValueChange={(v) => setDtiTarget(Number(v))}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.28">Conservative (28% DTI)</SelectItem>
                        <SelectItem value="0.36">Moderate (36% DTI) - Recommended</SelectItem>
                        <SelectItem value="0.43">Aggressive (43% DTI) - Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
