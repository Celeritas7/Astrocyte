export type Plan = { start: string; duration: number; weekdaysOnly: boolean };
export type PlanDay = { date: string; number: number; active: boolean };
export function planDays(plan: Plan): PlanDay[] {
  const [year, month, day] = (plan.start || '2000-01-03').split('-').map(Number);
  return Array.from({length: plan.duration}, (_, i) => {
    const d = new Date(year, month - 1, day + i, 12);
    return { number: i + 1, date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`, active: !plan.weekdaysOnly || (d.getDay() !== 0 && d.getDay() !== 6) };
  });
}
/** Pad partial weeks so weekdays retain their calendar columns. */
export function planWeeks(plan: Plan): (PlanDay | null)[][] {
  const days = planDays(plan);
  const [y,m,d] = (plan.start || '2000-01-03').split('-').map(Number);
  const offset = (new Date(y,m-1,d,12).getDay()+6)%7;
  const cells: (PlanDay | null)[] = [...Array(offset).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  return Array.from({length:cells.length/7},(_,i)=>cells.slice(i*7,i*7+7));
}
const WEEKDAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
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
    <div className="routine-heading"><div><div className="routine-kicker">{kind === 'making' ? 'MAKE A HABIT' : 'BREAK A HABIT'}</div><h2>{printable ? `${plan.duration}-day routine` : title}</h2><p>{plan.start ? `${plan.start} → ${days[days.length-1]?.date}` : 'Not started yet. Choose a start date to begin.'}</p></div><span className="routine-count">{done}/{active.length} done</span></div>
    {!printable && action && <p className="routine-guidance">{action}</p>}
    <div className="routine-track" role="progressbar" aria-label="Completed planned days" aria-valuenow={done} aria-valuemin={0} aria-valuemax={active.length || 1}>{days.map(d => <span key={d.number} className={complete(d) ? 'complete' : !d.active ? 'off' : ''}/>)}<b>{done}/{active.length}</b></div>
    <div className="routine-calendar-scroll">
    {planWeeks(plan).map((week,w) => {
      const available=week.filter((d): d is PlanDay => d !== null && active.some(a => a.date === d.date));
      return <section className="routine-week" key={w} aria-label={`Week ${w+1}`}><header><h3>Calendar week {w+1}</h3><b>{available.filter(complete).length}/{available.length} done</b></header><div className="routine-grid">{WEEKDAYS.map(day=><div className="routine-weekday" key={day}>{day}</div>)}{week.map((d,column) => {
        if (!d) {
          const first = days[0].date.split('-').map(Number);
          const offset = (new Date(first[0], first[1]-1, first[2], 12).getDay()+6)%7;
          const outside = new Date(first[0], first[1]-1, first[2]+w*7+column-offset,12);
          return <div key={`empty-${column}`} className="routine-placeholder"><span className="routine-date">{plan.start ? outside.toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : ''}</span></div>;
        }
        const status = plan.start ? entries[d.date]?.status : '';
        const future = !!plan.start && d.date > today;
        const content = <><strong className="routine-number">{String(d.number).padStart(2,'0')}</strong><span className="routine-date">{plan.start ? new Date(d.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : 'Day '+d.number}</span><span className="routine-outcome">{status || (!d.active ? 'Rest' : printable ? '' : future ? 'Upcoming' : plan.start ? 'Not recorded' : 'Not started')}</span>{d.active && <span aria-hidden="true" className={`routine-circle${complete(d) ? ' checked' : ''}`}>{complete(d) ? '✓' : status === 'Lapse' || status === 'Missed' ? '–' : ''}</span>}</>;
        const cls=`routine-day${d.active ? '' : ' rest'}${complete(d) ? ' done' : ''}${plan.start && d.date === today ? ' is-today' : ''}`;
        return printable ? <div className={cls} key={d.number}>{content}</div> : <button type="button" className={cls} key={d.number} disabled={!plan.start || future} onClick={()=>onSelect?.(d.date)} aria-label={`Day ${d.number}, ${plan.start ? d.date : 'not started'}, ${status || 'not recorded'}`}>{content}</button>;
      })}</div></section>;
    })}
    </div>
    <p className="routine-footnote">{plan.duration} days is a planning window, not a promise of habit formation. Missed days and lapses remain visible; future days cannot be marked early.</p>
  </div>;
}

