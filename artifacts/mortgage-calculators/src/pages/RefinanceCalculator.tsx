import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingDown, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RefinanceCalculator() {
  const { t } = useLanguage();
  const [currentBalance, setCurrentBalance] = useState<number>(300000);
  const [currentRate, setCurrentRate] = useState<number>(7.5);
  const [currentMonthlyPayment, setCurrentMonthlyPayment] = useState<number>(2200);
  const [newRate, setNewRate] = useState<number>(5.5);
  const [newTerm, setNewTerm] = useState<number>(30);
  const [closingCosts, setClosingCosts] = useState<number>(4500);

  const calculations = useMemo(() => {
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
    let breakEvenMonths = 0;
    if (monthlySavings > 0) {
      breakEvenMonths = Math.ceil(closingCosts / monthlySavings);
    }
    return {
      newMonthlyPayment,
      monthlySavings,
      breakEvenMonths,
      shouldRefinance: monthlySavings > 0 && breakEvenMonths < 60
    };
  }, [currentBalance, currentRate, currentMonthlyPayment, newRate, newTerm, closingCosts]);

  return (
    <AppLayout>
      <div className="bg-primary/5 py-8 md:py-12 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{t.refinanceCalc.title}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">{t.refinanceCalc.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full border-border/50">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center">
                <TrendingDown className="w-8 h-8 text-primary mb-3" />
                <p className="text-muted-foreground font-medium mb-1">{t.refinanceCalc.monthlySavings}</p>
                <h3 className={`text-4xl font-display font-bold ${calculations.monthlySavings > 0 ? 'text-primary' : 'text-destructive'}`}>
                  {calculations.monthlySavings > 0 ? formatCurrency(calculations.monthlySavings) : "$0"}
                </h3>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full border-border/50">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center">
                <Clock className="w-8 h-8 text-primary mb-3" />
                <p className="text-muted-foreground font-medium mb-1">{t.refinanceCalc.breakEven}</p>
                <h3 className="text-4xl font-display font-bold text-foreground">
                  {calculations.breakEvenMonths > 0 ? `${calculations.breakEvenMonths} ${t.refinanceCalc.mo}` : t.refinanceCalc.never}
                </h3>
                {calculations.breakEvenMonths > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">({(calculations.breakEvenMonths / 12).toFixed(1)} {t.refinanceCalc.years})</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className={`h-full border-2 ${calculations.shouldRefinance ? 'border-primary/50 bg-primary/5' : 'border-border/50'}`}>
              <CardContent className="p-6 flex flex-col items-center text-center justify-center">
                {calculations.shouldRefinance ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
                    <p className="text-muted-foreground font-medium mb-1">{t.refinanceCalc.verdict}</p>
                    <h3 className="text-2xl font-display font-bold text-primary">{t.refinanceCalc.worthIt}</h3>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium mb-1">{t.refinanceCalc.verdict}</p>
                    <h3 className="text-xl font-display font-bold text-foreground">{t.refinanceCalc.notWorth}</h3>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>{t.refinanceCalc.currentLoan}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>{t.refinanceCalc.remainingBalance}</Label>
                <InputWithAddon type="number" addonLeft="$" value={currentBalance.toString()} onChange={(e) => setCurrentBalance(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>{t.refinanceCalc.currentRate}</Label>
                <InputWithAddon type="number" addonRight="%" step="0.125" value={currentRate.toString()} onChange={(e) => setCurrentRate(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>{t.refinanceCalc.currentPayment}</Label>
                <InputWithAddon type="number" addonLeft="$" value={currentMonthlyPayment.toString()} onChange={(e) => setCurrentMonthlyPayment(Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-primary text-xl">{t.refinanceCalc.newLoan}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>{t.refinanceCalc.newRate}</Label>
                <InputWithAddon type="number" addonRight="%" step="0.125" value={newRate.toString()} onChange={(e) => setNewRate(Number(e.target.value))} className="font-bold text-primary" />
              </div>
              <div className="space-y-2">
                <Label>{t.refinanceCalc.newTerm}</Label>
                <Select value={newTerm.toString()} onValueChange={(v) => setNewTerm(Number(v))}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t.refinanceCalc.years30}</SelectItem>
                    <SelectItem value="20">{t.refinanceCalc.years20}</SelectItem>
                    <SelectItem value="15">{t.refinanceCalc.years15}</SelectItem>
                    <SelectItem value="10">{t.refinanceCalc.years10}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.refinanceCalc.closingCosts}</Label>
                <InputWithAddon type="number" addonLeft="$" value={closingCosts.toString()} onChange={(e) => setClosingCosts(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground">{t.refinanceCalc.closingCostsNote}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50 bg-muted/20 -mx-6 -mb-6 p-6 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t.refinanceCalc.newMonthlyPayment}</span>
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
