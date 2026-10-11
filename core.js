/*
 * Pure scheduling logic (no DOM). Loaded by the browser and by test.js in Node.
 *
 * Model
 *  - Weekday slots (Mon–Fri) and weekend slots (Sat/Sun) are two separate queues,
 *    so a missed 1.5h weekday never pushes a 4–5h weekend block onto a weekday.
 *  - A unit is "done" when every item is checked; its done date = the latest check date.
 *  - Walking the calendar from the start date:
 *      past day  → the next pending unit is assigned; done on/before that day ⇒ done, else missed (and it stays at the head of the queue)
 *      today     → the next pending unit (carried over if it was missed earlier)
 *      future    → remaining units in order, skipping off-days
 *  - D-Day = original D-Day + missed days + days off − sessions finished ahead of schedule
 *    (so it moves one day per missed day, and one day back per session you get ahead on).
 */
(function (root) {
  const DAY = 86400000;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  const fmt = (t) => new Date(t).toISOString().slice(0, 10);
  const addDays = (s, n) => fmt(parse(s) + n * DAY);
  const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / DAY);
  const dow = (s) => new Date(parse(s)).getUTCDay(); // 0 = Sun
  const isWeekend = (s) => { const d = dow(s); return d === 0 || d === 6; };
  const todayStr = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  };

  function parseItem(text, id, track) {
    let label = text, url = null;
    const at = text.lastIndexOf('@');
    if (at > 0 && /^[a-z0-9-]+$/.test(text.slice(at + 1))) {
      label = text.slice(0, at);
      url = `https://leetcode.com/problems/${text.slice(at + 1)}/`;
    } else if (/\((GfG|CodeStudio)\)/.test(text)) {
      url = 'https://www.google.com/search?q=' + encodeURIComponent(text.replace(/[()]/g, ''));
    }
    return { id, text: label, url, track };
  }

  function buildUnits(weeks, revision) {
    const wd = [], we = [], byId = {}, items = {};
    const add = (u, q) => { q.push(u); byId[u.id] = u; u.items.forEach((it) => { items[it.id] = it; it.unit = u.id; }); };
    weeks.forEach((w, wi) => {
      const n = wi + 1;
      w.days.forEach((d, di) => {
        const id = `w${n}d${di + 1}`;
        add({ id, queue: 'wd', week: n, topic: w.topic, kind: 'Weekday', hours: '1.5h', title: d[0],
          items: d.slice(1).map((t, k) => parseItem(t, `${id}.${k}`, 'DSA')) }, wd);
      });
      const sid = `w${n}sat`;
      const sat = [...w.sat.map((t) => [t, 'DSA']), ...w.sd.slice(1).map((t) => [t, 'SD'])];
      add({ id: sid, queue: 'we', week: n, topic: w.topic, kind: 'Saturday', hours: '4–5h',
        title: `${w.sd[0]} + deep DSA`,
        items: sat.map(([t, tr], k) => parseItem(t, `${sid}.${k}`, tr)) }, we);
      const uid = `w${n}sun`;
      const sunTrack = n >= 15 ? 'Career' : 'Project';
      const sun = [...w.sun.slice(1).map((t) => [t, sunTrack]), ...(n <= 16 ? revision.slice(1).map((t) => [t, 'Revision']) : [])];
      add({ id: uid, queue: 'we', week: n, topic: w.topic, kind: 'Sunday', hours: '4–5h', title: w.sun[0],
        items: sun.map(([t, tr], k) => parseItem(t, `${uid}.${k}`, tr)) }, we);
    });
    return { wd, we, byId, items, all: [...wd, ...we] };
  }

  function doneOn(unit, checks) {
    let max = null;
    for (const it of unit.items) {
      const c = checks[it.id];
      if (!c) return null;
      if (!max || c > max) max = c;
    }
    return max;
  }

  /** Schedule assuming nothing is ever missed — gives the original D-Day and each unit's planned date. */
  function baseline(units, start) {
    const ptr = { wd: 0, we: 0 }, date = {};
    let d = start, last = start;
    while (ptr.wd < units.wd.length || ptr.we < units.we.length) {
      const q = isWeekend(d) ? 'we' : 'wd';
      if (ptr[q] < units[q].length) { date[units[q][ptr[q]++].id] = d; last = d; }
      d = addDays(d, 1);
    }
    return { date, dday: last };
  }

  function buildSchedule(units, state, today) {
    const off = state.offDays || {}, checks = state.checks || {};
    const done = {};
    units.all.forEach((u) => { done[u.id] = doneOn(u, checks); });
    const ptr = { wd: 0, we: 0 };
    const byDate = {}, unitDate = {};
    let d = state.startDate, last = state.startDate, guard = 0;
    let missed = 0, ahead = 0, offCount = 0;
    const push = (date, u, status, extra) => {
      (byDate[date] ||= { off: false, entries: [] }).entries.push({ unit: u, status, ...extra });
      unitDate[u.id] = date; last = date;
    };
    const pending = () => ptr.wd < units.wd.length || ptr.we < units.we.length;

    while ((d <= today || pending()) && guard++ < 3000) {
      const q = isWeekend(d) ? 'we' : 'wd';
      const Q = units[q];
      if (off[d]) { byDate[d] = { off: true, entries: [] }; offCount++; d = addDays(d, 1); continue; }

      if (d <= today) {
        if (ptr[q] < Q.length) {
          const u = Q[ptr[q]];
          if (done[u.id] && done[u.id] <= d) {
            push(d, u, 'done'); ptr[q]++;
            // Extra units finished the same day (getting ahead) are attached to this day too.
            while (ptr[q] < Q.length && done[Q[ptr[q]].id] && done[Q[ptr[q]].id] <= d) { push(d, Q[ptr[q]], 'done', { bonus: true }); ptr[q]++; ahead++; }
          } else if (d < today) {
            push(d, u, 'missed'); missed++;
          } else {
            push(d, u, 'today'); ptr[q]++;
          }
        }
      } else {
        // Future sessions already finished (done ahead of time) free up their slot.
        while (ptr[q] < Q.length && done[Q[ptr[q]].id]) { unitDate[Q[ptr[q]].id] = done[Q[ptr[q]].id]; ptr[q]++; ahead++; }
        if (ptr[q] < Q.length) push(d, Q[ptr[q]++], 'upcoming');
      }
      d = addDays(d, 1);
    }
    // Units finished out of order before their slot (rare) — record their done date.
    units.all.forEach((u) => { if (!unitDate[u.id] && done[u.id]) unitDate[u.id] = done[u.id]; });

    // D-Day moves day-for-day: +1 per missed day or day off, −1 per session finished ahead of schedule.
    const base = baseline(units, state.startDate);
    const slip = missed + offCount - ahead;
    let dday = addDays(base.dday, slip);
    const allDone = units.all.every((u) => done[u.id]);
    if (allDone) dday = units.all.map((u) => done[u.id]).sort().pop();
    else if (dday < today) dday = today;
    return { byDate, unitDate, done, dday, end: last, slip, missed, ahead, offCount };
  }

  const api = { DAY, parse, fmt, addDays, diffDays, dow, isWeekend, todayStr, parseItem, buildUnits, doneOn, baseline, buildSchedule };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Core = api;
})(this);
