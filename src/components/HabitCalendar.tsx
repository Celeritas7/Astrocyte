type CheckIn = { status: string; early?: string; note?: string };
/** Print-only month grid: guidance belongs above the calendar, never inside dates. */
export function HabitCalendar({month, entries, notes = false}: { month: string; entries: Record<string, CheckIn>; notes?: boolean }) {
  const [year, m] = month.split('-').map(Number);
  const offset = (new Date(year, m - 1, 1, 12).getDay() + 6) % 7;
  const count = new Date(year, m, 0, 12).getDate();
  const cells = Math.ceil((offset + count) / 7) * 7;
  const success = new Set(['Full','Screen off confirmed','Resisted','Replacement used']);
  return <section className="print-calendar" aria-label={`Checkmark calendar ${month}`}>
    <h2>{new Date(year, m - 1, 1, 12).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</h2>
    <p>Check the box after completing the action. Leave unrecorded days blank.</p>
    <div className="print-calendar-grid">
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=><div className="calendar-weekday" key={d}>{d}</div>)}
      {Array.from({length:cells},(_,i)=>{
        const n=i-offset+1;
        if(n<1 || n>count) return <div key={i} className="calendar-empty"/>;
        const date=`${month}-${String(n).padStart(2,'0')}`;
        const entry=entries[date];
        return <div className="calendar-date" key={i} aria-label={date}>
          <strong>{n}</strong><span className="calendar-mark" aria-label={success.has(entry?.status) ? 'Completed' : 'Unchecked'}>{success.has(entry?.status) ? '✓' : ''}</span>
          {entry?.status && <span className="calendar-saved">{entry.status}</span>}
          {notes && entry?.note && <span className="calendar-saved">{entry.note}</span>}
          <span className="calendar-writing-space" aria-hidden="true"/>
        </div>;
      })}
    </div>
  </section>;
}
