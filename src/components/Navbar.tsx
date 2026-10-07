import React from 'react';
import {
  Train,
  Heart,
  Bell,
  Calculator,
  Compass,
  TrendingUp,
  SlidersHorizontal,
  Info,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'listings' | 'chat' | 'map' | 'trends' | 'mortgage' | 'saved' | 'alerts';
  setActiveTab: (tab: 'listings' | 'chat' | 'map' | 'trends' | 'mortgage' | 'saved' | 'alerts') => void;
  savedCount: number;
  unreadAlertCount: number;
  onOpenTransitExplainer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  unreadAlertCount,
  onOpenTransitExplainer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('listings')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <Train className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">TransitHDB</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    LTA Scored
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Singapore Resale Flats · Public Transit Proximity
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-sm font-medium">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-emerald-800 bg-emerald-100/60 hover:bg-emerald-100 font-semibold'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chat Advisor</span>
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'listings'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden md:inline">Listings</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden md:inline">Transit Map</span>
              <span className="md:hidden">Map</span>
            </button>

            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'trends'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Trends</span>
            </button>

            <button
              onClick={() => setActiveTab('mortgage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'mortgage'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden md:inline">Mortgage</span>
            </button>
          </nav>


          {/* Right Action Icons: Saved & Alerts */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTransitExplainer}
              title="Learn about LTA Transit Accessibility Score"
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Transit Score Guide</span>
            </button>

            {/* Saved Flats */}
            <button
              onClick={() => setActiveTab('saved')}
              className={`relative p-2 rounded-lg transition-colors ${
                activeTab === 'saved'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Saved Listings & Compare"
            >
              <Heart className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Custom Listing Alerts */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative p-2 rounded-lg transition-colors ${
                activeTab === 'alerts'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Listing Alerts & Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlertCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
