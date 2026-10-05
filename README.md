# astrocyte

A personal behavioural instrument. It watches five patterns, F1 Autopilot, F2 Easy belief, F3 Mimicry, F4 Rigidity and F5 Lost exploring, and reports what it observed and how sure it is. Every judgement shows its confidence and evidence and can be challenged. The instrument keeps score of its own accuracy.

Stack: Vite + React 18 + TypeScript + Tailwind v4, installable as a PWA. Android comes later via Capacitor, using the same code.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173/astrocyte/
npm run typecheck  # optional
```

Preview switches (phase 1 only):

| URL | Shows |
| --- | --- |
| `?day=flag` (default) | Today with one active flag (statement) |
| `?day=question` | Today asking instead of stating |
| `?day=quiet` | Today with nothing to report |
| `?data=thin` | Self-model on day 9 (thin data) |
| `?flag=27` | Opens the F3 flag the user challenged and won |

## Deploy to GitHub Pages (celeritas7.github.io/astrocyte)

1. Create a repo named **astrocyte** under `celeritas7` and push this folder to `main`.
2. In the repo, go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Each push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes the site.
4. On a phone, open the URL and use **Add to Home Screen**. It then runs full-screen and works offline.

If you rename the repo, change `base`, `start_url` and `scope` in `vite.config.ts` to match.

## Structure

```
src/
  App.tsx              tab state, flag routing, challenge sheet
  data/mock.ts         ALL phase-1 data (replace with Supabase in phase 2)
  lib/chart.ts         path builders, interpolation, seeded RNG
  lib/store.ts         localStorage (log entries, challenges, calendar edits, budget spends)
  components/          ui primitives, neural motifs, trajectory charts, tab bar, challenge sheet
  screens/             Today, FlagDetail, SelfModel, Habits, Log, Budget
```

## Tokens (src/index.css `@theme`)

- Surface: `bg #0A0A0F`, `panel #111118`, `line #1C1C25`, `line-2 #2A2A36`, `dendrite #2E2E3C`
- Ink: `ink-1 #ECECF1`, `ink-2 #A0A0AE`, `ink-3 #6E6E7E`, `ink-4 #3A3A47`
- Violet is the instrument: `violet #9B4FD1`, `violet-ink #B98BE6`
- Amber is you (challenges, lapses, the instrument being wrong): `amber #E0A458`
- Type: IBM Plex Sans for prose, IBM Plex Mono for every number and label (`.label` = 11px, uppercase, .08em tracking)
- Shape: radius 0, 1px hairlines, 20px gutter, hit targets of 44px or more
- Flag threshold 0.60. Bands are 80% intervals.

## Motion rules

Every motion effect is driven by data. Raster density shows pattern strength, edge spike rate shows co-movement, and only a firing node pulses. Settled things, such as withdrawn flags and missing data, don't move. A quiet day is completely still. When the OS reduced-motion setting is on, all motion is removed (`.signal` elements are hidden). Motion must never be used to push compliance.

## Phases

1. **Phase 1 (this):** app shell, all six screens on mock data, PWA on GitHub Pages.
2. **Phase 2: Supabase.** Add `@supabase/supabase-js` and copy `.env.example` to `.env.local`. Add auth for a single user (magic link). Tables `log_entries`, `challenges`, `habit_days`, `budget_spends`, with the Log screen writing real rows first. Replace `lib/store.ts` calls and `data/mock.ts` reads.
3. **Phase 3: Judgements.** Read location, mood, weather and health from the shared data layer. Compute F1–F5 strengths, confidence and evidence (e.g. a Supabase Edge Function on a schedule). Write flags and verdicts. Calculate the track record from resolved flags.
4. **Phase 4: Android.** Run `npm i @capacitor/core @capacitor/cli @capacitor/android`, then `npx cap init astrocyte <app.id>` and `npx cap add android`. Native location and health permissions come in here.
