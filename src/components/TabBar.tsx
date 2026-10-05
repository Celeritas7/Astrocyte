import type { Tab } from '../types';

const TABS: [Tab, string][] = [['today', 'Today'], ['self', 'Self'], ['habits', 'Habits'], ['log', 'Log'], ['budget', 'Budget']];

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav className="sticky bottom-0 z-40 border-t border-line bg-bg/95 pb-[max(env(safe-area-inset-bottom),14px)] backdrop-blur">
      <div className="mx-auto flex max-w-[480px] justify-between px-4 pt-1.5">
        {TABS.map(([id, label]) => {
          const on = id === tab;
          return (
            <button key={id} type="button" onClick={() => onTab(id)} aria-current={on ? 'page' : undefined}
              className={`label flex min-h-11 min-w-14 flex-col items-center justify-center gap-[7px] ${on ? 'text-violet-ink' : 'text-ink-3'}`}>
              <span className={`size-[5px] rounded-full ${on ? 'soma-pulse bg-violet' : 'bg-line-2'}`} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
