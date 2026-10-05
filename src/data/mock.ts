// Phase 1 mock data. Every screen reads from here; phase 2 swaps this module for Supabase queries.
import { pts } from '../lib/chart';
import type { DayState, Flag, Scenario, TodayData, Trajectory } from '../types';

export const todays: Record<Scenario, TodayData> = {
  flag: {
    date: 'Sat 24 Oct',
    record: { flags: 31, right: 22, wrong: 6, open: 3 },
    novelty: 0.31,
    median: 0.44,
    note: 'lowest since 2 Oct',
    sources: 'Location · calendar · 2 logs',
    strengths: [0.78, 0.4, 0.35, 0.49, 0.55],
    history: [0.52, 0.47, 0.44, 0.41, 0.49, 0.38, 0.46, 0.43, 0.4, 0.36, 0.33, 0.35, 0.3, 0.31],
    flagId: 31,
  },
  question: {
    date: 'Wed 14 Oct',
    record: { flags: 30, right: 22, wrong: 6, open: 2 },
    novelty: 0.47,
    median: 0.44,
    note: 'within normal range',
    sources: 'Location · calendar · 3 logs',
    strengths: [0.46, 0.52, 0.33, 0.48, 0.5],
    question: {
      dim: 'F2',
      text: 'Yesterday you logged a claim about rate cuts, source M. Did you check it before accepting it?',
      why: 'Asked because 3 of your last 4 accepted claims came from M. Not scored until you answer. Your answer is kept with the F2 record.',
      options: [
        { id: 'a', label: 'Checked it', result: 'Recorded: checked. Scored on F2 as verified. Nothing changes for M.' },
        { id: 'b', label: "Took M's word", result: 'Recorded: took M’s word. Scored on F2 as accepted unchecked. M is now 4 of 5 — a flag fires at 0.60.' },
        { id: 'c', label: "Don't remember", muted: true, result: 'Recorded: no memory of checking. Scored as unchecked, weight 0.5. Three of these in a month will be raised as a flag.' },
      ],
    },
  },
  quiet: {
    date: 'Sun 18 Oct',
    record: { flags: 30, right: 22, wrong: 6, open: 2 },
    novelty: 0.52,
    median: 0.44,
    note: 'within normal range',
    sources: 'Location · calendar · 1 log',
    strengths: [0.44, 0.41, 0.35, 0.49, 0.55],
    quietNote: 'Nothing to report. Last flag 6 days ago — F3 #27, withdrawn after your challenge.',
  },
};

export const DIM_NAMES = ['Autopilot', 'Easy belief', 'Mimicry', 'Rigidity', 'Lost exploring'];

