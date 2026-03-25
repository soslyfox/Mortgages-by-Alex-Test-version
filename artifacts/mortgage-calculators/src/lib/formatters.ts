export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0%";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 3,
  }).format(value / 100);
};

export const parseNumber = (value: string): number => {
  return Number(value.replace(/[^0-9.-]+/g, ""));
};

/**
 * Canadian minimum down payment rules:
 *   ≤ $500,000           → 5%
 *   $500,001–$1,499,999  → $25,000 + 10% of amount over $500,000
 *   ≥ $1,500,000         → $25,000 + $100,000 + 20% of amount over $1,500,000
 */
export function minDownPayment(price: number): number {
  if (price <= 500000) return price * 0.05;
  if (price <= 1500000) return 25000 + (price - 500000) * 0.10;
  return 125000 + (price - 1500000) * 0.20;
}
