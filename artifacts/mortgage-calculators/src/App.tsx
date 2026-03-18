import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Home from "@/pages/Home";
import MortgageCalculator from "@/pages/MortgageCalculator";
import AffordabilityCalculator from "@/pages/AffordabilityCalculator";
import RefinanceCalculator from "@/pages/RefinanceCalculator";
import AmortizationCalculator from "@/pages/AmortizationCalculator";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mortgage-calculator" component={MortgageCalculator} />
      <Route path="/affordability-calculator" component={AffordabilityCalculator} />
      <Route path="/refinance-calculator" component={RefinanceCalculator} />
      <Route path="/amortization-calculator" component={AmortizationCalculator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
