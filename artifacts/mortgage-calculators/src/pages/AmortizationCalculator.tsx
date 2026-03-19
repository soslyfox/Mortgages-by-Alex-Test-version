import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AmortizationCalculator() {
  const { t, language } = useLanguage();
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(4);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 7));

  const locale = language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US';

  const schedule = useMemo(() => {
    const monthlyRate = (interestRate / 100) / 12;
    const numberOfPayments = loanTerm * 12;
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = loanAmount / numberOfPayments;
    }
    let balance = loanAmount;
    let totalInterest = 0;
    const amortizationSchedule = [];
    const yearlyData = [];
    const startYear = parseInt(startDate.split('-')[0]);
    const startMonth = parseInt(startDate.split('-')[1]) - 1;
    let currentYearTotalInterest = 0;
    let currentYearTotalPrincipal = 0;
    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      totalInterest += interestPayment;
      currentYearTotalInterest += interestPayment;
      currentYearTotalPrincipal += principalPayment;
      const currentDate = new Date(startYear, startMonth + month, 1);
      if (month % 12 === 0 || month === numberOfPayments) {
        yearlyData.push({ year: currentDate.getFullYear(), balance: Math.max(0, balance), totalInterestPaid: totalInterest, principalPaidThisYear: currentYearTotalPrincipal, interestPaidThisYear: currentYearTotalInterest });
        currentYearTotalInterest = 0;
        currentYearTotalPrincipal = 0;
      }
      amortizationSchedule.push({
        month,
        date: currentDate.toLocaleDateString(locale, { month: 'short', year: 'numeric' }),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        totalInterest,
        balance: Math.max(0, balance)
      });
    }
    return { monthlyPayment, totalInterest, totalPayment: loanAmount + totalInterest, details: amortizationSchedule, yearlyData };
  }, [loanAmount, interestRate, loanTerm, startDate, locale]);

  return (
    <AppLayout>
      <div className="bg-primary/5 py-8 md:py-12 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{t.amortCalc.title}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">{t.amortCalc.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>{t.amortCalc.loanDetails}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>{t.amortCalc.loanAmount}</Label>
                <InputWithAddon type="number" addonLeft="$" value={loanAmount.toString()} onChange={(e) => setLoanAmount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>{t.amortCalc.interestRate}</Label>
                <InputWithAddon type="number" addonRight="%" step="0.125" value={interestRate.toString()} onChange={(e) => setInterestRate(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>{t.amortCalc.loanTerm}</Label>
                <Select value={loanTerm.toString()} onValueChange={(v) => setLoanTerm(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t.amortCalc.years30}</SelectItem>
                    <SelectItem value="25">{t.amortCalc.years25}</SelectItem>
                    <SelectItem value="20">{t.amortCalc.years20}</SelectItem>
                    <SelectItem value="15">{t.amortCalc.years15}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.amortCalc.startDate}</Label>
                <InputWithAddon type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="pt-4 mt-4 border-t border-border/50">
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground block">{t.amortCalc.monthlyPayment}</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(schedule.monthlyPayment)}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">{t.amortCalc.totalInterest}</span>
                  <span className="text-xl font-semibold">{formatCurrency(schedule.totalInterest)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>{t.amortCalc.balanceOverTime}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={schedule.yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickMargin={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `$${(val / 1000)}k`} width={60} />
                      <RechartsTooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `${t.amortCalc.yearLabel} ${label}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="balance" name={t.amortCalc.remainingBalance} stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
                      <Area type="monotone" dataKey="totalInterestPaid" name={t.amortCalc.totalInterestPaid} stackId="2" stroke="#f97316" fill="rgba(249,115,22,0.2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-0">
                <Tabs defaultValue="yearly" className="w-full">
                  <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h3 className="font-semibold text-lg">{t.amortCalc.amortTable}</h3>
                    <TabsList>
                      <TabsTrigger value="yearly">{t.amortCalc.yearly}</TabsTrigger>
                      <TabsTrigger value="monthly">{t.amortCalc.monthly}</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="yearly" className="m-0 p-0">
                    <div className="max-h-[500px] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                          <TableRow>
                            <TableHead>{t.amortCalc.year}</TableHead>
                            <TableHead className="text-right">{t.amortCalc.principalPaid}</TableHead>
                            <TableHead className="text-right">{t.amortCalc.interestPaid}</TableHead>
                            <TableHead className="text-right">{t.amortCalc.cumInterest}</TableHead>
                            <TableHead className="text-right font-bold">{t.amortCalc.balance}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.yearlyData.map((row) => (
                            <TableRow key={row.year}>
                              <TableCell className="font-medium">{row.year}</TableCell>
                              <TableCell className="text-right text-primary">{formatCurrency(row.principalPaidThisYear)}</TableCell>
                              <TableCell className="text-right text-orange-600 dark:text-orange-400">{formatCurrency(row.interestPaidThisYear)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.totalInterestPaid)}</TableCell>
                              <TableCell className="text-right font-bold">{formatCurrency(row.balance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="monthly" className="m-0 p-0">
                    <div className="max-h-[500px] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                          <TableRow>
                            <TableHead>{t.amortCalc.date}</TableHead>
                            <TableHead className="text-right">{t.amortCalc.payment}</TableHead>
                            <TableHead className="text-right">{t.amortCalc.principal}</TableHead>
                            <TableHead className="text-right">{t.amortCalc.interest}</TableHead>
                            <TableHead className="text-right font-bold">{t.amortCalc.balance}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.details.slice(0, 360).map((row) => (
                            <TableRow key={row.month}>
                              <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
                              <TableCell className="text-right text-primary">{formatCurrency(row.principal)}</TableCell>
                              <TableCell className="text-right text-orange-600 dark:text-orange-400">{formatCurrency(row.interest)}</TableCell>
                              <TableCell className="text-right font-bold">{formatCurrency(row.balance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