export const flags: Record<number, Flag> = {
  31: {
    id: 31,
    dim: 'F1',
    dimName: 'Autopilot',
    status: 'open',
    statusLabel: '#31 · Open · day 4',
    claim: 'Four days, same route, same departure window.',
    summary: 'Mon–Thu · dep. 08:12–08:19 · Home → Grove St → Canal → Office',
    confidence: 0.78,
    confidenceLabel: 'Confidence',
    sampleNote: '4 of 4 weekdays sampled',
    caveat: 'Tue has a 6-min GPS gap at 08:14, counted as consistent. Without Tue: 0.71.',
    evidence: {
      kind: 'route',
      title: 'Evidence · route trace',
      range: 'Mon 19 – Fri 23',
      stops: ['Home', 'Grove St', 'Canal', 'Office'],
      days: [
        { day: 'Mon', time: '08:12' },
        { day: 'Tue', time: '08:14', gapAfter: 0 },
        { day: 'Wed', time: '08:19' },
        { day: 'Thu', time: '08:13' },
        { day: 'Fri', time: null },
      ],
    },
    asks: 'One departure by a different street before Fri 17:00 closes this as resolved. None closes it as confirmed. Neither is being asked for.',
    history: {
      title: 'F1 · last 12 flags',
      tally: { right: 8, wrong: 2, open: 2 },
      outcomes: ['right', 'right', 'wrong', 'right', 'right', 'right', 'open', 'right', 'wrong', 'right', 'right', 'open'],
      current: 11,
      note: 'You challenged 3 · upheld 2 · withdrawn 1',
    },
  },
  27: {
    id: 27,
    dim: 'F3',
    dimName: 'Mimicry',
    status: 'withdrawn',
    statusLabel: '#27 · Withdrawn 29 Sep',
    claim: 'First 06:30 run within 72 h of two conversations about running.',
    confidence: 0.64,
    confidenceLabel: 'At time of flag',
    sampleNote: 'margin 0.04',
    evidence: {
      kind: 'timeline',
      title: 'Evidence · exposure → adoption',
      range: '5 days',
      events: [
        { when: 'Thu 18 · 19:40', text: 'Dinner with A — marathon training came up. Calendar + your log.' },
        { when: 'Sat 20 · 11:05', text: 'Call with R, 38 min. You logged "running".' },
        { when: 'Mon 22 · 06:30', text: 'First 06:30 run. Health: 5.2 km, 31 min.' },
      ],
    },
    challenge: {
      ground: 'Plan predates it',
      text: 'Running block has been in the calendar since 14 Sep. The plan came before the dinner, not after.',
      at: '29 Sep 21:12',
    },
    verdict: 'Calendar entry "Run 06:30" created 14 Sep, 8 days before exposure. Plan precedes exposure. Flag marked wrong. Weight of pre-existing plans in F3 raised 0.15 → 0.25.',
    history: {
      title: 'F3 · last 12 flags',
      tally: { right: 7, wrong: 3, open: 2 },
      outcomes: ['right', 'wrong', 'right', 'right', 'open', 'right', 'wrong', 'right', 'right', 'wrong', 'right', 'open'],
      current: 9,
      note: 'You challenged 4 · upheld 1 · withdrawn 3 — F3 is where the model is weakest',
    },
  },
};

export const trajectories: Trajectory[] = [
  {
    dim: 'F1', name: 'Autopilot', meta: '28 D · DAILY · n=28', source: 'location, calendar', estimable: true,
    points: pts([.42, .38, .45, .51, .36, .33, .47, .52, .44, .39, .41, .48, .55, .43, .37, .46, .5, .44, .41, .49, .53, .47, .44, .52, .61, .68, .74, .78], 0.05),
    now: 0.78, delta: '+0.34', deltaWindow: '/ 7 d', warn: true, band: '±0.05', flags: { raised: 12, right: 8, wrong: 2 },
    axis: ['26 Sep', 'today'],
  },
  {
    dim: 'F2', name: 'Easy belief', meta: '90 D · WEEKLY · n=13', source: 'logged claims, answers', estimable: true,
    points: pts([.41, .44, .39, .42, .46, .4, .38, .43, .45, .41, .39, .42, .4], 0.09),
    now: 0.4, delta: '−0.02', deltaWindow: '/ 30 d', band: '±0.09', flags: { raised: 5, right: 4, wrong: 1 },
    axis: ['26 Jul', 'today'],
  },
  {
    dim: 'F3', name: 'Mimicry', meta: '90 D · WEEKLY · n=13', source: 'adoptions × social exposure', estimable: true,
    points: pts([.33, .36, .31, .4, .47, .52, .58, .64, .49, .41, .36, .34, .35], 0.07),
    now: 0.35, delta: '−0.29', deltaWindow: 'since #27', band: '±0.07', flags: { raised: 12, right: 7, wrong: 3 },
    axis: ['26 Jul', 'today'], axisNote: '#27 withdrawn', markIndex: 7,
  },
  {
    dim: 'F4', name: 'Rigidity', meta: '18 MO · MONTHLY · n=18', source: 'opinion revisits, Δ per revisit', estimable: true,
    points: pts([.36, .37, .37, .39, .38, .4, .41, .41, .43, .42, .44, .45, .45, .47, .46, .48, .49, .49], (i) => 0.1 - i * 0.0025),
    now: 0.49, delta: '+0.13', deltaWindow: '/ 18 mo', band: '±0.06', flags: { raised: 0, right: 0, wrong: 0 },
    axis: ['May 2025', 'Oct 2026'], axisNote: '+0.007 / mo · 0.60 ≈ Feb 2028',
  },
  {
    dim: 'F5', name: 'Lost exploring', meta: '90 D · WEEKLY · n=13', source: 'decisions logged, budget spend', estimable: true,
    points: pts([.28, .31, .3, .35, .38, .37, .42, .45, .44, .49, .52, .51, .55], 0.08),
    now: 0.55, delta: '+0.27', deltaWindow: '/ 90 d', warn: true, band: '±0.08', flags: { raised: 2, right: 2, wrong: 0 },
    axis: ['26 Jul', 'today'], axisNote: 'upper band over 0.60',
  },
];

