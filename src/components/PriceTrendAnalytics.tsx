import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Building,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { HISTORICAL_PRICE_TRENDS, SINGAPORE_TOWNS } from '../data/townStats';
import { formatSGD } from '../utils/mortgageCalculations';
import { TownName } from '../types/hdb';

interface PriceTrendAnalyticsProps {
  onFilterByTown: (town: TownName) => void;
}

export const PriceTrendAnalytics: React.FC<PriceTrendAnalyticsProps> = ({ onFilterByTown }) => {
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Central' | 'East' | 'West' | 'North' | 'North-East'>('All');
  const [selectedMetric, setSelectedMetric] = useState<'index' | 'psf'>('index');

  const filteredTowns = SINGAPORE_TOWNS.filter(
    (t) => selectedRegion === 'All' || t.region === selectedRegion
  );

  // Latest quarters
  const latestDataPoint = HISTORICAL_PRICE_TRENDS[HISTORICAL_PRICE_TRENDS.length - 1];
  const earliestDataPoint = HISTORICAL_PRICE_TRENDS[0];
  const totalGrowthPercent = (
    ((latestDataPoint.hdbResaleIndex - earliestDataPoint.hdbResaleIndex) /
      earliestDataPoint.hdbResaleIndex) *
    100
  ).toFixed(1);

  // SVG Chart calculation for Resale Index (2022 to 2026)
  const chartHeight = 200;
  const chartWidth = 700;
  const minIndex = 150;
  const maxIndex = 215;

  const getPoints = () => {
    return HISTORICAL_PRICE_TRENDS.map((dp, i) => {
      const x = (i / (HISTORICAL_PRICE_TRENDS.length - 1)) * (chartWidth - 40) + 20;
      const val = selectedMetric === 'index' ? dp.hdbResaleIndex : dp.centralMedianPsf;
      const minVal = selectedMetric === 'index' ? minIndex : 500;
      const maxVal = selectedMetric === 'index' ? maxIndex : 1050;
      const y = chartHeight - ((val - minVal) / (maxVal - minVal)) * (chartHeight - 40) - 20;
      return { x, y, dp, val };
    });
  };

  const points = getPoints();
  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Analytics Overview Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              HDB Historical Resale Index
            </span>
            <span className="text-xs text-slate-400">Quarterly 2022 – 2026</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Singapore Resale Market Momentum & PSF Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Track official HDB Resale Price Index benchmarks alongside median transaction prices across Singapore estates and regional clusters.
          </p>
        </div>

        {/* High-level index stats */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-right">
            <span className="text-[11px] text-slate-500 font-medium block">Current Resale Index</span>
            <div className="text-xl font-black text-slate-900 tracking-tight">{latestDataPoint.hdbResaleIndex}</div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{totalGrowthPercent}% since 2022</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Historical Trend Chart */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              {selectedMetric === 'index'
                ? 'Official HDB Resale Price Index Trend (Base: 2009-Q1 = 100)'
                : 'Central Region Median PSF Trend ($/sqft)'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedMetric('index')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedMetric === 'index' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HDB Resale Index
            </button>
            <button
              onClick={() => setSelectedMetric('psf')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedMetric === 'psf' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Central PSF ($/sqft)
            </button>
          </div>
        </div>

        {/* SVG Resale Trend Line Chart */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 overflow-x-auto">
          <div className="min-w-[640px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
              {/* Horizontal gridlines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => (
                <line
                  key={idx}
                  x1={20}
                  y1={chartHeight * ratio}
                  x2={chartWidth - 20}
                  y2={chartHeight * ratio}
                  stroke="#e2e8f0"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Area gradient under curve */}
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Fill area */}
              <polygon
                points={`20,${chartHeight - 20} ${polylineStr} ${chartWidth - 20},${chartHeight - 20}`}
                fill="url(#trendGradient)"
              />

              {/* Polyline line */}
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#059669"
                    strokeWidth="2"
                    className="group-hover:scale-150 transition-transform"
                  />
                  {/* Label for selected milestone quarters */}
                  {i % 4 === 0 && (
                    <text
                      x={p.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                      fontWeight="500"
                    >
                      {p.dp.period}
                    </text>
                  )}
                  {/* Tooltip on hover */}
                  <title>{`${p.dp.period}: ${p.val}`}</title>
                </g>
              ))}
            </svg>
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 pt-2 px-3">
            <span>2022 Q1 (159.5)</span>
            <span>2023 Q4 (180.4)</span>
            <span>2024 Q4 (196.2)</span>
            <span className="font-bold text-slate-900">2026 Q1 ({latestDataPoint.hdbResaleIndex})</span>
          </div>
        </div>
      </div>

      {/* Town-by-Town Price & PSF Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Estate Pricing & Transit Index Matrix</h3>
            <p className="text-xs text-slate-500">Cross-compare median transaction prices with LTA public transport accessibility scores.</p>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {(['All', 'Central', 'East', 'West', 'North', 'North-East'] as const).map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedRegion === reg ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Towns */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Estate / Town</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Median Resale Price</th>
                <th className="py-3 px-4">Median PSF</th>
                <th className="py-3 px-4">LTA Transit Accessibility</th>
                <th className="py-3 px-4">YoY Growth</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTowns.map((town) => (
                <tr key={town.town} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {town.town}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{town.region}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatSGD(town.medianPrice)}</td>
                  <td className="py-3 px-4 font-mono">${town.medianPsf} psf</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {town.avgTransitScore} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">
                    +{town.yoyPriceChangePercent}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onFilterByTown(town.town)}
                      className="text-xs font-semibold text-slate-900 hover:text-emerald-700 underline underline-offset-2"
                    >
                      View Flats
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
