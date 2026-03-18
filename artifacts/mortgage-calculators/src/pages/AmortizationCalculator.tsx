import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InputWithAddon } from "@/components/ui/input-addon";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(300000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0].substring(0, 7)); // YYYY-MM

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
      
      // Store yearly summary for the chart (every 12 months)
      if (month % 12 === 0 || month === numberOfPayments) {
        yearlyData.push({
          year: currentDate.getFullYear(),
          balance: Math.max(0, balance),
          totalInterestPaid: totalInterest,
          principalPaidThisYear: currentYearTotalPrincipal,
          interestPaidThisYear: currentYearTotalInterest
        });
        currentYearTotalInterest = 0;
        currentYearTotalPrincipal = 0;
      }

      amortizationSchedule.push({
        month,
        date: currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        totalInterest,
        balance: Math.max(0, balance)
      });
    }

    return {
      monthlyPayment,
      totalInterest,
      totalPayment: loanAmount + totalInterest,
      details: amortizationSchedule,
      yearlyData
    };
  }, [loanAmount, interestRate, loanTerm, startDate]);

  return (
    <AppLayout>
      <div className="bg-orange-500/5 py-8 md:py-12 border-b border-orange-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 text-orange-600 rounded-lg">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Amortization Schedule</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-lg">
            See exactly how much of your payment goes to principal vs interest over the entire life of your loan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Loan Amount</Label>
                <InputWithAddon 
                  type="number"
                  addonLeft="$"
                  value={loanAmount.toString()}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Interest Rate</Label>
                <InputWithAddon 
                  type="number"
                  addonRight="%"
                  step="0.125"
                  value={interestRate.toString()}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Loan Term</Label>
                <Select value={loanTerm.toString()} onValueChange={(v) => setLoanTerm(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Years Fixed</SelectItem>
                    <SelectItem value="20">20 Years Fixed</SelectItem>
                    <SelectItem value="15">15 Years Fixed</SelectItem>
                    <SelectItem value="10">10 Years Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date (YYYY-MM)</Label>
                <InputWithAddon 
                  type="month"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="pt-4 mt-4 border-t border-border/50">
                <div className="mb-2">
                  <span className="text-sm text-muted-foreground block">Monthly P&I Payment</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(schedule.monthlyPayment)}</span>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block">Total Interest Paid</span>
                  <span className="text-xl font-semibold">{formatCurrency(schedule.totalInterest)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle>Balance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={schedule.yearlyData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickMargin={10} />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12}
                        tickFormatter={(val) => `$${(val/1000)}k`}
                        width={60}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Year ${label}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        name="Remaining Balance"
                        stackId="1" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary)/0.2)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalInterestPaid" 
                        name="Total Interest Paid"
                        stackId="2" 
                        stroke="hsl(var(--orange-500))" 
                        fill="hsl(var(--orange-500)/0.2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardContent className="p-0">
                <Tabs defaultValue="yearly" className="w-full">
                  <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h3 className="font-semibold text-lg">Amortization Table</h3>
                    <TabsList>
                      <TabsTrigger value="yearly">Yearly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="yearly" className="m-0 p-0">
                    <div className="max-h-[500px] overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-right">Principal Paid</TableHead>
                            <TableHead className="text-right">Interest Paid</TableHead>
                            <TableHead className="text-right">Total Interest</TableHead>
                            <TableHead className="text-right font-bold">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.yearlyData.map((row) => (
                            <TableRow key={row.year}>
                              <TableCell className="font-medium">{row.year}</TableCell>
                              <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(row.principalPaidThisYear)}</TableCell>
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
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Payment</TableHead>
                            <TableHead className="text-right">Principal</TableHead>
                            <TableHead className="text-right">Interest</TableHead>
                            <TableHead className="text-right font-bold">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedule.details.slice(0, 360).map((row) => (
                            <TableRow key={row.month}>
                              <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                              <TableCell className="text-right">{formatCurrency(row.payment)}</TableCell>
                              <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(row.principal)}</TableCell>
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
