export type Dim = 'F1' | 'F2' | 'F3' | 'F4' | 'F5';
export type Outcome = 'right' | 'wrong' | 'open';
export type Scenario = 'flag' | 'question' | 'quiet';
export type Tab = 'today' | 'self' | 'habits' | 'log' | 'budget';
export type DayState = 'full' | 'partial' | 'rest' | 'missed';

export interface TrackRecord { flags: number; right: number; wrong: number; open: number }

export interface Question {
  dim: Dim;
  text: string;
  why: string;
  options: { id: string; label: string; result: string; muted?: boolean }[];
}

export interface TodayData {
  date: string;
  record: TrackRecord;
  novelty: number;
  median: number;
  note: string;
  sources: string;
  strengths: number[];
  history?: number[];
  flagId?: number;
  question?: Question;
  quietNote?: string;
}

export interface Point { v: number; lo: number; hi: number }

export interface Trajectory {
  dim: Dim;
  name: string;
  meta: string;
  source: string;
  estimable: boolean;
  points: Point[];
  dots?: { t: number; v: number }[];
  empty?: string;
  now: number | null;
  delta?: string;
  deltaWindow?: string;
  warn?: boolean;
  band?: string;
  flags?: { raised: number; right: number; wrong: number };
  axis: string[];
  axisNote?: string;
  markIndex?: number;
}

export interface RouteDay { day: string; time: string | null; gapAfter?: number }

export type Evidence =
  | { kind: 'route'; title: string; range: string; stops: string[]; days: RouteDay[] }
  | { kind: 'timeline'; title: string; range: string; events: { when: string; text: string }[] };

export interface Challenge { ground: string | null; text: string; at: string }

export interface Flag {
  id: number;
  dim: Dim;
  dimName: string;
  status: 'open' | 'withdrawn' | 'upheld';
  statusLabel: string;
  claim: string;
  summary?: string;
  confidence: number;
  confidenceLabel: string;
  sampleNote: string;
  caveat?: string;
  evidence: Evidence;
  asks?: string;
  challenge?: Challenge;
  verdict?: string;
  history: {
    title: string;
    tally: { right: number; wrong: number; open: number };
    outcomes: Outcome[];
    current: number;
    note: string;
  };
}