/** Day 9 of use — what the Self-model looks like before there is anything to say. */
export const thinTrajectories: Trajectory[] = [
  {
    dim: 'F1', name: 'Autopilot', meta: '9 D · DAILY · n=9', source: 'location, calendar', estimable: true,
    points: pts([.44, .39, .47, .52, .41, .38, .45, .5, .46], 0.18),
    now: 0.46, delta: '±0.18', axis: ['15 Oct', 'today'], axisNote: 'band halves ≈ n=28',
  },
  {
    dim: 'F2', name: 'Easy belief', meta: 'n=2', source: 'logged claims', estimable: false, points: [],
    dots: [{ t: 0.3, v: 0.41 }, { t: 0.8, v: 0.47 }], now: null,
    axis: ['2 claims logged', 'trend needs 8 · ≈3 weeks'],
  },
  {
    dim: 'F3', name: 'Mimicry', meta: 'n=0', source: 'adoptions × exposure', estimable: false, points: [],
    empty: 'no adoption events · nothing to estimate', now: null,
    axis: ['needs logged adoptions + social exposure'],
  },
  {
    dim: 'F4', name: 'Rigidity', meta: '0 OF 6 MO', source: 'opinion revisits', estimable: false, points: [],
    empty: 'measured in months · first point ≈ Apr 2027', now: null,
    axis: ['needs 6 monthly opinion revisits', '0 / 6'],
  },
  {
    dim: 'F5', name: 'Lost exploring', meta: 'n=1', source: 'decisions logged', estimable: false, points: [],
    dots: [{ t: 0.6, v: 0.33 }], now: null,
    axis: ['1 decision in 9 days', 'not enough to say anything'],
  },
];

export const making = {
  name: 'Strength, 06:30',
  month: 'October 2026',
  firstWeekday: 3, // 1 Oct 2026 is a Thursday; grid starts Monday
  days: 31,
  since: 4,
  today: 24,
  states: {
    4: 'rest', 5: 'full', 6: 'full', 7: 'partial', 8: 'full', 9: 'full', 10: 'partial', 11: 'rest',
    12: 'full', 13: 'full', 14: 'partial', 15: 'full', 16: 'partial', 17: 'full', 18: 'rest',
    19: 'full', 20: 'full', 21: 'partial', 22: 'full', 23: 'partial', 24: 'full',
  } as Record<number, DayState>,
};

export const breaking = { name: 'Phone before 08:00', since: 16, today: 24, lapses: [17, 19] };

export const budget = {
  today: 24,
  days: 31,
  total: 12,
  decisions: 40,
  share: 0.3,
  spentDays: [2, 3, 7, 9, 13, 16, 19, 22],
  ledger: [
    { date: '22 Oct', text: 'Lunch — Hanoi Kitchen, first visit' },
    { date: '19 Oct', text: 'Route home via the river path' },
    { date: '16 Oct', text: 'Read the opposing column first' },
    { date: '13 Oct', text: '14:10 train instead of the usual 14:40' },
  ],
};
