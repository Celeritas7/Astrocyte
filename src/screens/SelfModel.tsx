import { useState, type PointerEvent } from 'react';
import { thinTrajectories, trajectories } from '../data/mock';
import type { Trajectory } from '../types';
import { valueAt } from '../lib/chart';
import { Screen } from '../components/ui';
import { Connectome, DendriteField } from '../components/Neural';
import { DotsChart, EmptyChart, TrajectoryChart } from '../components/Trajectory';

const COLS = 'md:grid md:grid-cols-[170px_minmax(0,1fr)_250px] md:gap-7';

function Row({ t, scrub, onScrub }: { t: Trajectory; scrub: number | null; onScrub: (v: number | null) => void }) {
  const v = t.estimable && t.points.length ? (scrub == null ? t.now : valueAt(t.points, scrub)) : null;
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onScrub(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  };
  const chartCls = 'h-[50px] md:h-[72px]';
  return (
    <div className={`${COLS} md:items-center md:border-b md:border-line md:py-3`}>
      <div className="flex items-start justify-between gap-3 md:block">
        <div className="label flex flex-col gap-[5px] tracking-[.06em]">
          <span className="text-violet-ink">{t.dim} {t.name}</span>
          <span className="normal-case text-ink-3">{t.meta}</span>
          <span className="hidden normal-case tracking-normal text-ink-3 md:block">{t.source}</span>
        </div>
        <div className="label whitespace-nowrap md:hidden">
          {v != null ? (
            <>
              <span className="text-sm text-ink-1">{v.toFixed(2)}</span>
              {t.delta && <span className={t.warn ? 'text-amber' : 'text-ink-2'}> {t.delta}{t.deltaWindow ? ` ${t.deltaWindow}` : ''}</span>}
            </>
          ) : <span className="text-ink-3">No estimate</span>}
        </div>
      </div>

      <div className={`mt-2 md:mt-0 ${t.estimable ? 'cursor-crosshair touch-none' : ''}`}
        onPointerMove={t.estimable ? move : undefined} onPointerDown={t.estimable ? move : undefined}
        onPointerLeave={t.estimable ? () => onScrub(null) : undefined}>
        {t.estimable ? <TrajectoryChart t={t} scrub={scrub} className={chartCls} />
          : t.dots ? <DotsChart t={t} className={chartCls} />
          : <EmptyChart text={t.empty} className={chartCls} />}
        <div className="mt-1.5 flex justify-between gap-2 font-mono text-[10px] leading-none text-ink-3">
          <span>{t.axis[0]}</span>
          {t.axisNote && <span className={t.markIndex != null ? 'text-amber' : ''}>{t.axisNote}</span>}
          {t.axis.length > 1 && <span>{t.axis[t.axis.length - 1]}</span>}
        </div>
      </div>

      <div className="hidden grid-cols-4 font-mono text-xs leading-[1.4] text-ink-2 md:grid">
        <span className="text-base text-ink-1">{v != null ? v.toFixed(2) : '—'}</span>
        <span className={t.warn ? 'text-amber' : ''}>{t.delta ?? '—'}{t.deltaWindow && <><br /><span className="text-[10px] text-ink-3">{t.deltaWindow.replace(/^\/ /, '')}</span></>}</span>
        <span>{t.band ?? '—'}</span>
        <span>{t.flags ? <>{t.flags.raised} · <span className="text-violet-ink">{t.flags.right}</span>/<span className="text-amber">{t.flags.wrong}</span></> : '—'}</span>
      </div>
    </div>
  );
}

export function SelfModel({ thin }: { thin: boolean }) {
  const set = thin ? thinTrajectories : trajectories;
  const [scrub, setScrub] = useState<number | null>(null);
  const label = scrub == null
    ? (thin ? 'Day 9 of use' : 'Drag to read')
    : `F1 −${Math.round((1 - scrub) * 27)}D · F4 −${Math.round((1 - scrub) * 17)}MO`;

  return (
    <Screen wide>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="whitespace-nowrap text-[22px] font-medium leading-none md:text-2xl">Self-model</h1>
        <span className="label whitespace-nowrap text-ink-3">{label}</span>
      </div>

      <div className="mt-3 md:flex md:items-center md:gap-5">
        <div className="md:w-[300px]"><Connectome values={set.map((t) => t.now)} firing={thin ? null : 0} mode={thin ? 'thin' : 'live'} /></div>
        <p className="mt-2 font-mono text-[10px] leading-[1.4] text-ink-3 md:mt-0">
          {thin ? 'No edges yet · co-movement needs two estimable dimensions' : 'Edges = 90 d co-movement · band 80% interval · dashed = 0.60 threshold'}
        </p>
      </div>

      <div className={`label mt-5 hidden border-b border-line pb-2 text-[10px] text-ink-3 ${COLS}`}>
        <span>Dimension · window</span><span>Trajectory</span>
        <span className="grid grid-cols-4"><span>Now</span><span>Δ</span><span>Band</span><span>Flags</span></span>
      </div>

      <div className="mt-[18px] flex flex-col gap-3.5 md:mt-0 md:gap-0">
        {set.map((t) => <Row key={t.dim} t={t} scrub={t.estimable ? scrub : null} onScrub={setScrub} />)}
      </div>

      {!thin && (
        <p className="mt-4 hidden font-mono text-[11px] text-ink-3 md:block">
          Timescales are not aligned on purpose: F1 moves in days, F4 in months. Aligning them would flatten one or the other.
        </p>
      )}
      <DendriteField className="-mx-5 min-h-6 md:hidden" />
    </Screen>
  );
}
