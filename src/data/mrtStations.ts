import { MRTLine } from '../types/hdb';

export interface SVGMRTLine {
  id: MRTLine;
  name: string;
  color: string;
  pathD: string;
}

export interface SVGMRTStation {
  name: string;
  code: string;
  lines: MRTLine[];
  x: number; // SVG coordinate (0 - 100)
  y: number; // SVG coordinate (0 - 100)
  isInterchange: boolean;
}

export const MRT_SVG_LINES: SVGMRTLine[] = [
  // East-West Line (Green)
  {
    id: 'EW',
    name: 'East-West Line',
    color: '#009530',
    pathD: 'M 10 50 L 25 54 L 32 56 L 40 62 L 44 66 L 50 68 L 56 62 L 67 60 L 72 58 L 80 48 L 88 42',
  },
  // North-South Line (Red)
  {
    id: 'NS',
    name: 'North-South Line',
    color: '#D42E12',
    pathD: 'M 25 54 L 30 40 L 38 22 L 50 26 L 50 46 L 48 52 L 48 68',
  },
  // North East Line (Purple)
  {
    id: 'NE',
    name: 'North East Line',
    color: '#8F4199',
    pathD: 'M 46 72 L 50 65 L 56 56 L 62 38 L 67 32',
  },
  // Circle Line (Orange)
  {
    id: 'CC',
    name: 'Circle Line',
    color: '#FA9E0D',
    pathD: 'M 40 62 L 34 50 L 42 42 L 50 46 L 58 48 L 58 60 L 50 68 Z',
  },
  // Downtown Line (Blue)
  {
    id: 'DT',
    name: 'Downtown Line',
    color: '#005EC4',
    pathD: 'M 26 48 L 38 38 L 48 52 L 54 64 L 62 58 L 74 54 L 80 48',
  },
  // Thomson-East Coast Line (Brown)
  {
    id: 'TE',
    name: 'Thomson-East Coast Line',
    color: '#9D5B25',
    pathD: 'M 38 20 L 44 32 L 48 46 L 48 60 L 52 70 L 67 66 L 78 62',
  },
];

export const KEY_MRT_STATIONS: SVGMRTStation[] = [
  { name: 'Jurong East', code: 'NS1/EW24', lines: ['NS', 'EW'], x: 25, y: 54, isInterchange: true },
  { name: 'Woodlands', code: 'NS9/TE2', lines: ['NS', 'TE'], x: 38, y: 22, isInterchange: true },
  { name: 'Bishan', code: 'NS17/CC15', lines: ['NS', 'CC'], x: 50, y: 46, isInterchange: true },
  { name: 'Toa Payoh', code: 'NS19', lines: ['NS'], x: 48, y: 52, isInterchange: false },
  { name: 'Queenstown', code: 'EW19', lines: ['EW'], x: 40, y: 62, isInterchange: false },
  { name: 'Redhill', code: 'EW18', lines: ['EW'], x: 44, y: 66, isInterchange: false },
  { name: 'Outram Park', code: 'EW16/NE3/TE17', lines: ['EW', 'NE', 'TE'], x: 48, y: 70, isInterchange: true },
  { name: 'Raffles Place', code: 'EW14/NS26', lines: ['EW', 'NS'], x: 50, y: 68, isInterchange: true },
  { name: 'Punggol', code: 'NE17/CP4', lines: ['NE'], x: 67, y: 32, isInterchange: true },
  { name: 'Sengkang', code: 'NE16', lines: ['NE'], x: 62, y: 38, isInterchange: true },
  { name: 'Serangoon', code: 'NE12/CC13', lines: ['NE', 'CC'], x: 56, y: 48, isInterchange: true },
  { name: 'Tampines', code: 'EW2/DT32', lines: ['EW', 'DT'], x: 80, y: 48, isInterchange: true },
  { name: 'Bedok', code: 'EW5', lines: ['EW'], x: 72, y: 58, isInterchange: false },
  { name: 'Marine Parade', code: 'TE26', lines: ['TE'], x: 67, y: 66, isInterchange: false },
  { name: 'Clementi', code: 'EW23', lines: ['EW'], x: 32, y: 56, isInterchange: false },
  { name: 'Ang Mo Kio', code: 'NS16', lines: ['NS'], x: 51, y: 40, isInterchange: false },
  { name: 'Yishun', code: 'NS13', lines: ['NS'], x: 50, y: 26, isInterchange: false },
  { name: 'Pasir Ris', code: 'EW1', lines: ['EW'], x: 84, y: 39, isInterchange: false },
];
