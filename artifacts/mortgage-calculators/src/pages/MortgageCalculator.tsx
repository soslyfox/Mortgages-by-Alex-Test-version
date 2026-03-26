import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, minDownPayment } from "@/lib/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Info, Calculator } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalculator } from "@/contexts/CalculatorContext";

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

/** Show up to `decimals` places, stripping trailing zeros so whole numbers show without a decimal point */
function stripTrailingZero(value: number, decimals = 2): string {
  return parseFloat(value.toFixed(decimals)).toString();
}

export default function MortgageCalculator() {
  const { t } = useLanguage();
  const { calc, setCalc } = useCalculator();

  const { homePrice, downPayment, loanTerm, interestRate, propertyTax, condoFee, heat, homeInsurance, other } = calc;

  const calculations = useMemo(() => {
    const baseLoanAmount = Math.max(0, homePrice - downPayment);
    const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) : 0;

    // Canadian CMHC mortgage default insurance (added to principal, not monthly)
    // 30-year amortization carries an extra 0.20% surcharge on each bracket
    const cmhcSurcharge = loanTerm >= 30 ? 0.002 : 0;
    let cmhcRate = 0;
    if (downPaymentPercent < 0.10) cmhcRate = 0.040 + cmhcSurcharge;
    else if (downPaymentPercent < 0.15) cmhcRate = 0.031 + cmhcSurcharge;
    else if (downPaymentPercent < 0.20) cmhcRate = 0.028 + cmhcSurcharge;
    const cmhcPremium = baseLoanAmount * cmhcRate;
    const loanAmount = baseLoanAmount + cmhcPremium;

    // Canadian mortgages: semi-annual compounding (Bank Act requirement)
    const monthlyInterestRate = Math.pow(1 + (interestRate / 100) / 2, 1 / 6) - 1;
    const numberOfPayments = loanTerm * 12;
    let principalAndInterest = 0;
    if (monthlyInterestRate > 0) {
      principalAndInterest = loanAmount *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else if (numberOfPayments > 0) {
      principalAndInterest = loanAmount / numberOfPayments;
    }

    const monthlyPropertyTax = propertyTax / 12;
    // GDS-impacting costs (for reference/display)
    const gdsMonthly = principalAndInterest + monthlyPropertyTax + heat + condoFee * 0.5;
    // Total monthly (all costs)
    const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax + condoFee + heat + homeInsurance + other;

    const chartData = [
      { name: t.mortgageCalc.principalInterest, value: principalAndInterest, color: CHART_COLORS[0] },
      { name: t.mortgageCalc.propertyTaxes,     value: monthlyPropertyTax,   color: CHART_COLORS[1] },
    ];
    if (condoFee > 0)       chartData.push({ name: t.mortgageCalc.condoFeeChart,     value: condoFee,      color: CHART_COLORS[2] });
    if (heat > 0)           chartData.push({ name: t.mortgageCalc.heatChart,          value: heat,          color: CHART_COLORS[3] });
    if (homeInsurance > 0)  chartData.push({ name: t.mortgageCalc.homeInsuranceChart, value: homeInsurance, color: CHART_COLORS[4] });
    if (other > 0)          chartData.push({ name: t.mortgageCalc.otherChart,         value: other,         color: 'hsl(220 70% 60%)' });

    return { baseLoanAmount, loanAmount, cmhcPremium, downPaymentPercent: downPaymentPercent * 100, principalAndInterest, monthlyPropertyTax, gdsMonthly, totalMonthlyPayment, chartData };
  }, [homePrice, downPayment, loanTerm, interestRate, propertyTax, condoFee, heat, homeInsurance, other, t]);

  const minDown = minDownPayment(homePrice);
  const minDownPercent = homePrice > 0 ? (minDown / homePrice) * 100 : 5;
  // Slider snaps to the minimum down payment if dragged within this many % points
  const SNAP_TOLERANCE = 0.3;

  const handleHomePriceChange = (val: number) => {
    const pct = homePrice > 0 ? downPayment / homePrice : 0;
    setCalc({ homePrice: val, downPayment: val * pct });
  };

  const handleDownPaymentSlider = (rawPct: number) => {
    if (Math.abs(rawPct - minDownPercent) <= SNAP_TOLERANCE) {
      setCalc({ downPayment: minDown });
    } else {
      setCalc({ downPayment: homePrice * (rawPct / 100) });
    }
  };

  return (
    <AppLayout>
      <div className="bg-primary/5 py-4 md:py-6 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <Calculator className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{t.mortgageCalc.title}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">{t.mortgageCalc.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>{t.mortgageCalc.loanDetails}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <Label className="text-base">{t.mortgageCalc.homePrice}</Label>
                    <div className="w-1/2 md:w-1/3">
                      <InputWithAddon type="number" addonLeft="$" value={homePrice.toString()} onChange={(e) => handleHomePriceChange(Number(e.target.value))} className="font-semibold" />
                    </div>
                  </div>
                  <Slider value={[homePrice]} min={50000} max={2000000} step={1000} onValueChange={(val) => handleHomePriceChange(val[0])} />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-end">
                    <Label className="text-base">{t.mortgageCalc.downPayment}</Label>
                    <div className="flex gap-2 w-2/3 md:w-1/2">
                      <InputWithAddon type="number" addonLeft="$" value={Math.round(downPayment).toString()} onChange={(e) => setCalc({ downPayment: Math.min(Number(e.target.value), homePrice) })} />
                      <InputWithAddon type="number" addonRight="%" value={stripTrailingZero(calculations.downPaymentPercent, 2)} onChange={(e) => setCalc({ downPayment: homePrice * (Number(e.target.value) / 100) })} step="any" />
                    </div>
                  </div>
                  <Slider
                    value={[calculations.downPaymentPercent]}
                    min={0} max={100} step={0.1}
                    onValueChange={(val) => handleDownPaymentSlider(val[0])}
                  />
                  {homePrice > 0 && downPayment < minDown && (
                    <p className="text-xs text-destructive font-medium">
                      {t.mortgageCalc.minDownWarning} {formatCurrency(minDown)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-base">{t.mortgageCalc.loanTerm}</Label>
                    <Select value={loanTerm.toString()} onValueChange={(v) => setCalc({ loanTerm: Number(v) })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{t.mortgageCalc.years30}</SelectItem>
                        <SelectItem value="25">{t.mortgageCalc.years25}</SelectItem>
                        <SelectItem value="20">{t.mortgageCalc.years20}</SelectItem>
                        <SelectItem value="15">{t.mortgageCalc.years15}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">{t.mortgageCalc.interestRate}</Label>
                    <InputWithAddon type="number" addonRight="%" value={stripTrailingZero(interestRate, 3)} onChange={(e) => setCalc({ interestRate: Number(e.target.value) })} step="any" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>{t.mortgageCalc.taxesInsHoa}</CardTitle>
                <CardDescription>{t.mortgageCalc.estimatedAnnual}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t.mortgageCalc.propertyTax}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={propertyTax.toString()} onChange={(e) => setCalc({ propertyTax: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.mortgageCalc.condoFee}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={condoFee.toString()} onChange={(e) => setCalc({ condoFee: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.mortgageCalc.heat}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={heat.toString()} onChange={(e) => setCalc({ heat: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.mortgageCalc.homeInsurance}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={homeInsurance.toString()} onChange={(e) => setCalc({ homeInsurance: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.mortgageCalc.other}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={other.toString()} onChange={(e) => setCalc({ other: Number(e.target.value) })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <motion.div className="sticky top-24" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <Card className="shadow-xl border-primary/20 bg-card overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-border/50 text-center">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">{t.mortgageCalc.estMonthlyPayment}</h3>
                  <div className="text-5xl font-display font-bold text-foreground">{formatCurrency(calculations.totalMonthlyPayment)}</div>
                </div>
                <CardContent className="p-6">
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={calculations.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {calculations.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {calculations.chartData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.mortgageCalc.loanAmount}</span>
                      <span className="font-semibold">{formatCurrency(calculations.baseLoanAmount)}</span>
                    </div>
                    {calculations.cmhcPremium > 0 && (
                      <div className="flex justify-between text-sm items-center">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {t.mortgageCalc.pmi}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="inline-flex text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="w-48 p-3 space-y-2">
                              <p className="text-xs font-semibold text-white">{t.mortgageCalc.pmi}</p>
                              <p className="text-xs text-white/60">{t.mortgageCalc.pmiNote}</p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-white/50">
                                    <th className="text-left font-normal pb-1">Down payment</th>
                                    <th className="text-right font-normal pb-1">Premium</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  <tr><td className="py-0.5 text-white/80">5 – 9.99%</td><td className="text-right font-semibold text-white">{loanTerm >= 30 ? '4.20%' : '4.00%'}</td></tr>
                                  <tr><td className="py-0.5 text-white/80">10 – 14.99%</td><td className="text-right font-semibold text-white">{loanTerm >= 30 ? '3.30%' : '3.10%'}</td></tr>
                                  <tr><td className="py-0.5 text-white/80">15 – 19.99%</td><td className="text-right font-semibold text-white">{loanTerm >= 30 ? '3.00%' : '2.80%'}</td></tr>
                                </tbody>
                              </table>
                              {loanTerm >= 30 && <p className="text-xs text-white/50 border-t border-white/10 pt-2">+0.20% surcharge for 30-yr amortization</p>}
                            </TooltipContent>
                          </Tooltip>
                        </span>
                        <span className="font-semibold text-orange-600">+{formatCurrency(calculations.cmhcPremium)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.mortgageCalc.totalLoanAmount}</span>
                      <span className="font-semibold">{formatCurrency(calculations.loanAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
