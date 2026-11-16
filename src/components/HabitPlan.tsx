export type Plan = { start: string; duration: number; weekdaysOnly: boolean };
export type PlanDay = { date: string; number: number; active: boolean };
export function planDays(plan: Plan): PlanDay[] {
  const [year, month, day] = (plan.start || '2000-01-03').split('-').map(Number);
  return Array.from({length: plan.duration}, (_, i) => {
    const d = new Date(year, month - 1, day + i, 12);
    return { number: i + 1, date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, active: !plan.weekdaysOnly || (d.getDay() !== 0 && d.getDay() !== 6) };
  });
}
const successes = new Set(['Full', 'Screen off confirmed', 'Resisted', 'Replacement used']);
export function HabitPlan({plan, title, action, kind, entries, today, onSelect, printable = false}: {
  plan: Plan; title: string; action: string; kind: 'making' | 'breaking'; entries: Record<string, {status: string}>;
  today: string; onSelect?: (date: string) => void; printable?: boolean;
}) {
  const days = planDays(plan);
  const active = days.filter(d => d.active && !['Rest','Not applicable','Not at office'].includes(entries[d.date]?.status));
  const complete = (d: PlanDay) => !!plan.start && d.active && successes.has(entries[d.date]?.status);
  const done = active.filter(complete).length;
  return <div className={`routine-plan${printable ? ' routine-print' : ''}`}>
    <div className="routine-heading"><div><div className="routine-kicker">{kind === 'making' ? 'MAKE A HABIT' : 'BREAK A HABIT'}</div><h2>{title}</h2><p>{plan.start ? `${plan.start} → ${days[days.length-1]?.date}` : 'Not started yet. Choose a start date to begin.'}</p></div><span className="routine-count">{done}/{active.length} done</span></div>
    <div className="routine-track" role="progressbar" aria-label="Completed planned days" aria-valuenow={done} aria-valuemin={0} aria-valuemax={active.length || 1}>{days.map(d => <span key={d.number} className={complete(d) ? 'complete' : !d.active ? 'off' : ''}/>)}<b>{done}/{active.length}</b></div>
    {Array.from({length:Math.ceil(days.length/7)},(_,w) => {
      const week=days.slice(w*7,w*7+7); const available=week.filter(d=>active.includes(d));
      return <section className="routine-week" key={w} aria-label={`Week ${w+1}`}><header><h3>Week {w+1}</h3><span>{['Notice the cue','Repeat the action','Review what helps','Keep it practical'][w]}</span><b>{available.filter(complete).length}/{available.length} done</b></header><div className="routine-grid">{week.map(d => {
        const status = plan.start ? entries[d.date]?.status : '';
        const future = !!plan.start && d.date > today;
        const content = <><strong className="routine-number">{String(d.number).padStart(2,'0')}</strong><span className="routine-date">{plan.start ? d.date.slice(5) : 'Day '+d.number}</span><b>{!d.active ? 'Rest / away' : kind === 'making' ? 'Practise' : 'Replace'}</b>{!printable && <span className="routine-action">{!d.active ? 'No scheduled action.' : action || (printable ? 'Daily check-in' : 'Choose a small action in habit details.')}</span>}<span className="routine-outcome">{status || (!d.active ? 'Rest' : future ? 'Upcoming' : plan.start ? 'Not recorded' : 'Not started')}</span><span aria-hidden="true" className={`routine-circle${complete(d) ? ' checked' : ''}`}>{complete(d) ? '✓' : status === 'Lapse' || status === 'Missed' ? '–' : ''}</span></>;
        const cls=`routine-day${d.active ? '' : ' rest'}${complete(d) ? ' done' : ''}${plan.start && d.date === today ? ' is-today' : ''}`;
        return printable ? <div className={cls} key={d.number}>{content}</div> : <button type="button" className={cls} key={d.number} disabled={!plan.start || future} onClick={()=>onSelect?.(d.date)} aria-label={`Day ${d.number}, ${plan.start ? d.date : 'not started'}, ${status || 'not recorded'}`}>{content}</button>;
      })}</div></section>;
    })}
    <p className="routine-footnote">{plan.duration} days is a planning window, not a promise of habit formation. Missed days and lapses remain visible; future days cannot be marked early.</p>
  </div>;
}
