import './screen-off.css';
type Entry = {status: string; early: string; note: string};
export function ScreenOffDashboard({title, date, entry, completed, onRecord, onCalendar, onPrint, disabled=false}: {
  title: string; date: string; entry: Entry; completed: number; onRecord:(patch:Partial<Entry>)=>void;
  onCalendar:()=>void; onPrint:()=>void; disabled?:boolean;
}) {
  const done=entry.status==='Screen off confirmed';
  const away=entry.status==='Not at office';
  return <section className={`screen-ritual ${done ? 'ritual-done' : ''}`} aria-label="Screen shutdown routine">
    <div className="ritual-top"><span><i/> END-OF-DAY RITUAL</span><span>{date}</span></div>
    <div className="ritual-body"><div className="ritual-copy"><span className="ritual-eyebrow">ONE SMALL ACTION. A CLEAR FINISH.</span>
      <h2>{done ? 'Screen off.\nDay complete.' : away ? 'Away today.\nPick up next time.' : 'Power down.\nSwitch off for the day.'}</h2>
      <p className="ritual-title">{title}</p>
      <p className="ritual-caption">{done ? 'You recorded the final check for today.' : 'Finish your work, turn off the monitor, and check that it is off.'}</p>
      <div className="ritual-actions"><button disabled={disabled || done} className="ritual-confirm" onClick={()=>onRecord({status:'Screen off confirmed'})}>{done ? '✓ Confirmed for today' : 'Confirm screen is off'}<span aria-hidden="true">↗</span></button>
      <button disabled={disabled} className="ritual-away" aria-pressed={away} onClick={()=>onRecord({status:away ? '' : 'Not at office'})}>{away ? 'Mark as office day' : 'Not at office today'}</button></div>
      <p className="ritual-status" role="status">{done ? 'Recorded today' : away ? 'Not applicable today' : entry.status === 'Missed' ? 'Marked missed — you can still correct it.' : 'Awaiting your check'}{done && <button disabled={disabled} onClick={()=>onRecord({status:''})}>Undo</button>}</p>
    </div><div className="ritual-visual" aria-hidden="true"><div className="ritual-orbit"/><div className="ritual-monitor"><div className="ritual-display"><span className="ritual-power">⏻</span><span>{done ? 'OFF · CONFIRMED' : 'READY TO SWITCH OFF'}</span></div><div className="ritual-bezel"><i/></div></div><div className="ritual-stand"/><div className="ritual-base"/><span className="ritual-visual-caption">{done ? 'A little less energy. A little more intention.' : 'A deliberate check beats an easy-to-miss cue.'}</span></div></div>
    <div className="ritual-bottom"><div><b>{completed}</b><span>confirmed days<br/>all recorded history</span></div><button onClick={onCalendar}>View calendar <span aria-hidden="true">↗</span></button><button onClick={onPrint}>Print checklist <span aria-hidden="true">↗</span></button></div>
    <div className="ritual-winddown"><div><span className="ritual-minute">30<span>MIN</span></span><div><h3>A gentler finish</h3><p>Stop screen use 30 minutes before leaving when work permits.</p></div></div><label>Today's wind-down<select disabled={disabled} value={entry.early} onChange={e=>onRecord({early:e.target.value})}><option value="">Choose an outcome</option><option>Stopped 30 minutes early</option><option>Screen still needed for work</option><option>Not applicable</option></select></label></div>
    <p className="ritual-disclaimer">Manual check-in only. This app does not detect or turn off your monitor.</p>
  </section>;
}
