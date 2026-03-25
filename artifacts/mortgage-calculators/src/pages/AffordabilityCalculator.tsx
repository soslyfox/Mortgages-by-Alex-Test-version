import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, minDownPayment } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalculator } from "@/contexts/CalculatorContext";

const GDS_LIMIT = 0.39;
const TDS_LIMIT = 0.44;

function cmhcRate(downPct: number, term: number): number {
  const surcharge = term >= 30 ? 0.002 : 0;
  if (downPct < 0.10) return 0.040 + surcharge;
  if (downPct < 0.15) return 0.031 + surcharge;
  if (downPct < 0.20) return 0.028 + surcharge;
  return 0;
}

function mortgageFactor(annualRate: number, months: number): number {
  const monthly = Math.pow(1 + (annualRate / 100) / 2, 1 / 6) - 1;
  if (monthly <= 0) return 1 / months;
  return (monthly * Math.pow(1 + monthly, months)) / (Math.pow(1 + monthly, months) - 1);
}

export default function AffordabilityCalculator() {
  const { t } = useLanguage();
  const { calc, setCalc } = useCalculator();

  const { homePrice, interestRate, loanTerm, downPayment, propertyTax, condoFee, heat } = calc;

  const [annualIncome, setAnnualIncome] = useState<number>(100000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(500);

  const calculations = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    const stressRate    = Math.max(5.25, interestRate + 2);
    const months        = loanTerm * 12;
    const stressFactor  = mortgageFactor(stressRate, months);

    // ── Monthly housing costs toward GDS ──────────────────────────────────────
    const monthlyTax    = propertyTax / 12;   // 100% of taxes
    const condoHalf     = condoFee * 0.5;     // 50% of condo fee
    const fixedGDSCosts = monthlyTax + heat + condoHalf;

    // ── BACKWARD: Max affordable home price (primary output) ─────────────────
    // Use the entered downPayment directly; min-down validation is done separately
    const maxPI_GDS      = Math.max(0, monthlyIncome * GDS_LIMIT - fixedGDSCosts);
    const maxPI_TDS      = Math.max(0, monthlyIncome * TDS_LIMIT - fixedGDSCosts - monthlyDebts);
    const maxPI          = Math.min(maxPI_GDS, maxPI_TDS);
    const maxInsuredLoan = stressFactor > 0 ? maxPI / stressFactor : 0;

    // Back out CMHC from maxInsuredLoan → true home price
    let maxHomePrice = maxInsuredLoan + downPayment; // default: ≥20% down, no CMHC
    for (const [lo, hi] of [[0.05, 0.10], [0.10, 0.15], [0.15, 0.20]] as [number, number][]) {
      const rate         = cmhcRate(lo, loanTerm);
      const candidate    = maxInsuredLoan / (1 + rate) + downPayment;
      const candidatePct = downPayment / candidate;
      if (candidatePct >= lo && candidatePct < hi) { maxHomePrice = candidate; break; }
    }

    // GDS/TDS AT the max affordable price (these are the real qualifying ratios)
    const backwardGDS = monthlyIncome > 0 ? (maxPI + fixedGDSCosts) / monthlyIncome * 100 : 0;
    const backwardTDS = monthlyIncome > 0 ? (maxPI + fixedGDSCosts + monthlyDebts) / monthlyIncome * 100 : 0;

    // ── Qualification: does the entered home price fit within max? ────────────
    const qualifies = homePrice > 0 && homePrice <= maxHomePrice;

    // ── Min down payment validation ──────────────────────────────────────────
    // Check against BOTH the entered home price and the computed max
    const minDownForEntered = minDownPayment(homePrice);
    const minDownForMax     = minDownPayment(maxHomePrice);
    const downTooLowForEntered = homePrice > 0 && downPayment < minDownForEntered;
    const downTooLowForMax     = maxHomePrice > 0 && downPayment < minDownForMax;

    // ── Actual monthly payment at CONTRACT rate (for the entered home price) ──
    const effectiveDown   = Math.max(downPayment, minDownForEntered);
    const baseLoan        = Math.max(0, homePrice - effectiveDown);
    const downPct         = homePrice > 0 ? effectiveDown / homePrice : 0;
    const insuredLoan     = baseLoan * (1 + cmhcRate(downPct, loanTerm));
    const contractFactor  = mortgageFactor(interestRate, months);
    const actualMonthlyPI = insuredLoan * contractFactor;

    return {
      monthlyIncome, stressRate,
      backwardGDS, backwardTDS,
      qualifies,
      maxHomePrice, maxInsuredLoan,
      actualMonthlyPI,
      minDownForEntered, minDownForMax,
      downTooLowForEntered, downTooLowForMax,
    };
  }, [annualIncome, monthlyDebts, interestRate, loanTerm, homePrice, downPayment, propertyTax, condoFee, heat]);

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

          {/* ── Results panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <motion.div className="sticky top-24 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Qualification badge for the entered home price */}
              <Card className={`shadow-xl border-primary/20 overflow-hidden ${calculations.qualifies ? 'bg-primary/5' : 'bg-destructive/5'}`}>
                <div className="p-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      {formatCurrency(homePrice)} @ {calculations.stressRate.toFixed(2)}% stress
                    </p>
                    <p className="font-semibold">
                      {calculations.qualifies ? t.affordCalc.qualifies : t.affordCalc.doesNotQualify}
                    </p>
                  </div>
                  {calculations.qualifies
                    ? <CheckCircle2 className="w-7 h-7 text-primary shrink-0" />
                    : <XCircle className="w-7 h-7 text-destructive shrink-0" />
                  }
                </div>
              </Card>

              {/* GDS / TDS card — ratios AT the max affordable price */}
              <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {/* GDS */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">GDS</span>
                      <span className="text-sm font-bold text-primary">
                        {calculations.backwardGDS.toFixed(1)}% / {(GDS_LIMIT * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(calculations.backwardGDS / (GDS_LIMIT * 100) * 100, 100)}
                      className="h-2 bg-muted"
                      indicatorClassName="bg-primary"
                    />
                    <p className="text-xs text-muted-foreground">{t.affordCalc.gdsFormula}</p>
                  </div>
                  {/* TDS */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">TDS</span>
                      <span className="text-sm font-bold text-primary">
                        {calculations.backwardTDS.toFixed(1)}% / {(TDS_LIMIT * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(calculations.backwardTDS / (TDS_LIMIT * 100) * 100, 100)}
                      className="h-2 bg-muted"
                      indicatorClassName={calculations.backwardTDS > 39 ? "bg-orange-500" : "bg-primary"}
                    />
                    <p className="text-xs text-muted-foreground">{t.affordCalc.tdsFormula}</p>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.estMonthlyPayment}</span>
                      <span className="font-bold">{formatCurrency(calculations.actualMonthlyPI)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Max affordable (backward) */}
              <Card className="shadow-md border-border/50">
                <CardContent className="p-5 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{t.affordCalc.canAfford}</p>
                  <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(calculations.maxHomePrice)}</p>
                  <div className="flex justify-between text-sm pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">{t.affordCalc.loanAmount}</span>
                    <span className="font-semibold">{formatCurrency(calculations.maxInsuredLoan)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.affordCalc.downPayment}</span>
                    <span className="font-semibold">{formatCurrency(downPayment)}</span>
                  </div>
                </CardContent>
              </Card>

            </motion.div>
          </div>

          {/* ── Inputs ────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.affordCalc.financialProfile}</CardTitle>
                <CardDescription>{t.affordCalc.enterIncome}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. Annual income */}
                <div className="space-y-2">
                  <Label>{t.affordCalc.annualIncome}</Label>
                  <InputWithAddon
                    type="number" addonLeft="$"
                    value={annualIncome.toString()}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="font-semibold text-lg"
                  />
                  <p className="text-xs text-muted-foreground">{t.affordCalc.monthly} {formatCurrency(calculations.monthlyIncome)}</p>
                </div>
                {/* 2. Down payment */}
                <div className="space-y-2">
                  <Label>{t.affordCalc.availableDown}</Label>
                  <InputWithAddon
                    type="number" addonLeft="$"
                    value={downPayment.toString()}
                    onChange={(e) => setCalc({ downPayment: Number(e.target.value) })}
                    className={calculations.downTooLowForEntered || calculations.downTooLowForMax ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {calculations.downTooLowForEntered && (
                    <p className="text-xs text-destructive font-medium">
                      {t.affordCalc.minDownWarning} {formatCurrency(calculations.minDownForEntered)}
                    </p>
                  )}
                  {!calculations.downTooLowForEntered && calculations.downTooLowForMax && (
                    <p className="text-xs text-destructive font-medium">
                      {t.affordCalc.minDownForMaxWarning} {formatCurrency(calculations.minDownForMax)}
                    </p>
                  )}
                </div>
                {/* 3. Monthly debts */}
                <div className="space-y-2">
                  <Label>{t.affordCalc.monthlyDebts}</Label>
                  <InputWithAddon
                    type="number" addonLeft="$"
                    value={monthlyDebts.toString()}
                    onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">{t.affordCalc.monthlyDebtsNote}</p>
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
                    <Label>{t.affordCalc.homePrice}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={homePrice.toString()} onChange={(e) => setCalc({ homePrice: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.affordCalc.interestRate}</Label>
                    <InputWithAddon type="number" addonRight="%" value={interestRate.toString()} onChange={(e) => setCalc({ interestRate: Number(e.target.value) })} step="any" />
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
                </div>

                {/* Shared housing costs */}
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-4">{t.affordCalc.housingCostsNote}</p>
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
