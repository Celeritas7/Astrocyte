import { useEffect, useState, type ReactNode } from 'react';
import type { Challenge, Scenario, Tab } from './types';
import { flags } from './data/mock';
import { load, save } from './lib/store';
import { TabBar } from './components/TabBar';
import { ChallengeSheet } from './components/ChallengeSheet';
import { Today } from './screens/Today';
import { FlagDetail } from './screens/FlagDetail';
import { SelfModel } from './screens/SelfModel';
import { Habits } from './screens/Habits';
import { Log } from './screens/Log';
import { Budget } from './screens/Budget';

// Phase 1 preview switches:  ?day=flag|question|quiet   ?data=thin   ?flag=27
const q = new URLSearchParams(window.location.search);
const scenario: Scenario = (['flag', 'question', 'quiet'] as const).find((s) => s === q.get('day')) ?? 'flag';
const thin = q.get('data') === 'thin';
const initialFlag = q.get('flag') && flags[Number(q.get('flag'))] ? Number(q.get('flag')) : null;

export default function App() {
  const [tab, setTab] = useState<Tab>('today');
  const [flagId, setFlagId] = useState<number | null>(initialFlag);
  const [sheetFor, setSheetFor] = useState<number | null>(null);
  const [challenges, setChallenges] = useState<Record<number, Challenge>>(() => load('astrocyte.challenges', {}));
  useEffect(() => save('astrocyte.challenges', challenges), [challenges]);
  useEffect(() => { window.scrollTo(0, 0); }, [tab, flagId]);

  const flag = flagId != null ? flags[flagId] : null;
  const goTab = (t: Tab) => { setFlagId(null); setTab(t); };

  let screen: ReactNode;
  if (flag) {
    screen = <FlagDetail flag={flag} challenge={challenges[flag.id]} onBack={() => setFlagId(null)} onChallenge={() => setSheetFor(flag.id)} />;
  } else if (tab === 'today') {
    screen = <Today scenario={scenario} challenges={challenges} onOpenFlag={setFlagId} onChallenge={setSheetFor} />;
  } else if (tab === 'self') {
    screen = <SelfModel thin={thin} />;
  } else if (tab === 'habits') {
    screen = <Habits />;
  } else if (tab === 'log') {
    screen = <Log />;
  } else {
    screen = <Budget />;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg font-sans text-ink-1">
      <main className="flex flex-1 flex-col pt-[max(env(safe-area-inset-top),24px)]">{screen}</main>
      {!flag && <TabBar tab={tab} onTab={goTab} />}
      {sheetFor != null && (
        <ChallengeSheet
          flag={flags[sheetFor]}
          onClose={() => setSheetFor(null)}
          onSubmit={(c) => setChallenges((p) => ({ ...p, [sheetFor]: c }))}
        />
      )}
    </div>
  );
}
