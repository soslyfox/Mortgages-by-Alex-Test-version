import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalculator } from "@/contexts/CalculatorContext";

const GDS_TDS: Record<string, { gds: number; tds: number }> = {
  conservative: { gds: 0.32, tds: 0.40 },
  standard:     { gds: 0.39, tds: 0.44 },
  maximum:      { gds: 0.39, tds: 0.44 },
};

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
  const [profile, setProfile] = useState<string>('standard');

  const calculations = useMemo(() => {
    const monthlyIncome  = annualIncome / 12;
    const { gds, tds }   = GDS_TDS[profile];
    const stressRate     = Math.max(5.25, interestRate + 2);
    const months         = loanTerm * 12;

    // ── Monthly housing costs that count toward GDS ──────────────────────────
    const monthlyTax     = propertyTax / 12;           // 100% of taxes
    const condoHalf      = condoFee * 0.5;              // 50% of condo fee
    const heatMonthly    = heat;                        // 100% of heat
    const fixedGDSCosts  = monthlyTax + heatMonthly + condoHalf;

    // ── FORWARD: GDS/TDS for the SPECIFIC home price from shared context ─────
    const baseLoan       = Math.max(0, homePrice - downPayment);
    const downPct        = homePrice > 0 ? downPayment / homePrice : 0;
    const insuredLoan    = baseLoan * (1 + cmhcRate(downPct, loanTerm));
    const stressFactor   = mortgageFactor(stressRate, months);
    const forwardPI      = insuredLoan * stressFactor;         // P&I at stress test rate

    const forwardGDS     = monthlyIncome > 0 ? (forwardPI + fixedGDSCosts) / monthlyIncome * 100 : 0;
    const forwardTDS     = monthlyIncome > 0 ? (forwardPI + fixedGDSCosts + monthlyDebts) / monthlyIncome * 100 : 0;
    const qualifiesGDS   = forwardGDS <= gds * 100;
    const qualifiesTDS   = forwardTDS <= tds * 100;
    const qualifies      = qualifiesGDS && qualifiesTDS;

    // ── BACKWARD: Maximum affordable home price ──────────────────────────────
    const maxPI_GDS      = Math.max(0, monthlyIncome * gds - fixedGDSCosts);
    const maxPI_TDS      = Math.max(0, monthlyIncome * tds - fixedGDSCosts - monthlyDebts);
    const maxPI          = Math.min(maxPI_GDS, maxPI_TDS);
    const maxInsuredLoan = stressFactor > 0 ? maxPI / stressFactor : 0;

    // Back out CMHC from maxInsuredLoan → true home price (check each bracket)
    let maxHomePrice = maxInsuredLoan + downPayment; // default: ≥20% down, no CMHC
    for (const [lo, hi] of [[0.05, 0.10], [0.10, 0.15], [0.15, 0.20]] as [number, number][]) {
      const rate = cmhcRate(lo, loanTerm);
      const candidate    = maxInsuredLoan / (1 + rate) + downPayment;
      const candidatePct = downPayment / candidate;
      if (candidatePct >= lo && candidatePct < hi) { maxHomePrice = candidate; break; }
    }

    // Actual monthly payment at CONTRACT rate (what borrower really pays)
    const contractFactor  = mortgageFactor(interestRate, months);
    const actualMonthlyPI = insuredLoan * contractFactor;

    return {
      monthlyIncome, stressRate,
      forwardPI, forwardGDS, forwardTDS,
      qualifiesGDS, qualifiesTDS, qualifies,
      maxHomePrice, maxInsuredLoan,
      actualMonthlyPI,
      gdsLimit: gds * 100, tdsLimit: tds * 100,
    };
  }, [annualIncome, monthlyDebts, interestRate, loanTerm, homePrice, downPayment, propertyTax, condoFee, heat, profile]);

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

              {/* GDS / TDS card (forward, for the specific home price) */}
              <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
                <div className={`p-6 border-b border-border/50 flex items-center justify-between ${calculations.qualifies ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-0.5">{formatCurrency(homePrice)} @ {calculations.stressRate.toFixed(2)}% stress</p>
                    <p className="text-lg font-semibold">{calculations.qualifies ? t.affordCalc.qualifies : t.affordCalc.doesNotQualify}</p>
                  </div>
                  {calculations.qualifies
                    ? <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
                    : <XCircle className="w-8 h-8 text-destructive shrink-0" />
                  }
                </div>
                <CardContent className="p-6 space-y-4">
                  {/* GDS */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">GDS</span>
                      <span className={`text-sm font-bold ${!calculations.qualifiesGDS ? 'text-destructive' : 'text-primary'}`}>
                        {calculations.forwardGDS.toFixed(2)}% / {calculations.gdsLimit.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(calculations.forwardGDS / calculations.gdsLimit * 100, 110)}
                      className="h-2 bg-muted"
                      indicatorClassName={!calculations.qualifiesGDS ? "bg-destructive" : "bg-primary"}
                    />
                    <p className="text-xs text-muted-foreground">{t.affordCalc.gdsFormula}</p>
                  </div>
                  {/* TDS */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium">TDS</span>
                      <span className={`text-sm font-bold ${!calculations.qualifiesTDS ? 'text-destructive' : 'text-primary'}`}>
                        {calculations.forwardTDS.toFixed(2)}% / {calculations.tdsLimit.toFixed(0)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(calculations.forwardTDS / calculations.tdsLimit * 100, 110)}
                      className="h-2 bg-muted"
                      indicatorClassName={!calculations.qualifiesTDS ? "bg-destructive" : calculations.forwardTDS > 39 ? "bg-orange-500" : "bg-primary"}
                    />
                    <p className="text-xs text-muted-foreground">{t.affordCalc.tdsFormula}</p>
                  </div>
                  <div className="pt-2 border-t border-border/50 space-y-2">
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
                <div className="space-y-2">
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
                  <div className="space-y-2">
                    <Label>{t.affordCalc.homePrice}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={homePrice.toString()} onChange={(e) => setCalc({ homePrice: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2 md:col-span-1">
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
