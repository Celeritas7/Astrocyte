import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
await build({entryPoints:['src/components/HabitPlan.tsx'],outfile:'tests/.calendar-check.mjs',bundle:true,platform:'node',format:'esm',packages:'external'});
const {planWeeks,HabitPlan}=await import('./.calendar-check.mjs');
const React=await import('react');
const {renderToStaticMarkup}=await import('react-dom/server');
for(const start of ['2026-11-16','2026-11-17','2026-11-18','2026-11-19','2026-11-20','2026-11-21','2026-11-22','2026-12-29','2028-02-27']) {
  for(const duration of [7,14,21,28]) {
    const plan={start,duration,weekdaysOnly:true};const weeks=planWeeks(plan);
    const days=weeks.flat().filter(Boolean);assert.equal(days.length,duration);
    assert.equal(days[0].date,start);assert.equal(new Set(days.map(d=>d.date)).size,duration);
    weeks.forEach(week=>{assert.equal(week.length,7);week.forEach((day,column)=>{if(!day)return;const [y,m,d]=day.date.split('-').map(Number);assert.equal((new Date(y,m-1,d,12).getDay()+6)%7,column);assert.equal(day.active,column<5);});});
    for(const printable of [false,true]) {
      const html=renderToStaticMarkup(React.createElement(HabitPlan,{plan,title:'Test',action:'One instruction',kind:'making',entries:{},today:'2026-12-31',printable}));
      assert.equal((html.match(/class="routine-weekday"/g)||[]).length,weeks.length*7);
      assert.equal((html.match(/class="routine-day/g)||[]).length,duration);
    }
  }
}
const tuesday=planWeeks({start:'2026-11-17',duration:21,weekdaysOnly:true});
assert.equal(tuesday[0][0],null);assert.equal(tuesday[0][5].date,'2026-11-21');assert.equal(tuesday[0][6].date,'2026-11-22');assert.equal(tuesday.length,4);
const preview=renderToStaticMarkup(React.createElement(HabitPlan,{plan:{start:'2026-11-17',duration:21,weekdaysOnly:true},title:'Test',action:'',kind:'making',entries:{},today:'2026-11-17',printable:true}));
assert.ok(preview.includes('16 Nov'));
assert.ok(preview.includes('13 Dec'));
assert.equal((preview.match(/class="routine-number"/g)||[]).length,21);
assert.equal((preview.match(/class="routine-circle/g)||[]).length,15);
assert.ok(preview.includes('21-day program'));
assert.ok(preview.includes('0/4 done'));
await unlink('tests/.calendar-check.mjs');
console.log('PASS: weekday alignment, all start weekdays, all lengths, month/year/leap boundaries, screen and print headings.');
