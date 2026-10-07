import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  PieChart,
  HelpCircle,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { HDBListing, MortgageConfig } from '../types/hdb';
import { evaluateMortgage, formatSGD, calculateBSD } from '../utils/mortgageCalculations';

interface MortgageCalculatorProps {
  prefilledListing?: HDBListing | null;
  onClearPrefilled?: () => void;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({
  prefilledListing,
  onClearPrefilled,
}) => {
  const [config, setConfig] = useState<MortgageConfig>({
    loanType: 'hdb',
    propertyPrice: 750000,
    downpaymentPercent: 20,
    cashPercent: 0,
    cpfPercent: 20,
    interestRate: 2.6,
    loanTenureYears: 25,
    monthlyHouseholdIncome: 9500,
    monthlyOtherDebts: 600,
  });

  // Sync when prefilledListing is supplied
  useEffect(() => {
    if (prefilledListing) {
      setConfig((prev) => ({
        ...prev,
        propertyPrice: prefilledListing.price,
      }));
    }
  }, [prefilledListing]);

  // Handle loan type toggles
  const handleSelectLoanType = (type: 'hdb' | 'bank') => {
    if (type === 'hdb') {
      setConfig((prev) => ({
        ...prev,
        loanType: 'hdb',
        interestRate: 2.6,
        downpaymentPercent: 20,
        cashPercent: 0,
        cpfPercent: 20,
        loanTenureYears: Math.min(prev.loanTenureYears, 25),
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        loanType: 'bank',
        interestRate: 2.95,
        downpaymentPercent: 25,
        cashPercent: 5,
        cpfPercent: 20,
        loanTenureYears: 30,
      }));
    }
  };

  const result = evaluateMortgage(config);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              MAS & HDB Compliant Engine
            </span>
            <span className="text-xs text-slate-400">IRAS BSD 2026 Tiers</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            HDB Housing Loan & Bank Mortgage Affordability Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Simulate monthly installments, test against Singapore's 30% Mortgage Servicing Ratio (MSR) and 55% Total Debt Servicing Ratio (TDSR) limits, and calculate cash/CPF downpayments.
          </p>
        </div>

        {prefilledListing && (
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Currently evaluating:</span>
              <div className="font-bold text-slate-900">{prefilledListing.block} {prefilledListing.streetName}</div>
              <div className="text-slate-500 font-mono">{formatSGD(prefilledListing.price)}</div>
            </div>
            {onClearPrefilled && (
              <button
                onClick={onClearPrefilled}
                className="text-xs text-slate-400 hover:text-slate-700 underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters (5 columns) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Loan & Financial Parameters</span>
            </h3>

            {/* Loan Type Pill Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => handleSelectLoanType('hdb')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  config.loanType === 'hdb'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HDB Loan (2.6%)
              </button>
              <button
                onClick={() => handleSelectLoanType('bank')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  config.loanType === 'bank'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bank Loan (2.95%)
              </button>
            </div>
          </div>

          {/* Property Purchase Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">Purchase Price</label>
              <span className="font-bold text-slate-900 font-mono">{formatSGD(config.propertyPrice)}</span>
            </div>
            <input
              type="number"
              step={10000}
              min={200000}
              max={2000000}
              value={config.propertyPrice}
              onChange={(e) => setConfig({ ...config, propertyPrice: Number(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {/* Quick Price Buttons */}
            <div className="flex gap-1 pt-1">
              {[500000, 700000, 850000, 1000000].map((pr) => (
                <button
                  key={pr}
                  onClick={() => setConfig({ ...config, propertyPrice: pr })}
                  className="flex-1 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                >
                  ${(pr / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Downpayment & Loan Tenure */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                Downpayment %
              </label>
              <select
                value={config.downpaymentPercent}
                onChange={(e) => {
                  const dp = Number(e.target.value);
                  const cash = config.loanType === 'bank' ? 5 : 0;
                  setConfig({
                    ...config,
                    downpaymentPercent: dp,
                    cashPercent: cash,
                    cpfPercent: dp - cash,
                  });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                {config.loanType === 'hdb' ? (
                  <>
                    <option value={20}>20% (Max 80% LTV)</option>
                    <option value={25}>25% Downpayment</option>
                    <option value={30}>30% Downpayment</option>
                  </>
                ) : (
                  <>
                    <option value={25}>25% (Max 75% LTV, min 5% cash)</option>
                    <option value={30}>30% (5% cash + 25% CPF)</option>
                    <option value={40}>40% Downpayment</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                Loan Tenure
              </label>
              <select
                value={config.loanTenureYears}
                onChange={(e) => setConfig({ ...config, loanTenureYears: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value={15}>15 Years</option>
                <option value={20}>20 Years</option>
                <option value={25}>25 Years {config.loanType === 'hdb' ? '(HDB Max)' : ''}</option>
                {config.loanType === 'bank' && <option value={30}>30 Years (Bank Max)</option>}
              </select>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                Interest Rate (% p.a.)
              </label>
              <span className="font-bold text-slate-900">{config.interestRate.toFixed(2)}%</span>
            </div>
            <input
              type="range"
              step={0.05}
              min={1.5}
              max={5.0}
              value={config.interestRate}
              onChange={(e) => setConfig({ ...config, interestRate: Number(e.target.value) })}
              className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>HDB Concessionary: 2.60%</span>
              <span>Bank Fixed/SORA: ~2.8% – 3.2%</span>
            </div>
          </div>

          {/* Combined Household Income & Existing Debts */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                Combined Gross Monthly Household Income (SGD)
              </label>
              <input
                type="number"
                step={500}
                min={2000}
                max={50000}
                value={config.monthlyHouseholdIncome}
                onChange={(e) =>
                  setConfig({ ...config, monthlyHouseholdIncome: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-[11px] text-slate-400">
                Used to test 30% MSR and 55% TDSR regulatory limits.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                Other Existing Monthly Debts (Car, Cards, Loans)
              </label>
              <input
                type="number"
                step={100}
                min={0}
                max={15000}
                value={config.monthlyOtherDebts}
                onChange={(e) =>
                  setConfig({ ...config, monthlyOtherDebts: Number(e.target.value) || 0 })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Output & Affordability Breakdown (7 columns) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Monthly Payment Hero Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Estimated Monthly Mortgage
                </span>
                <div className="text-4xl font-black tracking-tight mt-1">
                  {formatSGD(result.monthlyInstallment)}
                  <span className="text-sm font-normal text-slate-400"> / month</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Based on loan of <strong className="text-white">{formatSGD(result.loanAmount)}</strong> over {config.loanTenureYears} years @ {config.interestRate}%
                </div>
              </div>

              {/* CPF OA coverage box */}
              <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl text-xs space-y-1.5 md:text-right">
                <span className="text-slate-400 block font-medium">Estimated Monthly CPF OA:</span>
                <div className="text-emerald-400 font-bold text-base font-mono">
                  +{formatSGD(result.estimatedCpfMonthlyOA)}/mo
                </div>
                <div className="text-[11px] text-slate-300">
                  {result.netCashOutlayMonthly > 0 ? (
                    <span>Est. Net Cash Outlay: <strong className="text-amber-400 font-semibold">{formatSGD(result.netCashOutlayMonthly)}</strong>/mo</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">100% Fully Covered by CPF OA!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Interest & Repayment Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Principal Borrowed</span>
                <strong className="text-white font-semibold">{formatSGD(result.loanAmount)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Total Interest Paid</span>
                <strong className="text-amber-400 font-semibold">{formatSGD(result.totalInterestPaid)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">IRAS Stamp Duty (BSD)</span>
                <strong className="text-emerald-400 font-semibold">{formatSGD(result.bsdAmount)}</strong>
              </div>
            </div>
          </div>

          {/* Regulatory Eligibility Cards: MSR & TDSR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MSR (30% Cap) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">Mortgage Servicing Ratio (MSR)</span>
                </div>
                {result.msrExceeded ? (
                  <span className="text-rose-700 bg-rose-50 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Exceeds Cap
                  </span>
                ) : (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Eligible (Pass)
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 font-medium">Current Ratio:</span>
                <span className="text-base font-bold text-slate-900 font-mono">{result.msrPercent}% <span className="text-slate-400 text-xs font-normal">/ 30% cap</span></span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.msrExceeded ? 'bg-rose-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (result.msrPercent / 30) * 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                HDB buyers cannot spend more than 30% of gross household income on flat mortgage.
              </p>
            </div>

            {/* TDSR (55% Cap) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">Total Debt Servicing Ratio (TDSR)</span>
                </div>
                {result.tdsrExceeded ? (
                  <span className="text-rose-700 bg-rose-50 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Exceeds Cap
                  </span>
                ) : (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Eligible (Pass)
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 font-medium">All Monthly Debts:</span>
                <span className="text-base font-bold text-slate-900 font-mono">{result.tdsrPercent}% <span className="text-slate-400 text-xs font-normal">/ 55% cap</span></span>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.tdsrExceeded ? 'bg-rose-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (result.tdsrPercent / 55) * 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                MAS rules stipulate total debt repayments cannot exceed 55% of monthly income.
              </p>
            </div>
          </div>

          {/* Upfront Cash & CPF Outlay Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Purchase Milestone Cash & CPF Outlay Breakdown
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-bold text-slate-900">1. Option to Purchase (OTP) Fee</div>
                  <div className="text-[11px] text-slate-500">Paid in cash upon securing the flat offer</div>
                </div>
                <div className="font-bold text-slate-900 font-mono">$1,000 (Cash)</div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-bold text-slate-900">2. Option Exercise Fee</div>
                  <div className="text-[11px] text-slate-500">Paid in cash within 21 days to confirm contract</div>
                </div>
                <div className="font-bold text-slate-900 font-mono">$4,000 (Cash)</div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-bold text-slate-900">3. Balance Downpayment</div>
                  <div className="text-[11px] text-slate-500">
                    {config.loanType === 'hdb'
                      ? 'Remaining 20% downpayment payable via CPF OA or cash'
                      : 'Remaining 25% (Min 5% cash, remainder CPF OA)'}
                  </div>
                </div>
                <div className="font-bold text-slate-900 font-mono">
                  {formatSGD(result.downpaymentTotal - 5000)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-bold text-slate-900">4. IRAS Buyer's Stamp Duty (BSD)</div>
                  <div className="text-[11px] text-slate-500">Payable within 14 days of OTP exercise (CPF OA or cash)</div>
                </div>
                <div className="font-bold text-slate-900 font-mono">{formatSGD(result.bsdAmount)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
