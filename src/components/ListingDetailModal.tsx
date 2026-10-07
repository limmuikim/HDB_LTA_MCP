import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Train,
  Bus,
  MapPin,
  Clock,
  Compass,
  ShieldCheck,
  Calculator,
  ChevronRight,
  Share2,
  Check,
  Building,
  FileText,
  User,
} from 'lucide-react';
import { HDBListing } from '../types/hdb';
import { formatSGD, calculateBSD, calculateMonthlyInstallment } from '../utils/mortgageCalculations';
import { MRT_LINE_CONFIG, getScoreColor, getGradeBadge } from '../utils/ltaScoring';

interface ListingDetailModalProps {
  listing: HDBListing | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (listing: HDBListing) => void;
  onOpenMortgage: (listing: HDBListing) => void;
  savedNotes: Record<string, string>;
  onSaveNote: (listingId: string, note: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isSaved,
  onToggleSave,
  onOpenMortgage,
  savedNotes,
  onSaveNote,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  useEffect(() => {
    if (listing) {
      setActiveImageIdx(0);
      setNoteText(savedNotes[listing.id] || '');
    }
  }, [listing, savedNotes]);

  if (!listing) return null;

  const { ltaTransit } = listing;
  const scoreColors = getScoreColor(ltaTransit.score);
  const gradeBadge = getGradeBadge(ltaTransit.grade);

  // Mortgage snapshot
  const hdbLoanAmt = listing.price * 0.8;
  const hdbMonthly = calculateMonthlyInstallment(hdbLoanAmt, 2.6, 25);
  const bankLoanAmt = listing.price * 0.75;
  const bankMonthly = calculateMonthlyInstallment(bankLoanAmt, 2.95, 30);
  const bsd = calculateBSD(listing.price);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNoteSave = () => {
    onSaveNote(listing.id, noteText);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">{listing.block} {listing.streetName}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{listing.town}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Copy flat link"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onToggleSave(listing)}
              className={`p-2 rounded-xl transition-colors ${
                isSaved ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Saved to favorites' : 'Save flat'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Images Section */}
          <div className="space-y-2">
            <div className="relative aspect-16/9 bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
              <img
                src={listing.images[activeImageIdx]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg">
                Photo {activeImageIdx + 1} of {listing.images.length}
              </div>
            </div>

            {listing.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIdx === idx ? 'border-slate-900 scale-98' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Heading & Pricing */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{listing.title}</h2>
              <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-500 mt-1">
                <span>{listing.block} {listing.streetName}, Singapore {listing.postalCode}</span>
                <span aria-hidden="true">·</span>
                <span>{listing.flatType} ({listing.flatModel})</span>
                <span aria-hidden="true">·</span>
                <span>Level: {listing.floorLevel}</span>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <div className="text-2xl font-black text-slate-900 tracking-tight">{formatSGD(listing.price)}</div>
              <div className="text-xs text-slate-500">${listing.psf} psf · {listing.floorAreaSqft.toLocaleString()} sqft ({listing.floorAreaSqm} sqm)</div>
            </div>
          </div>

          {/* LTA Transit Accessibility Breakdown (Differentiating Feature) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-black ${scoreColors.bg} ${scoreColors.text} border ${scoreColors.border}`}
                >
                  <span className="text-xl leading-none">{ltaTransit.score}</span>
                  <span className="text-[10px] font-bold opacity-80">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">LTA Transit Accessibility Rating</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${scoreColors.bg} ${scoreColors.text}`}>
                      Grade {ltaTransit.grade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{gradeBadge.description}</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 sm:text-right">
                <div className="font-semibold text-slate-800">First-to-Last Mile:</div>
                <div className="flex items-center gap-1.5 sm:justify-end text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{ltaTransit.shelteredWalkway}</span>
                  {ltaTransit.pcnConnectivity && <span>· Direct PCN</span>}
                </div>
              </div>
            </div>

            {/* Score Component Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">MRT Proximity</div>
                <div className="text-sm font-bold text-slate-900">{ltaTransit.scoreBreakdown.mrtProximity} / 40 pts</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(ltaTransit.scoreBreakdown.mrtProximity / 40) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Line Interchange</div>
                <div className="text-sm font-bold text-slate-900">{ltaTransit.scoreBreakdown.interchangeBonus} / 15 pts</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(ltaTransit.scoreBreakdown.interchangeBonus / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">Bus Connectivity</div>
                <div className="text-sm font-bold text-slate-900">{ltaTransit.scoreBreakdown.busConnectivity} / 25 pts</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(ltaTransit.scoreBreakdown.busConnectivity / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">CBD Door-to-Door</div>
                <div className="text-sm font-bold text-slate-900">{ltaTransit.scoreBreakdown.cbdTravelSpeed} / 20 pts</div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(ltaTransit.scoreBreakdown.cbdTravelSpeed / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Commute Times & Nearby Stations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Train className="w-4 h-4 text-emerald-600" />
                  <span>Station Accessibility</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{ltaTransit.nearestMRT.name}</span>
                    <div className="flex items-center gap-1">
                      {ltaTransit.nearestMRT.lines.map((ln) => (
                        <span
                          key={ln}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${MRT_LINE_CONFIG[ln].bg} ${MRT_LINE_CONFIG[ln].text}`}
                        >
                          {ln}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{ltaTransit.nearestMRT.distanceMeters}m walk</span>
                    <span className="font-semibold text-slate-700">{ltaTransit.nearestMRT.walkMinutes} mins on foot</span>
                  </div>
                  {ltaTransit.secondaryMRT && (
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Also near {ltaTransit.secondaryMRT.name}</span>
                      <span>{ltaTransit.secondaryMRT.walkMinutes} mins walk</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Door-to-Door Travel Times</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-500 font-medium">To CBD (Raffles)</div>
                    <div className="text-sm font-bold text-slate-900">{ltaTransit.travelTimeToRafflesPlaceMin} min</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-500 font-medium">To Orchard</div>
                    <div className="text-sm font-bold text-slate-900">{ltaTransit.travelTimeToOrchardMin} min</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-500 font-medium">To Jurong East</div>
                    <div className="text-sm font-bold text-slate-900">{ltaTransit.travelTimeToJurongEastMin} min</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bus Services */}
            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1.5 pt-1">
              <Bus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700">{ltaTransit.busStopsWithin400m} bus stops within 400m:</span>
              <div className="flex flex-wrap gap-1">
                {ltaTransit.busLines.map((bus) => (
                  <span key={bus} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                    {bus}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Mortgage & Financing Snapshot */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">Estimated Financing & Downpayment</h3>
              </div>
              <button
                onClick={() => onOpenMortgage(listing)}
                className="text-xs font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Customize in Mortgage Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-[11px] text-slate-500 font-medium">HDB Loan Installment (2.6%)</div>
                <div className="text-lg font-bold text-slate-900">{formatSGD(hdbMonthly)}<span className="text-xs font-normal text-slate-500">/mo</span></div>
                <div className="text-[10px] text-slate-400 mt-0.5">20% Downpayment: {formatSGD(listing.price * 0.2)} (Payable via CPF OA)</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-[11px] text-slate-500 font-medium">Bank Loan Installment (2.95%)</div>
                <div className="text-lg font-bold text-slate-900">{formatSGD(bankMonthly)}<span className="text-xs font-normal text-slate-500">/mo</span></div>
                <div className="text-[10px] text-slate-400 mt-0.5">25% Downpayment: {formatSGD(listing.price * 0.25)} (Min 5% Cash: {formatSGD(listing.price * 0.05)})</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-[11px] text-slate-500 font-medium">IRAS Stamp Duty (BSD)</div>
                <div className="text-lg font-bold text-slate-900">{formatSGD(bsd)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Progressive IRAS Tier Schedule</div>
              </div>
            </div>
          </div>

          {/* Description & Flat Features */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Property Highlights</h3>
            <div className="flex flex-wrap gap-1.5">
              {listing.features.map((feat) => (
                <span
                  key={feat}
                  className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg"
                >
                  {feat}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {listing.description}
            </p>
          </div>

          {/* Lease & Eligibility Specs */}
          <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Remaining Lease</span>
              <strong className="text-slate-900 font-semibold">{listing.remainingLeaseYears} yrs {listing.remainingLeaseMonths} mths</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Lease Commencement</span>
              <strong className="text-slate-900 font-semibold">{listing.leaseCommenceYear}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Ethnic Quota (EIP)</span>
              <strong className="text-slate-900 font-semibold">{listing.ethnicQuota}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Listing Agent</span>
              <strong className="text-slate-900 font-semibold">{listing.agentName} ({listing.agentAgency})</strong>
            </div>
          </div>

          {/* Personal Viewing Notes (Saved in localStorage) */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>My Private Notes for this Flat</span>
              </label>
              {noteSavedFeedback && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Note saved!
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Viewing appointment with Wayne on Saturday 3pm. Check bathroom piping & morning sun orientation..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleNoteSave}
                className="text-xs bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Listed by {listing.agentName}</div>
            <div className="text-xs font-semibold text-slate-800">{listing.agentAgency}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenMortgage(listing)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Full Mortgage Simulator</span>
            </button>
            <button
              onClick={() => onToggleSave(listing)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved in Favorites' : 'Save to Favorites'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
