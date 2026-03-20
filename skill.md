# Stardust Dev Skills & Lessons Learned

## Build & Deploy

### How to build
```bash
npm run build
```
Outputs to `docs/` with stable filenames (`assets/index.js`, `assets/index.css`).

### Cache busting — do this manually after every build
The build **resets** `docs/index.html` to bare paths (no version). After running `npm run build`, you must re-add the query params:

```html
<script type="module" crossorigin src="/stardust/assets/index.js?v=20260320b"></script>
<link rel="stylesheet" crossorigin href="/stardust/assets/index.css?v=20260320b">
```

Version format: `YYYYMMDD`. Append a letter suffix (`b`, `c`, …) for same-day rebuilds.

### Lesson: always preview before committing docs/
The root cause of the mobile day view bug was that `docs/` had never been rebuilt after the feature was added. The stale bundle had none of the new code. Rebuild `docs/` as part of every fix that touches JS or CSS.

---

## Mobile / Responsive

### Breakpoint
Mobile styles apply at `max-width: 767px` (covers most phones including larger Android devices, not just iPhone ≤599px).

### Day view nav bar crowding
The `.cal-nav` bar on mobile must fit: `<` arrow · date label · Day/Week toggle · Today button · `>` arrow — all on one row.

"March 20, 2026" at 16px was too wide and caused the row to wrap to 2 lines. Fix: reduce `.cal-nav-title strong` to `13px` inside the `@media (max-width: 767px)` block.

**General rule**: when adding controls to the mobile nav bar, check that the date label still fits on one line. Prefer shrinking text over truncating or hiding controls.

### Day view default
On mobile, `calView` initialises to `'day'` via `window.matchMedia('(max-width: 767px)')`. Week view is still accessible via the toggle.

---

## Git / Branch workflow

- Feature branches: `claude/fix-<topic>-<sessionId>`
- Always push with `git push -u origin <branch-name>`
- Never push to a branch that doesn't start with `claude/`
