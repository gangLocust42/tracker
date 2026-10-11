/* Switch Tracker — UI, storage and optional GitHub Gist sync. Vanilla JS, no build step. */
(() => {
  'use strict';
  const C = window.Core;
  const units = C.buildUnits(PLAN_WEEKS, SUNDAY_REVISION);
  const TRACKS = ['DSA', 'SD', 'Project', 'Revision', 'Career'];
  const TRACK_NAME = { DSA: 'DSA', SD: 'System Design', Project: 'Project', Revision: 'Revision', Career: 'Career' };
  const KEY = 'switchTracker.v1', SYNC_KEY = 'switchTracker.sync', UI_KEY = 'switchTracker.ui';
  const GIST_FILE = 'switch-tracker.json';
  const $view = document.getElementById('view');

  /* ---------------- storage ---------------- */
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const normalize = (s) => ({
    v: 1, updatedAt: 0, startDate: PLAN_START, offDays: {}, checks: {}, notes: {}, flags: {},
    ...(s || {}),
  });
  let state = normalize(ls.get(KEY));
  const ui = { tab: 'today', calMonth: null, calSel: null, ...(ls.get(UI_KEY) || {}) };
  let resetArmed = false;

  function persist() { ls.set(KEY, state); }
  function save(rerender = true) {
    state.updatedAt = Date.now();
    persist();
    Sync.schedulePush();
    if (rerender) render();
  }

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const D = (s) => new Date(C.parse(s));
  const fmt = (s, o) => D(s).toLocaleDateString('en-GB', { timeZone: 'UTC', ...o });
  const fDay = (s) => fmt(s, { weekday: 'short', day: 'numeric', month: 'short' });
  const fLong = (s) => fmt(s, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const plural = (n, w) => `${n} ${w}${Math.abs(n) === 1 ? '' : 's'}`;
  const ICON = {
    link: '<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
  };
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------------- derived data ---------------- */
  function compute() {
    const today = C.todayStr();
    const base = C.baseline(units, state.startDate);
    const sched = C.buildSchedule(units, state, today);
    const totalItems = Object.keys(units.items).length;
    const checked = Object.keys(state.checks).filter((k) => units.items[k]).length;
    return { today, base, sched, totalItems, checked, slip: C.diffDays(base.dday, sched.dday), left: C.diffDays(today, sched.dday) };
  }

  function unitStatus(u, m) {
    if (m.sched.done[u.id]) return 'done';
    const d = m.sched.unitDate[u.id];
    if (d === m.today) return 'today';
    if (m.base.date[u.id] < m.today) return 'late';
    return '';
  }

  /* ---------------- components ---------------- */
  function itemRow(it) {
    const on = !!state.checks[it.id], fl = !!state.flags[it.id];
    return `<li class="item">
      <label><input type="checkbox" data-check="${it.id}" ${on ? 'checked' : ''} aria-label="${esc(it.text)}"><span class="txt">${esc(it.text)}</span></label>
      ${it.url ? `<a class="icon-btn" href="${esc(it.url)}" target="_blank" rel="noopener" title="Open problem" aria-label="Open ${esc(it.text)}">${ICON.link}</a>` : ''}
      <button class="icon-btn ${fl ? 'flagged' : ''}" data-flag="${it.id}" title="${fl ? 'Remove from revision list' : 'Flag for revision'}" aria-pressed="${fl}">${ICON.flag}</button>
    </li>`;
  }

  function itemGroups(u) {
    return TRACKS.map((t) => {
      const its = u.items.filter((i) => i.track === t);
      if (!its.length) return '';
      const n = its.filter((i) => state.checks[i.id]).length;
      return `<div class="track-head" style="--c:var(--${t})">${TRACK_NAME[t]} <span>${n}/${its.length}</span></div><ul class="items">${its.map(itemRow).join('')}</ul>`;
    }).join('');
  }

  function unitCard(u, m, { status = '', date = null, actions = true } = {}) {
    const planned = m.base.date[u.id];
    const carried = date && planned && planned < date && status !== 'done';
    const isDone = !!m.sched.done[u.id];
    return `<article class="card ${isDone ? 'is-done' : status === 'missed' ? 'is-missed' : ''}">
      <div class="unit-meta"><span>Week ${u.week}</span><i class="dot"></i><span>${u.kind}</span><i class="dot"></i><span>${u.hours}</span><i class="dot"></i><span>${esc(u.topic)}</span></div>
      <h3 class="unit-title">${esc(u.title)}</h3>
      ${carried ? `<div class="carried">Carried over · originally planned for ${fDay(planned)}</div>` : ''}
      ${itemGroups(u)}
      <textarea data-note="${u.id}" placeholder="Notes — where you got stuck, key idea, complexity…">${esc(state.notes[u.id] || '')}</textarea>
      ${actions ? `<div class="actions">
        ${isDone ? '' : `<button class="btn primary" data-act="complete" data-unit="${u.id}">Mark all done</button>`}
        ${status === 'missed' ? `<button class="btn" data-act="done-on" data-unit="${u.id}" data-date="${date}">I did it on ${fDay(date)}</button>` : ''}
      </div>` : ''}
    </article>`;
  }

  function chipsFor(u) {
    return [...new Set(u.items.map((i) => i.track))].map((t) => `<span class="chip" style="--c:var(--${t})">${TRACK_NAME[t]}</span>`).join('');
  }

  function hero(m) {
    const slip = m.slip;
    const pill = slip > 0 ? `<span class="pill bad">+${plural(slip, 'day')} slipped</span>`
      : slip < 0 ? `<span class="pill ok">${plural(-slip, 'day')} ahead</span>`
      : `<span class="pill ok">On track</span>`;
    const p = pct(m.checked, m.totalItems);
    return `<section class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">D-Day</div>
          <div class="count">${Math.max(0, m.left)}<small>${m.left === 1 ? 'day' : 'days'} left</small></div>
          <div class="dday-date">${fLong(m.sched.dday)}</div>
        </div>
        ${pill}
      </div>
      <div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>
      <div class="hero-foot"><span>${p}% of plan done</span><span>${slip !== 0 ? `Original: ${fDay(m.base.dday)}` : `${m.checked}/${m.totalItems} tasks`}</span></div>
    </section>`;
  }

  /* ---------------- views ---------------- */
  function viewToday(m) {
    const { today, sched } = m;
    const day = sched.byDate[today];
    let html = hero(m);
    html += `<div class="section-title"><span>Today · ${fDay(today)}</span><span>${C.isWeekend(today) ? 'Weekend · 4–5h' : 'Weekday · 1.5h'}</span></div>`;

    const futureDates = Object.keys(sched.byDate).filter((d) => d > today).sort();
    const nextEntry = futureDates.map((d) => ({ d, e: sched.byDate[d].entries[0] })).find((x) => x.e);

    if (today < state.startDate) {
      html += `<div class="card empty"><strong>Plan starts ${fLong(state.startDate)}</strong>Tomorrow's work is below — you can start early if you like.</div>`;
      if (nextEntry) html += `<div class="section-title"><span>First up · ${fDay(nextEntry.d)}</span></div>` + unitCard(nextEntry.e.unit, m, { status: 'upcoming', date: nextEntry.d });
    } else if (day && day.off) {
      html += `<div class="card empty"><strong>Day off 🌴</strong>Everything after today shifted by one slot.<div class="actions" style="justify-content:center"><button class="btn" data-act="off" data-date="${today}">Undo day off</button></div></div>`;
    } else if (!day || !day.entries.length) {
      html += `<div class="card empty"><strong>Nothing scheduled today</strong>This queue is finished. Nice.</div>`;
    } else {
      const allDone = day.entries.every((e) => e.status === 'done');
      if (allDone) html += `<div class="done-banner">${ICON.check}<span>Today's work is done${day.entries.length > 1 ? ` — plus ${day.entries.length - 1} ahead` : ''}. </span></div>`;
      html += day.entries.map((e) => unitCard(e.unit, m, { status: e.status, date: today })).join('');
      if (!allDone) html += `<div class="actions"><button class="btn ghost" data-act="off" data-date="${today}">Can't study today — take a day off</button></div>`;
      if (allDone && nextEntry) {
        html += `<div class="section-title"><span>Get ahead (optional)</span><span>${fDay(nextEntry.d)}</span></div>` + unitCard(nextEntry.e.unit, m, { status: 'upcoming', date: nextEntry.d });
      }
    }

    // Up next
    const upcoming = futureDates.filter((d) => sched.byDate[d].off || sched.byDate[d].entries.length).slice(0, 7);
    if (upcoming.length) {
      html += `<div class="section-title"><span>Coming up</span></div><div class="list">` + upcoming.map((d) => {
        const b = sched.byDate[d];
        const u = b.entries[0]?.unit;
        return `<div class="row"><div class="when"><b>${D(d).getUTCDate()}</b><span>${fmt(d, { weekday: 'short' })}</span></div>
          <div class="what">${b.off ? '<div class="muted">Day off</div>' : `<div>${esc(u.title)}</div><div class="chips">${chipsFor(u)}<span class="chip" style="--c:var(--muted)">${u.hours}</span></div>`}</div></div>`;
      }).join('') + `</div>`;
    }
    return html;
  }

  function dayStatus(b) {
    if (!b) return 'none';
    if (b.off) return 'off';
    if (!b.entries.length) return 'none';
    if (b.entries.some((e) => e.status === 'missed')) return 'missed';
    if (b.entries.every((e) => e.status === 'done')) return 'done';
    if (b.entries.some((e) => e.status === 'today')) return 'today';
    return 'up';
  }

  function viewCalendar(m) {
    const { today, sched } = m;
    if (!ui.calMonth) ui.calMonth = (today < state.startDate ? state.startDate : today).slice(0, 7);
    if (!ui.calSel) ui.calSel = today < state.startDate ? state.startDate : today;
    const [y, mo] = ui.calMonth.split('-').map(Number);
    const first = `${ui.calMonth}-01`;
    const lead = (C.dow(first) + 6) % 7;
    const nDays = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    const title = D(first).toLocaleDateString('en-GB', { timeZone: 'UTC', month: 'long', year: 'numeric' });

    let cells = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<div class="cal-dow">${d}</div>`).join('');
    cells += '<div class="cal-day blank"></div>'.repeat(lead);
    for (let i = 1; i <= nDays; i++) {
      const d = `${ui.calMonth}-${String(i).padStart(2, '0')}`;
      const b = sched.byDate[d];
      const st = dayStatus(b);
      const tracks = b && !b.off ? [...new Set(b.entries.flatMap((e) => e.unit.items.map((x) => x.track)))].slice(0, 4) : [];
      cells += `<button class="cal-day s-${st} ${d === today ? 'is-today' : ''} ${d === ui.calSel ? 'is-sel' : ''} ${d === sched.dday ? 'is-dday' : ''}" data-act="cal-day" data-date="${d}" aria-label="${fLong(d)}: ${st}">
        <span class="n">${i}</span><span class="marks">${tracks.map((t) => `<i style="background:var(--${t})"></i>`).join('')}</span></button>`;
    }

    let html = `<div class="cal-head"><button class="btn ghost" data-act="cal-prev" aria-label="Previous month">‹</button><h2>${title}</h2><button class="btn ghost" data-act="cal-next" aria-label="Next month">›</button></div>
      <div class="cal-grid">${cells}</div>
      <div class="legend">
        <span><i style="background:var(--ok-soft);border:1px solid var(--ok)"></i>Done</span>
        <span><i style="background:var(--bad-soft);border:1px solid var(--bad)"></i>Missed</span>
        <span><i style="border:2px solid var(--accent)"></i>Today</span>
        <span><i style="background:var(--off)"></i>Day off</span>
        <span>🎯 D-Day</span>
      </div>`;

    // Selected day detail
    const d = ui.calSel, b = sched.byDate[d];
    html += `<div class="section-title"><span>${fLong(d)}</span><span>${d === sched.dday ? '🎯 D-Day' : ''}</span></div>`;
    if (d < state.startDate) {
      html += `<div class="card empty">Before the plan starts.</div>`;
    } else if (b && b.off) {
      html += `<div class="card empty"><strong>Day off</strong><div class="actions" style="justify-content:center"><button class="btn" data-act="off" data-date="${d}">Remove day off</button></div></div>`;
    } else {
      if (b && b.entries.length) html += b.entries.map((e) => unitCard(e.unit, m, { status: e.status, date: d })).join('');
      else html += `<div class="card empty">Nothing scheduled.</div>`;
      html += `<div class="actions"><button class="btn ghost" data-act="off" data-date="${d}">Mark ${fDay(d)} as a day off</button></div>`;
    }
    return html;
  }

  function viewRoadmap(m) {
    const curWeek = (() => {
      const t = m.sched.byDate[m.today];
      if (t && t.entries[0]) return t.entries[0].unit.week;
      const next = units.wd.find((u) => !m.sched.done[u.id]);
      return next ? next.week : PLAN_WEEKS.length;
    })();
    let html = hero(m) + `<div class="section-title"><span>17-week roadmap</span><span>tap a week</span></div>`;
    PLAN_WEEKS.forEach((w, wi) => {
      const n = wi + 1;
      const us = units.all.filter((u) => u.week === n);
      const its = us.flatMap((u) => u.items);
      const done = its.filter((i) => state.checks[i.id]).length;
      const dates = us.map((u) => m.sched.unitDate[u.id]).filter(Boolean).sort();
      const full = done === its.length;
      html += `<details class="week" ${n === curWeek ? 'open' : ''}>
        <summary><div class="wk-num ${full ? 'full' : n === curWeek ? 'current' : ''}">W${n}</div>
          <div class="wk-body"><div class="t">${esc(w.topic)}</div>
            <div class="small muted">${dates.length ? `${fDay(dates[0])} – ${fDay(dates[dates.length - 1])}` : ''} · ${done}/${its.length}</div>
            <div class="bar"><i style="width:${pct(done, its.length)}%"></i></div></div></summary>
        <div class="wk-inner">${us.map((u) => {
          const st = unitStatus(u, m);
          return `<details class="wk-unit"><summary><span class="status-dot ${st}"></span>
            <div style="flex:1;min-width:0"><div style="font-weight:600">${esc(u.title)}</div>
            <div class="small muted">${u.kind} · ${m.sched.unitDate[u.id] ? fDay(m.sched.unitDate[u.id]) : ''}${st === 'late' ? ' · behind' : ''}</div></div></summary>
            ${itemGroups(u)}</details>`;
        }).join('')}</div></details>`;
    });
    return html;
  }

  function viewProgress(m) {
    const { sched, today } = m;
    // streaks
    let streak = 0, best = 0, missed = 0;
    Object.keys(sched.byDate).filter((d) => d <= today).sort().forEach((d) => {
      const st = dayStatus(sched.byDate[d]);
      if (st === 'done') { streak++; best = Math.max(best, streak); }
      else if (st === 'missed') { streak = 0; missed++; }
    });
    const dsa = Object.values(units.items).filter((i) => i.track === 'DSA');
    const dsaDone = dsa.filter((i) => state.checks[i.id]).length;

    let html = `<div class="section-title" style="margin-top:4px"><span>Progress</span></div><div class="tiles">
      <div class="tile"><div class="v">${pct(m.checked, m.totalItems)}%</div><div class="l">Plan complete</div></div>
      <div class="tile"><div class="v">${dsaDone}<span class="muted" style="font-size:15px">/${dsa.length}</span></div><div class="l">DSA tasks solved</div></div>
      <div class="tile"><div class="v">${streak}🔥</div><div class="l">Day streak · best ${best}</div></div>
      <div class="tile"><div class="v">${missed}</div><div class="l">Days missed · ${m.slip > 0 ? `+${m.slip}d slip` : 'no slip'}</div></div>
    </div>`;

    html += `<div class="section-title"><span>By track</span></div><div class="card">` + TRACKS.map((t) => {
      const its = Object.values(units.items).filter((i) => i.track === t);
      const n = its.filter((i) => state.checks[i.id]).length;
      return `<div class="track-row" style="--c:var(--${t})"><span style="font-weight:600;font-size:13px">${TRACK_NAME[t]}</span><div class="bar"><i style="width:${pct(n, its.length)}%"></i></div><span class="n">${n}/${its.length}</span></div>`;
    }).join('') + `</div>`;

    // heatmap: Monday of start week → D-Day
    const counts = {};
    Object.entries(state.checks).forEach(([, d]) => { counts[d] = (counts[d] || 0) + 1; });
    const s0 = C.addDays(state.startDate, -((C.dow(state.startDate) + 6) % 7));
    const end = sched.dday > today ? sched.dday : today;
    let cells = '';
    for (let d = s0; d <= end || (C.dow(d) + 6) % 7 !== 0; d = C.addDays(d, 1)) {
      const c = counts[d] || 0;
      const lvl = c === 0 ? '' : c <= 2 ? 'l1' : c <= 4 ? 'l2' : 'l3';
      cells += `<i class="${lvl} ${d > today ? 'fut' : ''} ${d === today ? 't' : ''}" title="${fDay(d)}: ${c} done"></i>`;
    }
    html += `<div class="section-title"><span>Activity</span><span>Mon → Sun ↓</span></div><div class="card heat-wrap"><div class="heat">${cells}</div></div>`;

    // revision list
    const flagged = Object.keys(state.flags).filter((k) => state.flags[k] && units.items[k]).map((k) => units.items[k]);
    html += `<div class="section-title"><span>Revision list</span><span>${flagged.length}</span></div>`;
    html += flagged.length
      ? `<div class="card"><ul class="items">${flagged.map(itemRow).join('')}</ul><p class="help">Re-solve these on Fridays and Sundays. Tap the flag to remove.</p></div>`
      : `<div class="card empty">Flag any problem you struggled with (⚑) and it shows up here for revision.</div>`;
    return html;
  }

  function viewSettings(m) {
    const s = Sync.cfg;
    const offs = Object.keys(state.offDays).filter((d) => state.offDays[d]).sort();
    return `<div class="section-title" style="margin-top:4px"><span>Sync across devices</span></div>
    <div class="card">
      <div class="sync-status ${s.token ? (Sync.error ? 'err' : 'on') : ''}"><i></i>${s.token ? (Sync.error ? `Sync error: ${esc(Sync.error)}` : `Synced with GitHub Gist${Sync.lastAt ? ` · ${new Date(Sync.lastAt).toLocaleTimeString()}` : ''}`) : 'Not syncing — progress is saved on this device only'}</div>
      ${s.token ? `<div class="actions"><button class="btn primary" data-act="sync-now">Sync now</button><button class="btn danger" data-act="sync-off">Disconnect</button></div>`
      : `<div class="help"><ol>
          <li>On GitHub: Settings → Developer settings → Personal access tokens → <b>Tokens (classic)</b> → Generate new token.</li>
          <li>Tick only the <b>gist</b> scope. Set expiry to cover your plan (e.g. 180 days).</li>
          <li>Paste it below on <b>every</b> device (laptop + phone). They'll share one private gist.</li></ol></div>
        <label class="field"><span>GitHub token</span><input type="password" id="tok" placeholder="ghp_…" autocomplete="off"></label>
        <button class="btn primary" data-act="sync-on">Connect</button>`}
      <p class="help">The token is stored only in this browser. Use a token with just the gist scope.</p>
    </div>

    <div class="section-title"><span>Plan</span></div>
    <div class="card">
      <label class="field"><span>Start date (Week 1 Monday)</span><input type="date" id="start" value="${state.startDate}"></label>
      <button class="btn" data-act="set-start">Save start date</button>
      <p class="help">Original D-Day for this start: <b>${fLong(m.base.dday)}</b> · current: <b>${fLong(m.sched.dday)}</b></p>
    </div>

    <div class="section-title"><span>Planned days off</span><span>${offs.length}</span></div>
    <div class="card">
      <label class="field"><span>Add a day off (travel, wedding, crunch…)</span><input type="date" id="offd" min="${state.startDate}"></label>
      <button class="btn" data-act="add-off">Add day off</button>
      ${offs.length ? `<ul class="items" style="margin-top:10px">${offs.map((d) => `<li class="item"><span style="flex:1;padding:10px 0">${fLong(d)}</span><button class="btn ghost" data-act="off" data-date="${d}">Remove</button></li>`).join('')}</ul>` : ''}
    </div>

    <div class="section-title"><span>Backup</span></div>
    <div class="card">
      <div class="actions" style="margin-top:0">
        <button class="btn" data-act="export">Export JSON</button>
        <label class="btn" style="display:inline-flex;align-items:center">Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label>
        <button class="btn danger" data-act="reset">${resetArmed ? 'Tap again to erase everything' : 'Reset progress'}</button>
      </div>
      <p class="help">${units.all.length} sessions · ${m.totalItems} tasks · edit <code>plan.js</code> in your repo to change the plan.</p>
    </div>`;
  }

  /* ---------------- render ---------------- */
  function render() {
    const m = compute();
    const views = { today: viewToday, calendar: viewCalendar, roadmap: viewRoadmap, progress: viewProgress, settings: viewSettings };
    $view.innerHTML = (views[ui.tab] || viewToday)(m);
    document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === ui.tab));
    renderChrome(m);
    ls.set(UI_KEY, { tab: ui.tab });
  }

  function currentWeek(m) {
    const t = m.sched.byDate[m.today];
    if (t && t.entries[0]) return t.entries[0].unit.week;
    const next = units.all.find((u) => !m.sched.done[u.id]);
    return next ? next.week : PLAN_WEEKS.length;
  }

  function renderChrome(m) {
    const TITLES = { today: 'Today', calendar: 'Calendar', roadmap: 'Roadmap', progress: 'Progress', settings: 'Settings' };
    const wk = currentWeek(m);
    const started = m.today >= state.startDate;
    document.getElementById('hdr-title').textContent = TITLES[ui.tab] || 'Today';
    document.getElementById('hdr-sub').textContent = `${fDay(m.today).replace(',', '')} · ${started ? `Week ${wk}/${PLAN_WEEKS.length}` : 'starts ' + fDay(state.startDate)}`;
    document.title = `${TITLES[ui.tab]} · Switch Tracker`;

    const chip = document.getElementById('hdr-dday');
    chip.className = 'dday-chip ' + (m.slip > 0 ? 'bad' : m.slip < 0 ? 'ok' : '');
    chip.innerHTML = `🎯 ${Math.max(0, m.left)}d${m.slip ? ` <span>${m.slip > 0 ? '+' : '−'}${Math.abs(m.slip)}</span>` : ''}`;
    chip.title = `D-Day ${fLong(m.sched.dday)}${m.slip ? ` (${m.slip > 0 ? '+' : ''}${m.slip} days vs plan)` : ''}`;

    const dot = document.getElementById('hdr-sync');
    dot.className = 'sync-dot ' + (Sync.cfg.token ? (Sync.error ? 'err' : 'on') : '');
    dot.title = Sync.cfg.token ? (Sync.error ? 'Sync error — tap for details' : 'Synced across devices') : 'Saved on this device only — tap to set up sync';

    const remaining = units.all.filter((u) => !m.sched.done[u.id]).length;
    document.getElementById('foot').innerHTML = `
      <div class="foot-stats">
        <div><b>${m.checked}/${m.totalItems}</b>tasks done</div>
        <div><b>${remaining}</b>sessions left</div>
        <div><b>${fDay(m.sched.dday).replace(/^\w+, /, '')}</b>D-Day</div>
      </div>
      <div class="foot-links">
        <span>${Sync.cfg.token ? (Sync.error ? '⚠ Sync error' : '☁ Synced via GitHub Gist') : '💾 Saved on this device'}</span>
        <span><button data-goto="settings">Backup</button> · <button data-goto="calendar">Plan a day off</button></span>
      </div>
      <div>Switch Tracker · 17-week plan · started ${fDay(state.startDate)}</div>`;
  }

  // Header/footer shortcuts
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-goto]');
    if (!g) return;
    ui.tab = g.dataset.goto; render(); window.scrollTo(0, 0);
  });

  /* ---------------- events ---------------- */
  document.querySelector('.tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tab]');
    if (!b) return;
    ui.tab = b.dataset.tab; resetArmed = false;
    render(); window.scrollTo(0, 0);
  });

  $view.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.check) {
      const id = t.dataset.check;
      if (t.checked) state.checks[id] = C.todayStr(); else delete state.checks[id];
      const u = units.byId[units.items[id].unit];
      save();
      if (t.checked && C.doneOn(u, state.checks)) toast('Session complete 🎉');
    } else if (t.id === 'imp' && t.files[0]) {
      t.files[0].text().then((txt) => {
        try {
          const s = JSON.parse(txt);
          if (!s.checks || !s.startDate) throw new Error('Not a tracker backup');
          state = normalize(s); save(); toast('Imported ✓');
        } catch (err) { toast('Import failed: ' + err.message); }
      });
    }
  });

  $view.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.note) {
      if (t.value) state.notes[t.dataset.note] = t.value; else delete state.notes[t.dataset.note];
      save(false);
    }
  });

  $view.addEventListener('click', (e) => {
    const f = e.target.closest('[data-flag]');
    if (f) { const id = f.dataset.flag; if (state.flags[id]) delete state.flags[id]; else state.flags[id] = true; save(); return; }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const { act, unit, date } = a.dataset;
    switch (act) {
      case 'complete': {
        const t = C.todayStr();
        units.byId[unit].items.forEach((i) => { if (!state.checks[i.id]) state.checks[i.id] = t; });
        save(); toast('Session complete 🎉'); break;
      }
      case 'done-on':
        units.byId[unit].items.forEach((i) => { state.checks[i.id] = date; });
        save(); toast(`Logged as done on ${fDay(date)}`); break;
      case 'off':
        if (state.offDays[date]) { delete state.offDays[date]; toast('Day off removed'); }
        else { state.offDays[date] = true; toast(`${fDay(date)} is a day off — plan shifted`); }
        save(); break;
      case 'add-off': {
        const v = document.getElementById('offd').value;
        if (!v) { toast('Pick a date first'); break; }
        state.offDays[v] = true; save(); toast(`${fDay(v)} added as a day off`); break;
      }
      case 'cal-day': ui.calSel = date; render(); break;
      case 'cal-prev': case 'cal-next': {
        let [y, mo] = ui.calMonth.split('-').map(Number);
        mo += act === 'cal-next' ? 1 : -1;
        if (mo < 1) { mo = 12; y--; } if (mo > 12) { mo = 1; y++; }
        ui.calMonth = `${y}-${String(mo).padStart(2, '0')}`; render(); break;
      }
      case 'set-start': {
        const v = document.getElementById('start').value;
        if (!v) break;
        state.startDate = v; ui.calMonth = null; ui.calSel = null; save(); toast('Start date updated'); break;
      }
      case 'export': {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement('a'), { href: url, download: `switch-tracker-${C.todayStr()}.json` });
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000); break;
      }
      case 'reset':
        if (!resetArmed) { resetArmed = true; render(); setTimeout(() => { resetArmed = false; if (ui.tab === 'settings') render(); }, 4000); break; }
        resetArmed = false;
        state = normalize({ startDate: state.startDate }); save(); toast('Progress reset'); break;
      case 'sync-on': {
        const tok = document.getElementById('tok').value.trim();
        if (!tok) { toast('Paste a token first'); break; }
        Sync.connect(tok); break;
      }
      case 'sync-now': Sync.pushNow(); break;
      case 'sync-off': Sync.disconnect(); break;
    }
  });

  /* ---------------- GitHub Gist sync (optional) ---------------- */
  const Sync = {
    cfg: { token: '', gistId: '', lastRemoteAt: 0, ...(ls.get(SYNC_KEY) || {}) },
    error: '', lastAt: 0, timer: null, dirty: false, busy: false,
    saveCfg() { ls.set(SYNC_KEY, this.cfg); },
    async api(path, opts = {}) {
      const res = await fetch('https://api.github.com' + path, {
        ...opts,
        headers: { Authorization: `Bearer ${this.cfg.token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(res.status === 401 ? 'token rejected (401)' : `GitHub ${res.status}`);
      return res.json();
    },
    async readRemote() {
      const g = await this.api(`/gists/${this.cfg.gistId}`);
      const f = g.files[GIST_FILE];
      if (!f) return null;
      const txt = f.truncated ? await (await fetch(f.raw_url)).text() : f.content;
      return normalize(JSON.parse(txt));
    },
    ok() { const was = this.error; this.error = ''; this.lastAt = Date.now(); if (ui.tab === 'settings' || was) render(); },
    fail(err) { this.error = err.message || String(err); render(); },
    async connect(token) {
      this.cfg.token = token; this.error = '';
      try {
        const list = await this.api('/gists?per_page=100');
        const found = list.find((g) => g.files && g.files[GIST_FILE]);
        if (found) {
          this.cfg.gistId = found.id; this.cfg.lastRemoteAt = 0; this.saveCfg();
          const remote = await this.readRemote();
          if (remote && remote.updatedAt > state.updatedAt) { state = remote; persist(); this.cfg.lastRemoteAt = remote.updatedAt; this.saveCfg(); toast('Connected — loaded your progress'); }
          else { await this.pushNow(true); toast('Connected — synced'); }
        } else {
          const g = await this.api('/gists', { method: 'POST', body: JSON.stringify({ description: 'Switch Tracker progress', public: false, files: { [GIST_FILE]: { content: JSON.stringify(state) } } }) });
          this.cfg.gistId = g.id; this.cfg.lastRemoteAt = state.updatedAt; this.saveCfg(); toast('Connected — created private gist');
        }
        this.ok(); render();
      } catch (err) { this.cfg.token = ''; this.saveCfg(); this.fail(err); toast('Could not connect: ' + err.message); }
    },
    disconnect() { this.cfg = { token: '', gistId: '', lastRemoteAt: 0 }; this.saveCfg(); this.error = ''; render(); toast('Sync disconnected'); },
    schedulePush() {
      if (!this.cfg.token) return;
      this.dirty = true; clearTimeout(this.timer);
      this.timer = setTimeout(() => this.pushNow(true), 1500);
    },
    async pushNow(silent) {
      if (!this.cfg.token || !this.cfg.gistId || this.busy) return;
      this.busy = true;
      try {
        const remote = await this.readRemote();
        if (remote && remote.updatedAt > this.cfg.lastRemoteAt && remote.updatedAt !== state.updatedAt) {
          // Changed on another device since our last sync → merge (union, this device wins on conflicts).
          for (const k of ['checks', 'flags', 'offDays', 'notes']) state[k] = { ...remote[k], ...state[k] };
          state.updatedAt = Date.now(); persist(); render();
        }
        await this.api(`/gists/${this.cfg.gistId}`, { method: 'PATCH', body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(state) } } }) });
        this.cfg.lastRemoteAt = state.updatedAt; this.saveCfg(); this.dirty = false;
        this.ok(); if (!silent) toast('Synced ✓');
      } catch (err) { this.fail(err); if (!silent) toast('Sync failed: ' + err.message); }
      finally { this.busy = false; }
    },
    async pull() {
      if (!this.cfg.token || !this.cfg.gistId || this.dirty || this.busy) return;
      try {
        const remote = await this.readRemote();
        if (remote && remote.updatedAt > state.updatedAt) {
          state = remote; persist(); this.cfg.lastRemoteAt = remote.updatedAt; this.saveCfg(); render();
        }
        this.ok();
      } catch (err) { this.fail(err); }
    },
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { render(); Sync.pull(); }
    else if (Sync.dirty) Sync.pushNow(true);
  });

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

  render();
  Sync.pull();
})();
