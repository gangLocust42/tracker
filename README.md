# Switch Tracker

A tracker for a 17-week job-switch plan covering DSA (recursion → DP → trees/graphs → mixed practice), system design, a URL shortener and an AI project. It plans each day and has a **D-Day that moves when you miss a day**.

It's plain HTML, CSS and JS with no build step, so it runs on GitHub Pages as-is.

## Deploy on GitHub Pages (about 3 minutes)

1. Create a new repo on GitHub, e.g. `switch-tracker`. It can be public, or private if you have Pro.
2. Upload every file in this folder to the repo root (**Add file → Upload files**), or push from your terminal:
   ```bash
   git init && git add . && git commit -m "Switch tracker"
   git branch -M main
   git remote add origin https://github.com/<you>/switch-tracker.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save**.
4. After about a minute, the app is live at `https://<you>.github.io/switch-tracker/`.
5. **On your phone:** open that URL, then use **Add to Home Screen** (Safari Share menu, or the Chrome ⋮ menu). It opens full-screen like an app and works offline.

## Sync between phone and laptop

Progress is saved in each browser. To share it across devices:

1. On GitHub, go to **Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token**.
2. Tick only the **`gist`** scope.
3. In the app, open **Settings → paste token → Connect**. Do this on every device.

Your progress is stored in one private gist (`switch-tracker.json`). The app pulls whenever you open it and pushes about 1.5 seconds after each change.

## How the "moving D-Day" works

- Weekday sessions (1.5h) and weekend sessions (4–5h) are **two separate queues**, so a missed weekday never pushes a heavy weekend block onto a weekday evening.
- A session counts as done only when every task in it is ticked.
- If a day ends unfinished, that session carries over to the **next day of the same type**. Ticked tasks stay ticked, so only the unfinished ones remain.
- **D-Day moves automatically, one day at a time:**
  - **+1 day** for every past day whose session wasn't finished, and for every day off
  - **−1 day** for every session you finish ahead of schedule (tick any future day's tasks in Today, Calendar or Roadmap)
  - Catching up cancels out: miss Monday, do both Monday's and Tuesday's sessions on Tuesday, and you're back on track.
- **Day off:** mark a day in advance (Calendar or Settings) and the plan shifts around it.
- **Forgot to tick?** On a missed day in the Calendar, tap **"I did it on …"** to log it on that date.
- **⚑ Flag** a problem you struggled with to add it to the Revision list in the Progress tab.

## Editing the plan

All the content is in **`plan.js`**: one entry per week, with 5 weekdays, Saturday DSA, system design (`sd`) and Sunday (`sun`).

- Write `"Problem name@leetcode-slug"` to auto-link to a LeetCode problem.
- Items marked `(GfG)` or `(CodeStudio)` link to a Google search.
- Change `PLAN_START` or the start date in Settings to move the whole plan.

Tick state is keyed by position (e.g. week 3, day 2, task 1). Editing the text of future weeks is safe; reordering past weeks will shuffle their ticks.

## Files

| File | Purpose |
|---|---|
| `index.html`, `style.css`, `app.js` | UI (Today, Calendar, Roadmap, Progress, Settings) |
| `core.js` | Scheduling and slip logic (pure functions) |
| `plan.js` | The 17-week plan |
| `sw.js`, `manifest.webmanifest`, `icon*` | Installable PWA and offline support |
| `test.js` | `node test.js` runs the schedule tests |
