# Property Truth

Buyer-side property intelligence for **NSW** — scan nearby development activity, environmental overlays, and run due diligence before you buy.

**Phase:** Testing (not public beta). Sample and seeded Firestore data are always labelled in the UI.

## Stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, MapLibre GL
- **Backend:** Next.js Route Handlers on Vercel (hobby tier — 60s function limit)
- **Data:** Firebase Auth, Firestore, Firebase Storage
- **Geocoding:** AddressFinder (NSW) with fallbacks
- **AI:** Gemini (summaries), Document AI (strata OCR)
- **State:** Zustand (local + Firestore workspace sync when signed in)

## Quick start

```bash
cd PropertyTruth
cp .env.example .env.local   # fill Firebase + keys (see below)
npm install
npm run seed:nsw             # load NSW sample planning data into Firestore
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in to save property cases, upload strata PDFs, and sync your workspace.

## Testing configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `APP_ENV` / `NEXT_PUBLIC_APP_ENV` | `testing` | Shows testing banners; allows labelled demo fallback |
| `ALLOW_DEMO_DATA` | `true` in testing | Demo scan when Firestore has no nearby seed rows |
| `SEED_SECRET` | optional | Protects `POST /api/admin/seed-nsw` |

## NSW seed data

```bash
npm run seed:nsw
# or
curl -X POST http://localhost:3000/api/admin/seed-nsw \
  -H "x-seed-secret: $SEED_SECRET"
```

Populates Firestore collections: `developments`, `infrastructure`, `zoning`, `risk_overlays` (labelled **Seeded sample** in UI).

## Key flows

1. **Address scan** — geocode NSW address → Firestore spatial query → property case (when signed in) → `/properties/[caseId]`
2. **Strata upload** — auth required → Firebase Storage → chunked pipeline (60s steps, poll `/api/strata/[id]/status`)
3. **Workspace** — shortlist, compare, due diligence sync to `users/{uid}.workspace`
4. **Buyer report** — one-off $29 AUD stub; testing mode downloads JSON preview via `/api/reports/[caseId]`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm test` | Vitest smoke tests |
| `npm run seed:nsw` | Seed Firestore with NSW sample data |

## Credentials

See **Credentials checklist** in project docs or ask the agent after setup — required: Firebase client + admin, AddressFinder, MapTiler, Gemini, Document AI (strata), `INTERNAL_PROCESS_SECRET`, `CRON_SECRET` (retention cron).

**Not used at runtime:** Supabase migrations in `supabase/` are legacy reference only.
