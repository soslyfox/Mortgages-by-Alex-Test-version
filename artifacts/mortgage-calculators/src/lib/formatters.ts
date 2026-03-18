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
