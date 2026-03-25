import { createContext, useContext, useState, ReactNode } from "react";

export interface CalculatorState {
  homePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  propertyTax: number;
  condoFee: number;
  heat: number;
  homeInsurance: number;
  other: number;
}

interface CalculatorContextType {
  calc: CalculatorState;
  setCalc: (patch: Partial<CalculatorState>) => void;
}

const defaults: CalculatorState = {
  homePrice: 400000,
  downPayment: 80000,
  loanTerm: 25,
  interestRate: 4,
  propertyTax: 3000,
  condoFee: 0,
  heat: 100,
  homeInsurance: 100,
  other: 0,
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [calc, setCalcState] = useState<CalculatorState>(defaults);

  const setCalc = (patch: Partial<CalculatorState>) =>
    setCalcState((prev) => ({ ...prev, ...patch }));

  return (
    <CalculatorContext.Provider value={{ calc, setCalc }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error("useCalculator must be used within CalculatorProvider");
  return ctx;
}
