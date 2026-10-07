import React, { useState } from 'react';
import { Search, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { FlatType, Region, TownName } from '../types/hdb';
import { SINGAPORE_TOWNS } from '../data/townStats';

export interface FilterState {
  searchQuery: string;
  selectedTowns: TownName[];
  selectedRegion: Region | 'All';
  selectedFlatTypes: FlatType[];
  minPrice: number;
  maxPrice: number;
  minTransitScore: number;
  maxWalkMinutes: number;
  minRemainingLease: number;
  sortBy: 'transitScore' | 'priceAsc' | 'priceDesc' | 'psfAsc' | 'walkTime' | 'leaseDesc';
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalResultsCount: number;
}

const FLAT_TYPES: FlatType[] = ['2-Room', '3-Room', '4-Room', '5-Room', 'Executive', '3Gen'];
const REGIONS: (Region | 'All')[] = ['All', 'Central', 'East', 'West', 'North', 'North-East'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalResultsCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      selectedTowns: [],
      selectedRegion: 'All',
      selectedFlatTypes: [],
      minPrice: 300000,
      maxPrice: 1300000,
      minTransitScore: 0,
      maxWalkMinutes: 20,
      minRemainingLease: 0,
      sortBy: 'transitScore',
    });
  };

  const toggleFlatType = (type: FlatType) => {
    setFilters((prev) => {
      const exists = prev.selectedFlatTypes.includes(type);
      return {
        ...prev,
        selectedFlatTypes: exists
          ? prev.selectedFlatTypes.filter((t) => t !== type)
          : [...prev.selectedFlatTypes, type],
      };
    });
  };

  const handleTownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as TownName | '';
    if (!val) {
      setFilters((prev) => ({ ...prev, selectedTowns: [] }));
    } else {
      setFilters((prev) => ({
        ...prev,
        selectedTowns: prev.selectedTowns.includes(val) ? prev.selectedTowns : [...prev.selectedTowns, val],
      }));
    }
  };

  const removeTown = (town: TownName) => {
    setFilters((prev) => ({
      ...prev,
      selectedTowns: prev.selectedTowns.filter((t) => t !== town),
    }));
  };

  const activeFiltersCount =
    (filters.selectedTowns.length > 0 ? 1 : 0) +
    (filters.selectedRegion !== 'All' ? 1 : 0) +
    (filters.selectedFlatTypes.length > 0 ? 1 : 0) +
    (filters.minPrice > 300000 || filters.maxPrice < 1300000 ? 1 : 0) +
    (filters.minTransitScore > 0 ? 1 : 0) +
    (filters.maxWalkMinutes < 20 ? 1 : 0) +
    (filters.minRemainingLease > 0 ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
        {/* Top Search & Primary Bar */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search by Street, Block, Town or MRT station (e.g. Bishan, Redhill, Buona Vista)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setFilters((prev) => ({ ...prev, selectedRegion: region }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  filters.selectedRegion === region
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {region === 'All' ? 'All Regions' : region}
              </button>
            ))}
          </div>

          {/* Expand Filters / Sort Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FilterState['sortBy'],
                }))
              }
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="transitScore">Sort: Highest Transit Score (LTA)</option>
              <option value="walkTime">Sort: Shortest Walk to MRT</option>
              <option value="priceAsc">Sort: Price (Lowest First)</option>
              <option value="priceDesc">Sort: Price (Highest First)</option>
              <option value="psfAsc">Sort: Lowest PSF Rate</option>
              <option value="leaseDesc">Sort: Longest Remaining Lease</option>
            </select>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700"
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Selected Towns tags & count bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-slate-700">Showing {totalResultsCount} flats</span>
            {filters.selectedTowns.length > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">Towns:</span>
                {filters.selectedTowns.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {t}
                    <button onClick={() => removeTown(t)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>

        {/* Expanded Filters Panel */}
        {isExpanded && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Flat Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Flat Type</label>
              <div className="flex flex-wrap gap-1">
                {FLAT_TYPES.map((type) => {
                  const active = filters.selectedFlatTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleFlatType(type)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LTA Public Transport Accessibility Score */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  LTA Transit Score
                </label>
                <span className="text-xs font-bold text-emerald-700">
                  {filters.minTransitScore === 0 ? 'Any Score' : `≥ ${filters.minTransitScore} / 100`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { label: 'Any', val: 0 },
                  { label: '75+ Good', val: 75 },
                  { label: '85+ Prime', val: 85 },
                  { label: '90+ Top (A+)', val: 90 },
                ].map((tier) => (
                  <button
                    key={tier.val}
                    onClick={() => setFilters((prev) => ({ ...prev, minTransitScore: tier.val }))}
                    className={`flex-1 py-1 px-1.5 text-xs text-center rounded-lg font-medium transition-colors ${
                      filters.minTransitScore === tier.val
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Scores based on walk to MRT, bus frequency & rapid CBD links.
              </p>
            </div>

            {/* Max Walk to MRT & Remaining Lease */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Max Walk to Nearest MRT
              </label>
              <div className="flex items-center gap-1">
                {[
                  { label: 'Any', min: 20 },
                  { label: '≤ 5 mins', min: 5 },
                  { label: '≤ 8 mins', min: 8 },
                  { label: '≤ 12 mins', min: 12 },
                ].map((item) => (
                  <button
                    key={item.min}
                    onClick={() => setFilters((prev) => ({ ...prev, maxWalkMinutes: item.min }))}
                    className={`flex-1 py-1 px-1 text-xs text-center rounded-lg font-medium transition-colors ${
                      filters.maxWalkMinutes === item.min
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Lease selector */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Min Remaining Lease:</span>
                <select
                  value={filters.minRemainingLease}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minRemainingLease: Number(e.target.value) }))
                  }
                  className="bg-slate-50 border border-slate-200 text-slate-700 font-medium py-1 px-2 rounded-lg text-xs"
                >
                  <option value={0}>Any Lease</option>
                  <option value={60}>≥ 60 Years</option>
                  <option value={70}>≥ 70 Years</option>
                  <option value={80}>≥ 80 Years</option>
                  <option value={90}>≥ 90 Years</option>
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Price Budget (SGD)
                </label>
                <span className="text-xs font-semibold text-slate-800">
                  ${(filters.minPrice / 1000).toFixed(0)}k – ${(filters.maxPrice / 1000).toFixed(0)}k
                </span>
              </div>
              <input
                type="range"
                min={300000}
                max={1300000}
                step={25000}
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
                }
                className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex items-center gap-1 pt-1">
                <select
                  onChange={handleTownChange}
                  value=""
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium py-1.5 px-2 rounded-lg text-xs"
                >
                  <option value="">+ Add Town Filter...</option>
                  {SINGAPORE_TOWNS.map((t) => (
                    <option key={t.town} value={t.town}>
                      {t.town} ({t.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
