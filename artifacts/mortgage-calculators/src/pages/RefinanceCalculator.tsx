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

function monthlyPayment(balance: number, annualRate: number, amortMonths: number): number {
  const r = canadianMonthlyRate(annualRate);
  const n = amortMonths;
  if (n <= 0 || balance <= 0) return 0;
  if (r === 0) return balance / n;
  return balance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function monthsToPayOff(balance: number, annualRate: number, payment: number): number {
  const r = canadianMonthlyRate(annualRate);
  if (r === 0) return Math.ceil(balance / payment);
  if (payment <= r * balance) return Infinity;
  return Math.ceil(Math.log(payment / (payment - r * balance)) / Math.log(1 + r));
}

const TERM_OPTIONS = [5, 4, 3, 2, 1];

type AmortUnit = "years" | "months";

interface AmortInputProps {
  label: string;
  valueMonths: number;
  onChange: (months: number) => void;
  unit: AmortUnit;
  onUnitChange: (u: AmortUnit) => void;
  labelYears: string;
  labelMonths: string;
}

function AmortInput({ label, valueMonths, onChange, unit, onUnitChange, labelYears, labelMonths }: AmortInputProps) {
  const displayed = unit === "years" ? Math.round(valueMonths / 12) : valueMonths;

  function handleChange(raw: string) {
    const n = Number(raw);
    if (!isFinite(n) || n < 0) return;
    onChange(unit === "years" ? Math.round(n * 12) : n);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex rounded-md overflow-hidden border border-border/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => onUnitChange("years")}
            className={`px-2.5 py-1 transition-colors ${
              unit === "years"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {labelYears}
          </button>
          <button
            type="button"
            onClick={() => onUnitChange("months")}
            className={`px-2.5 py-1 transition-colors border-l border-border/60 ${
              unit === "months"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {labelMonths}
          </button>
        </div>
      </div>
      <InputWithAddon
        type="number"
        addonRight={unit === "years" ? labelYears.toLowerCase() : labelMonths.toLowerCase()}
        value={displayed.toString()}
        onChange={(e) => handleChange(e.target.value)}
        min={1}
        step={1}
      />
    </div>
  );
}

export default function RefinanceCalculator() {
  const { t } = useLanguage();
  const rc = t.refinanceCalc;

  // --- Current mortgage ---
  const [propertyValue, setPropertyValue] = useState(600000);
  const [currentMortgage, setCurrentMortgage] = useState(420000);
  const [currentRate, setCurrentRate] = useState(5.89);
  const [amortLeftMonths, setAmortLeftMonths] = useState(300);
  const [amortLeftUnit, setAmortLeftUnit] = useState<AmortUnit>("years");
  const [termLeft, setTermLeft] = useState(3);

  // --- New mortgage ---
  const [newRate, setNewRate] = useState(4.39);
  const [newAmortMonths, setNewAmortMonths] = useState(300);
  const [newAmortUnit, setNewAmortUnit] = useState<AmortUnit>("years");
  const [newTerm, setNewTerm] = useState(5);
  const [penaltyFees, setPenaltyFees] = useState(6000);
  const [cashOut, setCashOut] = useState(0);

  const calc = useMemo(() => {
    const maxMortgage = propertyValue * 0.8;
    const canRefinance = currentMortgage + penaltyFees <= maxMortgage;
    const availableEquity = Math.max(0, maxMortgage - currentMortgage - penaltyFees);

    // Clamp cashOut to available equity
    const clampedCashOut = Math.min(cashOut, availableEquity);
    const newBalance = currentMortgage + penaltyFees + clampedCashOut;

    const curPayment = monthlyPayment(currentMortgage, currentRate, amortLeftMonths);
    const newPayment = monthlyPayment(newBalance, newRate, newAmortMonths);

    const savings = curPayment - newPayment;
    const termSavings = savings * termLeft * 12;

    let monthsSaved = 0;
    if (savings > 0 && canRefinance) {
      const fasterMonths = monthsToPayOff(newBalance, newRate, newPayment + savings);
      monthsSaved = fasterMonths === Infinity ? 0 : Math.max(0, newAmortMonths - fasterMonths);
    }

    return { maxMortgage, canRefinance, availableEquity, clampedCashOut, curPayment, newBalance, newPayment, savings, termSavings, monthsSaved };
  }, [propertyValue, currentMortgage, currentRate, amortLeftMonths, termLeft, penaltyFees, newRate, newAmortMonths, newTerm, cashOut]);

  const savingsPositive = calc.savings > 0 && calc.canRefinance;

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-primary/5 py-4 md:py-6 border-b border-primary/10">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 w-full space-y-8">

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
            { icon: <DollarSign className="w-5 h-5" />, label: rc.currentPaymentLabel, value: formatCurrency(calc.curPayment), highlight: false },
            { icon: <DollarSign className="w-5 h-5" />, label: rc.newPaymentLabel, value: formatCurrency(calc.newPayment), highlight: false },
            { icon: <TrendingDown className="w-5 h-5" />, label: rc.monthlySavings, value: savingsPositive ? formatCurrency(calc.savings) : "—", highlight: savingsPositive, negative: calc.savings < 0 && calc.canRefinance },
            { icon: <PiggyBank className="w-5 h-5" />, label: rc.termSavings, value: savingsPositive ? formatCurrency(calc.termSavings) : "—", highlight: savingsPositive },
            { icon: <Calendar className="w-5 h-5" />, label: rc.monthsSaved, value: savingsPositive && calc.monthsSaved > 0 ? `${calc.monthsSaved} ${rc.months}` : "—", highlight: savingsPositive && calc.monthsSaved > 0 },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <Card className={`h-full ${card.highlight ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
                <CardContent className="p-4 flex flex-col items-center text-center justify-center h-full gap-1.5 pt-4">
                  <div className={card.highlight ? "text-primary" : "text-muted-foreground"}>{card.icon}</div>
                  <p className="text-xs text-muted-foreground font-medium leading-tight">{card.label}</p>
                  <p className={`text-xl font-display font-bold leading-none ${card.highlight ? "text-primary" : card.negative ? "text-destructive" : "text-foreground"}`}>
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Unified Input Card */}
        <Card className="overflow-hidden">

          {/* ── Property info row (full-width top band) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-6 pt-6 pb-6 bg-muted/20 border-b border-border/50">
            <div className="space-y-2">
              <Label>{rc.propertyValue}</Label>
              <InputWithAddon type="number" addonLeft="$" value={propertyValue.toString()} onChange={(e) => setPropertyValue(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{rc.currentMortgage}</Label>
              <InputWithAddon type="number" addonLeft="$" value={currentMortgage.toString()} onChange={(e) => setCurrentMortgage(Number(e.target.value))} />
            </div>
          </div>

          {/* ── Column headers ── */}
          <div className="grid grid-cols-2 gap-5 px-6 pt-5 pb-3 border-b border-dashed border-border/40">
            <p className="text-sm font-semibold text-muted-foreground">{rc.currentSection}</p>
            <p className="text-sm font-semibold text-primary">{rc.newSection}</p>
          </div>

          {/* ── Comparison rows — single CSS grid keeps left/right aligned ── */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-5 px-6 pt-5 pb-6">

            {/* Rate */}
            <div className="space-y-2">
              <Label>{rc.currentRate}</Label>
              <InputWithAddon type="number" addonRight="%" step="0.01" value={currentRate.toString()} onChange={(e) => setCurrentRate(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>{rc.newRate}</Label>
              <InputWithAddon type="number" addonRight="%" step="0.01" value={newRate.toString()} onChange={(e) => setNewRate(Number(e.target.value))} className="font-bold text-primary" />
            </div>

            {/* Amortization */}
            <AmortInput
              label={rc.amortLeft}
              valueMonths={amortLeftMonths}
              onChange={setAmortLeftMonths}
              unit={amortLeftUnit}
              onUnitChange={setAmortLeftUnit}
              labelYears={rc.unitYears}
              labelMonths={rc.unitMonths}
            />
            <AmortInput
              label={rc.newAmort}
              valueMonths={newAmortMonths}
              onChange={setNewAmortMonths}
              unit={newAmortUnit}
              onUnitChange={setNewAmortUnit}
              labelYears={rc.unitYears}
              labelMonths={rc.unitMonths}
            />

            {/* Term */}
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

            {/* Penalty & Equity — right column only, left cell is empty spacer */}
            <div />
            <div className="space-y-2">
              <Label>{rc.penaltyFees}</Label>
              <InputWithAddon type="number" addonLeft="$" value={penaltyFees.toString()} onChange={(e) => setPenaltyFees(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">{rc.penaltyFeesNote}</p>
            </div>

            <div />
            <div className="space-y-2">
              <Label>{rc.cashOut}</Label>
              <InputWithAddon
                type="number"
                addonLeft="$"
                value={cashOut.toString()}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(Number(e.target.value), calc.availableEquity));
                  setCashOut(v);
                }}
                disabled={!calc.canRefinance || calc.availableEquity <= 0}
              />
              <p className={`text-xs ${calc.availableEquity > 0 && calc.canRefinance ? "text-muted-foreground" : "text-destructive"}`}>
                {rc.cashOutNote}: <strong>{formatCurrency(calc.availableEquity)}</strong>
              </p>
            </div>
          </div>

          {/* ── Summary breakdown ── */}
          <div className="border-t border-border/50 bg-muted/10 px-6 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{rc.currentMortgage}</span>
              <span className="font-medium">{formatCurrency(currentMortgage)}</span>
            </div>
            {penaltyFees > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">+ {rc.penaltyFees}</span>
                <span className="font-medium">{formatCurrency(penaltyFees)}</span>
              </div>
            )}
            {calc.clampedCashOut > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">+ {rc.cashOut}</span>
                <span className="font-medium text-primary">{formatCurrency(calc.clampedCashOut)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline font-semibold border-t border-border/50 pt-3">
              <span className="text-sm">{rc.newSection} ({rc.newPaymentLabel})</span>
              <span className="text-2xl font-display text-foreground">{formatCurrency(calc.newPayment)}</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
