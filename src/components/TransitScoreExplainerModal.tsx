import React from 'react';
import {
  X,
  Train,
  Bus,
  Clock,
  Compass,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface TransitScoreExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransitScoreExplainerModal: React.FC<TransitScoreExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                LTA Public Transport Accessibility Score
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                The Gold Standard Transit Metric for Singapore HDB Resale Flats
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Introduction */}
        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            Unlike generic property apps that merely state "near MRT", TransitHDB incorporates official <strong>Land Transport Authority (LTA) Datamall</strong> criteria to compute a true multi-dimensional accessibility index (0 to 100).
          </p>
          <p>
            Transit proximity is Singapore's single strongest catalyst for long-term HDB capital appreciation, rental yield defensibility, and daily commute time savings.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Formula Weighting & Component Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. MRT Station Proximity</span>
                </span>
                <span className="font-bold text-xs text-emerald-700">40% Weight</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Calculated on actual door-to-platform walking time and distance. Blocks under 300m receive maximum points.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Multi-Line Interchange Bonus</span>
                </span>
                <span className="font-bold text-xs text-indigo-700">15% Weight</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dual and triple-line interchanges (e.g. Bishan NS/CC, Buona Vista EW/CC, Jurong East EW/NS) receive extra bonus for transfer convenience.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. Bus Network Density</span>
                </span>
                <span className="font-bold text-xs text-amber-700">25% Weight</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Measures number of operational bus services and bus stops within 400m radius, ensuring feeder and cross-town trunk redundancy.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>4. CBD Door-to-Door Speed</span>
                </span>
                <span className="font-bold text-xs text-rose-700">20% Weight</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Transit duration to Raffles Place / Downtown CBD. Estates under 20 mins transit receive highest allocation.
              </p>
            </div>
          </div>
        </div>

        {/* Grade tiers */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Rating Bands
          </h3>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 text-emerald-950 font-medium">
              <span><strong>Grade A+ (90 – 100 pts)</strong>: Exceptional (&lt;4 min walk to MRT Interchange, &lt;22 min to CBD)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-teal-50 text-teal-950 font-medium">
              <span><strong>Grade A (80 – 89 pts)</strong>: Prime Transit (&lt;7 min walk to MRT, high frequency bus lines)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50 text-sky-950 font-medium">
              <span><strong>Grade B+ (70 – 79 pts)</strong>: Well-Connected (7–10 min walk or 1 feeder bus stop)</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 text-slate-800 font-medium">
              <span><strong>Grade B / C (&lt;70 pts)</strong>: Feeder reliant connectivity</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            Got it, Back to App
          </button>
        </div>
      </div>
    </div>
  );
};
