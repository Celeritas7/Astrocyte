import { paths, THRESHOLD } from '../lib/chart';
import type { Trajectory } from '../types';

const PAD = 4;
const yPct = (v: number) => PAD + (1 - v) * (100 - 2 * PAD);

export function TrajectoryChart({ t, scrub, className = '' }: { t: Trajectory; scrub: number | null; className?: string }) {
  const p = paths(t.points, PAD);
  const last = p.at(t.points.length - 1);
  const mark = t.markIndex != null ? p.at(t.markIndex) : null;
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <line x1="0" x2="100" y1={p.thr} y2={p.thr} stroke="var(--color-ink-4)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        <path d={p.band} fill="var(--color-violet)" fillOpacity={0.14} />
        <path d={p.line} fill="none" stroke="var(--color-violet)" strokeWidth={1.5} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {scrub != null && <line x1={scrub * 100} x2={scrub * 100} y1="0" y2="100" stroke="var(--color-ink-2)" vectorEffect="non-scaling-stroke" />}
      </svg>
      {mark && (
        <span className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-amber bg-bg"
          style={{ left: `${mark.x}%`, top: `${mark.y}%` }} />
      )}
      <span className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-1 text-ink-1"
        style={{ left: `${last.x}%`, top: `${last.y}%` }}>
        <span className="signal ring-html" />
      </span>
    </div>
  );
}

/** Thin data: raw samples only, no line, no band. */
export function DotsChart({ t, className = '' }: { t: Trajectory; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-x-0 border-t border-dashed border-ink-4" style={{ top: `${yPct(THRESHOLD)}%` }} />
      {(t.dots ?? []).map((d, i) => (
        <span key={i} className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet"
          style={{ left: `${d.t * 100}%`, top: `${yPct(d.v)}%` }} />
      ))}
    </div>
  );
}

export function EmptyChart({ text, className = '' }: { text?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center border-t border-b border-dashed border-t-line-2 border-b-line font-mono text-[11px] text-ink-4 ${className}`}>
      {text}
    </div>
  );
}
