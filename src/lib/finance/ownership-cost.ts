export interface OwnershipCostInput {
  purchasePrice: number;
  deposit: number;
  interestRate: number;
  loanTermYears: number;
  repaymentType: "principal_interest" | "interest_only";
  strataPerQuarter?: number;
  councilRatesPerQuarter?: number;
  waterPerQuarter?: number;
  insurancePerYear?: number;
  maintenancePerYear?: number;
  monthlyComfortPayment?: number;
}

export interface OwnershipCostOutput {
  loanAmount: number;
  monthlyRepayment: number;
  monthlyOwnershipCost: number;
  annualOwnershipCost: number;
  fiveYearHoldingCost: number;
  tenYearHoldingCost: number;
  stressTests: { rateIncrease: number; monthlyRepayment: number }[];
  affordability: "comfortable" | "stretch" | "danger" | "unknown";
}

function monthlyRepayment(
  principal: number,
  annualRate: number,
  years: number,
  interestOnly: boolean,
): number {
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (interestOnly) return principal * r;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateOwnershipCost(
  input: OwnershipCostInput,
): OwnershipCostOutput {
  const loanAmount = Math.max(0, input.purchasePrice - input.deposit);
  const monthlyRepaymentPI = monthlyRepayment(
    loanAmount,
    input.interestRate,
    input.loanTermYears,
    input.repaymentType === "interest_only",
  );

  const quarterlyExtras =
    (input.strataPerQuarter ?? 0) +
    (input.councilRatesPerQuarter ?? 0) +
    (input.waterPerQuarter ?? 0);
  const monthlyExtras = quarterlyExtras / 3 + (input.maintenancePerYear ?? 0) / 12 + (input.insurancePerYear ?? 0) / 12;

  const monthlyOwnershipCost = monthlyRepaymentPI + monthlyExtras;
  const annualOwnershipCost = monthlyOwnershipCost * 12;

  const stressTests = [1, 2, 3].map((inc) => ({
    rateIncrease: inc,
    monthlyRepayment: monthlyRepayment(
      loanAmount,
      input.interestRate + inc,
      input.loanTermYears,
      input.repaymentType === "interest_only",
    ),
  }));

  let affordability: OwnershipCostOutput["affordability"] = "unknown";
  if (input.monthlyComfortPayment && input.monthlyComfortPayment > 0) {
    const ratio = monthlyOwnershipCost / input.monthlyComfortPayment;
    if (ratio <= 0.85) affordability = "comfortable";
    else if (ratio <= 1.05) affordability = "stretch";
    else affordability = "danger";
  }

  return {
    loanAmount,
    monthlyRepayment: Math.round(monthlyRepaymentPI),
    monthlyOwnershipCost: Math.round(monthlyOwnershipCost),
    annualOwnershipCost: Math.round(annualOwnershipCost),
    fiveYearHoldingCost: Math.round(annualOwnershipCost * 5 + input.deposit * 0),
    tenYearHoldingCost: Math.round(annualOwnershipCost * 10),
    stressTests: stressTests.map((s) => ({
      ...s,
      monthlyRepayment: Math.round(s.monthlyRepayment),
    })),
    affordability,
  };
}
