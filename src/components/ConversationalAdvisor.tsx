import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Train,
  Check,
  ArrowRight,
  Filter,
  DollarSign,
  Compass,
  RotateCcw,
  User,
  Bot,
  Heart,
  Calculator,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { FlatType, HDBListing, TownName } from '../types/hdb';
import { FilterState } from './FilterBar';
import { formatSGD, calculateMonthlyInstallment } from '../utils/mortgageCalculations';
import { MRT_LINE_CONFIG, getScoreColor } from '../utils/ltaScoring';

export interface DerivedCriteria {
  towns?: TownName[];
  flatTypes?: FlatType[];
  maxPrice?: number;
  minPrice?: number;
  minTransitScore?: number;
  maxWalkMinutes?: number;
  workDestination?: string;
  focusListingId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  derivedCriteria?: DerivedCriteria;
  matchedListings?: HDBListing[];
  suggestedQuestions?: string[];
}

interface ConversationalAdvisorProps {
  listings: HDBListing[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectListing: (listing: HDBListing) => void;
  onOpenMortgage: (listing: HDBListing) => void;
  onLocateOnMap: (listing: HDBListing) => void;
  onExploreMapWithFilters: (derived: DerivedCriteria) => void;
  savedListingIds: string[];
  onToggleSave: (listing: HDBListing) => void;
  onNavigateToListings: () => void;
  onNavigateToMap: () => void;
}

const STARTER_PROMPTS = [
  'I work in Raffles Place CBD, have an $850k budget, want a 4-Room flat with high transit score.',
  'Looking for a 5-Room in Queenstown or Bishan near MRT under $1.2M.',
  'Starter 3-Room flat under $600k with under 5 min walk to MRT.',
  'Flats with top LTA Transit Score (Grade A+) and fully sheltered walkway.',
  'Spacious Executive flat in the East with good transit connections.',
];

export const ConversationalAdvisor: React.FC<ConversationalAdvisorProps> = ({
  listings,
  filters,
  setFilters,
  onSelectListing,
  onOpenMortgage,
  onLocateOnMap,
  onExploreMapWithFilters,
  savedListingIds,
  onToggleSave,
  onNavigateToListings,
  onNavigateToMap,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: "Hello! I'm your TransitHDB Housing & Transit Advisor. Tell me what you're looking for in your own words — for example:\n\n• Your workplace or preferred commute (e.g., \"work in Tanjong Pagar CBD\")\n• Budget (e.g., \"under $850k\" or \"around 600k\")\n• Flat size & towns (e.g., \"4-Room in Bishan or Redhill\")\n• Walking comfort (e.g., \"under 5 min walk, fully sheltered\")\n\nI'll analyze Singapore's resale listings, compute transit proximity scores, and derive the exact criteria for you.",
      timestamp: 'Just now',
      suggestedQuestions: [
        '4-Room under $850k near CBD',
        'Top LTA Transit Score flats (≥90)',
        'Bishan vs Queenstown transit comparison',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAppliedDerived, setLastAppliedDerived] = useState<DerivedCriteria | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Natural Language Intent Parsing & Housing Rule Engine
  const parseNaturalLanguage = (query: string): {
    derived: DerivedCriteria;
    responseContent: string;
    matchedFlats: HDBListing[];
    suggestedQuestions: string[];
  } => {
    const q = query.toLowerCase();
    const derived: DerivedCriteria = {};

    // 1. Detect Towns
    const townMap: Record<string, TownName> = {
      bishan: 'Bishan',
      queenstown: 'Queenstown',
      buona: 'Queenstown',
      holland: 'Queenstown',
      redhill: 'Bukit Merah',
      tiong: 'Bukit Merah',
      merah: 'Bukit Merah',
      'toa payoh': 'Toa Payoh',
      payoh: 'Toa Payoh',
      tampines: 'Tampines',
      bedok: 'Bedok',
      punggol: 'Punggol',
      sengkang: 'Sengkang',
      buangkok: 'Sengkang',
      woodlands: 'Woodlands',
      'jurong east': 'Jurong East',
      jurong: 'Jurong East',
      clementi: 'Clementi',
      'ang mo kio': 'Ang Mo Kio',
      amk: 'Ang Mo Kio',
      kallang: 'Kallang/Whampoa',
      whampoa: 'Kallang/Whampoa',
      marine: 'Marine Parade',
      parade: 'Marine Parade',
      yishun: 'Yishun',
      khatib: 'Yishun',
      pasir: 'Pasir Ris',
    };

    const detectedTowns: TownName[] = [];
    Object.entries(townMap).forEach(([keyword, townName]) => {
      if (q.includes(keyword) && !detectedTowns.includes(townName)) {
        detectedTowns.push(townName);
      }
    });
    if (detectedTowns.length > 0) {
      derived.towns = detectedTowns;
    }

    // 2. Detect Flat Types
    const detectedFlatTypes: FlatType[] = [];
    if (q.includes('2-room') || q.includes('2 room')) detectedFlatTypes.push('2-Room');
    if (q.includes('3-room') || q.includes('3 room')) detectedFlatTypes.push('3-Room');
    if (q.includes('4-room') || q.includes('4 room')) detectedFlatTypes.push('4-Room');
    if (q.includes('5-room') || q.includes('5 room')) detectedFlatTypes.push('5-Room');
    if (q.includes('executive') || q.includes('ea') || q.includes('em') || q.includes('maisonette')) detectedFlatTypes.push('Executive');
    if (q.includes('3gen') || q.includes('multi-gen') || q.includes('generation')) detectedFlatTypes.push('3Gen');
    if (detectedFlatTypes.length > 0) {
      derived.flatTypes = detectedFlatTypes;
    }

    // 3. Detect Budget / Price
    const priceUnderMatch = q.match(/(?:under|below|max|budget|within|around)\s*(?:\$|sgd)?\s*([0-9.]+)\s*(k|m|mil|million)?/i);
    const directPriceMatch = q.match(/(?:\$|sgd)\s*([0-9.]+)\s*(k|m|mil|million)?/i);
    const numMatch = priceUnderMatch || directPriceMatch;

    if (numMatch) {
      const val = parseFloat(numMatch[1]);
      const unit = (numMatch[2] || '').toLowerCase();
      if (unit.startsWith('m') || unit.startsWith('mil')) {
        derived.maxPrice = Math.round(val * 1000000);
      } else if (unit === 'k' || val < 2000) {
        derived.maxPrice = Math.round(val * 1000);
      } else {
        derived.maxPrice = Math.round(val);
      }
    }

    // 4. Detect Transit Criteria
    if (q.includes('grade a+') || q.includes('top transit') || q.includes('best transit')) {
      derived.minTransitScore = 90;
    } else if (q.includes('high transit') || q.includes('good transit') || q.includes('prime transit')) {
      derived.minTransitScore = 85;
    } else if (q.includes('near mrt') || q.includes('close to mrt') || q.includes('transit score')) {
      derived.minTransitScore = 80;
    }

    // 5. Detect Max Walk Minutes
    if (q.includes('3 min') || q.includes('3min')) {
      derived.maxWalkMinutes = 4;
    } else if (q.includes('5 min') || q.includes('5min') || q.includes('short walk')) {
      derived.maxWalkMinutes = 5;
    } else if (q.includes('8 min') || q.includes('8min')) {
      derived.maxWalkMinutes = 8;
    } else if (q.includes('10 min') || q.includes('10min')) {
      derived.maxWalkMinutes = 10;
    }

    // 6. Detect Destination / Work Hub
    if (q.includes('cbd') || q.includes('raffles') || q.includes('tanjong pagar') || q.includes('marina bay') || q.includes('shenton')) {
      derived.workDestination = 'Raffles Place / CBD';
    } else if (q.includes('orchard') || q.includes('somerset') || q.includes('dhoby')) {
      derived.workDestination = 'Orchard Road';
    } else if (q.includes('jurong lake') || q.includes('jurong east') || q.includes('second cbd')) {
      derived.workDestination = 'Jurong East Regional Centre';
    }

    // 7. Find Matching Listings based on derived criteria
    let matches = listings.filter((flat) => {
      if (derived.towns && derived.towns.length > 0 && !derived.towns.includes(flat.town)) {
        return false;
      }
      if (derived.flatTypes && derived.flatTypes.length > 0 && !derived.flatTypes.includes(flat.flatType)) {
        return false;
      }
      if (derived.maxPrice && flat.price > derived.maxPrice) {
        return false;
      }
      if (derived.minTransitScore && flat.ltaTransit.score < derived.minTransitScore) {
        return false;
      }
      if (derived.maxWalkMinutes && flat.ltaTransit.nearestMRT.walkMinutes > derived.maxWalkMinutes) {
        return false;
      }
      return true;
    });

    // If too restrictive, provide closest recommendations
    if (matches.length === 0) {
      matches = listings
        .filter((f) => (derived.maxPrice ? f.price <= derived.maxPrice * 1.15 : true))
        .sort((a, b) => b.ltaTransit.score - a.ltaTransit.score)
        .slice(0, 3);
    } else {
      matches.sort((a, b) => b.ltaTransit.score - a.ltaTransit.score);
    }

    // 8. Generate conversational response text
    let narrative = '';

    if (derived.workDestination) {
      narrative += `Based on your commute to **${derived.workDestination}**, I prioritized flats with direct trunk MRT lines and rapid door-to-door transit times.\n\n`;
    }

    if (derived.towns && derived.towns.length > 0) {
      narrative += `I looked specifically into **${derived.towns.join(' & ')}**`;
    } else {
      narrative += `I surveyed high-accessibility estates across Singapore`;
    }

    if (derived.flatTypes && derived.flatTypes.length > 0) {
      narrative += ` for **${derived.flatTypes.join(' & ')}** configurations`;
    }

    if (derived.maxPrice) {
      narrative += ` with a budget ceiling of **${formatSGD(derived.maxPrice)}**`;
    }

    if (derived.minTransitScore) {
      narrative += ` requiring an LTA Transit Accessibility Score of **≥ ${derived.minTransitScore}**`;
    }

    narrative += `.\n\nHere are the top **${matches.length}** matched flats that fit what you're looking at:`;

    const suggestedQuestions = [
      `What would the monthly mortgage be for ${matches[0]?.title ? matches[0].title.slice(0, 25) : 'these'}?`,
      'Show me flats with fully sheltered linkways only',
      'Compare remaining lease duration',
    ];

    return {
      derived,
      responseContent: narrative,
      matchedFlats: matches.slice(0, 4),
      suggestedQuestions,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    // Simulate smart thinking delay
    setTimeout(() => {
      const { derived, responseContent, matchedFlats, suggestedQuestions } = parseNaturalLanguage(text);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseContent,
        timestamp: 'Just now',
        derivedCriteria: derived,
        matchedListings: matchedFlats,
        suggestedQuestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 600);
  };

  const handleApplyDerivedFilters = (criteria: DerivedCriteria) => {
    setFilters((prev) => ({
      ...prev,
      selectedTowns: criteria.towns && criteria.towns.length > 0 ? criteria.towns : prev.selectedTowns,
      selectedFlatTypes: criteria.flatTypes && criteria.flatTypes.length > 0 ? criteria.flatTypes : prev.selectedFlatTypes,
      maxPrice: criteria.maxPrice || prev.maxPrice,
      minTransitScore: criteria.minTransitScore || prev.minTransitScore,
      maxWalkMinutes: criteria.maxWalkMinutes || prev.maxWalkMinutes,
    }));
    setLastAppliedDerived(criteria);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Chat reset. What type of HDB flat or location are you looking at today? Type your budget, desired town, or commute requirements.",
        timestamp: 'Just now',
        suggestedQuestions: [
          '4-Room under $850k near CBD',
          'Flats in Queenstown with Grade A+ transit',
          'Starter flats under $600k near MRT',
        ],
      },
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conversational Housing Finder</span>
            </span>
            <span className="text-xs text-slate-400">Natural Language Intent Parser</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Chat to Derive What You're Looking For
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Type your commute preferences, budget, or family needs. Our advisor extracts your exact criteria, computes transit scores, and filters the marketplace automatically.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToMap}
            className="text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold px-3 py-2 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5"
            title="View current Singapore Transit Map & Heatmap"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transit Map</span>
          </button>

          <button
            onClick={handleResetChat}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>

          <button
            onClick={onNavigateToListings}
            className="text-xs text-white bg-slate-900 hover:bg-slate-800 font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>View All {listings.length} Listings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[680px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center shadow-xs text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Body */}
              <div className="space-y-3 flex-1 min-w-0">
                <div
                  className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-medium">{msg.text}</div>

                  {/* Derived Criteria Card */}
                  {msg.derivedCriteria && Object.keys(msg.derivedCriteria).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 bg-white rounded-2xl p-3.5 text-slate-900 shadow-2xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                          <Filter className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Derived Search Criteria</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onExploreMapWithFilters(msg.derivedCriteria!)}
                            className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            title="View matching areas and rail lines on the Transit Map"
                          >
                            <Compass className="w-3 h-3 text-emerald-600" />
                            <span>Explore on Transit Map</span>
                          </button>
                          <button
                            onClick={() => handleApplyDerivedFilters(msg.derivedCriteria!)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Apply to Marketplace</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 font-medium">
                        {msg.derivedCriteria.towns && (
                          <span>Towns: <strong className="text-slate-900">{msg.derivedCriteria.towns.join(', ')}</strong></span>
                        )}
                        {msg.derivedCriteria.flatTypes && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>Type: <strong className="text-slate-900">{msg.derivedCriteria.flatTypes.join(', ')}</strong></span>
                          </>
                        )}
                        {msg.derivedCriteria.maxPrice && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>Max Budget: <strong className="text-slate-900">{formatSGD(msg.derivedCriteria.maxPrice)}</strong></span>
                          </>
                        )}
                        {msg.derivedCriteria.minTransitScore && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-emerald-700 font-semibold">
                              LTA Score ≥ {msg.derivedCriteria.minTransitScore}
                            </span>
                          </>
                        )}
                        {msg.derivedCriteria.maxWalkMinutes && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>Walk ≤ {msg.derivedCriteria.maxWalkMinutes} min</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline Matched Listing Cards in Chat */}
                {msg.matchedListings && msg.matchedListings.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Top Matched Units ({msg.matchedListings.length})
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.matchedListings.map((flat) => {
                        const scoreColors = getScoreColor(flat.ltaTransit.score);
                        const isSaved = savedListingIds.includes(flat.id);
                        const estLoan = flat.price * 0.8;
                        const estMonthly = calculateMonthlyInstallment(estLoan, 2.6, 25);

                        return (
                          <div
                            key={flat.id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative aspect-16/9 bg-slate-100">
                                <img
                                  src={flat.images[0]}
                                  alt={flat.title}
                                  className="w-full h-full object-cover"
                                />
                                <div
                                  className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-lg border backdrop-blur-md ${scoreColors.bg} ${scoreColors.text} ${scoreColors.border}`}
                                >
                                  Transit: {flat.ltaTransit.score} ({flat.ltaTransit.grade})
                                </div>
                                <button
                                  onClick={() => onToggleSave(flat)}
                                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-md text-slate-700 hover:text-rose-600 transition-colors"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                                </button>
                              </div>

                              <div className="p-3 space-y-1.5">
                                <div className="flex items-baseline justify-between">
                                  <div className="font-bold text-sm text-slate-900">{formatSGD(flat.price)}</div>
                                  <div className="text-[11px] text-slate-500">Est. {formatSGD(estMonthly)}/mo</div>
                                </div>

                                <div className="text-[11px] text-slate-500 font-medium">
                                  {flat.block} {flat.streetName} · {flat.town} · {flat.flatType}
                                </div>

                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] space-y-0.5">
                                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                                    <span className="truncate">{flat.ltaTransit.nearestMRT.name}</span>
                                    <span className="text-[10px] text-emerald-700 font-bold">{flat.ltaTransit.nearestMRT.walkMinutes} min walk</span>
                                  </div>
                                  <div className="text-slate-500 text-[10px]">
                                    CBD commute: <strong className="text-slate-700">{flat.ltaTransit.travelTimeToRafflesPlaceMin} min</strong> door-to-door
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onLocateOnMap(flat)}
                                  className="text-emerald-700 hover:text-emerald-900 text-[11px] font-semibold flex items-center gap-1 p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Locate flat and rail lines on Transit Map"
                                >
                                  <Compass className="w-3 h-3 text-emerald-600" />
                                  <span>Map</span>
                                </button>
                                <button
                                  onClick={() => onOpenMortgage(flat)}
                                  className="text-slate-600 hover:text-slate-900 text-[11px] font-semibold flex items-center gap-1 p-1 hover:bg-slate-200/60 rounded-lg transition-colors"
                                >
                                  <Calculator className="w-3 h-3" />
                                  <span>Calc</span>
                                </button>
                              </div>
                              <button
                                onClick={() => onSelectListing(flat)}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <span>Details</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested follow-up prompt chips */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedQuestions.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-xl transition-colors text-left"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Processing / Thinking Indicator */}
          {isProcessing && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-9 h-9 rounded-2xl shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-3xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Analyzing Singapore resale transactions & LTA transit proximity...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar & Suggested Prompt Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Quick Starter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Try asking:
            </span>
            {STARTER_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] font-medium bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg shrink-0 transition-colors shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Key in what you're looking for (e.g., '4-room flat near MRT in Bishan under 850k with high transit score')..."
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className={`p-3 rounded-2xl font-semibold transition-all shrink-0 ${
                inputText.trim() && !isProcessing
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
