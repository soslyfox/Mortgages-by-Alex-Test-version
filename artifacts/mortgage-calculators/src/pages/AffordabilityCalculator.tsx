import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, minDownPayment } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
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
  const [, navigate] = useLocation();

  const { interestRate, loanTerm, downPayment, propertyTax, condoFee, heat } = calc;

  const [annualIncome, setAnnualIncome] = useState<number>(100000);
  const [monthlyDebts, setMonthlyDebts] = useState<number>(0);
  // null = auto-follow the computed max; a number = user manually edited
  const [manualHomePrice, setManualHomePrice] = useState<number | null>(null);
  // Local string state so the user can type freely without context overriding mid-edit
  const [downPaymentInput, setDownPaymentInput] = useState<string>("");
  // Track whether we've done the one-time minimum-down initialization
  const [initialized, setInitialized] = useState<boolean>(false);

  // ── BACKWARD: max affordable home price (income-driven) ──────────────────
  const backward = useMemo(() => {
    const monthlyIncome = annualIncome / 12;
    const stressRate    = Math.max(5.25, interestRate + 2);
    const months        = loanTerm * 12;
    const stressFactor  = mortgageFactor(stressRate, months);

    const monthlyTax    = propertyTax / 12;
    const condoHalf     = condoFee * 0.5;
    const fixedGDSCosts = monthlyTax + heat + condoHalf;

    const maxPI_GDS      = Math.max(0, monthlyIncome * GDS_LIMIT - fixedGDSCosts);
    const maxPI_TDS      = Math.max(0, monthlyIncome * TDS_LIMIT - fixedGDSCosts - monthlyDebts);
    const maxPI          = Math.min(maxPI_GDS, maxPI_TDS);
    const maxInsuredLoan = stressFactor > 0 ? maxPI / stressFactor : 0;

    // Back out CMHC to find true home price
    let rawMax = maxInsuredLoan + downPayment; // default: ≥20%, no CMHC
    for (const [lo, hi] of [[0.05, 0.10], [0.10, 0.15], [0.15, 0.20]] as [number, number][]) {
      const rate      = cmhcRate(lo, loanTerm);
      const candidate = maxInsuredLoan / (1 + rate) + downPayment;
      const pct       = downPayment / candidate;
      if (pct >= lo && pct < hi) { rawMax = candidate; break; }
    }

    const maxHomePrice = Math.floor(rawMax); // integer so display = calculation
    const minDownForMax = minDownPayment(maxHomePrice);

    return {
      monthlyIncome, stressRate, fixedGDSCosts,
      maxHomePrice, maxInsuredLoan, maxPI,
      minDownForMax,
      stressFactor,
    };
  }, [annualIncome, monthlyDebts, interestRate, loanTerm, downPayment, propertyTax, condoFee, heat]);

  // ── One-time init: set down payment to the minimum for the computed max ──
  useEffect(() => {
    if (!initialized && backward.maxHomePrice > 0) {
      const minDown = Math.ceil(backward.minDownForMax);
      setCalc({ downPayment: minDown });
      setDownPaymentInput(minDown.toString());
      setInitialized(true);
    }
  }, [backward.maxHomePrice, initialized]);

  // Effective home price: follow max unless user overrode it
  const homePrice = manualHomePrice !== null ? manualHomePrice : backward.maxHomePrice;

  // ── FORWARD: stress-tested GDS/TDS for the displayed home price ───────────
  const forward = useMemo(() => {
    const { stressFactor, fixedGDSCosts, monthlyIncome } = backward;
    const minDown     = minDownPayment(homePrice);
    const effDown     = Math.max(downPayment, minDown);
    const baseLoan    = Math.max(0, homePrice - effDown);
    const downPct     = homePrice > 0 ? effDown / homePrice : 0;
    const insuredLoan = baseLoan * (1 + cmhcRate(downPct, loanTerm));
    const forwardPI   = insuredLoan * stressFactor;
    const forwardGDS  = monthlyIncome > 0 ? (forwardPI + fixedGDSCosts) / monthlyIncome * 100 : 0;
    const forwardTDS  = monthlyIncome > 0 ? (forwardPI + fixedGDSCosts + monthlyDebts) / monthlyIncome * 100 : 0;

    const contractFactor  = mortgageFactor(interestRate, loanTerm * 12);
    const actualMonthlyPI = insuredLoan * contractFactor;
    const qualifies       = homePrice > 0 && homePrice <= backward.maxHomePrice;

    return { forwardGDS, forwardTDS, qualifies, actualMonthlyPI, effDown, insuredLoan };
  }, [backward, homePrice, downPayment, interestRate, loanTerm, monthlyDebts]);

  function handleGoToMortgage() {
    setCalc({ homePrice, downPayment });
    navigate("/mortgage-calculator");
  }

  return (
    <AppLayout>
      <div className="bg-primary/5 py-4 md:py-6 border-b border-primary/10">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Results panel ─────────────────────────────────────────── */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <motion.div className="sticky top-24 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Max affordable */}
              <Card className="shadow-xl border-primary/20 bg-primary/5 overflow-hidden">
                <CardContent className="p-6 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">{t.affordCalc.canAfford}</p>
                  <p className="text-4xl font-display font-bold text-foreground">{formatCurrency(backward.maxHomePrice)}</p>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">{t.affordCalc.loanAmount}</span>
                    <span className="font-semibold">{formatCurrency(backward.maxInsuredLoan)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.affordCalc.downPayment}</span>
                    <span className="font-semibold">{formatCurrency(downPayment)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.affordCalc.minDownPayment ?? 'Min. down payment'}</span>
                    <span className="font-semibold">{formatCurrency(backward.minDownForMax)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Qualification badge for the entered home price */}
              <Card className={`shadow-xl border-primary/20 overflow-hidden ${forward.qualifies ? 'bg-primary/5' : 'bg-destructive/5'}`}>
                <div className="p-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-0.5">
                      {formatCurrency(homePrice)} @ {backward.stressRate.toFixed(2)}% stress
                    </p>
                    <p className="font-semibold">
                      {forward.qualifies ? t.affordCalc.qualifies : t.affordCalc.doesNotQualify}
                    </p>
                  </div>
                  {forward.qualifies
                    ? <CheckCircle2 className="w-7 h-7 text-primary shrink-0" />
                    : <XCircle className="w-7 h-7 text-destructive shrink-0" />
                  }
                </div>
              </Card>

              {/* GDS / TDS card */}
              <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">GDS</span>
                      <span className={`text-sm font-bold ${forward.forwardGDS > GDS_LIMIT * 100 ? 'text-destructive' : 'text-primary'}`}>
                        {forward.forwardGDS.toFixed(1)}% / {(GDS_LIMIT * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(forward.forwardGDS / (GDS_LIMIT * 100) * 100, 110)}
                      className="h-2 bg-muted"
                      indicatorClassName={forward.forwardGDS > GDS_LIMIT * 100 ? "bg-destructive" : "bg-primary"}
                    />
                    <p className="text-xs text-muted-foreground">{t.affordCalc.gdsFormula}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">TDS</span>
                      <span className={`text-sm font-bold ${forward.forwardTDS > TDS_LIMIT * 100 ? 'text-destructive' : forward.forwardTDS > 39 ? 'text-orange-500' : 'text-primary'}`}>
                        {forward.forwardTDS.toFixed(1)}% / {(TDS_LIMIT * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(forward.forwardTDS / (TDS_LIMIT * 100) * 100, 110)}
                      className="h-2 bg-muted"
                      indicatorClassName={forward.forwardTDS > TDS_LIMIT * 100 ? "bg-destructive" : forward.forwardTDS > 39 ? "bg-orange-500" : "bg-primary"}
                    />
                    <p className="text-xs text-muted-foreground">{t.affordCalc.tdsFormula}</p>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.affordCalc.estMonthlyPayment}</span>
                      <span className="font-bold">{formatCurrency(forward.actualMonthlyPI)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA: open in Mortgage Calculator */}
              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handleGoToMortgage}
              >
                {t.affordCalc.viewInMortgage ?? 'Calculate Monthly Payment'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

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
                  <p className="text-xs text-muted-foreground">{t.affordCalc.monthly} {formatCurrency(backward.monthlyIncome)}</p>
                </div>
                {/* 2. Down payment */}
                <div className="space-y-2">
                  <Label>{t.affordCalc.availableDown}</Label>
                  <InputWithAddon
                    type="number" addonLeft="$"
                    value={downPaymentInput}
                    onChange={(e) => setDownPaymentInput(e.target.value)}
                    onBlur={() => {
                      const val = Number(downPaymentInput);
                      const minDown = Math.ceil(minDownPayment(homePrice));
                      const adjusted = Math.max(val, minDown);
                      setCalc({ downPayment: adjusted });
                      setDownPaymentInput(adjusted.toString());
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.affordCalc.minDownWarning} {formatCurrency(backward.minDownForMax)}
                  </p>
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
                  {/* Home price — defaults to max, user can override */}
                  <div className="space-y-2">
                    <Label>{t.affordCalc.homePrice}</Label>
                    <InputWithAddon
                      type="number" addonLeft="$"
                      value={homePrice.toString()}
                      onChange={(e) => setManualHomePrice(Number(e.target.value))}
                    />
                    {manualHomePrice !== null && (
                      <button
                        className="text-xs text-primary underline"
                        onClick={() => setManualHomePrice(null)}
                      >
                        {t.affordCalc.resetToMax ?? 'Reset to maximum'}
                      </button>
                    )}
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
