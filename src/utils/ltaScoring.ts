import { MRTLine } from '../types/hdb';

export const MRT_LINE_CONFIG: Record<
  MRTLine,
  { name: string; bg: string; text: string; hex: string }
> = {
  EW: { name: 'East-West Line', bg: 'bg-[#009530]', text: 'text-white', hex: '#009530' },
  NS: { name: 'North-South Line', bg: 'bg-[#D42E12]', text: 'text-white', hex: '#D42E12' },
  NE: { name: 'North East Line', bg: 'bg-[#8F4199]', text: 'text-white', hex: '#8F4199' },
  CC: { name: 'Circle Line', bg: 'bg-[#FA9E0D]', text: 'text-slate-900', hex: '#FA9E0D' },
  DT: { name: 'Downtown Line', bg: 'bg-[#005EC4]', text: 'text-white', hex: '#005EC4' },
  TE: { name: 'Thomson-East Coast', bg: 'bg-[#9D5B25]', text: 'text-white', hex: '#9D5B25' },
};

export function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
  fillHex: string;
} {
  if (score >= 90) {
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800',
      fillHex: '#059669',
    };
  }
  if (score >= 80) {
    return {
      text: 'text-teal-700 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200 dark:border-teal-800',
      fillHex: '#0d9488',
    };
  }
  if (score >= 70) {
    return {
      text: 'text-sky-700 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-200 dark:border-sky-800',
      fillHex: '#0284c7',
    };
  }
  if (score >= 60) {
    return {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      fillHex: '#d97706',
    };
  }
  return {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    fillHex: '#e11d48',
  };
}

export function getGradeBadge(grade: string): { label: string; description: string } {
  switch (grade) {
    case 'A+':
      return { label: 'Exceptional (A+)', description: 'Direct MRT Interchange access (<4 min walk), rapid CBD commute <20 mins' };
    case 'A':
      return { label: 'Prime Transit (A)', description: 'Under 7 min walk to MRT, high frequency trunk bus routes' };
    case 'B+':
      return { label: 'Well-Connected (B+)', description: '7-10 min walk or 1 bus stop to MRT, good feeder coverage' };
    case 'B':
      return { label: 'Moderate (B)', description: '10-15 min walk or 2-3 stops feeder bus connectivity' };
    default:
      return { label: 'Feeder Reliant (C)', description: 'Requires feeder bus to reach MRT network' };
  }
}
