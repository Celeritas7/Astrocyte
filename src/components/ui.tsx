import type { ReactNode } from 'react';
import type { Outcome, TrackRecord } from '../types';
import { THRESHOLD } from '../lib/chart';

export function Screen({ children, wide = false, className = '' }: { children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <div className={`mx-auto flex w-full flex-1 flex-col px-5 ${wide ? 'max-w-[480px] md:max-w-[1180px] md:px-9' : 'max-w-[480px]'} ${className}`}>
      {children}
    </div>
  );
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2 font-mono text-[11px] font-medium leading-none tracking-[.1em] text-ink-3">
      <svg width="24" height="14" viewBox="0 0 24 14" className="overflow-visible" aria-hidden>
        <g stroke="var(--color-ink-2)" strokeWidth={1.2}>
          <line x1="1" y1="2" x2="6" y2="7" />
          <line x1="1" y1="7" x2="6" y2="7" />
          <line x1="1" y1="12" x2="6" y2="7" />
          <line x1="10" y1="7" x2="21" y2="7" />
        </g>
        <circle cx="7" cy="7" r="3" fill="var(--color-violet)" />
        <circle cx="22" cy="7" r="1.5" fill="var(--color-ink-3)" />
      </svg>
      astrocyte
    </div>
  );
}

export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h1 className="whitespace-nowrap text-[22px] font-medium leading-none">{title}</h1>
      {right ?? <Wordmark />}
    </div>
  );
}

/** The instrument's own accuracy. Shown on Today, always. */
export function RecordStrip({ r }: { r: TrackRecord }) {
  const acc = (r.right / (r.right + r.wrong)).toFixed(2);
  return (
    <div className="-mx-5 mt-4 border-y border-line px-5">
      <div className="label flex items-baseline gap-3 whitespace-nowrap py-2.5 tracking-[.04em]">
        <span className="text-ink-3">Record</span>
        <span className="text-ink-2">{r.flags} flags</span>
        <span className="text-violet-ink">{r.right} right</span>
        <span className="text-amber">{r.wrong} wrong</span>
        <span className="text-ink-3">{r.open} open</span>
        <span className="ml-auto text-ink-1" title="right ÷ (right + wrong)">{acc}</span>
      </div>
    </div>
  );
}

export function Bar({ value, muted = false }: { value: number; muted?: boolean }) {
  return (
    <div className="relative h-[3px] bg-line-2">
      <div className={`absolute inset-y-0 left-0 ${muted ? 'bg-ink-4' : 'bg-violet'}`} style={{ width: `${value * 100}%` }} />
      <div className="absolute -top-[3px] h-[9px] w-px bg-ink-3" style={{ left: `${THRESHOLD * 100}%` }} />
    </div>
  );
}

export function SegMeter({ value, muted = false }: { value: number; muted?: boolean }) {
  const on = muted ? 'var(--color-ink-4)' : 'var(--color-violet)';
  return (
    <div className="relative flex gap-[3px]">
      {Array.from({ length: 10 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value * 10 - i)) * 100;
        return <div key={i} className="h-1 flex-1" style={{ background: `linear-gradient(90deg, ${on} ${fill}%, var(--color-line-2) ${fill}%)` }} />;
      })}
      <div className="absolute -top-[3px] h-2.5 w-px bg-ink-2" style={{ left: `${THRESHOLD * 100}%` }} />
    </div>
  );
}

export function OutcomeStrip({ outcomes, current }: { outcomes: Outcome[]; current?: number }) {
  return (
    <div className="flex gap-[5px]">
      {outcomes.map((o, i) => (
        <span
          key={i}
          title={o}
          className={`h-3.5 flex-1 ${o === 'right' ? 'bg-violet' : o === 'wrong' ? 'border border-amber' : 'bg-line-2'} ${i === current ? 'outline outline-1 outline-offset-1 outline-ink-1' : ''}`}
        />
      ))}
    </div>
  );
}

export function Chip({ on, onClick, children, solid = false, disabled = false, className = '' }: {
  on: boolean; onClick: () => void; children: ReactNode; solid?: boolean; disabled?: boolean; className?: string;
}) {
  const look = on
    ? solid ? 'border-violet bg-violet font-semibold text-bg' : 'border-violet bg-violet/15 text-ink-1'
    : 'border-line-2 text-ink-2';
  return (
    <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick}
      className={`flex h-12 items-center justify-center border text-sm font-medium disabled:opacity-40 ${look} ${className}`}>
      {children}
    </button>
  );
}

export function FiringDot() {
  return <span className="soma-pulse size-[7px] flex-none rounded-full bg-violet" />;
}
