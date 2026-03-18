import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function MortgageCalculator() {
  const { t } = useLanguage();
  const [homePrice, setHomePrice] = useState<number>(400000);
  const [downPayment, setDownPayment] = useState<number>(80000);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [propertyTax, setPropertyTax] = useState<number>(4000);
  const [homeInsurance, setHomeInsurance] = useState<number>(1200);
  const [hoa, setHoa] = useState<number>(0);

  const calculations = useMemo(() => {
    const loanAmount = Math.max(0, homePrice - downPayment);
    const monthlyInterestRate = (interestRate / 100) / 12;
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
    const monthlyHomeInsurance = homeInsurance / 12;
    const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) : 0;
    let monthlyPMI = 0;
    if (downPaymentPercent < 0.2 && loanAmount > 0) {
      monthlyPMI = (loanAmount * 0.0075) / 12;
    }
    const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax + monthlyHomeInsurance + hoa + monthlyPMI;
    const chartData = [
      { name: t.mortgageCalc.principalInterest, value: principalAndInterest, color: CHART_COLORS[0] },
      { name: t.mortgageCalc.propertyTaxes,     value: monthlyPropertyTax,   color: CHART_COLORS[1] },
      { name: t.mortgageCalc.homeIns,           value: monthlyHomeInsurance, color: CHART_COLORS[2] },
    ];
    if (hoa > 0) chartData.push({ name: t.mortgageCalc.hoa, value: hoa, color: CHART_COLORS[3] });
    if (monthlyPMI > 0) chartData.push({ name: t.mortgageCalc.pmi, value: monthlyPMI, color: 'hsl(var(--chart-5))' });
    return { loanAmount, downPaymentPercent: downPaymentPercent * 100, principalAndInterest, monthlyPropertyTax, monthlyHomeInsurance, monthlyPMI, totalMonthlyPayment, chartData };
  }, [homePrice, downPayment, loanTerm, interestRate, propertyTax, homeInsurance, hoa, t]);

  const handleHomePriceChange = (val: number) => {
    setHomePrice(val);
    setDownPayment(val * (calculations.downPaymentPercent / 100));
  };
  const handleDownPaymentChange = (val: number) => setDownPayment(Math.min(val, homePrice));
  const handleDownPaymentPercentChange = (val: number) => setDownPayment(homePrice * (val / 100));

  return (
    <AppLayout>
      <div className="bg-muted/30 py-8 md:py-12 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">{t.mortgageCalc.title}</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">{t.mortgageCalc.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
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
                      <InputWithAddon type="number" addonLeft="$" value={Math.round(downPayment).toString()} onChange={(e) => handleDownPaymentChange(Number(e.target.value))} />
                      <InputWithAddon type="number" addonRight="%" value={calculations.downPaymentPercent.toFixed(1)} onChange={(e) => handleDownPaymentPercentChange(Number(e.target.value))} />
                    </div>
                  </div>
                  <Slider value={[calculations.downPaymentPercent]} min={0} max={100} step={0.1} onValueChange={(val) => handleDownPaymentPercentChange(val[0])} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label className="text-base">{t.mortgageCalc.loanTerm}</Label>
                    <Select value={loanTerm.toString()} onValueChange={(v) => setLoanTerm(Number(v))}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{t.mortgageCalc.years30}</SelectItem>
                        <SelectItem value="20">{t.mortgageCalc.years20}</SelectItem>
                        <SelectItem value="15">{t.mortgageCalc.years15}</SelectItem>
                        <SelectItem value="10">{t.mortgageCalc.years10}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">{t.mortgageCalc.interestRate}</Label>
                    <InputWithAddon type="number" addonRight="%" value={interestRate.toString()} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.125" />
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
                    <InputWithAddon type="number" addonLeft="$" value={propertyTax.toString()} onChange={(e) => setPropertyTax(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.mortgageCalc.homeInsurance}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={homeInsurance.toString()} onChange={(e) => setHomeInsurance(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t.mortgageCalc.hoaFees}</Label>
                    <InputWithAddon type="number" addonLeft="$" value={hoa.toString()} onChange={(e) => setHoa(Number(e.target.value))} />
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
                  {calculations.downPaymentPercent < 20 && (
                    <div className="mt-6 p-4 bg-orange-500/10 rounded-xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-orange-700 dark:text-orange-300">{t.mortgageCalc.pmiNote}</p>
                    </div>
                  )}
                  <div className="mt-8 pt-6 border-t border-border/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.mortgageCalc.loanAmount}</span>
                      <span className="font-semibold">{formatCurrency(calculations.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t.mortgageCalc.totalInterestPaid}</span>
                      <span className="font-semibold">{formatCurrency((calculations.principalAndInterest * loanTerm * 12) - calculations.loanAmount)}</span>
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
