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
import { useLanguage } from "@/contexts/LanguageContext";

export default function AffordabilityCalculator() {
  const { t } = useLanguage();
  const [annualIncome, setAnnualIncome] = useState<number>(100000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(500);
  const [downPayment, setDownPayment] = useState<number>(40000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [dtiTarget, setDtiTarget] = useState<number>(0.36);

  const calculations = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    const maxTotalMonthlyDebt = monthlyIncome * dtiTarget;
    const maxMonthlyHousingPayment = Math.max(0, maxTotalMonthlyDebt - monthlyDebts);
    const monthlyInterestRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm * 12;
    let mortgageFactor = 0;
    if (monthlyInterestRate > 0) {
      mortgageFactor = (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
      mortgageFactor = 1 / numberOfPayments;
    }
    const taxInsFactor = 0.017 / 12;
    let maxHomePrice = 0;
    if (mortgageFactor + taxInsFactor > 0) {
      maxHomePrice = (maxMonthlyHousingPayment + (downPayment * mortgageFactor)) / (mortgageFactor + taxInsFactor);
    }
    const loanAmount = Math.max(0, maxHomePrice - downPayment);
    const currentDti = ((monthlyDebts + maxMonthlyHousingPayment) / monthlyIncome) * 100;
    return { maxHomePrice, loanAmount, maxMonthlyHousingPayment, currentDti, monthlyIncome };
  }, [annualIncome, monthlyDebts, downPayment, interestRate, loanTerm, dtiTarget]);

  return (
    <AppLayout>
      <div className="bg-primary/5 py-8 md:py-12 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{t.affordCalc.title}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">{t.affordCalc.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 order-first lg:order-last">
            <motion.div className="sticky top-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
                <div className="bg-primary/10 p-8 text-center border-b border-border/50">
                  <h3 className="text-lg font-medium text-primary mb-2">{t.affordCalc.canAfford}</h3>
                  <div className="text-5xl md:text-6xl font-display font-bold text-primary">
                    {formatCurrency(calculations.maxHomePrice)}
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.estMonthlyPayment}</span>
                      <span className="font-bold">{formatCurrency(calculations.maxMonthlyHousingPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.loanAmount}</span>
                      <span className="font-bold">{formatCurrency(calculations.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.downPayment}</span>
                      <span className="font-bold">{formatCurrency(downPayment)}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium">{t.affordCalc.dtiLabel}</span>
                      <span className="text-sm font-bold">{calculations.currentDti.toFixed(1)}%</span>
                    </div>
                    <Progress value={calculations.currentDti} className="h-2 bg-muted" indicatorClassName={calculations.currentDti > 43 ? "bg-destructive" : calculations.currentDti > 36 ? "bg-orange-500" : "bg-primary"} />
                    <p className="text-xs text-muted-foreground mt-2">{t.affordCalc.dtiNote}</p>
                  </div>

                  {dtiTarget > 0.36 ? (
                    <div className="p-4 bg-orange-500/10 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-700 dark:text-orange-300">{t.affordCalc.dtiAggressiveWarning}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-primary/10 rounded-xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-primary">{t.affordCalc.dtiConservativeNote}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.affordCalc.financialProfile}</CardTitle>
                <CardDescription>{t.affordCalc.enterIncome}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t.affordCalc.annualIncome}</Label>
                  <InputWithAddon type="number" addonLeft="$" value={annualIncome.toString()} onChange={(e) => setAnnualIncome(Number(e.target.value))} className="font-semibold text-lg" />
                  <p className="text-xs text-muted-foreground">{t.affordCalc.monthly} {formatCurrency(calculations.monthlyIncome)}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t.affordCalc.monthlyDebts}</Label>
                  <InputWithAddon type="number" addonLeft="$" value={monthlyDebts.toString()} onChange={(e) => setMonthlyDebts(Number(e.target.value))} />
                  <p className="text-xs text-muted-foreground">{t.affordCalc.monthlyDebtsNote}</p>
                </div>
                <div className="space-y-2 pt-2">
                  <Label>{t.affordCalc.availableDown}</Label>
                  <InputWithAddon type="number" addonLeft="$" value={downPayment.toString()} onChange={(e) => setDownPayment(Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.affordCalc.loanAssumptions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t.affordCalc.interestRate}</Label>
                    <InputWithAddon type="number" addonRight="%" value={interestRate.toString()} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.125" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.affordCalc.loanTerm}</Label>
                    <Select value={loanTerm.toString()} onValueChange={(v) => setLoanTerm(Number(v))}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{t.affordCalc.years30}</SelectItem>
                        <SelectItem value="15">{t.affordCalc.years15}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t.affordCalc.dtiTarget}</Label>
                    <Select value={dtiTarget.toString()} onValueChange={(v) => setDtiTarget(Number(v))}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.28">{t.affordCalc.conservative}</SelectItem>
                        <SelectItem value="0.36">{t.affordCalc.moderate}</SelectItem>
                        <SelectItem value="0.43">{t.affordCalc.aggressive}</SelectItem>
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
