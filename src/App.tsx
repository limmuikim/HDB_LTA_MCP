import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar, FilterState } from './components/FilterBar';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { InteractiveMapHeatmap } from './components/InteractiveMapHeatmap';
import { PriceTrendAnalytics } from './components/PriceTrendAnalytics';
import { MortgageCalculator } from './components/MortgageCalculator';
import { SavedAndCompare } from './components/SavedAndCompare';
import { AlertsManager } from './components/AlertsManager';
import { TransitScoreExplainerModal } from './components/TransitScoreExplainerModal';
import { ConversationalAdvisor } from './components/ConversationalAdvisor';

import { INITIAL_HDB_LISTINGS } from './data/hdbListings';
import { CustomAlertRule, HDBListing, InAppNotification, TownName } from './types/hdb';
import { Train, Info, Sparkles, Filter, MessageSquare, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'listings' | 'chat' | 'map' | 'trends' | 'mortgage' | 'saved' | 'alerts'>('listings');
  const [listings] = useState<HDBListing[]>(INITIAL_HDB_LISTINGS);
  const [selectedListing, setSelectedListing] = useState<HDBListing | null>(null);
  const [mortgagePrefilledListing, setMortgagePrefilledListing] = useState<HDBListing | null>(null);
  const [isTransitExplainerOpen, setIsTransitExplainerOpen] = useState(false);
  const [quickChatInput, setQuickChatInput] = useState('');

  // Saved Listings & Comparison State (with LocalStorage)
  const [savedListingIds, setSavedListingIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('transitHdb_savedIds');
      return stored ? JSON.parse(stored) : ['hdb-bishan-234', 'hdb-queenstown-18c'];
    } catch {
      return ['hdb-bishan-234', 'hdb-queenstown-18c'];
    }
  });

  const [comparedListingIds, setComparedListingIds] = useState<string[]>(['hdb-bishan-234', 'hdb-queenstown-18c']);

  const [savedNotes, setSavedNotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('transitHdb_notes');
      return stored ? JSON.parse(stored) : {
        'hdb-bishan-234': 'Call agent Benjamin to check on extension of stay. High interest due to Catholic High 1km proximity.',
      };
    } catch {
      return {};
    }
  });

  // Custom Alerts Rules
  const [customAlerts, setCustomAlerts] = useState<CustomAlertRule[]>(() => {
    try {
      const stored = localStorage.getItem('transitHdb_alerts');
      return stored ? JSON.parse(stored) : [
        {
          id: 'alert-1',
          name: 'Central 4-Room near MRT Under $900k',
          towns: ['Bishan', 'Queenstown', 'Toa Payoh'],
          flatTypes: ['4-Room'],
          maxPrice: 900000,
          minPrice: 300000,
          minTransitScore: 88,
          maxWalkMinutesToMRT: 5,
          frequency: 'instant',
          channel: 'in_app',
          createdAt: '2026-10-01',
          enabled: true,
          matchCount: 3,
        },
        {
          id: 'alert-2',
          name: 'Top Transit Score (≥90) Anywhere',
          towns: ['Bishan', 'Queenstown', 'Redhill', 'Kallang/Whampoa', 'Clementi'],
          flatTypes: ['3-Room', '4-Room', '5-Room'],
          maxPrice: 1100000,
          minPrice: 300000,
          minTransitScore: 90,
          maxWalkMinutesToMRT: 6,
          frequency: 'daily',
          channel: 'in_app',
          createdAt: '2026-10-03',
          enabled: true,
          matchCount: 5,
        },
      ];
    } catch {
      return [];
    }
  });

  // In-App Notification Feed
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-1',
      alertId: 'alert-1',
      alertName: 'Central 4-Room near MRT Under $900k',
      listingId: 'hdb-bishan-234',
      listingTitle: 'Blk 234 Bishan St 22 (4-Room)',
      town: 'Bishan',
      flatType: '4-Room',
      price: 888000,
      transitScore: 93,
      nearestMRT: 'Bishan MRT (NS/CC)',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: 'notif-2',
      alertId: 'alert-2',
      alertName: 'Top Transit Score (≥90) Anywhere',
      listingId: 'hdb-queenstown-18c',
      listingTitle: 'Blk 18C Holland Drive (5-Room)',
      town: 'Queenstown',
      flatType: '5-Room',
      price: 1180000,
      transitScore: 96,
      nearestMRT: 'Buona Vista MRT (EW/CC)',
      timestamp: 'Yesterday',
      read: true,
    },
  ]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('transitHdb_savedIds', JSON.stringify(savedListingIds));
  }, [savedListingIds]);

  useEffect(() => {
    localStorage.setItem('transitHdb_notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    localStorage.setItem('transitHdb_alerts', JSON.stringify(customAlerts));
  }, [customAlerts]);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
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

  // Filter & Sort Logic
  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        // Keyword Search
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchTitle = listing.title.toLowerCase().includes(query);
          const matchStreet = listing.streetName.toLowerCase().includes(query);
          const matchBlock = listing.block.toLowerCase().includes(query);
          const matchTown = listing.town.toLowerCase().includes(query);
          const matchMRT = listing.ltaTransit.nearestMRT.name.toLowerCase().includes(query);
          if (!matchTitle && !matchStreet && !matchBlock && !matchTown && !matchMRT) {
            return false;
          }
        }

        // Town filter
        if (filters.selectedTowns.length > 0 && !filters.selectedTowns.includes(listing.town)) {
          return false;
        }

        // Region filter
        if (filters.selectedRegion !== 'All' && listing.region !== filters.selectedRegion) {
          return false;
        }

        // Flat type filter
        if (
          filters.selectedFlatTypes.length > 0 &&
          !filters.selectedFlatTypes.includes(listing.flatType)
        ) {
          return false;
        }

        // Price range
        if (listing.price < filters.minPrice || listing.price > filters.maxPrice) {
          return false;
        }

        // LTA Public Transport Accessibility Score filter
        if (listing.ltaTransit.score < filters.minTransitScore) {
          return false;
        }

        // Max Walk to MRT
        if (listing.ltaTransit.nearestMRT.walkMinutes > filters.maxWalkMinutes) {
          return false;
        }

        // Remaining lease
        if (listing.remainingLeaseYears < filters.minRemainingLease) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'transitScore':
            return b.ltaTransit.score - a.ltaTransit.score;
          case 'priceAsc':
            return a.price - b.price;
          case 'priceDesc':
            return b.price - a.price;
          case 'psfAsc':
            return a.psf - b.psf;
          case 'walkTime':
            return a.ltaTransit.nearestMRT.walkMinutes - b.ltaTransit.nearestMRT.walkMinutes;
          case 'leaseDesc':
            return b.remainingLeaseYears - a.remainingLeaseYears;
          default:
            return 0;
        }
      });
  }, [listings, filters]);

  // Saved Listings Map
  const savedListings = useMemo(() => {
    return listings.filter((l) => savedListingIds.includes(l.id));
  }, [listings, savedListingIds]);

  const comparedListings = useMemo(() => {
    return listings.filter((l) => comparedListingIds.includes(l.id));
  }, [listings, comparedListingIds]);

  // Handlers
  const handleToggleSave = (listing: HDBListing) => {
    setSavedListingIds((prev) =>
      prev.includes(listing.id) ? prev.filter((id) => id !== listing.id) : [...prev, listing.id]
    );
  };

  const handleToggleCompare = (listing: HDBListing) => {
    setComparedListingIds((prev) => {
      if (prev.includes(listing.id)) {
        return prev.filter((id) => id !== listing.id);
      }
      if (prev.length >= 4) {
        // Replace oldest or cap at 4
        return [...prev.slice(1), listing.id];
      }
      return [...prev, listing.id];
    });
  };

  const handleSaveNote = (listingId: string, note: string) => {
    setSavedNotes((prev) => ({
      ...prev,
      [listingId]: note,
    }));
  };

  const handleOpenMortgage = (listing: HDBListing) => {
    setMortgagePrefilledListing(listing);
    setActiveTab('mortgage');
  };

  const handleFilterByTown = (town: TownName) => {
    setFilters((prev) => ({
      ...prev,
      selectedTowns: [town],
      selectedRegion: 'All',
    }));
    setActiveTab('listings');
  };

  // Custom Alerts Handlers
  const handleCreateAlert = (newAlertData: Omit<CustomAlertRule, 'id' | 'createdAt' | 'matchCount'>) => {
    const newAlert: CustomAlertRule = {
      ...newAlertData,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      matchCount: 1,
    };
    setCustomAlerts((prev) => [newAlert, ...prev]);
  };

  const handleToggleAlert = (alertId: string) => {
    setCustomAlerts((prev) =>
      prev.map((al) => (al.id === alertId ? { ...al, enabled: !al.enabled } : al))
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    setCustomAlerts((prev) => prev.filter((al) => al.id !== alertId));
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSimulateNewListingAlert = (alert: CustomAlertRule) => {
    // Pick an existing or synthetic match from listings
    const match =
      listings.find((l) => alert.towns.includes(l.town) && l.price <= alert.maxPrice) ||
      listings[0];

    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      alertId: alert.id,
      alertName: alert.name,
      listingId: match.id,
      listingTitle: `Just Listed: Blk ${match.block} ${match.streetName} (${match.flatType})`,
      town: match.town,
      flatType: match.flatType,
      price: match.price,
      transitScore: match.ltaTransit.score,
      nearestMRT: match.ltaTransit.nearestMRT.name,
      timestamp: 'Just now',
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setCustomAlerts((prev) =>
      prev.map((al) => (al.id === alert.id ? { ...al, matchCount: al.matchCount + 1 } : al))
    );
  };

  const handleSelectListingById = (listingId: string) => {
    const target = listings.find((l) => l.id === listingId);
    if (target) {
      setSelectedListing(target);
    }
  };

  const unreadAlertCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Primary Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedListingIds.length}
        unreadAlertCount={unreadAlertCount}
        onOpenTransitExplainer={() => setIsTransitExplainerOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'listings' && (
          <div>
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalResultsCount={filteredListings.length}
            />

            {/* Listings Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* Feature Banner: Transit Differentiator */}
              <div className="mb-6 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                      LTA Datamall Integration
                    </span>
                    <span className="text-xs text-slate-400">MRT & Bus Proximity Metric</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    Smart Singapore HDB Search Powered by Public Transit Proximity
                  </h1>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                    Compare units by door-to-door CBD transit times, multi-line rail interchanges, and sheltered linkway connectivity — the true engine of Singapore property value.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Chat to Find</span>
                  </button>
                  <button
                    onClick={() => setIsTransitExplainerOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/15 transition-colors flex items-center gap-1.5"
                  >
                    <Train className="w-4 h-4 text-emerald-400" />
                    <span>Guide</span>
                  </button>
                </div>
              </div>

              {/* Conversational Input Banner: Chat to derive what they are looking for */}
              <div className="mb-6 bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Not sure which filters to set?</span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">Conversational Advisor</span>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (quickChatInput.trim()) {
                          setActiveTab('chat');
                        }
                      }}
                      className="mt-1 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={quickChatInput}
                        onChange={(e) => setQuickChatInput(e.target.value)}
                        placeholder="Key in what you're looking for (e.g. '4-room flat near MRT in Bishan under 850k')..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                      />
                      <button
                        type="submit"
                        onClick={() => setActiveTab('chat')}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 shadow-2xs"
                      >
                        <span>Chat & Derive</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>


              {filteredListings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
                  <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-sm text-slate-900">No matching flats found</h3>
                  <p className="text-xs text-slate-500">
                    Try relaxing your budget, expanding town selections, or lowering the minimum LTA transit score threshold.
                  </p>
                  <button
                    onClick={() =>
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
                      })
                    }
                    className="text-xs text-slate-900 font-bold underline"
                  >
                    Reset all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isSaved={savedListingIds.includes(listing.id)}
                      onToggleSave={handleToggleSave}
                      isCompared={comparedListingIds.includes(listing.id)}
                      onToggleCompare={handleToggleCompare}
                      onSelectListing={setSelectedListing}
                      onOpenMortgage={handleOpenMortgage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <ConversationalAdvisor
            listings={listings}
            filters={filters}
            setFilters={setFilters}
            onSelectListing={setSelectedListing}
            onOpenMortgage={handleOpenMortgage}
            savedListingIds={savedListingIds}
            onToggleSave={handleToggleSave}
            onNavigateToListings={() => setActiveTab('listings')}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMapHeatmap
            listings={listings}
            onSelectListing={setSelectedListing}
            onFilterByTown={handleFilterByTown}
          />
        )}

        {activeTab === 'trends' && (
          <PriceTrendAnalytics onFilterByTown={handleFilterByTown} />
        )}

        {activeTab === 'mortgage' && (
          <MortgageCalculator
            prefilledListing={mortgagePrefilledListing}
            onClearPrefilled={() => setMortgagePrefilledListing(null)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedAndCompare
            savedListings={savedListings}
            comparedListings={comparedListings}
            onToggleSave={handleToggleSave}
            onToggleCompare={handleToggleCompare}
            onSelectListing={setSelectedListing}
            onOpenMortgage={handleOpenMortgage}
            savedNotes={savedNotes}
            onSaveNote={handleSaveNote}
            onClearAllSaved={() => setSavedListingIds([])}
            onBrowseListings={() => setActiveTab('listings')}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsManager
            alerts={customAlerts}
            notifications={notifications}
            onCreateAlert={handleCreateAlert}
            onToggleAlert={handleToggleAlert}
            onDeleteAlert={handleDeleteAlert}
            onMarkNotificationRead={handleMarkNotificationRead}
            onClearAllNotifications={handleClearAllNotifications}
            onSimulateNewListingAlert={handleSimulateNewListingAlert}
            onSelectListingById={handleSelectListingById}
          />
        )}
      </main>

      {/* Listing Detail Modal */}
      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        isSaved={selectedListing ? savedListingIds.includes(selectedListing.id) : false}
        onToggleSave={handleToggleSave}
        onOpenMortgage={handleOpenMortgage}
        savedNotes={savedNotes}
        onSaveNote={handleSaveNote}
      />

      {/* Transit Score Explainer Modal */}
      <TransitScoreExplainerModal
        isOpen={isTransitExplainerOpen}
        onClose={() => setIsTransitExplainerOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-bold text-xs">
              T
            </div>
            <span className="font-bold text-slate-900">TransitHDB</span>
            <span>· Singapore Public Housing & LTA Rail Network Navigator</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsTransitExplainerOpen(true)}
              className="hover:text-slate-900 font-medium"
            >
              LTA Methodology
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('mortgage')}
              className="hover:text-slate-900 font-medium"
            >
              MSR & TDSR Calculator
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('map')}
              className="hover:text-slate-900 font-medium"
            >
              Interactive Heatmap
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
