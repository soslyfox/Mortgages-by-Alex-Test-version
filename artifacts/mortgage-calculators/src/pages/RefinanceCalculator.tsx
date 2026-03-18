import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingDown, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RefinanceCalculator() {
  const [currentBalance, setCurrentBalance] = useState<number>(300000);
  const [currentRate, setCurrentRate] = useState<number>(7.5);
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState<number>(2200); // P&I only ideally
  
  const [newRate, setNewRate] = useState<number>(5.5);
  const [newTerm, setNewTerm] = useState<number>(30);
  const [closingCosts, setClosingCosts] = useState<number>(4500);

  const calculations = useMemo(() => {
    // Calculate new monthly payment (P&I)
    const monthlyInterestRate = (newRate / 100) / 12;
    const numberOfPayments = newTerm * 12;
    
    let newMonthlyPayment = 0;
    if (monthlyInterestRate > 0) {
      newMonthlyPayment = currentBalance * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
      newMonthlyPayment = currentBalance / numberOfPayments;
    }

    const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
    
    // Break even point in months
    let breakEvenMonths = 0;
    if (monthlySavings > 0) {
      breakEvenMonths = Math.ceil(closingCosts / monthlySavings);
    }

    // Total savings over life of new loan (simplified, comparing payments remaining vs new payments)
    // To be perfectly accurate we'd need remaining term of OLD loan, but users rarely know it exactly.
    // We'll calculate simple cost of new loan vs old payment * new term (rough proxy)
    // Let's assume they had X months left on old loan. 
    
    // More accurate: compare total cost of new loan vs continuing old loan until paid off.
    // Total interest old loan = (currentPayment * remainingMonths) - currentBalance
    // Remaining months can be derived:
    // This is mathematically complex to inverse reliably without a solver, so we approximate
    // Or ask for remaining term. Let's just ask for remaining term to be precise.
    // Let's just compare monthly savings for now as primary metric.

    return {
      newMonthlyPayment,
      monthlySavings,
      breakEvenMonths,
      shouldRefinance: monthlySavings > 0 && breakEvenMonths < 60 // Good if break even is < 5 years
    };
  }, [currentBalance, currentRate, currentMonthlyPayment, newRate, newTerm, closingCosts]);

  return (
    <AppLayout>
      <div className="bg-purple-500/5 py-8 md:py-12 border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 text-purple-600 rounded-lg">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Refinance Calculator</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Find out if refinancing makes sense. Calculate your new monthly payment, savings, and how long it takes to break even on closing costs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full border-border/50">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center">
                <TrendingDown className="w-8 h-8 text-primary mb-3" />
                <p className="text-muted-foreground font-medium mb-1">Monthly Savings</p>
                <h3 className={`text-4xl font-display font-bold ${calculations.monthlySavings > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                  {calculations.monthlySavings > 0 ? formatCurrency(calculations.monthlySavings) : "$0"}
                </h3>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border-border/50">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center">
                <Clock className="w-8 h-8 text-purple-600 mb-3" />
                <p className="text-muted-foreground font-medium mb-1">Break-even Point</p>
                <h3 className="text-4xl font-display font-bold text-foreground">
                  {calculations.breakEvenMonths > 0 ? `${calculations.breakEvenMonths} mo` : "Never"}
                </h3>
                {calculations.breakEvenMonths > 0 && <p className="text-xs text-muted-foreground mt-1">({(calculations.breakEvenMonths/12).toFixed(1)} years)</p>}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className={`h-full border-2 ${calculations.shouldRefinance ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border/50'}`}>
              <CardContent className="p-6 flex flex-col items-center text-center justify-center">
                {calculations.shouldRefinance ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-3" />
                    <p className="text-muted-foreground font-medium mb-1">Verdict</p>
                    <h3 className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-400">Refinance Makes Sense</h3>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium mb-1">Verdict</p>
                    <h3 className="text-xl font-display font-bold text-foreground">Might Not Be Worth It</h3>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>Current Loan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Remaining Balance</Label>
                <InputWithAddon 
                  type="number"
                  addonLeft="$"
                  value={currentBalance.toString()}
                  onChange={(e) => setCurrentBalance(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Interest Rate</Label>
                <InputWithAddon 
                  type="number"
                  addonRight="%"
                  step="0.125"
                  value={currentRate.toString()}
                  onChange={(e) => setCurrentRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Monthly Payment (P&I only)</Label>
                <InputWithAddon 
                  type="number"
                  addonLeft="$"
                  value={currentMonthlyPayment.toString()}
                  onChange={(e) => setCurrentMonthlyPayment(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-primary text-xl">New Loan Option</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>New Interest Rate</Label>
                <InputWithAddon 
                  type="number"
                  addonRight="%"
                  step="0.125"
                  value={newRate.toString()}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="font-bold text-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>New Loan Term</Label>
                <Select value={newTerm.toString()} onValueChange={(v) => setNewTerm(Number(v))}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Years Fixed</SelectItem>
                    <SelectItem value="20">20 Years Fixed</SelectItem>
                    <SelectItem value="15">15 Years Fixed</SelectItem>
                    <SelectItem value="10">10 Years Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Closing Costs</Label>
                <InputWithAddon 
                  type="number"
                  addonLeft="$"
                  value={closingCosts.toString()}
                  onChange={(e) => setClosingCosts(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Typically 2-5% of the loan amount.</p>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50 bg-muted/20 -mx-6 -mb-6 p-6 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">New Monthly Payment:</span>
                  <span className="text-2xl font-display font-bold">{formatCurrency(calculations.newMonthlyPayment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
