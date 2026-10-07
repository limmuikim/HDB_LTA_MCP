import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Send,
  Train,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
} from 'lucide-react';
import { CustomAlertRule, FlatType, HDBListing, InAppNotification, TownName } from '../types/hdb';
import { SINGAPORE_TOWNS } from '../data/townStats';
import { formatSGD } from '../utils/mortgageCalculations';
import { getScoreColor } from '../utils/ltaScoring';

interface AlertsManagerProps {
  alerts: CustomAlertRule[];
  notifications: InAppNotification[];
  onCreateAlert: (newAlert: Omit<CustomAlertRule, 'id' | 'createdAt' | 'matchCount'>) => void;
  onToggleAlert: (alertId: string) => void;
  onDeleteAlert: (alertId: string) => void;
  onMarkNotificationRead: (notifId: string) => void;
  onClearAllNotifications: () => void;
  onSimulateNewListingAlert: (alert: CustomAlertRule) => void;
  onSelectListingById: (listingId: string) => void;
}

const FLAT_TYPES: FlatType[] = ['2-Room', '3-Room', '4-Room', '5-Room', 'Executive', '3Gen'];

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  notifications,
  onCreateAlert,
  onToggleAlert,
  onDeleteAlert,
  onMarkNotificationRead,
  onClearAllNotifications,
  onSimulateNewListingAlert,
  onSelectListingById,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [selectedTowns, setSelectedTowns] = useState<TownName[]>(['Bishan', 'Queenstown']);
  const [selectedFlatTypes, setSelectedFlatTypes] = useState<FlatType[]>(['4-Room', '5-Room']);
  const [maxPrice, setMaxPrice] = useState(900000);
  const [minTransitScore, setMinTransitScore] = useState(85);
  const [maxWalkMinutes, setMaxWalkMinutes] = useState(6);
  const [channel, setChannel] = useState<'in_app' | 'email' | 'push'>('in_app');
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAlert({
      name: name || `${selectedTowns.join(', ')} Flats Under ${formatSGD(maxPrice)}`,
      towns: selectedTowns.length > 0 ? selectedTowns : ['Bishan'],
      flatTypes: selectedFlatTypes.length > 0 ? selectedFlatTypes : ['4-Room'],
      maxPrice,
      minPrice: 300000,
      minTransitScore,
      maxWalkMinutesToMRT: maxWalkMinutes,
      frequency,
      channel,
      enabled: true,
    });
    setShowCreateModal(false);
    setName('');
  };

  const toggleTown = (t: TownName) => {
    setSelectedTowns((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const toggleFlatType = (ft: FlatType) => {
    setSelectedFlatTypes((prev) =>
      prev.includes(ft) ? prev.filter((item) => item !== ft) : [...prev, ft]
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Instant Match Notification Center
            </span>
            <span className="text-xs text-slate-400">{alerts.length} Active Rules</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Custom HDB Listing & Transit Proximity Alerts
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Never miss an ideal resale unit. Set precise thresholds for location, price caps, and minimum LTA public transport accessibility scores.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center gap-2 self-start md:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Alert Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Alerts Rules (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Your Alert Subscriptions</h3>
            <span className="text-xs text-slate-400">Rules evaluate real-time resale feeds</span>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-3">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No alerts configured yet. Create your first rule to receive automated updates.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-slate-900 font-bold underline"
              >
                Create Alert Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`bg-white rounded-2xl border p-4.5 transition-all shadow-xs space-y-3 ${
                    al.enabled ? 'border-slate-200' : 'border-slate-200/50 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{al.name}</h4>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {al.frequency}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1 font-medium">
                        <span>Max {formatSGD(al.maxPrice)}</span>
                        <span>·</span>
                        <span>{al.flatTypes.join(', ')}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-semibold">
                          Transit Score ≥ {al.minTransitScore}
                        </span>
                        <span>·</span>
                        <span>Walk ≤ {al.maxWalkMinutesToMRT} mins</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onToggleAlert(al.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          al.enabled
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {al.enabled ? 'Active' : 'Paused'}
                      </button>

                      <button
                        onClick={() => onDeleteAlert(al.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Towns Tags */}
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {al.towns.map((town) => (
                      <span key={town} className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {town}
                      </span>
                    ))}
                  </div>

                  {/* Test Trigger Simulation Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {al.matchCount} listings matched to date
                    </span>

                    <button
                      onClick={() => onSimulateNewListingAlert(al)}
                      className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold text-xs py-1 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      title="Simulate a new incoming HDB resale flat that matches this rule"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Trigger Test Match</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Notification Feed & Inbox (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">Notification Feed</h3>
              {unreadCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={onClearAllNotifications}
                className="text-xs text-slate-400 hover:text-slate-700 underline"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400 space-y-2">
              <p>Your notification feed is empty.</p>
              <p className="text-[11px] text-slate-500">
                Click "Trigger Test Match" on any alert rule above to simulate a freshly listed matching flat!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {notifications.map((notif) => {
                const scoreColor = getScoreColor(notif.transitScore);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkNotificationRead(notif.id);
                      onSelectListingById(notif.listingId);
                    }}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                      notif.read
                        ? 'bg-white border-slate-200 text-slate-600 opacity-80'
                        : 'bg-emerald-50/50 border-emerald-200 text-slate-900 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        {notif.alertName}
                      </span>
                      <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                    </div>

                    <div className="font-bold text-sm text-slate-900">{notif.listingTitle}</div>

                    <div className="flex items-center justify-between">
                      <div className="font-mono font-bold text-slate-800">{formatSGD(notif.price)}</div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreColor.bg} ${scoreColor.text}`}>
                          Transit: {notif.transitScore}
                        </span>
                        <span className="text-slate-500 font-medium">Near {notif.nearestMRT}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Alert Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Create Custom Listing Alert</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Alert Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Alert Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bishan / Queenstown 4-Room Near MRT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Towns */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Select Target Towns</label>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {SINGAPORE_TOWNS.map((t) => (
                    <button
                      type="button"
                      key={t.town}
                      onClick={() => toggleTown(t.town)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        selectedTowns.includes(t.town)
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.town}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat Types */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Flat Types</label>
                <div className="flex flex-wrap gap-1">
                  {FLAT_TYPES.map((ft) => (
                    <button
                      type="button"
                      key={ft}
                      onClick={() => toggleFlatType(ft)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        selectedFlatTypes.includes(ft)
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price & Min Transit Score */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Max Price Cap</span>
                    <span className="font-mono">${(maxPrice / 1000).toFixed(0)}k</span>
                  </div>
                  <input
                    type="range"
                    min={400000}
                    max={1300000}
                    step={25000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Min LTA Transit Score</span>
                    <span className="text-emerald-700 font-bold">{minTransitScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={95}
                    step={1}
                    value={minTransitScore}
                    onChange={(e) => setMinTransitScore(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Walk minutes & Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Walk to MRT</label>
                  <select
                    value={maxWalkMinutes}
                    onChange={(e) => setMaxWalkMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    <option value={4}>≤ 4 mins (Ultra-prime)</option>
                    <option value={6}>≤ 6 mins</option>
                    <option value={8}>≤ 8 mins</option>
                    <option value={12}>≤ 12 mins</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                  >
                    <option value="instant">Instant Match</option>
                    <option value="daily">Daily Summary (9am)</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
