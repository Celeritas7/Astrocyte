import { useState } from 'react';
import { flags, todays, DIM_NAMES } from '../data/mock';
import type { Challenge, Scenario, TodayData } from '../types';
import { Bar, FiringDot, RecordStrip, Screen, ScreenHeader } from '../components/ui';
import { Connectome, DendriteField, NeuronMarker, SpikeRaster } from '../components/Neural';
import { THRESHOLD } from '../lib/chart';

function Novelty({ d, showHistory }: { d: TodayData; showHistory: boolean }) {
  return (
    <div className="pt-4">
      <div className="label flex justify-between gap-3 text-ink-3"><span>Novelty · today</span><span>{d.sources}</span></div>
      <div className="mt-3.5 flex items-baseline gap-3.5">
        <span className="font-mono text-[44px] leading-none tracking-[-.02em]">{d.novelty.toFixed(2)}</span>
        <span className="font-mono text-xs leading-[1.3] text-ink-2">14-day median {d.median.toFixed(2)}<br />{d.note}</span>
      </div>
      <div className="relative mt-[18px] h-3.5">
        <div className="absolute inset-x-0 top-1.5 h-px bg-line-2" />
        <div className="absolute top-0.5 h-[9px] w-px bg-ink-4" style={{ left: `${d.median * 100}%` }} />
        <NeuronMarker at={d.novelty} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] leading-none text-ink-3"><span>repetition</span><span>novel</span></div>
      {showHistory && d.history && (
        <>
          <div className="mt-3.5 flex h-[30px] items-end gap-1">
            {d.history.map((v, i) => (
              <div key={i} className={`flex-1 ${i === d.history!.length - 1 ? 'bg-violet' : 'bg-line-2'}`} style={{ height: `${v * 100}%` }} />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] leading-none text-ink-3"><span>−14 d</span><span>today</span></div>
        </>
      )}
    </div>
  );
}

export function Today({ scenario, challenges, onOpenFlag, onChallenge }: {
  scenario: Scenario;
  challenges: Record<number, Challenge>;
  onOpenFlag: (id: number) => void;
  onChallenge: (id: number) => void;
}) {
  const d = todays[scenario];
  const flag = d.flagId != null ? flags[d.flagId] : null;
  const firing = flag ? Number(flag.dim.slice(1)) - 1 : null;
  const [answer, setAnswer] = useState<string | null>(null);
  const challenged = flag ? !!challenges[flag.id] : false;

  return (
    <Screen>
      <ScreenHeader title={d.date} />
      <RecordStrip r={d.record} />

      {scenario !== 'quiet' && (
        <div className="pt-3">
          <div className="label mb-[7px] flex justify-between text-[10px] text-ink-3">
            <span>Activity · F1–F5</span><span>{flag ? 'Density = pattern strength' : 'No node above 0.60'}</span>
          </div>
          <SpikeRaster strengths={d.strengths} firing={firing} />
        </div>
      )}

      <Novelty d={d} showHistory={scenario === 'flag'} />

      {/* Statement */}
      {flag && (
        <div className="relative mt-[18px] overflow-hidden border border-line-2 bg-panel p-4 pb-3.5">
          <span className="signal edge-sweep" />
          <div className="label flex justify-between">
            <span className="flex items-center gap-2 text-violet-ink"><FiringDot />{flag.dim} {flag.dimName}</span>
            <span className="text-ink-2">Confidence {flag.confidence.toFixed(2)}</span>
          </div>
          <div className="mt-2.5"><Bar value={flag.confidence} /></div>
          <p className="mt-3.5 text-[17px] font-medium leading-[1.35] text-pretty">{flag.claim}</p>
          <p className="mt-2 text-[13px] leading-[1.45] text-ink-2">{flag.summary}</p>
          <div className="mt-4 flex gap-2.5">
            <button type="button" onClick={() => onOpenFlag(flag.id)} className="h-11 flex-1 border border-line-2 text-[13px] font-medium">Open flag</button>
            <button type="button" disabled={challenged} onClick={() => onChallenge(flag.id)}
              className={`h-11 flex-1 border text-[13px] font-medium ${challenged ? 'border-amber text-amber' : 'border-violet text-violet-ink'}`}>
              {challenged ? 'Challenged · pending' : 'Challenge this'}
            </button>
          </div>
        </div>
      )}

      {/* Question */}
      {d.question && (
        <div className="pt-[30px]">
          <div className="label flex justify-between">
            <span className="flex items-center gap-2 text-violet-ink"><span className="size-[7px] rounded-full border border-ink-3" />{d.question.dim} · A question, not a flag</span>
            <span className="text-ink-3">No confidence</span>
          </div>
          <p className="mt-3.5 text-xl font-medium leading-[1.3] text-pretty">{d.question.text}</p>
          <div className="mt-[22px] flex flex-col gap-2">
            {d.question.options.map((o) => (
              <button key={o.id} type="button" aria-pressed={answer === o.id} onClick={() => setAnswer(o.id)}
                className={`flex h-12 items-center border px-4 text-left text-sm font-medium ${answer === o.id ? 'border-violet bg-violet/15 text-ink-1' : `border-line-2 ${o.muted ? 'text-ink-2' : 'text-ink-1'}`}`}>
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-[18px] text-[13px] leading-[1.5] text-ink-3 text-pretty">
            {answer ? d.question.options.find((o) => o.id === answer)!.result : d.question.why}
          </p>
        </div>
      )}

      {/* Quiet */}
      {scenario === 'quiet' && (
        <div className="pt-10">
          <div className="label flex justify-between text-ink-3"><span>Flags</span><span>0 of 5 above {THRESHOLD.toFixed(2)}</span></div>
          <div className="mt-[18px] flex flex-col gap-3.5 text-[13px]">
            {d.strengths.map((s, i) => (
              <div key={i} className="grid grid-cols-[118px_1fr_36px] items-center gap-3">
                <span className="text-ink-2">F{i + 1} {DIM_NAMES[i]}</span>
                <Bar value={s} muted />
                <span className="text-right font-mono text-xs text-ink-2">{s.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-[26px]">
            <div className="label flex justify-between text-ink-3"><span>Network</span><span>At rest · no node firing</span></div>
            <div className="mt-3"><Connectome values={d.strengths} firing={null} mode="rest" /></div>
          </div>
          <p className="mt-6 text-[13px] leading-[1.5] text-ink-3 text-pretty">{d.quietNote}</p>
        </div>
      )}

      <DendriteField live={scenario !== 'quiet'} className="-mx-5 min-h-6" />
    </Screen>
  );
}
