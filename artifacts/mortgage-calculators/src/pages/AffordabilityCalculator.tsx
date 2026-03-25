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
import { useCalculator } from "@/contexts/CalculatorContext";

const GDS_TDS: Record<string, { gds: number; tds: number }> = {
  conservative: { gds: 0.32, tds: 0.40 },
  standard:     { gds: 0.39, tds: 0.44 },
  maximum:      { gds: 0.39, tds: 0.44 },
};

export default function AffordabilityCalculator() {
  const { t } = useLanguage();
  const { calc, setCalc } = useCalculator();

  const { interestRate, loanTerm, downPayment, propertyTax, condoFee, heat } = calc;

  const [annualIncome, setAnnualIncome] = useState<number>(100000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(500);
  const [profile, setProfile] = useState<string>('standard');

  const calculations = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    const { gds, tds } = GDS_TDS[profile];

    // Canadian stress test: qualify at the higher of 5.25% or contract rate + 2%
    const stressTestRate = Math.max(5.25, interestRate + 2);

    // Fixed housing costs that count toward GDS
    const monthlyTax    = propertyTax / 12;
    const condoGDS      = condoFee * 0.5;
    const fixedGDSCosts = monthlyTax + heat + condoGDS;

    // Qualifying uses stress test rate (semi-annual compounding, Bank Act)
    const numberOfPayments    = loanTerm * 12;
    const stressMonthlyRate   = Math.pow(1 + (stressTestRate / 100) / 2, 1 / 6) - 1;
    const stressMortgageFactor = stressMonthlyRate > 0
      ? (stressMonthlyRate * Math.pow(1 + stressMonthlyRate, numberOfPayments)) / (Math.pow(1 + stressMonthlyRate, numberOfPayments) - 1)
      : 1 / numberOfPayments;

    // Max P&I from GDS limit
    const maxPI_GDS = Math.max(0, monthlyIncome * gds - fixedGDSCosts);
    // Max P&I from TDS limit (subtracts external debts)
    const maxPI_TDS = Math.max(0, monthlyIncome * tds - fixedGDSCosts - monthlyDebts);
    // Binding constraint (at stress test rate — this is what lenders use)
    const maxPI = Math.min(maxPI_GDS, maxPI_TDS);

    // Loan amount at stress test rate; actual monthly payment at contract rate
    const maxLoanAmount = stressMortgageFactor > 0 ? maxPI / stressMortgageFactor : 0;
    const maxHomePrice  = maxLoanAmount + downPayment;

    // Actual monthly P&I at contract rate (what the borrower actually pays)
    const contractMonthlyRate   = Math.pow(1 + (interestRate / 100) / 2, 1 / 6) - 1;
    const contractMortgageFactor = contractMonthlyRate > 0
      ? (contractMonthlyRate * Math.pow(1 + contractMonthlyRate, numberOfPayments)) / (Math.pow(1 + contractMonthlyRate, numberOfPayments) - 1)
      : 1 / numberOfPayments;
    const actualMonthlyPI = maxLoanAmount * contractMortgageFactor;

    // Actual ratios at the computed max home price
    const actualGDS = monthlyIncome > 0 ? ((maxPI + fixedGDSCosts) / monthlyIncome) * 100 : 0;
    const actualTDS = monthlyIncome > 0 ? ((maxPI + fixedGDSCosts + monthlyDebts) / monthlyIncome) * 100 : 0;

    const bindingLimit = maxPI_TDS < maxPI_GDS ? 'tds' : 'gds';

    return {
      maxHomePrice,
      maxLoanAmount,
      maxPI,
      actualMonthlyPI,
      monthlyIncome,
      stressTestRate,
      actualGDS,
      actualTDS,
      bindingLimit,
      gdsLimit: gds * 100,
      tdsLimit: tds * 100,
    };
  }, [annualIncome, monthlyDebts, interestRate, loanTerm, downPayment, propertyTax, condoFee, heat, profile]);

  const isAtMax = profile === 'maximum';

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
          {/* Results panel */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <motion.div className="sticky top-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
                <div className="bg-primary/10 p-8 text-center border-b border-border/50">
                  <h3 className="text-lg font-medium text-primary mb-2">{t.affordCalc.canAfford}</h3>
                  <div className="text-5xl md:text-6xl font-display font-bold text-primary">
                    {formatCurrency(calculations.maxHomePrice)}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full">
                    <span>Stress test: {calculations.stressTestRate.toFixed(2)}%</span>
                    <span className="text-primary/60">·</span>
                    <span className="text-primary/70">contract {interestRate}%</span>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.estMonthlyPayment}</span>
                      <span className="font-bold">{formatCurrency(calculations.actualMonthlyPI)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.loanAmount}</span>
                      <span className="font-bold">{formatCurrency(calculations.maxLoanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.downPayment}</span>
                      <span className="font-bold">{formatCurrency(downPayment)}</span>
                    </div>
                  </div>

                  {/* GDS */}
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium">GDS</span>
                      <span className={`text-sm font-bold ${calculations.actualGDS > calculations.gdsLimit ? 'text-destructive' : 'text-primary'}`}>
                        {calculations.actualGDS.toFixed(1)}% / {calculations.gdsLimit.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(calculations.actualGDS, 100)}
                      className="h-2 bg-muted"
                      indicatorClassName={calculations.actualGDS > calculations.gdsLimit ? "bg-destructive" : "bg-primary"}
                    />
                    {/* TDS */}
                    <div className="flex justify-between items-end mb-1 mt-2">
                      <span className="text-sm font-medium">TDS</span>
                      <span className={`text-sm font-bold ${calculations.actualTDS > calculations.tdsLimit ? 'text-destructive' : 'text-primary'}`}>
                        {calculations.actualTDS.toFixed(1)}% / {calculations.tdsLimit.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(calculations.actualTDS, 100)}
                      className="h-2 bg-muted"
                      indicatorClassName={calculations.actualTDS > calculations.tdsLimit ? "bg-destructive" : calculations.actualTDS > 39 ? "bg-orange-500" : "bg-primary"}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t.affordCalc.dtiNote}</p>
                  </div>

                  {isAtMax ? (
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

          {/* Inputs */}
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
                  <InputWithAddon type="number" addonLeft="$" value={downPayment.toString()} onChange={(e) => setCalc({ downPayment: Number(e.target.value) })} />
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
                    <InputWithAddon type="number" addonRight="%" value={interestRate.toString()} onChange={(e) => setCalc({ interestRate: Number(e.target.value) })} step="0.125" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.affordCalc.loanTerm}</Label>
                    <Select value={loanTerm.toString()} onValueChange={(v) => setCalc({ loanTerm: Number(v) })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{t.affordCalc.years30}</SelectItem>
                        <SelectItem value="25">{t.affordCalc.years25}</SelectItem>
                        <SelectItem value="20">{t.affordCalc.years20}</SelectItem>
                        <SelectItem value="15">{t.affordCalc.years15}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t.affordCalc.dtiTarget}</Label>
                    <Select value={profile} onValueChange={setProfile}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">{t.affordCalc.conservative}</SelectItem>
                        <SelectItem value="standard">{t.affordCalc.moderate}</SelectItem>
                        <SelectItem value="maximum">{t.affordCalc.aggressive}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Shared housing costs (from Mortgage Calculator) */}
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-4">{t.affordCalc.dtiNote}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t.mortgageCalc.propertyTax}</Label>
                      <InputWithAddon type="number" addonLeft="$" value={propertyTax.toString()} onChange={(e) => setCalc({ propertyTax: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t.mortgageCalc.heat}</Label>
                      <InputWithAddon type="number" addonLeft="$" value={heat.toString()} onChange={(e) => setCalc({ heat: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t.mortgageCalc.condoFee}</Label>
                      <InputWithAddon type="number" addonLeft="$" value={condoFee.toString()} onChange={(e) => setCalc({ condoFee: Number(e.target.value) })} />
                    </div>
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
