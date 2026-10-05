import { useEffect, useRef, useState } from 'react';
import { load, save } from '../lib/store';
import { Chip, Screen, ScreenHeader } from '../components/ui';
import { DendriteField } from '../components/Neural';

type Kind = 'Decision' | 'Claim accepted' | 'Adopted';
const KINDS: Kind[] = ['Decision', 'Claim accepted', 'Adopted'];

// Steps 2 and 3 adapt to the kind, so every entry is exactly three taps.
const STEP2: Record<Kind, { label: string; hint: string; options: string[] }> = {
  Decision: { label: 'Which option', hint: 'Familiar = the one you usually pick', options: ['Familiar', 'Unfamiliar', 'Neither'] },
  'Claim accepted': { label: 'From whom', hint: 'M · 3 of your last 4 accepted claims', options: ['M', 'R', 'A', 'Dr L', 'Podcast', 'Other…'] },
  Adopted: { label: 'Came from', hint: 'Who or where you saw it first', options: ['A', 'R', 'M', 'Feed', 'Podcast', 'Other…'] },
};
const STEP3: Record<Kind, { label: string; options: string[] }> = {
  Decision: { label: 'Explore budget', options: ['Spend unit', 'No', 'n/a'] },
  'Claim accepted': { label: 'Did you check it', options: ['Yes', 'No', 'Later'] },
  Adopted: { label: 'Exposure was', options: ['< 72 h ago', 'Older', 'Unsure'] },
};

interface Entry { kind: Kind; a: string; b: string; about: string; ms: number; at: string }

export function Log() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [about, setAbout] = useState('');
  const t0 = useRef<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>(() => load('astrocyte.log', []));
  useEffect(() => save('astrocyte.log', entries), [entries]);

  const start = () => { if (t0.current == null) t0.current = performance.now(); };
  const taps = (kind ? 1 : 0) + (a ? 1 : 0) + (b ? 1 : 0);
  const ready = taps === 3;
  const s2 = STEP2[kind ?? 'Claim accepted'];
  const s3 = STEP3[kind ?? 'Claim accepted'];

  const pickKind = (k: Kind) => { start(); setKind(k === kind ? null : k); setA(null); setB(null); };
  const commit = () => {
    if (!kind || !a || !b) return;
    const ms = performance.now() - (t0.current ?? performance.now());
    const at = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setEntries((e) => [{ kind, a, b, about: about.trim(), ms, at }, ...e].slice(0, 500));
    setKind(null); setA(null); setB(null); setAbout(''); t0.current = null;
  };

  const sorted = entries.map((e) => e.ms).sort((x, y) => x - y);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] / 1000 : null;
  const last = entries[0];

  return (
    <Screen>
      <ScreenHeader title="Log" right={<span className="label text-ink-3">Median entry {median != null ? `${median.toFixed(1)} s` : '—'}</span>} />

      <div className="pt-[22px]">
        <div className="label flex justify-between text-ink-3"><span>What</span><span>Tap {Math.max(1, Math.min(3, taps + 1))} of 3</span></div>
        <div className="mt-2.5 flex gap-2">
          {KINDS.map((k) => (
            <Chip key={k} on={kind === k} solid onClick={() => pickKind(k)} className={`text-[13px] ${k === 'Claim accepted' ? 'flex-[1.3]' : 'flex-1'}`}>{k}</Chip>
          ))}
        </div>
      </div>

      <div className={`pt-[26px] ${kind ? '' : 'opacity-40'}`}>
        <div className="label flex justify-between text-ink-3"><span>{s2.label}</span><span>Tap 2 · recent first</span></div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {s2.options.map((o) => <Chip key={o} on={a === o} disabled={!kind} onClick={() => { start(); setA(a === o ? null : o); }}>{o}</Chip>)}
        </div>
        <p className="mt-2 font-mono text-[11px] leading-[1.4] text-ink-3">{s2.hint}</p>
      </div>

      <div className={`pt-[26px] ${kind ? '' : 'opacity-40'}`}>
        <div className="label flex justify-between text-ink-3"><span>{s3.label}</span><span>Tap 3</span></div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {s3.options.map((o) => <Chip key={o} on={b === o} disabled={!kind} onClick={() => { start(); setB(b === o ? null : o); }}>{o}</Chip>)}
        </div>
      </div>

      <div className="pt-[26px]">
        <div className="label flex justify-between text-ink-3"><span>About</span><span>Optional · skips on save</span></div>
        <input value={about} onChange={(e) => setAbout(e.target.value)} placeholder="three words, no more" maxLength={40}
          className="mt-1.5 h-11 w-full border-b border-line-2 bg-transparent px-3.5 text-sm text-ink-1 placeholder:text-ink-4 focus:border-violet focus:outline-none" />
      </div>

      <div className="pt-7">
        <button type="button" disabled={!ready} onClick={commit}
          className={`relative flex h-14 w-full items-center justify-between overflow-hidden px-[18px] text-[15px] font-semibold ${ready ? 'bg-violet text-bg' : 'bg-line text-ink-3'}`}>
          {ready && <span className="signal save-sweep" />}
          <span>Save</span>
          <span className="font-mono text-xs font-medium tracking-[.06em]">{ready ? '3 TAPS' : `${taps} OF 3`}</span>
        </button>
        <p className="mt-3 flex gap-2 font-mono text-[11px] leading-[1.4] text-ink-3">
          {last ? (
            <>
              <span>last · {last.at} · {last.kind} · {last.a} · {last.b} · {(last.ms / 1000).toFixed(1)} s</span>
              <button type="button" onClick={() => setEntries((e) => e.slice(1))} className="text-ink-2 underline underline-offset-2">undo</button>
            </>
          ) : <span>No entries yet. Three taps, under ten seconds.</span>}
        </p>
      </div>

      <DendriteField className="-mx-5 min-h-6" />
    </Screen>
  );
}
