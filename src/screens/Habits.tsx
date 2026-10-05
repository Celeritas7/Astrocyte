import { useEffect, useState } from 'react';
import { breaking, making } from '../data/mock';
import type { DayState } from '../types';
import { load, save } from '../lib/store';
import { Screen, ScreenHeader } from '../components/ui';
import { DendriteField } from '../components/Neural';

const CYCLE: DayState[] = ['full', 'partial', 'rest', 'missed'];

export function Habits() {
  const m = making;
  const [over, setOver] = useState<Record<number, DayState>>(() => load('astrocyte.calendar', {}));
  useEffect(() => save('astrocyte.calendar', over), [over]);

  const stateOf = (n: number): DayState | undefined => (n >= m.since && n <= m.today ? over[n] ?? m.states[n] : undefined);
  const counts: Record<DayState, number> = { full: 0, partial: 0, rest: 0, missed: 0 };
  for (let n = m.since; n <= m.today; n++) { const s = stateOf(n); if (s) counts[s]++; }
  const run = m.today - m.since + 1;
  const tap = (n: number) => {
    const s = stateOf(n);
    if (s) setOver((o) => ({ ...o, [n]: CYCLE[(CYCLE.indexOf(s) + 1) % CYCLE.length] }));
  };

  const cells: (number | null)[] = [...Array<null>(m.firstWeekday).fill(null), ...Array.from({ length: m.days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const strip = Array.from({ length: 14 }, (_, i) => breaking.today - 13 + i);
  const clean = breaking.today - breaking.since + 1 - breaking.lapses.length;

  return (
    <Screen>
      <ScreenHeader title="Habits" right={<span className="label text-ink-3">2 active</span>} />
      <p className="mt-2.5 text-xs leading-[1.5] text-ink-3 text-pretty">The trigger is daily. The activity isn't. A rest day is a check-in, not a gap.</p>

      <section className="mt-[18px] border border-line-2 bg-panel px-4 py-3.5">
        <div className="label flex justify-between">
          <span className="text-violet-ink">Making ↑</span>
          <span className="text-ink-2">Day {run} · {counts.missed === 0 ? 'unbroken' : `${counts.missed} gap${counts.missed > 1 ? 's' : ''}`}</span>
        </div>
        <h2 className="mt-2.5 text-lg font-medium leading-tight">{m.name}</h2>
        <p className="mt-1.5 font-mono text-xs leading-[1.4] text-ink-2">
          {counts.full} full · {counts.partial} partial · {counts.rest} rest · {counts.missed} missed · since {m.since} Oct
        </p>
        <div className="label mt-[18px] flex justify-between text-[10px] text-ink-3"><span>{m.month}</span><span>Tap a day to correct it</span></div>
        <div className="mt-2.5 grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-ink-4">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1">
          {cells.map((n, i) => {
            if (n == null) return <span key={i} />;
            const s = stateOf(n);
            const look = s === 'full' ? 'border-violet bg-violet text-bg'
              : s === 'partial' ? 'partial border-violet text-ink-1'
              : s === 'rest' ? 'border-ink-4 bg-[#15151C] text-ink-2'
              : s === 'missed' ? 'border-ink-4 text-amber'
              : n < m.since ? 'border-transparent text-ink-4' : 'border-line text-ink-4';
            const mark = s === 'partial' ? '½' : s === 'rest' ? 'rest' : s === 'missed' ? '×' : '';
            return (
              <button key={i} type="button" disabled={!s} onClick={() => tap(n)} aria-label={`${n} October: ${s ?? 'no data'}`}
                className={`relative flex h-10 flex-col justify-between border px-1.5 py-[5px] text-left font-mono text-[11px] font-medium leading-none ${look}`}>
                {n === m.today && <span className="signal today-ring" />}
                <span>{n}</span>
                <span className="self-end text-[9px] tracking-[.04em]">{mark}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3.5 font-mono text-[10px] leading-none text-ink-3">
          <span className="flex items-center gap-[5px]"><span className="size-[9px] bg-violet" />full</span>
          <span className="flex items-center gap-[5px]"><span className="partial size-[9px] border border-violet" />partial</span>
          <span className="flex items-center gap-[5px]"><span className="size-[9px] border border-ink-4" />rest</span>
          <span className="flex items-center gap-[5px]"><span className="text-amber">×</span>missed</span>
          <span className="ml-auto">× is the only gap</span>
        </div>
      </section>

      <section className="mt-3 border border-line-2 bg-panel px-4 py-3.5">
        <div className="label flex justify-between">
          <span className="text-violet-ink">Breaking ↓</span>
          <span className="text-ink-2">Day {breaking.today - breaking.since + 1} · {breaking.lapses.length} lapses</span>
        </div>
        <h2 className="mt-2.5 text-lg font-medium leading-tight">{breaking.name}</h2>
        <p className="mt-1.5 font-mono text-xs leading-[1.4] text-ink-2">{clean} clean · {breaking.lapses.length} lapses · 0 unreported · since {breaking.since} Oct</p>
        <div className="mt-3.5 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-[3px]">
          {strip.map((n) => {
            const lapse = breaking.lapses.includes(n);
            const before = n < breaking.since;
            return (
              <div key={n} className={`relative flex h-[26px] items-center justify-center border font-mono text-[10px] font-medium ${
                before ? 'border-transparent text-ink-4' : lapse ? 'border-amber text-amber' : 'border-violet bg-violet text-bg'}`}>
                {n === breaking.today && <span className="signal today-ring" />}
                {lapse ? '×' : n}
              </div>
            );
          })}
        </div>
        <p className="mt-2.5 font-mono text-[11px] leading-[1.4] text-ink-3">Lapses {breaking.lapses.join(', ')}, reported same day. The run counts reports, not clean days.</p>
      </section>

      <DendriteField className="-mx-5 min-h-6" />
    </Screen>
  );
}
