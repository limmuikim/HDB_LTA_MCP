export type FlatType = '2-Room' | '3-Room' | '4-Room' | '5-Room' | 'Executive' | '3Gen';

export type TownName =
  | 'Bishan'
  | 'Queenstown'
  | 'Toa Payoh'
  | 'Bukit Merah'
  | 'Tampines'
  | 'Bedok'
  | 'Punggol'
  | 'Sengkang'
  | 'Woodlands'
  | 'Jurong East'
  | 'Clementi'
  | 'Ang Mo Kio'
  | 'Kallang/Whampoa'
  | 'Marine Parade'
  | 'Yishun'
  | 'Pasir Ris';

export type Region = 'Central' | 'East' | 'West' | 'North' | 'North-East';

export type MRTLine = 'EW' | 'NS' | 'NE' | 'CC' | 'DT' | 'TE';

export interface MRTStationInfo {
  code: string; // e.g. "NS17/CC15"
  name: string; // e.g. "Bishan"
  lines: MRTLine[];
  distanceMeters: number;
  walkMinutes: number;
  isInterchange: boolean;
}

export interface LTATransitData {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  nearestMRT: MRTStationInfo;
  secondaryMRT?: MRTStationInfo;
  busStopsWithin400m: number;
  busServicesCount: number;
  busLines: string[];
  travelTimeToRafflesPlaceMin: number;
  travelTimeToOrchardMin: number;
  travelTimeToJurongEastMin: number;
  shelteredWalkway: 'Fully Sheltered' | 'Partially Sheltered' | 'Unsheltered';
  pcnConnectivity: boolean; // Park Connector Network
  scoreBreakdown: {
    mrtProximity: number; // max 40
    interchangeBonus: number; // max 15
    busConnectivity: number; // max 25
    cbdTravelSpeed: number; // max 20
  };
}

export interface HDBListing {
  id: string;
  title: string;
  block: string;
  streetName: string;
  town: TownName;
  region: Region;
  postalCode: string;
  flatType: FlatType;
  flatModel: string; // e.g. "Model A", "Improved", "Design, Build and Sell Scheme (DBSS)", "Premium Apartment"
  price: number; // SGD
  floorAreaSqm: number;
  floorAreaSqft: number;
  psf: number;
  leaseCommenceYear: number;
  remainingLeaseYears: number;
  remainingLeaseMonths: number;
  floorLevel: 'Low (01-04)' | 'Mid (05-12)' | 'High (13-24)' | 'Very High (25+)';
  builtYear: number;
  ethnicQuota: string; // e.g. "Open to all races & PRs" or "Chinese / Malay eligible"
  coordinates: {
    lat: number;
    lng: number;
    mapX: number; // Normalized 0-100 for SVG map
    mapY: number; // Normalized 0-100 for SVG map
  };
  ltaTransit: LTATransitData;
  features: string[];
  description: string;
  images: string[];
  dateListed: string;
  agentName: string;
  agentAgency: string;
  isFeatured?: boolean;
}

export interface CustomAlertRule {
  id: string;
  name: string;
  towns: TownName[];
  flatTypes: FlatType[];
  maxPrice: number;
  minPrice: number;
  minTransitScore: number;
  maxWalkMinutesToMRT: number;
  frequency: 'instant' | 'daily' | 'weekly';
  channel: 'in_app' | 'email' | 'push';
  createdAt: string;
  enabled: boolean;
  matchCount: number;
}

export interface InAppNotification {
  id: string;
  alertId: string;
  alertName: string;
  listingId: string;
  listingTitle: string;
  town: TownName;
  flatType: FlatType;
  price: number;
  transitScore: number;
  nearestMRT: string;
  timestamp: string;
  read: boolean;
}

export interface MortgageConfig {
  loanType: 'hdb' | 'bank';
  propertyPrice: number;
  downpaymentPercent: number; // e.g. 20% for HDB, 25% for bank
  cashPercent: number; // min 0% for HDB, min 5% for bank
  cpfPercent: number;
  interestRate: number; // 2.6% for HDB, 2.8-3.2% for bank
  loanTenureYears: number; // max 25 for HDB, max 30 for bank
  monthlyHouseholdIncome: number;
  monthlyOtherDebts: number;
}

export interface MortgageCalculationResult {
  loanAmount: number;
  downpaymentTotal: number;
  downpaymentCash: number;
  downpaymentCpf: number;
  monthlyInstallment: number;
  totalInterestPaid: number;
  totalRepayment: number;
  bsdAmount: number; // Buyer's Stamp Duty
  msrPercent: number; // Mortgage Servicing Ratio (cap 30%)
  msrExceeded: boolean;
  tdsrPercent: number; // Total Debt Servicing Ratio (cap 55%)
  tdsrExceeded: boolean;
  estimatedCpfMonthlyOA: number;
  netCashOutlayMonthly: number;
}

export interface TownHeatmapStat {
  town: TownName;
  region: Region;
  medianPrice: number;
  medianPsf: number;
  avgTransitScore: number;
  activeListingsCount: number;
  yoyPriceChangePercent: number;
  mapCoords: { x: number; y: number };
  description: string;
}
