import React from 'react';
import {
  Heart,
  Train,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Layers,
  Compass,
} from 'lucide-react';
import { HDBListing } from '../types/hdb';
import { formatSGD, calculateMonthlyInstallment } from '../utils/mortgageCalculations';
import { MRT_LINE_CONFIG, getScoreColor } from '../utils/ltaScoring';

interface ListingCardProps {
  listing: HDBListing;
  isSaved: boolean;
  onToggleSave: (listing: HDBListing) => void;
  isCompared: boolean;
  onToggleCompare: (listing: HDBListing) => void;
  onSelectListing: (listing: HDBListing) => void;
  onOpenMortgage: (listing: HDBListing) => void;
  onLocateOnMap?: (listing: HDBListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSaved,
  onToggleSave,
  isCompared,
  onToggleCompare,
  onSelectListing,
  onOpenMortgage,
  onLocateOnMap,
}) => {
  const { ltaTransit } = listing;
  const scoreColors = getScoreColor(ltaTransit.score);

  // Quick mortgage estimate (HDB loan: 20% down, 80% loan at 2.6% over 25 years)
  const estLoanAmount = listing.price * 0.8;
  const estMonthly = calculateMonthlyInstallment(estLoanAmount, 2.6, 25);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs hover:shadow-md flex flex-col overflow-hidden">
      {/* Top Image & Overlays */}
      <div className="relative aspect-16/10 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelectListing(listing)}>
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges / Actions */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {/* LTA Transit Badge */}
          <div
            className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg backdrop-blur-md font-bold text-xs shadow-xs border ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border}`}
            title="LTA Public Transport Accessibility Score"
          >
            <Train className="w-3.5 h-3.5" />
            <span>Transit Score: {ltaTransit.score}</span>
            <span className="font-semibold text-[10px] opacity-80">({ltaTransit.grade})</span>
          </div>

          {/* Save / Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(listing);
            }}
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition-colors ${
              isSaved
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white/85 text-slate-700 hover:bg-white hover:text-rose-500 shadow-xs'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save listing'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay: Walking Time & Price PSF */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-xs text-white drop-shadow-md">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md font-medium text-[11px]">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{ltaTransit.nearestMRT.walkMinutes} min walk to {ltaTransit.nearestMRT.name}</span>
          </div>
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-medium">
            ${listing.psf} psf
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Monthly Installment Row */}
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {formatSGD(listing.price)}
            </span>
            <div className="text-right">
              <span className="text-xs text-slate-500">
                Est. <strong className="text-slate-800 font-semibold">{formatSGD(estMonthly)}</strong>/mo
              </span>
            </div>
          </div>

          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center flex-wrap gap-x-1.5 text-xs text-slate-500 mb-2 font-medium">
            <span className="text-slate-900 font-semibold">{listing.town}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.flatType}</span>
            <span aria-hidden="true">·</span>
            <span>{listing.floorAreaSqft.toLocaleString()} sqft ({listing.floorAreaSqm} sqm)</span>
            <span aria-hidden="true">·</span>
            <span>{listing.remainingLeaseYears} yrs lease</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectListing(listing)}
            className="text-sm font-semibold text-slate-900 line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors mb-2"
          >
            {listing.title}
          </h3>

          {/* LTA Transit Connectivity Section */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-800 truncate">
                <span className="text-slate-500 text-[11px]">Nearest MRT:</span>
                <span className="truncate">{ltaTransit.nearestMRT.name}</span>
              </div>
              {/* Lines badge */}
              <div className="flex items-center gap-1 shrink-0">
                {ltaTransit.nearestMRT.lines.map((ln) => {
                  const cfg = MRT_LINE_CONFIG[ln];
                  return (
                    <span
                      key={ln}
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider ${cfg.bg} ${cfg.text}`}
                      title={cfg.name}
                    >
                      {ln}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Commute Speeds unboxed */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-200/60">
              <span>CBD (Raffles Pl): <strong className="text-slate-700 font-medium">{ltaTransit.travelTimeToRafflesPlaceMin}m</strong></span>
              <span aria-hidden="true">·</span>
              <span>Orchard: <strong className="text-slate-700 font-medium">{ltaTransit.travelTimeToOrchardMin}m</strong></span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" />
                {ltaTransit.shelteredWalkway === 'Fully Sheltered' ? 'Sheltered' : 'Walk'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          {/* Compare toggle */}
          <label className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(listing)}
              className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Compare</span>
          </label>

          <div className="flex items-center gap-1.5">
            {onLocateOnMap && (
              <button
                onClick={() => onLocateOnMap(listing)}
                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="Locate flat and transit lines on Transit Map"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Map</span>
              </button>
            )}

            <button
              onClick={() => onOpenMortgage(listing)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1"
              title="Calculate monthly mortgage"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calc</span>
            </button>

            <button
              onClick={() => onSelectListing(listing)}
              className="flex items-center gap-1 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <span>View Flat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
