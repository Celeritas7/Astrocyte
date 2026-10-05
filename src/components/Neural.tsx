import { useMemo } from 'react';
import { rng } from '../lib/chart';

/* ---------- Dendrite field: fills leftover space at the foot of a screen; never sits under text ---------- */
const field = (() => {
  const r = rng(7);
  const branches: string[] = [];
  const tips: [number, number][] = [];
  let all = '';
  for (let i = 0; i < 10; i++) {
    let x = 356;
    let y = 6 + r() * 128;
    let d = `M${x},${y.toFixed(1)}`;
    let main = d;
    const len = 5 + Math.floor(r() * 6);
    let dy = (r() - 0.5) * 8;
    for (let j = 0; j < len; j++) {
      x -= 9 + r() * 13; y += dy; dy += (r() - 0.5) * 9;
      const seg = ` L${x.toFixed(1)},${y.toFixed(1)}`;
      d += seg; main += seg;
      if (r() < 0.4) {
        const bx = x - (5 + r() * 10);
        const by = y + (r() - 0.5) * 26;
        d += ` L${bx.toFixed(1)},${by.toFixed(1)} M${x.toFixed(1)},${y.toFixed(1)}`;
        if (r() < 0.5) tips.push([bx, by]);
      }
    }
    tips.push([x, y]);
    all += d + ' ';
    branches.push(main);
  }
  return { all, branches, tips };
})();

export function DendriteField({ live = true, className = '' }: { live?: boolean; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none relative flex-1 overflow-hidden ${className}`}>
      <svg viewBox="0 0 356 140" className="absolute bottom-1.5 right-0 h-[140px] w-[356px] overflow-visible">
        <path d={field.all} fill="none" stroke="var(--color-dendrite)" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
        {field.tips.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.6} fill={live ? 'var(--color-violet)' : 'var(--color-ink-3)'} fillOpacity={live ? 0.55 : 0.5} />
        ))}
        {live && field.branches.map((b, i) => (
          <path key={i} d={b} pathLength={100} className="signal flow"
            style={{ animationDuration: `${(2.6 + ((i * 37) % 17) / 10).toFixed(1)}s`, animationDelay: `${-(i * 0.73).toFixed(2)}s` }} />
        ))}
      </svg>
    </div>
  );
}

/* ---------- Connectome: five neurons, edges = 90-day co-movement ---------- */
const XS = [10, 92.5, 175, 257.5, 340];
const CY = 20;
const EDGES: [number, number, number][] = [[0, 4, 0.62], [1, 2, 0.41], [0, 3, 0.28], [3, 4, 0.35], [1, 3, 0.18], [2, 4, 0.22]];
const arc = (a: number, b: number) => `M${XS[a]},${CY} Q${(XS[a] + XS[b]) / 2},${CY + 8 + (b - a) * 8} ${XS[b]},${CY}`;
const dend = (x: number) => `M${x},${CY} l-7,-11 l-5,-4 M${x},${CY} l1,-14 l-4,-5 M${x},${CY} l1,-14 l4,-5 M${x},${CY} l8,-10 l5,-3`;

export function Connectome({ values, firing, mode = 'live' }: { values: (number | null)[]; firing: number | null; mode?: 'live' | 'rest' | 'thin' }) {
  return (
    <div>
      <svg viewBox="0 0 350 64" className="block w-full overflow-visible" aria-hidden>
        {mode !== 'thin' && EDGES.map(([a, b, w], i) => (
          <path key={i} d={arc(a, b)} fill="none"
            stroke={w >= 0.4 ? (mode === 'live' ? 'var(--color-violet)' : 'var(--color-ink-4)') : 'var(--color-line-2)'}
            strokeWidth={w >= 0.4 ? 1.5 : 1} strokeOpacity={w >= 0.4 && mode === 'live' ? 0.7 : 1} />
        ))}
        {mode === 'live' && EDGES.map(([a, b, w], i) => (
          <path key={`p${i}`} d={arc(a, b)} pathLength={100} className="signal flow flow-edge"
            style={{ opacity: 0.3 + w, animationDuration: `${(3.6 - w * 3).toFixed(2)}s`, animationDelay: `${-i * 0.6}s` }} />
        ))}
        {XS.map((x, i) => {
          const v = values[i];
          const fire = mode === 'live' && firing === i;
          const known = v != null;
          const near = mode === 'live' && known && v >= 0.55;
          return (
            <g key={i}>
              <path d={dend(x)} fill="none" strokeWidth={1.1} strokeLinecap="round"
                stroke={fire ? 'var(--color-violet)' : known ? 'var(--color-ink-3)' : 'var(--color-ink-4)'} />
              {known ? (
                <circle cx={x} cy={CY} r={fire ? 5 : 4} fill={fire ? 'var(--color-violet)' : 'var(--color-bg)'}
                  stroke={fire ? 'none' : near ? 'var(--color-violet)' : 'var(--color-ink-3)'} />
              ) : (
                <circle cx={x} cy={CY} r={4} fill="none" stroke="var(--color-ink-4)" strokeDasharray="2 2" className="spin-dash" />
              )}
              {fire && <circle cx={x} cy={CY} r={5} className="signal ring-svg" stroke="var(--color-violet)" />}
            </g>
          );
        })}
      </svg>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] leading-none">
        {values.map((v, i) => (
          <span key={i} className={v == null ? 'text-ink-4' : 'text-ink-2'}>F{i + 1} {v == null ? '—' : v.toFixed(2).replace(/^0/, '')}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Spike raster: density per row = current pattern strength ---------- */
export function SpikeRaster({ strengths, firing }: { strengths: number[]; firing: number | null }) {
  const rows = useMemo(() => {
    const r = rng(11);
    return strengths.map((s) => Array.from({ length: Math.round(s * s * 70) }, () => r() * 350));
  }, [strengths]);
  return (
    <svg viewBox="0 0 350 24" preserveAspectRatio="none" className="block h-6 w-full overflow-hidden" aria-hidden>
      <g className="raster">
        {rows.map((row, ri) => row.flatMap((x, j) => [0, 350].map((off) => (
          <rect key={`${ri}-${j}-${off}`} x={x + off} y={ri * 5} width={1} height={3.5} fill={ri === firing ? 'var(--color-violet)' : '#4A4A5A'} />
        ))))}
      </g>
    </svg>
  );
}

/* ---------- A neuron sitting on a linear track (novelty reading) ---------- */
export function NeuronMarker({ at }: { at: number }) {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" className="absolute -top-[9px] overflow-visible" style={{ left: `calc(${at * 100}% - 10px)` }} aria-hidden>
      <path d="M10,16 l-6,-8 l-3,-3 M10,16 l0,-12 M10,16 l6,-8 l3,-4 M4,8 l-1,-6" fill="none" stroke="var(--color-violet)" strokeWidth={1.2} strokeLinecap="round" />
      <circle cx="10" cy="16" r="4" fill="var(--color-violet)" />
      <circle cx="10" cy="16" r="4" className="signal ring-svg" stroke="var(--color-violet)" />
    </svg>
  );
}
