import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { HabitExamples } from './HabitExamples';
import './habits.css';
import { ScreenOffDashboard } from '../components/ScreenOffDashboard';
import { HabitCalendar } from '../components/HabitCalendar';
import { HabitPlan, type Plan } from '../components/HabitPlan';

type Entry = { status: string; early: string; note: string };
type Habit = { plan?: Plan; id: string; name: string; alias: string; kind: 'making' | 'breaking'; issue: string; trigger: string; action: string; suggestion: string; office: boolean; entries: Record<string, Entry> };
type Privacy = { app: boolean; team: boolean; realName: boolean; details: boolean; notes: boolean };
type Data = { habits: Habit[]; privacy: Privacy; labels: { app: string; team: string } };
const KEY = 'astrocyte.habits.v1';
const initial: Data = { labels: { app: 'Astrocyte', team: '' }, privacy: { app: false, team: false, realName: false, details: true, notes: false }, habits: [{
  id: 'starter', name: 'My first habit', alias: 'Routine A', kind: 'making', office: false,
  issue: '', trigger: '', action: '', suggestion: '', entries: {}
}] };
export function parseHabits(value: unknown): Data {
  const v = value as Data;
  if (!v || !Array.isArray(v.habits) || !v.habits.length || v.habits.length > 500) throw Error('Invalid habit file.');
  const text = (x: unknown): x is string => typeof x === 'string' && x.length <= 2000;
  const habits = v.habits.map(h => {
    if (!h || !['making','breaking'].includes(h.kind) || ![h.id,h.name,h.alias,h.issue,h.trigger,h.action,h.suggestion].every(text) || !h.id || !h.entries || typeof h.entries !== 'object' || Array.isArray(h.entries)) throw Error('Invalid habit fields.');
    for (const [date,e] of Object.entries(h.entries)) if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !e || ![e.status,e.early,e.note].every(text)) throw Error('Invalid check-in.');
    const plan = h.plan;
    if (plan && (!/^\d{4}-\d{2}-\d{2}$/.test(plan.start) && plan.start !== '' || ![7,14,21,28].includes(plan.duration) || typeof plan.weekdaysOnly !== 'boolean')) throw Error('Invalid plan.');
    return { ...h, office: h.office === true };
  });
  if (new Set(habits.map(h => h.id)).size !== habits.length) throw Error('Duplicate habit IDs.');
  const privacy = {...initial.privacy};
  for (const k of Object.keys(privacy) as (keyof Privacy)[]) if (typeof v.privacy?.[k] === 'boolean') privacy[k] = v.privacy[k];
  return { habits, privacy, labels: { app: text(v.labels?.app) ? v.labels.app : initial.labels.app, team: text(v.labels?.team) ? v.labels.team : '' } };
}
export function sheetMonth(month: string, offset: number) { const [year, m] = month.split('-').map(Number); const total = year * 12 + m - 1 + offset; return `${Math.floor(total / 12)}-${String(total % 12 + 1).padStart(2, '0')}`; }
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function read(): Data { const raw = localStorage.getItem(KEY); return raw ? parseHabits(JSON.parse(raw)) : initial; }
const statuses = (h: Habit) => h.kind === 'breaking' ? ['Resisted', 'Replacement used', 'Lapse', 'Not applicable'] : h.office ? ['Screen off confirmed', 'Missed', 'Not at office'] : ['Full', 'Partial', 'Rest', 'Missed'];
export function Habits() {
  const [loaded] = useState(() => { try { return { data: read(), blocked: false }; } catch { return { data: initial, blocked: true }; } });
  const [data, setData] = useState<Data>(loaded.data);
  const [importMessage, setImportMessage] = useState('');
  const [selected, setSelected] = useState(data.habits[0].id);
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(today().slice(0,7));
  const [preview, setPreview] = useState(false);
  const [filled, setFilled] = useState(false);
  const [twoUp, setTwoUp] = useState(false);
  const [minimalPrint, setMinimalPrint] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [view, setView] = useState<'plan' | 'check' | 'print'>('plan');
  const [printLayout, setPrintLayout] = useState<'cards' | 'table' | 'calendar'>('calendar');
  const habit = data.habits.find(h => h.id === selected) ?? data.habits[0];
  const plan: Plan = habit.plan ?? {start:'',duration:21,weekdaysOnly:habit.office};
  const entry = habit.entries[date] ?? { status: '', early: '', note: '' };
  useEffect(() => { if (loaded.blocked) { setError('Saved habits could not be read. Existing storage has been preserved. Export your original data before continuing.'); return; } try { localStorage.setItem(KEY, JSON.stringify(data)); setError(''); } catch { setError('Changes could not be saved on this device. Keep this page open and export a backup.'); } }, [data, loaded.blocked]);
  useEffect(() => { if (!preview) return; const old = document.title; document.title = 'Routine sheet'; const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreview(false); }; window.addEventListener('keydown', key); return () => { document.title = old; window.removeEventListener('keydown', key); }; }, [preview]);
  const update = (patch: Partial<Habit>) => setData(d => ({ ...d, habits: d.habits.map(h => h.id === habit.id ? { ...h, ...patch } : h) }));
  const record = (patch: Partial<Entry>) => update({ entries: { ...habit.entries, [date]: { ...entry, ...patch } } });
  const add = (kind: Habit['kind']) => { const h: Habit = { id: crypto.randomUUID(), name: kind === 'making' ? 'New habit to build' : 'New habit to break', alias: 'Routine', kind, office: false, issue: '', trigger: '', action: '', suggestion: '', entries: {} }; setData(d => ({ ...d, habits: [...d.habits, h] })); setSelected(h.id); setEditing(true); };
  const backup = () => { const url = URL.createObjectURL(new Blob([loaded.blocked ? (localStorage.getItem(KEY) ?? '') : JSON.stringify(data, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'habit-backup.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
  const importHabits = async (file?: File) => {
    if (!file || loaded.blocked) return;
    try {
      if (file.size > 5000000) throw Error('File is too large.');
      const imported = parseHabits(JSON.parse(await file.text()));
      const added = imported.habits.filter(h => !data.habits.some(existing => existing.id === h.id));
      setData(d => ({ ...d, habits: [...d.habits, ...added], labels: imported.labels }));
      if (added.length) setSelected(added[0].id);
      setImportMessage(`${added.length} habits imported. Existing habits and print choices were kept; matching IDs were skipped.`);
    } catch { setImportMessage('Could not import this file. No habits were changed.'); }
  };
  const p = data.privacy;
  const days = /^\d{4}-\d{2}$/.test(month) ? new Date(Number(month.slice(0,4)), Number(month.slice(5)), 0).getDate() : 31;
  const enableTwoUp = (enabled: boolean) => { setTwoUp(enabled); if (enabled) { setMinimalPrint(true); setPrintLayout('calendar'); setFilled(false); } };
  return <div className="habit-page">
    <div className="habit-eyebrow">Astrocyte · Habits</div><h1>Your habit programs</h1>
    <p className="habit-muted">Build a routine you can check on your phone or keep on paper.</p>
    {error && <p role="alert" className="habit-error">{error}</p>}
    <label className="habit-field">Your habit<select value={habit.id} onChange={e => setSelected(e.target.value)}>{data.habits.map(h => <option value={h.id} key={h.id}>{h.name}</option>)}</select></label>
    <details className="habit-import"><summary>Import a prepared habit</summary><label className="habit-field">Import habit setup / backup<input type="file" accept=".json,application/json" disabled={loaded.blocked} onChange={e => { void importHabits(e.target.files?.[0]); e.target.value = ''; }}/></label></details>
    {importMessage && <p role="status">{importMessage}</p>}
    <div className="habit-row"><button onClick={() => add('making')}>+ Make a habit</button><button onClick={() => add('breaking')}>+ Break a habit</button></div>
    <div className="habit-view-switch" role="group" aria-label="Habit views">{([['plan','Program'],['check','Check-in'],['print','Print sheet']] as const).map(([key,label])=><button key={key} aria-pressed={view===key} onClick={()=>setView(key)}>{label}</button>)}</div>
    {view === 'plan' && habit.office && habit.kind === 'making' && <ScreenOffDashboard title={habit.name} date={today()} entry={habit.entries[today()] ?? {status:'',early:'',note:''}} completed={Object.values(habit.entries).filter(e=>e.status==='Screen off confirmed').length} disabled={loaded.blocked}
      onRecord={patch=>{const d=today();update({entries:{...habit.entries,[d]:{...(habit.entries[d] ?? {status:'',early:'',note:''}),...patch}}});}}
      onCalendar={()=>document.getElementById('habit-program-calendar')?.scrollIntoView({behavior:'smooth',block:'start'})} onPrint={()=>setView('print')}/>}
    {view === 'plan' && <section id="habit-program-calendar" className="habit-program"><div className="habit-plan-controls"><label className="habit-field">Plan start<input type="date" value={plan.start} onChange={e=>update({plan:{...plan,start:e.target.value}})}/></label><label className="habit-field">Plan length<select value={plan.duration} onChange={e=>update({plan:{...plan,duration:Number(e.target.value)}})}>{[7,14,21,28].map(n=><option key={n} value={n}>{n} days</option>)}</select></label><label className="habit-check"><input type="checkbox" checked={plan.weekdaysOnly} onChange={e=>update({plan:{...plan,weekdaysOnly:e.target.checked}})}/>Weekdays only</label></div>
    {!plan.start && <div className="habit-start"><span><b>Ready to begin?</b> Start today, or choose another date above.</span><button onClick={()=>update({plan:{...plan,start:today()}})}>Start today</button></div>}
    <HabitPlan plan={plan} title={habit.name} action={habit.action} kind={habit.kind} entries={habit.entries} today={today()} onSelect={d=>{setDate(d);setView('check');}}/>
    </section>}
    <details className="habit-card" open={editing || undefined}><summary>Habit details &amp; editor</summary><div className="habit-eyebrow">{habit.kind === 'making' ? 'Making ↑' : 'Breaking ↓'}</div><h2>{habit.name}</h2>
      <p><strong>Issue</strong><br/>{habit.issue || 'Add the obstacle you want to address.'}</p>
      <p><strong>Trigger</strong><br/>{habit.trigger || 'Choose when to act.'}</p><p><strong>{habit.kind === 'breaking' ? 'Replacement action' : 'Action'}</strong><br/>{habit.action || 'Choose a small, specific action.'}</p>
      {habit.suggestion && <p className="habit-tip"><strong>{habit.office ? '30-minute wind-down' : 'Suggestion'}</strong><br/>{habit.suggestion}</p>}
      <button onClick={() => setEditing(!editing)} aria-expanded={editing}>{editing ? 'Close editor' : 'Edit habit / printable name'}</button>
      {editing && <div className="habit-editor"><label className="habit-check"><input type="checkbox" checked={habit.office} onChange={e=>update({office:e.target.checked})}/>Use screen-off dashboard and check-in controls</label>{(['name','alias','issue','trigger','action','suggestion'] as const).map(k => <label className="habit-field" key={k}>{({name:'Habit name',alias:'Printable alias',issue:'Issue',trigger:'Trigger',action:'Action / replacement',suggestion:'Suggestion'})[k]}<textarea maxLength={700} rows={k === 'name' || k === 'alias' ? 1 : 3} value={habit[k]} onChange={e => update({ [k]: e.target.value })}/></label>)}</div>}
    </details>
    <section hidden={view !== 'check'} className="habit-card"><h2>Daily check-in</h2><label className="habit-field">Date<input type="date" value={date} max={today()} onChange={e => { if(e.target.value) setDate(e.target.value); }}/></label>
      <div className="habit-statuses">{statuses(habit).map(s => <button key={s} aria-pressed={entry.status === s} className={entry.status === s ? 'selected' : ''} onClick={() => record({ status: s })}>{s}</button>)}</div>
      {habit.office && <label className="habit-field">30-minute suggestion<select value={entry.early} onChange={e => record({ early: e.target.value })}><option value="">Not recorded</option><option>Stopped 30 minutes early</option><option>Screen still needed for work</option><option>Not applicable</option></select></label>}
      <label className="habit-field">{habit.kind === 'breaking' ? 'Urge, trigger or replacement notes' : 'Notes (optional)'}<textarea value={entry.note} maxLength={700} onChange={e => record({ note: e.target.value })}/></label>
      <button onClick={() => { const entries = {...habit.entries}; delete entries[date]; update({ entries }); }}>Clear this check-in</button>
      <p className="habit-muted" role="status">{error ? 'Not saved' : entry.status ? 'Check-in saved on this device.' : 'No outcome recorded for this date.'}</p>
    </section>
    <section hidden={view !== 'print'} className="habit-card"><h2>Paper sheet</h2><p className="habit-muted">Print a blank tracker or include saved check-ins. Private names are off by default.</p>
      <label className="habit-field">App label<input maxLength={100} value={data.labels.app} onChange={e => setData(d => ({...d, labels: {...d.labels, app: e.target.value}}))}/></label>
      <label className="habit-field">Team label (optional)<input maxLength={100} value={data.labels.team} onChange={e => setData(d => ({...d, labels: {...d.labels, team: e.target.value}}))}/></label>
      <label className="habit-check"><input type="checkbox" disabled={twoUp} checked={minimalPrint} onChange={e=>setMinimalPrint(e.target.checked)}/>Minimal checklist — title, month and checkboxes only</label>
      <label className="habit-check"><input type="checkbox" checked={twoUp} onChange={e=>enableTwoUp(e.target.checked)}/>2 sheets on one A4 — two consecutive months</label>
      <label className="habit-field">Page orientation<select disabled={twoUp} value={orientation} onChange={e=>setOrientation(e.target.value as 'portrait' | 'landscape')}><option value="landscape">Landscape — A4 wide</option><option value="portrait">Portrait — A4 tall</option></select></label>
      <label className="habit-field">Sheet format<select disabled={twoUp} value={printLayout} onChange={e=>setPrintLayout(e.target.value as 'cards'|'table'|'calendar')}><option value="calendar">Monthly checkmark calendar</option><option value="cards">Weekly day cards</option><option value="table">Monthly table</option></select></label>
      {printLayout === 'cards' && <p className="habit-muted">Uses the program start date and length. Set them in Program first, or print undated cards.</p>}
      <label className="habit-field">Start month (calendar or table)<input type="month" value={month} onChange={e => { if(e.target.value) setMonth(e.target.value); }}/></label>
      {([['app','Include app label'],['team','Include team label'],['realName','Print real habit name (otherwise use alias)'],['details','Print issue as title, trigger, action and suggestion'],['notes','Print saved personal notes']] as const).map(([key,label]) => <label className="habit-check" key={key}><input type="checkbox" checked={p[key]} onChange={e => setData(d => ({ ...d, privacy: {...d.privacy, [key]: e.target.checked} }))}/>{label}</label>)}
      <label className="habit-check"><input type="checkbox" disabled={twoUp} checked={filled} onChange={e => setFilled(e.target.checked)}/>Include recorded check-ins</label>
      <button className="habit-primary" onClick={() => setPreview(true)}>Preview printable sheet</button>
    </section>
    <details className="habit-card"><summary>Saved history · {Object.values(habit.entries).filter(e => e.status).length} outcomes</summary>{Object.entries(habit.entries).sort(([a],[b]) => b.localeCompare(a)).map(([d,e]) => <button className="habit-history" key={d} onClick={() => setDate(d)}>{d} · {e.status || 'Notes only'}</button>)}</details>
    <p className="habit-muted">Habits are stored in this browser only. No cloud sync or timed notifications yet.</p><button onClick={backup}>Export backup (includes private details)</button>
    <details className="habit-card"><summary>Original demo habits</summary><p>Sample data; separate from your habits above.</p><HabitExamples/></details>
    {preview && createPortal(<div className={`habit-print-overlay orientation-${twoUp ? 'portrait' : orientation}${twoUp ? ' two-up' : ''}${minimalPrint ? ' minimal-checklist' : ''}`} role="dialog" aria-modal="true" aria-label="Print preview"><style>{`@media print { @page { size: A4 ${twoUp ? 'portrait' : orientation}; margin: ${twoUp ? '8mm' : '12mm'}; } }`}</style><div className="habit-print-toolbar"><label><input type="checkbox" checked={twoUp} onChange={e=>enableTwoUp(e.target.checked)}/>2 sheets on one A4</label>{twoUp && <p>Selected month on top, next month below. Print on A4 portrait at 100% with 1 page per sheet; headers and footers off.</p>}<label><input type="checkbox" checked={minimalPrint} onChange={e=>setMinimalPrint(e.target.checked)}/>Minimal checklist</label><label>Preview orientation <select value={orientation} onChange={e=>setOrientation(e.target.value as 'portrait' | 'landscape')}><option value="landscape">Landscape</option><option value="portrait">Portrait</option></select></label><button autoFocus onClick={() => setPreview(false)}>Close preview</button><button onClick={() => window.print()}>Print / Save as PDF</button><p>Turn off browser headers and footers in the print dialog to omit the site URL. Review any sensitive wording in the sheet below.</p></div>
      <div className="habit-paper-stack">{Array.from({length:twoUp ? 2 : 1},(_,copy)=><article key={copy} className="habit-paper">{(p.app || p.team) && <div className="paper-brand">{[p.app && data.labels.app, p.team && data.labels.team].filter(Boolean).join(' · ')}</div>}<div className="paper-kicker">{habit.kind === 'making' ? 'Habit making' : 'Habit breaking'} · {sheetMonth(month, copy)}</div>{habit.office && habit.kind === 'making' ? <header className="screen-sheet-heading"><div><span className="screen-sheet-kicker">Habit maker</span><h1>{(!minimalPrint && p.details && habit.issue.trim()) || (p.realName ? habit.name : habit.alias) || 'Routine sheet'}</h1></div></header> : <h1>{(!minimalPrint && p.details && habit.issue.trim()) || (p.realName ? habit.name : habit.alias) || 'Routine sheet'}</h1>}
      {habit.office && habit.kind === 'making' && <div className="screen-sheet-cues"><span><b>01</b> Finish screen work</span><span><b>02</b> Turn the monitor off</span><span><b>03</b> Tick today's box</span></div>}
      {!minimalPrint && p.details && <div className="paper-plan"><p><b>Trigger:</b> {habit.trigger}</p><p><b>{habit.kind === 'breaking' ? 'Replacement' : 'Action'}:</b> {habit.action}</p><p><b>Suggestion:</b> {habit.suggestion}</p></div>}
      {!minimalPrint && <p className="paper-legend">{statuses(habit).map((s,i) => `${i+1} = ${s}`).join(' · ')}<br/>Blank = not recorded. Rest / not applicable is not a missed day.</p>}
      {printLayout === 'calendar' ? <HabitCalendar month={sheetMonth(month, copy)} entries={filled ? habit.entries : {}} notes={!twoUp && p.notes}/> : printLayout === 'cards' ? <HabitPlan printable plan={plan} title="Daily plan" action={p.details ? habit.action : ''} kind={habit.kind} entries={filled ? habit.entries : {}} today={today()}/> : <table><thead><tr><th>Date</th><th>Outcome / code</th>{habit.office && <th>30-min check*</th>}<th>Notes</th></tr></thead><tbody>{Array.from({length:days},(_,i) => {const d = `${month}-${String(i+1).padStart(2,'0')}`; const e = filled ? habit.entries[d] : undefined; return <tr key={d}><td>{d}</td><td>{e?.status}</td>{habit.office && <td>{e?.early}</td>}<td>{p.notes ? e?.note : ''}</td></tr>;})}</tbody></table>}
      {!minimalPrint && habit.office && <p className="paper-legend">* Early / Work still needs screen / N/A. Turning the screen off when work ends remains the main check.</p>}
      {!minimalPrint && <div className="paper-review"><b>Review:</b> What helped? What got missed? What will I adjust?<div>________________________________________________________________</div></div>}
      </article>)}</div></div>, document.body)}
  </div>;
}
