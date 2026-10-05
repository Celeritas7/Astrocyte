import { Fragment, useState } from 'react';
import type { Challenge, Evidence, Flag } from '../types';
import { OutcomeStrip, Screen, SegMeter } from '../components/ui';
import { DendriteField } from '../components/Neural';

function RouteTrace({ e, live }: { e: Extract<Evidence, { kind: 'route' }>; live: boolean }) {
  return (
    <div className="mt-3 flex flex-col gap-[9px] font-mono text-xs leading-none">
      {e.days.map((d, i) =>
        d.time ? (
          <div key={d.day} className="grid grid-cols-[34px_44px_1fr] items-center gap-3">
            <span className="uppercase text-ink-3">{d.day}</span>
            <span>{d.time}</span>
            <div className="relative flex items-center">
              {e.stops.map((s, si) => (
                <Fragment key={s}>
                  {si > 0 && (d.gapAfter === si - 1
                    ? <span className="h-0 flex-1 border-t border-dashed border-ink-4" />
                    : <span className="h-px flex-1 bg-ink-4" />)}
                  <span className="size-[7px] flex-none rounded-full bg-violet" />
                </Fragment>
              ))}
              {live && <span className="signal travel" style={{ animationDelay: `${i * 0.8}s` }} />}
            </div>
          </div>
        ) : (
          <div key={d.day} className="grid grid-cols-[34px_44px_1fr] items-center gap-3">
            <span className="uppercase text-ink-3">{d.day}</span>
            <span className="text-ink-3">—</span>
            <div className="flex justify-between text-[10px] text-ink-3">{e.stops.map((s) => <span key={s}>{s}</span>)}</div>
          </div>
        ),
      )}
    </div>
  );
}

function Timeline({ e }: { e: Extract<Evidence, { kind: 'timeline' }> }) {
  return (
    <div className="mt-3 flex flex-col gap-2.5">
      {e.events.map((ev) => (
        <div key={ev.when} className="grid grid-cols-[78px_1fr] gap-3">
          <span className="font-mono text-xs leading-[1.4] text-ink-3">{ev.when.toUpperCase()}</span>
          <span className="text-[13px] leading-[1.4] text-ink-2">{ev.text}</span>
        </div>
      ))}
    </div>
  );
}

export function FlagDetail({ flag, challenge, onBack, onChallenge }: {
  flag: Flag; challenge?: Challenge; onBack: () => void; onChallenge: () => void;
}) {
  const [acks, setAcks] = useState<Record<number, string>>(() => load('astrocyte.acks', {}));
  useEffect(() => save('astrocyte.acks', acks), [acks]);
  const ack = !!acks[flag.id];
  const setAck = () => setAcks((p) => ({ ...p, [flag.id]: new Date().toISOString() }));
  const c = challenge ?? flag.challenge;
  const settled = flag.status !== 'open';
  const contested = !settled && !!challenge;
  const e = flag.evidence;
  const h = flag.history;

  return (
    <Screen className="pb-8">
      <div className="label flex items-center justify-between">
        <button type="button" onClick={onBack} className="-m-3 p-3 text-ink-2">‹ Back</button>
        <span className={settled || contested ? 'text-amber' : 'text-ink-3'}>{contested ? `#${flag.id} · Contested` : flag.statusLabel}</span>
      </div>

      <div className="label mt-6 flex items-center gap-2 text-violet-ink">
        {settled ? <span className="size-[7px] rounded-full border border-amber" /> : <span className="soma-pulse size-[7px] rounded-full bg-violet" />}
        {flag.dim} {flag.dimName}
      </div>
      <h1 className={`mt-2.5 text-2xl font-medium leading-[1.25] tracking-[-.01em] text-pretty ${settled ? 'text-ink-2' : ''}`}>{flag.claim}</h1>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-2.5">
          <span className={`font-mono text-[40px] leading-none tracking-[-.02em] ${settled ? 'text-ink-2' : ''}`}>{flag.confidence.toFixed(2)}</span>
          <span className="label text-ink-3">{flag.confidenceLabel}</span>
        </div>
        <div className="text-right font-mono text-[11px] leading-[1.5] text-ink-2">threshold 0.60<br />{flag.sampleNote}</div>
      </div>
      <div className="mt-2.5"><SegMeter value={flag.confidence} muted={settled} /></div>
      {flag.caveat && <p className="mt-2.5 text-xs leading-[1.5] text-ink-3 text-pretty">{flag.caveat}</p>}

      <div className="label mt-6 flex justify-between gap-3 text-ink-3"><span>{e.title}</span><span>{e.range}</span></div>
      {e.kind === 'route' ? <RouteTrace e={e} live={!settled} /> : <Timeline e={e} />}

      {flag.asks && !settled && (
        <>
          <div className="label mt-6 text-ink-3">What closes it</div>
          <p className="mt-2.5 text-sm leading-[1.45] text-pretty">{flag.asks}</p>
        </>
      )}

      {c && (
        <>
          <div className="label mt-6 text-amber">Your challenge · {c.at}</div>
          <div className="mt-2.5 border border-amber px-3.5 py-3 text-sm leading-[1.45] text-pretty">
            {c.ground && <div className="label mb-2 text-[10px] text-ink-3">{c.ground}</div>}
            {c.text ? `“${c.text}”` : <span className="text-ink-2">No note.</span>}
          </div>
        </>
      )}

      {flag.verdict && (
        <>
          <div className="label mt-5 text-ink-3">Verdict</div>
          <p className="mt-2 text-[13px] leading-[1.5] text-ink-2 text-pretty">{flag.verdict}</p>
        </>
      )}
      {contested && <p className="mt-4 text-[13px] leading-[1.5] text-ink-3">Verdict pending · due within 24 h · kept either way.</p>}

      {!settled && !contested && (
        <div className="mt-[22px] flex gap-2.5">
          <button type="button" onClick={onChallenge} className="h-12 flex-1 bg-violet text-sm font-semibold text-bg">Challenge this</button>
          <button type="button" disabled={ack} onClick={setAck}
            className="h-12 flex-1 border border-line-2 text-sm font-medium text-ink-2 disabled:text-ink-3">{ack ? 'Acknowledged · still open' : 'Acknowledge'}</button>
        </div>
      )}

      <DendriteField live={!settled} className="-mx-5 min-h-4" />

      <div className="border-t border-line pt-3.5">
        <div className="label flex justify-between gap-3 text-ink-3">
          <span>{h.title}</span>
          <span><span className="text-violet-ink">{h.tally.right} right</span> · <span className="text-amber">{h.tally.wrong} wrong</span> · {h.tally.open} open</span>
        </div>
        <div className="mt-2.5"><OutcomeStrip outcomes={h.outcomes} current={h.current} /></div>
        <p className="mt-2.5 font-mono text-[11px] leading-[1.4] text-ink-3">{h.note}</p>
      </div>
    </Screen>
  );
}
