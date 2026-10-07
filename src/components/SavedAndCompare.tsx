import React from 'react';
import {
  Heart,
  Trash2,
  Train,
  ArrowRight,
  Calculator,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { HDBListing } from '../types/hdb';
import { formatSGD, calculateMonthlyInstallment } from '../utils/mortgageCalculations';
import { MRT_LINE_CONFIG, getScoreColor } from '../utils/ltaScoring';

interface SavedAndCompareProps {
  savedListings: HDBListing[];
  comparedListings: HDBListing[];
  onToggleSave: (listing: HDBListing) => void;
  onToggleCompare: (listing: HDBListing) => void;
  onSelectListing: (listing: HDBListing) => void;
  onOpenMortgage: (listing: HDBListing) => void;
  onLocateOnMap?: (listing: HDBListing) => void;
  savedNotes: Record<string, string>;
  onSaveNote: (listingId: string, note: string) => void;
  onClearAllSaved: () => void;
  onBrowseListings: () => void;
}

export const SavedAndCompare: React.FC<SavedAndCompareProps> = ({
  savedListings,
  comparedListings,
  onToggleSave,
  onToggleCompare,
  onSelectListing,
  onOpenMortgage,
  onLocateOnMap,
  savedNotes,
  onSaveNote,
  onClearAllSaved,
  onBrowseListings,
}) => {
  const comparisonList = comparedListings.length > 0 ? comparedListings : savedListings.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Saved Listings Section Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
              Saved Favorites ({savedListings.length})
            </span>
            <span className="text-xs text-slate-400">Personal Shortlist</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Bookmarked Flats & Side-by-Side Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Review your shortlisted properties, compare public transit accessibility metrics side-by-side, and record notes for property viewings.
          </p>
        </div>

        {savedListings.length > 0 && (
          <button
            onClick={onClearAllSaved}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 self-start md:self-auto px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Shortlist</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {savedListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">You haven't saved any flats yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Browse our listings and click the heart icon on any flat you're interested in. You can also compare up to 4 flats side-by-side.
          </p>
          <button
            onClick={onBrowseListings}
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <span>Browse Flats</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Side-by-Side Comparison Matrix */}
          {comparisonList.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Side-by-Side Comparison ({comparisonList.length} flats)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Select checkbox on cards to customize comparison
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-700 text-xs font-bold">
                    <tr>
                      <th className="p-3 w-44">Metric</th>
                      {comparisonList.map((flat) => (
                        <th key={flat.id} className="p-3 min-w-[200px]">
                          <div className="font-bold text-slate-900 truncate">{flat.block} {flat.streetName}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{flat.town} · {flat.flatType}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">Asking Price</td>
                      {comparisonList.map((flat) => (
                        <td key={flat.id} className="p-3 font-bold text-slate-900 text-sm">
                          {formatSGD(flat.price)}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">Price PSF</td>
                      {comparisonList.map((flat) => (
                        <td key={flat.id} className="p-3 font-mono">${flat.psf} psf</td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">LTA Transit Score</td>
                      {comparisonList.map((flat) => {
                        const scoreColor = getScoreColor(flat.ltaTransit.score);
                        return (
                          <td key={flat.id} className="p-3">
                            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded ${scoreColor.bg} ${scoreColor.text}`}>
                              {flat.ltaTransit.score} / 100 ({flat.ltaTransit.grade})
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">Nearest MRT & Walk</td>
                      {comparisonList.map((flat) => (
                        <td key={flat.id} className="p-3">
                          <div className="font-semibold text-slate-900">{flat.ltaTransit.nearestMRT.name}</div>
                          <div className="text-[11px] text-slate-500">{flat.ltaTransit.nearestMRT.walkMinutes} min walk ({flat.ltaTransit.nearestMRT.distanceMeters}m)</div>
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">CBD Commute (Raffles Pl)</td>
                      {comparisonList.map((flat) => (
                        <td key={flat.id} className="p-3 font-semibold text-slate-900">
                          {flat.ltaTransit.travelTimeToRafflesPlaceMin} mins door-to-door
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">Remaining Lease</td>
                      {comparisonList.map((flat) => (
                        <td key={flat.id} className="p-3">
                          {flat.remainingLeaseYears} yrs {flat.remainingLeaseMonths} mths
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">Floor Level</td>
                      {comparisonList.map((flat) => (
                        <td key={flat.id} className="p-3">{flat.floorLevel}</td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">Est. Monthly Mortgage</td>
                      {comparisonList.map((flat) => {
                        const monthly = calculateMonthlyInstallment(flat.price * 0.8, 2.6, 25);
                        return (
                          <td key={flat.id} className="p-3 font-bold text-slate-900">
                            {formatSGD(monthly)}/mo
                          </td>
                        );
                      })}
                    </tr>

                    <tr>
                      <td className="p-3 bg-slate-50 font-bold text-slate-800">Actions</td>
                      {comparisonList.map((flat) => (
                        <td key={flat.id} className="p-3 space-x-2">
                          <button
                            onClick={() => onSelectListing(flat)}
                            className="text-xs font-semibold text-slate-900 hover:text-emerald-700 underline"
                          >
                            Details
                          </button>
                          {onLocateOnMap && (
                            <button
                              onClick={() => onLocateOnMap(flat)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline"
                            >
                              Map
                            </button>
                          )}
                          <button
                            onClick={() => onOpenMortgage(flat)}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                          >
                            Mortgage
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Saved Flat Cards Grid with Notes */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900">All Shortlisted Properties ({savedListings.length})</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedListings.map((flat) => {
                const note = savedNotes[flat.id] || '';
                const scoreColor = getScoreColor(flat.ltaTransit.score);

                return (
                  <div
                    key={flat.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-16/10 bg-slate-100">
                        <img src={flat.images[0]} alt={flat.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => onToggleSave(flat)}
                          className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-xl shadow-sm"
                          title="Remove from saved"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <div
                          className={`absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-lg border backdrop-blur-md ${scoreColor.bg} ${scoreColor.text} ${scoreColor.border}`}
                        >
                          Transit: {flat.ltaTransit.score} ({flat.ltaTransit.grade})
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div className="text-xl font-bold text-slate-900">{formatSGD(flat.price)}</div>
                          <div className="text-xs text-slate-500">${flat.psf} psf</div>
                        </div>

                        <div className="text-xs text-slate-500 font-medium">
                          {flat.block} {flat.streetName} · {flat.town} · {flat.flatType}
                        </div>

                        {/* Station snippet */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="font-semibold text-slate-800">{flat.ltaTransit.nearestMRT.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {flat.ltaTransit.nearestMRT.walkMinutes} min walk · {flat.ltaTransit.travelTimeToRafflesPlaceMin} min to CBD
                          </div>
                        </div>

                        {/* Note editing area */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Private Notes:</span>
                          </label>
                          <textarea
                            rows={2}
                            value={note}
                            onChange={(e) => onSaveNote(flat.id, e.target.value)}
                            placeholder="Add viewing dates, agent comments..."
                            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom action bar */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {onLocateOnMap && (
                          <button
                            onClick={() => onLocateOnMap(flat)}
                            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Locate on Transit Map"
                          >
                            <Compass className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Map</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenMortgage(flat)}
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 p-1 hover:bg-slate-200/60 rounded-lg transition-colors"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Mortgage</span>
                        </button>
                      </div>

                      <button
                        onClick={() => onSelectListing(flat)}
                        className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <span>View Flat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
