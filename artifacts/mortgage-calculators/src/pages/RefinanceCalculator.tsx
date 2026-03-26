import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingDown, Calendar, DollarSign, PiggyBank, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Canadian mortgage: semi-annual compounding per Bank Act
function canadianMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate / 200, 1 / 6) - 1;
}

function monthlyPayment(balance: number, annualRate: number, amortYears: number): number {
  const r = canadianMonthlyRate(annualRate);
  const n = amortYears * 12;
  if (r === 0) return balance / n;
  return balance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Months to pay off a balance with a given payment and annual rate
function monthsToPayOff(balance: number, annualRate: number, payment: number): number {
  const r = canadianMonthlyRate(annualRate);
  if (r === 0) return Math.ceil(balance / payment);
  if (payment <= r * balance) return Infinity;
  return Math.ceil(Math.log(payment / (payment - r * balance)) / Math.log(1 + r));
}

const AMORT_OPTIONS = [5, 10, 15, 20, 25, 30];
const TERM_OPTIONS = [1, 2, 3, 4, 5];

export default function RefinanceCalculator() {
  const { t } = useLanguage();
  const rc = t.refinanceCalc;

  // --- Inputs ---
  const [propertyValue, setPropertyValue] = useState(600000);
  const [currentMortgage, setCurrentMortgage] = useState(420000);
  const [currentRate, setCurrentRate] = useState(5.89);
  const [amortLeft, setAmortLeft] = useState(25);
  const [termLeft, setTermLeft] = useState(3);
  const [penaltyFees, setPenaltyFees] = useState(6000);
  const [newRate, setNewRate] = useState(4.39);
  const [newAmort, setNewAmort] = useState(25);
  const [newTerm, setNewTerm] = useState(5);

  const calc = useMemo(() => {
    const maxMortgage = propertyValue * 0.8;
    const canRefinance = currentMortgage <= maxMortgage;
    const availableEquity = Math.max(0, maxMortgage - currentMortgage);

    // Current monthly payment (calculated from inputs, not entered)
    const curPayment = monthlyPayment(currentMortgage, currentRate, amortLeft);

    // New mortgage balance = current balance + penalty/fees rolled in
    const newBalance = currentMortgage + penaltyFees;
    const newPayment = monthlyPayment(newBalance, newRate, newAmort);

    const savings = curPayment - newPayment;
    const termSavings = savings * termLeft * 12;

    // If savings > 0, how many months shorter is the new mortgage if you pay an
    // extra `savings` per month?
    let monthsSaved = 0;
    if (savings > 0 && canRefinance) {
      const standardMonths = newAmort * 12;
      const fasterMonths = monthsToPayOff(newBalance, newRate, newPayment + savings);
      monthsSaved = fasterMonths === Infinity ? 0 : Math.max(0, standardMonths - fasterMonths);
    }

    return {
      maxMortgage,
      canRefinance,
      availableEquity,
      curPayment,
      newBalance,
      newPayment,
      savings,
      termSavings,
      monthsSaved,
    };
  }, [propertyValue, currentMortgage, currentRate, amortLeft, termLeft, penaltyFees, newRate, newAmort, newTerm]);

  const savingsPositive = calc.savings > 0 && calc.canRefinance;

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-primary/5 py-8 md:py-12 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{rc.title}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">{rc.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full space-y-8">

        {/* Eligibility Banner */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          {calc.canRefinance ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-primary">{rc.available}. </span>
                <span className="text-muted-foreground">
                  {rc.maxMortgage}: <strong className="text-foreground">{formatCurrency(calc.maxMortgage)}</strong>.{" "}
                  {rc.availableEquityDesc} <strong className="text-foreground">{formatCurrency(calc.availableEquity)}</strong>.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-sm">
                <span className="font-semibold text-destructive">{rc.notAvailable}. </span>
                <span className="text-muted-foreground">{rc.notAvailableDesc} {rc.maxMortgage}: <strong>{formatCurrency(calc.maxMortgage)}</strong>.</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Result Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              icon: <DollarSign className="w-5 h-5" />,
              label: rc.currentPaymentLabel,
              value: formatCurrency(calc.curPayment),
              highlight: false,
            },
            {
              icon: <DollarSign className="w-5 h-5" />,
              label: rc.newPaymentLabel,
              value: formatCurrency(calc.newPayment),
              highlight: false,
            },
            {
              icon: <TrendingDown className="w-5 h-5" />,
              label: rc.monthlySavings,
              value: savingsPositive ? formatCurrency(calc.savings) : "—",
              highlight: savingsPositive,
              negative: calc.savings < 0 && calc.canRefinance,
            },
            {
              icon: <PiggyBank className="w-5 h-5" />,
              label: rc.termSavings,
              value: savingsPositive ? formatCurrency(calc.termSavings) : "—",
              highlight: savingsPositive,
            },
            {
              icon: <Calendar className="w-5 h-5" />,
              label: rc.monthsSaved,
              value: savingsPositive && calc.monthsSaved > 0 ? `${calc.monthsSaved} ${rc.months}` : "—",
              highlight: savingsPositive && calc.monthsSaved > 0,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={i < 2 ? "col-span-1" : "col-span-1"}
            >
              <Card className={`h-full ${card.highlight ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
                <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full gap-1.5 pt-4">
                  <div className={`${card.highlight ? "text-primary" : "text-muted-foreground"}`}>
                    {card.icon}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-tight">{card.label}</p>
                  <p className={`text-xl font-display font-bold leading-none ${
                    card.highlight ? "text-primary" :
                    card.negative ? "text-destructive" :
                    "text-foreground"
                  }`}>
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Input Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Mortgage */}
          <Card>
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle className="text-base">{rc.currentSection}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>{rc.propertyValue}</Label>
                <InputWithAddon
                  type="number"
                  addonLeft="$"
                  value={propertyValue.toString()}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>{rc.currentMortgage}</Label>
                <InputWithAddon
                  type="number"
                  addonLeft="$"
                  value={currentMortgage.toString()}
                  onChange={(e) => setCurrentMortgage(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>{rc.currentRate}</Label>
                <InputWithAddon
                  type="number"
                  addonRight="%"
                  step="0.01"
                  value={currentRate.toString()}
                  onChange={(e) => setCurrentRate(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{rc.amortLeft}</Label>
                  <Select value={amortLeft.toString()} onValueChange={(v) => setAmortLeft(Number(v))}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AMORT_OPTIONS.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y} {rc.yr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{rc.termLeft}</Label>
                  <Select value={termLeft.toString()} onValueChange={(v) => setTermLeft(Number(v))}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TERM_OPTIONS.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y} {rc.yr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{rc.penaltyFees}</Label>
                <InputWithAddon
                  type="number"
                  addonLeft="$"
                  value={penaltyFees.toString()}
                  onChange={(e) => setPenaltyFees(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">{rc.penaltyFeesNote}</p>
              </div>
            </CardContent>
          </Card>

          {/* New Mortgage */}
          <Card className="border-primary/30 shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-primary text-base">{rc.newSection}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>{rc.newRate}</Label>
                <InputWithAddon
                  type="number"
                  addonRight="%"
                  step="0.01"
                  value={newRate.toString()}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="font-bold text-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{rc.newAmort}</Label>
                  <Select value={newAmort.toString()} onValueChange={(v) => setNewAmort(Number(v))}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AMORT_OPTIONS.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y} {rc.yr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{rc.newTerm}</Label>
                  <Select value={newTerm.toString()} onValueChange={(v) => setNewTerm(Number(v))}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TERM_OPTIONS.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y} {rc.yr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* New mortgage summary */}
              <div className="mt-4 pt-5 border-t border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{rc.currentMortgage}</span>
                  <span className="font-medium">{formatCurrency(currentMortgage)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">+ {rc.penaltyFees}</span>
                  <span className="font-medium">{formatCurrency(penaltyFees)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border/50 pt-3">
                  <span>{rc.newSection} ({rc.newPaymentLabel})</span>
                  <span className="text-xl font-display text-foreground">{formatCurrency(calc.newPayment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
