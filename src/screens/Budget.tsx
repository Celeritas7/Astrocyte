import { useEffect, useState } from 'react';
import { budget as B } from '../data/mock';
import { load, save } from '../lib/store';
import { Screen, ScreenHeader } from '../components/ui';
import { DendriteField } from '../components/Neural';

const W = 350;
const H = 96;

export function Budget() {
  const [extra, setExtra] = useState<{ at: string }[]>(() => load('astrocyte.budget', []));
  useEffect(() => save('astrocyte.budget', extra), [extra]);

  const spentDays = [...B.spentDays, ...extra.map(() => B.today)].slice(0, B.total);
  const spent = spentDays.length;
  const left = B.total - spent;
  const pace = B.total * (1 - B.today / B.days);
  const diff = left - pace;
  const note = left === 0
    ? `Budget exhausted on day ${B.today}. ${B.days - B.today} days with no reserved unfamiliar option.`
    : diff > 0.3 ? `${diff.toFixed(1)} units above pace. The month is running out faster than you are spending it.`
    : diff < -0.3 ? `${Math.abs(diff).toFixed(1)} units below pace. Spending ahead of the month.`
    : 'On pace.';

  const X = (d: number) => (d / B.days) * W;
  const Y = (r: number) => 4 + (1 - r / B.total) * (H - 8);
  let r = B.total;
  let line = `M0,${Y(r)}`;
  for (const s of spentDays) { line += ` L${X(s)},${Y(r)}`; r--; line += ` L${X(s)},${Y(r)}`; }
  line += ` L${X(B.today)},${Y(r)}`;
  const paceLine = `M0,${Y(B.total)} L${W},${Y(0)}`;

  const ledger = [
    ...extra.map((e) => ({ date: `${B.today} Oct`, text: `Unfamiliar option · logged ${e.at}` })),
    ...B.ledger,
  ].slice(0, 3);

  const spend = () => {
    if (left <= 0) return;
    setExtra((x) => [...x, { at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }]);
  };

  return (
    <Screen>
      <ScreenHeader title="Explore budget" right={<span className="label whitespace-nowrap text-ink-3">Oct · day {B.today} of {B.days}</span>} />

      <div className="pt-[26px]">
        <div className="flex items-baseline gap-3.5">
          <span className="font-mono text-[64px] leading-none tracking-[-.03em]">{left}</span>
          <span className="font-mono text-[13px] leading-[1.4] text-ink-2">left of {B.total}<br />{B.days - B.today} days remain</span>
        </div>
        <p className="mt-3.5 text-[13px] leading-[1.5] text-ink-2 text-pretty">
          {Math.round(B.share * 100)}% of logged decisions reserved for the unfamiliar option. {B.decisions} decisions this month → {B.total} units. {spent} spent.
        </p>
        <div className="mt-[18px] flex gap-1">
          {Array.from({ length: B.total }, (_, i) => (
            <span key={i} className={`relative h-[18px] flex-1 border ${i < spent ? 'border-ink-4' : 'border-violet bg-violet'}`}>
              {i === B.total - 1 && i >= spent && <span className="signal lapse" />}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] leading-none text-ink-3"><span>{spent} spent</span><span>{left} unspent</span></div>
        <button type="button" disabled={left <= 0} onClick={spend}
          className="mt-3.5 flex h-11 w-full items-center justify-between border border-line-2 px-3.5 text-[13px] font-medium text-ink-1 disabled:opacity-40">
          <span>Spent one — took the unfamiliar option</span><span className="font-mono text-xs text-violet-ink">−1</span>
        </button>
      </div>

      <div className="pt-[22px]">
        <div className="label flex justify-between text-ink-3"><span>Burn-down</span><span>Dashed = even pace</span></div>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 block w-full overflow-visible" aria-label={`${left} units left; even pace says ${pace.toFixed(1)}`}>
          <path d={paceLine} fill="none" stroke="var(--color-ink-4)" strokeDasharray="3 4" />
          <path d={paceLine} pathLength={100} className="signal flow flow-pace" />
          <line x1={X(B.today)} x2={X(B.today)} y1="0" y2={H} stroke="var(--color-line-2)" />
          <path d={line} fill="none" stroke="var(--color-violet)" strokeWidth={1.5} />
          <circle cx={X(B.today)} cy={Y(left)} r={3} fill="var(--color-ink-1)" />
          <circle cx={X(B.today)} cy={Y(left)} r={3} className="signal ring-svg" stroke="var(--color-ink-1)" />
        </svg>
        <div className="mt-1.5 flex justify-between gap-2 font-mono text-[10px] leading-none text-ink-3">
          <span>1 Oct · {B.total}</span><span>today · {left} left, pace says {pace.toFixed(1)}</span><span>31 Oct · 0</span>
        </div>
        <p className="mt-2.5 text-xs leading-[1.5] text-ink-3 text-pretty">{note}</p>
      </div>

      <div className="pt-5">
        <div className="label flex justify-between text-ink-3"><span>Spent on</span><span>{spent} · last 3</span></div>
        <div className="mt-1.5 flex flex-col text-[13px] leading-[1.3]">
          {ledger.map((l, i) => (
            <div key={i} className="grid grid-cols-[52px_1fr] gap-3 border-b border-line py-2.5">
              <span className="font-mono text-[11px] leading-[1.6] text-ink-3">{l.date.toUpperCase()}</span><span>{l.text}</span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 font-mono text-[11px] leading-[1.4] text-ink-3">Unspent units lapse 31 Oct 23:59. They do not roll over.</p>
      </div>

      <DendriteField className="-mx-5 min-h-6" />
    </Screen>
  );
}
