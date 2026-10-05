import { useState } from 'react';
import type { Challenge, Flag } from '../types';

const GROUNDS = ['Plan predates it', 'Data gap', 'Different cause', 'Reading is wrong'];

export function ChallengeSheet({ flag, onClose, onSubmit }: { flag: Flag; onClose: () => void; onSubmit: (c: Challenge) => void }) {
  const [ground, setGround] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  const submit = () => {
    const at = new Date().toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    onSubmit({ ground, text: text.trim(), at });
    setSent(at);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Challenge this flag" onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-bg/80">
      <div onClick={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-[480px] border-t border-line-2 bg-panel px-5 pt-[18px] pb-[max(env(safe-area-inset-bottom),28px)]">
        <div className="label flex justify-between gap-3">
          <span className="text-amber">Challenge · {flag.dim} #{flag.id}</span>
          <span className="text-ink-3">Kept on record either way</span>
        </div>
        <p className="mt-3.5 text-[13px] leading-[1.45] text-ink-2">“{flag.claim}” · confidence {flag.confidence.toFixed(2)}</p>

        {sent == null ? (
          <>
            <div className="label mt-4 text-ink-3">Grounds</div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {GROUNDS.map((g) => (
                <button key={g} type="button" aria-pressed={ground === g} onClick={() => setGround(ground === g ? null : g)}
                  className={`h-11 border text-[13px] font-medium ${ground === g ? 'border-amber bg-amber/15 text-ink-1' : 'border-line-2 text-ink-2'}`}>
                  {g}
                </button>
              ))}
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="In your words — optional"
              className="mt-3 w-full resize-none border-b border-line-2 bg-transparent px-3.5 py-3 text-sm text-ink-1 placeholder:text-ink-4 focus:border-violet focus:outline-none" />
            <div className="mt-4 flex gap-2.5">
              <button type="button" disabled={!ground && !text.trim()} onClick={submit}
                className="h-12 flex-1 bg-amber text-sm font-semibold text-bg disabled:opacity-40">Submit challenge</button>
              <button type="button" onClick={onClose} className="h-12 flex-1 border border-line-2 text-sm font-medium text-ink-2">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-[1.45] text-pretty">
              Logged {sent}. The flag is now <span className="text-amber">contested</span>. A verdict follows within 24 h.
              Challenge and verdict both stay in the record, whichever way it goes.
            </p>
            <button type="button" onClick={onClose} className="mt-4 h-12 w-full border border-line-2 text-sm font-medium text-ink-2">Close</button>
          </>
        )}
      </div>
    </div>
  );
}
