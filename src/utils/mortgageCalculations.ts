import { MortgageConfig, MortgageCalculationResult } from '../types/hdb';

/**
 * Calculates Buyer's Stamp Duty (BSD) according to IRAS Singapore rates:
 * - 1% on first $180,000
 * - 2% on next $180,000 ($180,001 - $360,000)
 * - 3% on next $640,000 ($360,001 - $1,000,000)
 * - 4% on next $500,000 ($1,000,001 - $1,500,000)
 * - 5% on amount exceeding $1,500,000
 */
export function calculateBSD(price: number): number {
  if (price <= 0) return 0;
  let bsd = 0;

  // Tier 1: First 180k @ 1%
  const tier1 = Math.min(price, 180000);
  bsd += tier1 * 0.01;

  // Tier 2: Next 180k (180k - 360k) @ 2%
  if (price > 180000) {
    const tier2 = Math.min(price - 180000, 180000);
    bsd += tier2 * 0.02;
  }

  // Tier 3: Next 640k (360k - 1,000,000) @ 3%
  if (price > 360000) {
    const tier3 = Math.min(price - 360000, 640000);
    bsd += tier3 * 0.03;
  }

  // Tier 4: Next 500k (1,000,000 - 1,500,000) @ 4%
  if (price > 1000000) {
    const tier4 = Math.min(price - 1000000, 500000);
    bsd += tier4 * 0.04;
  }

  // Tier 5: Above 1,500,000 @ 5%
  if (price > 1500000) {
    const tier5 = price - 1500000;
    bsd += tier5 * 0.05;
  }

  return Math.round(bsd);
}

/**
 * Calculates monthly mortgage payment using standard amortization formula
 */
export function calculateMonthlyInstallment(
  principal: number,
  annualInterestRatePercent: number,
  tenureYears: number
): number {
  if (principal <= 0 || tenureYears <= 0) return 0;
  const monthlyRate = annualInterestRatePercent / 100 / 12;
  const totalMonths = tenureYears * 12;

  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const installment = (principal * (monthlyRate * factor)) / (factor - 1);
  return Math.round(installment);
}

/**
 * Complete mortgage assessment with MSR (30% cap) & TDSR (55% cap) checks
 */
export function evaluateMortgage(config: MortgageConfig): MortgageCalculationResult {
  const {
    propertyPrice,
    downpaymentPercent,
    cashPercent,
    cpfPercent,
    interestRate,
    loanTenureYears,
    monthlyHouseholdIncome,
    monthlyOtherDebts,
  } = config;

  const downpaymentTotal = Math.round(propertyPrice * (downpaymentPercent / 100));
  const downpaymentCash = Math.round(propertyPrice * (cashPercent / 100));
  const downpaymentCpf = Math.round(propertyPrice * (cpfPercent / 100));
  const loanAmount = Math.max(0, propertyPrice - downpaymentTotal);

  const monthlyInstallment = calculateMonthlyInstallment(loanAmount, interestRate, loanTenureYears);
  const totalMonths = loanTenureYears * 12;
  const totalRepayment = monthlyInstallment * totalMonths;
  const totalInterestPaid = Math.max(0, totalRepayment - loanAmount);
  const bsdAmount = calculateBSD(propertyPrice);

  // MSR: Monthly Installment / Gross Household Income (capped at 30% for HDB)
  const msrPercent = monthlyHouseholdIncome > 0
    ? Number(((monthlyInstallment / monthlyHouseholdIncome) * 100).toFixed(1))
    : 0;
  const msrExceeded = msrPercent > 30;

  // TDSR: (Monthly Installment + Other Debts) / Gross Household Income (capped at 55%)
  const totalMonthlyDebt = monthlyInstallment + monthlyOtherDebts;
  const tdsrPercent = monthlyHouseholdIncome > 0
    ? Number(((totalMonthlyDebt / monthlyHouseholdIncome) * 100).toFixed(1))
    : 0;
  const tdsrExceeded = tdsrPercent > 55;

  // Estimated CPF OA monthly allocation (approx 23% of wage, capped at ordinary wage ceiling of $6,800/mo)
  const cappedIncome = Math.min(monthlyHouseholdIncome, 6800);
  const estimatedCpfMonthlyOA = Math.round(cappedIncome * 0.23);

  // Net Cash Outlay needed if CPF OA doesn't fully cover installment
  const netCashOutlayMonthly = Math.max(0, monthlyInstallment - estimatedCpfMonthlyOA);

  return {
    loanAmount,
    downpaymentTotal,
    downpaymentCash,
    downpaymentCpf,
    monthlyInstallment,
    totalInterestPaid,
    totalRepayment,
    bsdAmount,
    msrPercent,
    msrExceeded,
    tdsrPercent,
    tdsrExceeded,
    estimatedCpfMonthlyOA,
    netCashOutlayMonthly,
  };
}

export function formatSGD(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0,
  }).format(amount);
}
