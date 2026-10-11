// Run: node test.js  — sanity checks for the slip logic.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const C = require('./core.js');

const ctx = {};
vm.runInNewContext(fs.readFileSync(__dirname + '/plan.js', 'utf8') + ';this.W=PLAN_WEEKS;this.R=SUNDAY_REVISION;this.S=PLAN_START;', ctx);
const units = C.buildUnits(ctx.W, ctx.R);
const S = ctx.S;

assert.strictEqual(units.wd.length, 85);
assert.strictEqual(units.we.length, 34);
const base = C.baseline(units, S);
assert.strictEqual(base.dday, '2027-02-07', 'original D-Day');
assert.strictEqual(base.date.w1d1, '2026-10-12');
assert.strictEqual(base.date.w1sat, '2026-10-17');

const empty = { startDate: S, offDays: {}, checks: {} };
const checkUnit = (st, id, date) => units.byId[id].items.forEach((it) => { st.checks[it.id] = date; });

// Before start: nothing missed, D-Day unchanged
let s = C.buildSchedule(units, empty, '2026-10-11');
assert.strictEqual(s.dday, '2027-02-07');

// On day 1, nothing done yet: today = w1d1, D-Day unchanged
s = C.buildSchedule(units, empty, '2026-10-12');
assert.strictEqual(s.byDate['2026-10-12'].entries[0].status, 'today');
assert.strictEqual(s.dday, '2027-02-07');

// Missed Monday → on Tuesday, w1d1 is carried over, weekday queue slips 1 slot
s = C.buildSchedule(units, empty, '2026-10-13');
assert.strictEqual(s.byDate['2026-10-12'].entries[0].status, 'missed');
assert.strictEqual(s.byDate['2026-10-13'].entries[0].unit.id, 'w1d1');
assert.strictEqual(s.unitDate.w17d5, '2027-02-08'); // last weekday unit moved Fri → next Mon
assert.strictEqual(s.dday, '2027-02-08');
// Weekend queue untouched
assert.strictEqual(s.unitDate.w1sat, '2026-10-17');

// Did Monday's work on Monday → no slip
let st = { startDate: S, offDays: {}, checks: {} };
checkUnit(st, 'w1d1', '2026-10-12');
s = C.buildSchedule(units, st, '2026-10-13');
assert.strictEqual(s.byDate['2026-10-12'].entries[0].status, 'done');
assert.strictEqual(s.byDate['2026-10-13'].entries[0].unit.id, 'w1d2');
assert.strictEqual(s.dday, '2027-02-07');

// Partial: only some items checked → still carried over, checks preserved
st = { startDate: S, offDays: {}, checks: {} };
st.checks['w1d1.0'] = '2026-10-12';
s = C.buildSchedule(units, st, '2026-10-13');
assert.strictEqual(s.byDate['2026-10-12'].entries[0].status, 'missed');
assert.strictEqual(s.byDate['2026-10-13'].entries[0].unit.id, 'w1d1');

// Getting ahead: finish w1d1 and w1d2 on Monday → D-Day moves earlier
st = { startDate: S, offDays: {}, checks: {} };
checkUnit(st, 'w1d1', '2026-10-12'); checkUnit(st, 'w1d2', '2026-10-12');
s = C.buildSchedule(units, st, '2026-10-12');
assert.strictEqual(s.byDate['2026-10-12'].entries.length, 2);
assert.strictEqual(s.byDate['2026-10-13'].entries[0].unit.id, 'w1d3');
assert.strictEqual(s.dday, '2027-02-06'); // one session ahead = -1 day

// Missed Mon + Tue → +2 on Wednesday
s = C.buildSchedule(units, empty, '2026-10-14');
assert.strictEqual(s.dday, '2027-02-09');

// Missed Mon, caught up on Tue by doing both sessions → back on track
st = { startDate: S, offDays: {}, checks: {} };
checkUnit(st, 'w1d1', '2026-10-13'); checkUnit(st, 'w1d2', '2026-10-13');
s = C.buildSchedule(units, st, '2026-10-14');
assert.strictEqual(s.dday, '2027-02-07');

// Completing a later (non-consecutive) future session early → -1
st = { startDate: S, offDays: {}, checks: {} };
checkUnit(st, 'w1d1', '2026-10-12'); checkUnit(st, 'w1d5', '2026-10-12');
s = C.buildSchedule(units, st, '2026-10-12');
assert.strictEqual(s.dday, '2027-02-06');

// Finishing a future weekend session early also counts
st = { startDate: S, offDays: {}, checks: {} };
checkUnit(st, 'w1sat', '2026-10-12');
s = C.buildSchedule(units, st, '2026-10-12');
assert.strictEqual(s.dday, '2027-02-06');

// Missing a Saturday = +1 day (not a whole week)
s = C.buildSchedule(units, empty, '2026-10-18');
assert.strictEqual(s.byDate['2026-10-17'].entries[0].status, 'missed');
assert.strictEqual(s.dday, '2027-02-13'); // 5 weekdays + Sat missed = +6

// Planned day off on a Saturday → weekend queue shifts, D-Day +1 weekend slot (Sun → next Sat)
st = { startDate: S, offDays: { '2026-10-17': true }, checks: {} };
s = C.buildSchedule(units, st, '2026-10-12');
assert.strictEqual(s.unitDate.w1sat, '2026-10-18');
assert.strictEqual(s.unitDate.w17sun, '2027-02-13');
assert.strictEqual(s.dday, '2027-02-08'); // day off = +1 day

// Link parsing
assert.strictEqual(units.items['w1d3.0'].url, 'https://leetcode.com/problems/valid-palindrome/');
assert.strictEqual(units.items['w1d3.0'].text, 'Valid Palindrome');

console.log('All schedule tests passed ✔  (' + units.all.length + ' units, ' + Object.keys(units.items).length + ' items)');
