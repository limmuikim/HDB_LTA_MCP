import React, { useState, useEffect } from 'react';
import {
  Layers,
  Train,
  DollarSign,
  TrendingUp,
  MapPin,
  ChevronRight,
  Eye,
  Info,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Filter,
  RotateCcw,
  MessageSquare,
  Calculator,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { HDBListing, TownHeatmapStat, TownName } from '../types/hdb';
import { SINGAPORE_TOWNS } from '../data/townStats';
import { MRT_SVG_LINES, KEY_MRT_STATIONS } from '../data/mrtStations';
import { formatSGD, calculateMonthlyInstallment } from '../utils/mortgageCalculations';
import { MRT_LINE_CONFIG, getScoreColor } from '../utils/ltaScoring';
import { FilterState } from './FilterBar';

type HeatmapMode = 'transit' | 'price' | 'psf';

interface InteractiveMapHeatmapProps {
  allListings: HDBListing[];
  filteredListings: HDBListing[];
  focusedListing?: HDBListing | null;
  activeFilters: FilterState;
  onSelectListing: (listing: HDBListing) => void;
  onFilterByTown: (town: TownName) => void;
  onResetFilters: () => void;
  onOpenMortgage: (listing: HDBListing) => void;
  onNavigateToChat: () => void;
}

export const InteractiveMapHeatmap: React.FC<InteractiveMapHeatmapProps> = ({
  allListings,
  filteredListings,
  focusedListing,
  activeFilters,
  onSelectListing,
  onFilterByTown,
  onResetFilters,
  onOpenMortgage,
  onNavigateToChat,
}) => {
  const [mode, setMode] = useState<HeatmapMode>('transit');
  const [showMRTLines, setShowMRTLines] = useState(true);
  const [showListingPins, setShowListingPins] = useState(true);
  const [filterPinsToQueryOnly, setFilterPinsToQueryOnly] = useState(true);
  const [selectedTown, setSelectedTown] = useState<TownHeatmapStat | null>(() => {
    if (focusedListing) {
      return SINGAPORE_TOWNS.find((t) => t.town === focusedListing.town) || SINGAPORE_TOWNS[0];
    }
    return SINGAPORE_TOWNS[0]; // default Bishan
  });
  const [selectedListingPin, setSelectedListingPin] = useState<HDBListing | null>(focusedListing || null);

  // Sync when focusedListing changes externally (e.g. user clicked "View on Transit Map" in card/modal/chat)
  useEffect(() => {
    if (focusedListing) {
      setSelectedListingPin(focusedListing);
      const matchedTown = SINGAPORE_TOWNS.find((t) => t.town === focusedListing.town);
      if (matchedTown) {
        setSelectedTown(matchedTown);
      }
    }
  }, [focusedListing]);

  // Determine active displayed pins
  const displayedPins = filterPinsToQueryOnly ? filteredListings : allListings;

  // Check if active filters or chat criteria are applied
  const hasActiveQuery =
    activeFilters.selectedTowns.length > 0 ||
    activeFilters.selectedRegion !== 'All' ||
    activeFilters.selectedFlatTypes.length > 0 ||
    activeFilters.minPrice > 300000 ||
    activeFilters.maxPrice < 1300000 ||
    activeFilters.minTransitScore > 0 ||
    activeFilters.maxWalkMinutes < 20 ||
    activeFilters.searchQuery.trim().length > 0;

  // Helper to get town color fill based on active heatmap mode
  const getTownFillColor = (town: TownHeatmapStat) => {
    if (mode === 'transit') {
      if (town.avgTransitScore >= 92) return '#059669'; // Emerald dark
      if (town.avgTransitScore >= 88) return '#10b981'; // Emerald
      if (town.avgTransitScore >= 84) return '#34d399'; // Mint
      if (town.avgTransitScore >= 80) return '#6ee7b7'; // Light mint
      return '#a7f3d0'; // Pale green
    }

    if (mode === 'price') {
      if (town.medianPrice >= 850000) return '#e11d48'; // Rose deep
      if (town.medianPrice >= 750000) return '#f43f5e'; // Rose
      if (town.medianPrice >= 650000) return '#fb7185'; // Rose light
      if (town.medianPrice >= 580000) return '#fda4af'; // Pale rose
      return '#ffe4e6'; // Soft pink
    }

    // mode === 'psf'
    if (town.medianPsf >= 800) return '#6366f1'; // Indigo
    if (town.medianPsf >= 700) return '#818cf8'; // Indigo light
    if (town.medianPsf >= 620) return '#a5b4fc'; // Periwinkle
    if (town.medianPsf >= 560) return '#c7d2fe'; // Pale blue
    return '#e0e7ff';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner showing Active Search Query Linkage */}
      {hasActiveQuery && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                <span>Transit Map Linked to Active Search / Chat Query</span>
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                  {filteredListings.length} Matching Flats
                </span>
              </div>
              <div className="text-xs text-emerald-800 font-medium flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {activeFilters.selectedTowns.length > 0 && (
                  <span>Towns: {activeFilters.selectedTowns.join(', ')}</span>
                )}
                {activeFilters.selectedFlatTypes.length > 0 && (
                  <span>· Type: {activeFilters.selectedFlatTypes.join(', ')}</span>
                )}
                {activeFilters.maxPrice < 1300000 && (
                  <span>· Under {formatSGD(activeFilters.maxPrice)}</span>
                )}
                {activeFilters.minTransitScore > 0 && (
                  <span>· Transit Score ≥ {activeFilters.minTransitScore}</span>
                )}
                {activeFilters.maxWalkMinutes < 20 && (
                  <span>· Walk ≤ {activeFilters.maxWalkMinutes} min</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setFilterPinsToQueryOnly(!filterPinsToQueryOnly)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                filterPinsToQueryOnly
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {filterPinsToQueryOnly ? 'Showing Query Matches' : 'Showing All Flats'}
            </button>
            <button
              onClick={onResetFilters}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium underline px-2 py-1"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Singapore HDB Interactive Geospatial Heatmap</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              LTA Transport & Pricing
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualize Singapore housing estate data: transit proximity scores, median resale prices, and MRT network connectivity.
          </p>
        </div>

        {/* Heatmap Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('transit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'transit'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Train className="w-3.5 h-3.5 text-emerald-600" />
              <span>LTA Transit Score</span>
            </button>

            <button
              onClick={() => setMode('price')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'price'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-rose-600" />
              <span>Median Price</span>
            </button>

            <button
              onClick={() => setMode('psf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'psf'
                  ? 'bg-white text-indigo-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Median PSF</span>
            </button>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={showMRTLines}
                onChange={(e) => setShowMRTLines(e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
              />
              <span>MRT Rail Network</span>
            </label>

            <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={showListingPins}
                onChange={(e) => setShowListingPins(e.target.checked)}
                className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
              />
              <span>Listing Pins ({displayedPins.length})</span>
            </label>

            <button
              onClick={onNavigateToChat}
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
              title="Chat with Advisor to derive custom search criteria"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Finder</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Interactive Map (3 columns on desktop) */}
        <div className="lg:col-span-3 bg-slate-950 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden border border-slate-800 flex flex-col justify-between min-h-[500px]">
          {/* Map Title / Active Legend in Top Corner */}
          <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md border border-slate-700 p-3 rounded-2xl text-white max-w-xs shadow-lg">
            <div className="text-xs font-bold flex items-center gap-1.5">
              {mode === 'transit' && <Train className="w-3.5 h-3.5 text-emerald-400" />}
              {mode === 'price' && <DollarSign className="w-3.5 h-3.5 text-rose-400" />}
              {mode === 'psf' && <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />}
              <span>
                {mode === 'transit' && 'LTA Public Transport Accessibility'}
                {mode === 'price' && 'Median Resale Flat Price'}
                {mode === 'psf' && 'Median Price Per Sq Ft (PSF)'}
              </span>
            </div>

            {/* Gradient scale */}
            <div className="mt-2 space-y-1">
              <div
                className="h-2 rounded-full w-full"
                style={{
                  background:
                    mode === 'transit'
                      ? 'linear-gradient(to right, #a7f3d0, #34d399, #10b981, #059669)'
                      : mode === 'price'
                      ? 'linear-gradient(to right, #ffe4e6, #fb7185, #f43f5e, #e11d48)'
                      : 'linear-gradient(to right, #e0e7ff, #a5b4fc, #818cf8, #6366f1)',
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{mode === 'transit' ? 'Moderate (78)' : mode === 'price' ? '$520k' : '$520 psf'}</span>
                <span>{mode === 'transit' ? 'Exceptional (96)' : mode === 'price' ? '$910k+' : '$890+ psf'}</span>
              </div>
            </div>

            {selectedListingPin && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/80 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>Focused: Blk {selectedListingPin.block} {selectedListingPin.streetName}</span>
                <span className="font-bold">Score: {selectedListingPin.ltaTransit.score}</span>
              </div>
            )}
          </div>

          {/* Map Graphic Canvas */}
          <div className="w-full h-full relative aspect-16/10 flex items-center justify-center">
            <svg
              viewBox="0 0 100 80"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}
            >
              {/* Singapore Island Outline Base */}
              <defs>
                <radialGradient id="landGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                </radialGradient>
              </defs>

              {/* Singapore mainland simplified geographical shape */}
              <path
                d="M 12 45 C 16 38, 22 30, 32 24 C 40 18, 52 18, 62 25 C 72 26, 82 32, 90 40 C 92 48, 86 54, 76 60 C 66 65, 54 72, 44 72 C 34 72, 24 64, 18 56 Z"
                fill="url(#landGlow)"
                stroke="#334155"
                strokeWidth="0.6"
              />

              {/* Coastal waters grid lines for cartographic style */}
              <path d="M 0 30 Q 50 25 100 30" stroke="#1e293b" strokeWidth="0.2" fill="none" strokeDasharray="1 3" />
              <path d="M 0 50 Q 50 55 100 50" stroke="#1e293b" strokeWidth="0.2" fill="none" strokeDasharray="1 3" />

              {/* MRT Lines Layer */}
              {showMRTLines && (
                <g opacity="0.85">
                  {MRT_SVG_LINES.map((line) => (
                    <path
                      key={line.id}
                      d={line.pathD}
                      fill="none"
                      stroke={line.color}
                      strokeWidth="0.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {/* Stations */}
                  {KEY_MRT_STATIONS.map((stn) => (
                    <g key={stn.name} transform={`translate(${stn.x}, ${stn.y})`}>
                      <circle
                        r={stn.isInterchange ? 1.4 : 0.8}
                        fill="#ffffff"
                        stroke="#0f172a"
                        strokeWidth="0.4"
                      />
                    </g>
                  ))}
                </g>
              )}

              {/* Town Nodes & Heat Circles */}
              {SINGAPORE_TOWNS.map((town) => {
                const color = getTownFillColor(town);
                const isSelected = selectedTown?.town === town.town;
                return (
                  <g
                    key={town.town}
                    transform={`translate(${town.mapCoords.x}, ${town.mapCoords.y})`}
                    onClick={() => {
                      setSelectedTown(town);
                      // Clear selected specific pin so town stats are in view
                      setSelectedListingPin(null);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Heat aura */}
                    <circle
                      r={isSelected ? 6.5 : 4.5}
                      fill={color}
                      fillOpacity={isSelected ? 0.65 : 0.35}
                      className="transition-all duration-300"
                    />
                    {/* Inner core */}
                    <circle
                      r={isSelected ? 2.5 : 1.8}
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 0.7 : 0.4}
                      className="transition-all"
                    />
                    {/* Town text label */}
                    <text
                      y={4.5}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="2.4"
                      fontWeight="600"
                      className="drop-shadow-xs pointer-events-none tracking-tight font-sans"
                    >
                      {town.town}
                    </text>
                  </g>
                );
              })}

              {/* Listing Pins Layer */}
              {showListingPins &&
                displayedPins.map((item) => {
                  const isPinSelected = selectedListingPin?.id === item.id;
                  const scoreColor = getScoreColor(item.ltaTransit.score);
                  return (
                    <g
                      key={item.id}
                      transform={`translate(${item.coordinates.mapX}, ${item.coordinates.mapY})`}
                      onClick={() => {
                        setSelectedListingPin(item);
                        const matchedTown = SINGAPORE_TOWNS.find((t) => t.town === item.town);
                        if (matchedTown) setSelectedTown(matchedTown);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Pulse aura when focused/selected */}
                      {isPinSelected && (
                        <circle
                          r={4.2}
                          fill={scoreColor.fillHex}
                          fillOpacity={0.4}
                          className="animate-ping"
                        />
                      )}
                      <circle
                        r={isPinSelected ? 2.8 : 1.8}
                        fill={scoreColor.fillHex}
                        stroke="#ffffff"
                        strokeWidth={isPinSelected ? 0.8 : 0.4}
                        className={isPinSelected ? '' : 'hover:scale-125 transition-transform'}
                      />
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* Bottom Bar: Quick MRT Line Legend */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">MRT Network:</span>
              {MRT_SVG_LINES.map((line) => (
                <div key={line.id} className="flex items-center gap-1 text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: line.color }}
                  />
                  <span>{line.id}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-emerald-400" />
              <span>Click any town or pin to inspect details</span>
            </div>
          </div>
        </div>

        {/* Selected Listing OR Selected Town Details Sidebar (1 column) */}
        <div className="space-y-4">
          {/* If a specific listing pin is selected/focused */}
          {selectedListingPin ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Focused Flat on Map</span>
                </span>
                <button
                  onClick={() => setSelectedListingPin(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  View Town Stats
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {selectedListingPin.title}
                </h3>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  Blk {selectedListingPin.block} {selectedListingPin.streetName} · {selectedListingPin.town}
                </div>
              </div>

              {/* Price & Transit Score Badge */}
              <div className="flex items-baseline justify-between border-y border-slate-100 py-3">
                <div>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {formatSGD(selectedListingPin.price)}
                  </div>
                  <div className="text-xs text-slate-500">${selectedListingPin.psf} psf · {selectedListingPin.floorAreaSqft} sqft</div>
                </div>

                <div
                  className={`text-right px-3 py-1.5 rounded-xl border font-bold text-xs ${getScoreColor(selectedListingPin.ltaTransit.score).bg} ${getScoreColor(selectedListingPin.ltaTransit.score).text} ${getScoreColor(selectedListingPin.ltaTransit.score).border}`}
                >
                  <div className="text-base font-black leading-none">{selectedListingPin.ltaTransit.score}</div>
                  <div className="text-[9px] uppercase font-bold opacity-80">Grade {selectedListingPin.ltaTransit.grade}</div>
                </div>
              </div>

              {/* Transit Details */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{selectedListingPin.ltaTransit.nearestMRT.name}</span>
                  <span className="text-emerald-700 font-bold">{selectedListingPin.ltaTransit.nearestMRT.walkMinutes} min walk</span>
                </div>
                <div className="flex items-center gap-1">
                  {selectedListingPin.ltaTransit.nearestMRT.lines.map((ln) => (
                    <span
                      key={ln}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${MRT_LINE_CONFIG[ln].bg} ${MRT_LINE_CONFIG[ln].text}`}
                    >
                      {ln}
                    </span>
                  ))}
                  <span className="text-slate-400 text-[10px] ml-1">
                    {selectedListingPin.ltaTransit.shelteredWalkway}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  Door-to-door to Raffles Place CBD: <strong className="text-slate-800">{selectedListingPin.ltaTransit.travelTimeToRafflesPlaceMin} mins</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onSelectListing(selectedListingPin)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Open Full Flat Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenMortgage(selectedListingPin)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Mortgage</span>
                  </button>

                  <button
                    onClick={onNavigateToChat}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Query</span>
                  </button>
                </div>
              </div>
            </div>
          ) : selectedTown ? (
            /* Selected Town Details Card */
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {selectedTown.region} Region
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedTown.town}</h3>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-xs"
                  style={{
                    backgroundColor: `${getScoreColor(selectedTown.avgTransitScore).fillHex}15`,
                    color: getScoreColor(selectedTown.avgTransitScore).fillHex,
                  }}
                >
                  <span className="text-base font-black leading-none">{selectedTown.avgTransitScore}</span>
                  <span className="text-[9px] uppercase font-bold">Transit</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedTown.description}
              </p>

              {/* Town Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Median Resale Price</div>
                  <div className="text-sm font-bold text-slate-900">{formatSGD(selectedTown.medianPrice)}</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Median PSF</div>
                  <div className="text-sm font-bold text-slate-900">${selectedTown.medianPsf} psf</div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">YoY Price Appreciation</div>
                  <div className="text-sm font-bold text-emerald-700 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{selectedTown.yoyPriceChangePercent}%
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Active Portal Listings</div>
                  <div className="text-sm font-bold text-slate-900">{selectedTown.activeListingsCount} flats</div>
                </div>
              </div>

              {/* Action Buttons: Filter Listings / Ask in Chat */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onFilterByTown(selectedTown.town)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Filter Listings for {selectedTown.town}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onNavigateToChat}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Advisor About {selectedTown.town}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
              Select any town on the map to view in-depth transit and price metrics.
            </div>
          )}

          {/* Quick Town Transit Score Leaderboard */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-emerald-600" />
                <span>Top LTA Transit Towns</span>
              </h4>
              <span className="text-[10px] text-slate-400">Public data</span>
            </div>

            <div className="space-y-2">
              {[...SINGAPORE_TOWNS]
                .sort((a, b) => b.avgTransitScore - a.avgTransitScore)
                .slice(0, 5)
                .map((t, idx) => (
                  <div
                    key={t.town}
                    onClick={() => {
                      setSelectedTown(t);
                      setSelectedListingPin(null);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      selectedTown?.town === t.town && !selectedListingPin
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center font-bold text-slate-400 text-[11px]">{idx + 1}</span>
                      <span className="font-semibold">{t.town}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-500 font-sans text-[11px]">{formatSGD(t.medianPrice)}</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[11px]">
                        {t.avgTransitScore}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
