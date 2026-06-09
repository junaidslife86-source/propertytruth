# Technical Architecture

**Last updated:** Testing phase — Firebase-only runtime, NSW geographic scope, auth required for strata upload.

## Stack summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router 16.x |
| UI | React 19, Tailwind 4, Radix/shadcn-style |
| Client state | Zustand (localStorage + Firestore workspace sync) |
| Validation | Zod |
| Maps | MapLibre GL (+ MapTiler optional) |
| Auth | Firebase Auth (Google + email) |
| Database | **Firestore only** (runtime) |
| Files | Firebase Storage (strata PDFs) |
| Hosting | Vercel hobby (60s `maxDuration`) |

## Frontend structure

```
src/app/           # Pages + API route handlers
src/components/    # Feature UI (buyer, strata, compliance, map)
src/providers/     # AuthProvider, QueryProvider
src/stores/        # Zustand persist + workspace sync hooks
src/lib/           # Business logic, Firebase, strata pipeline, schemas
```

## Backend

- Next.js Route Handlers under `src/app/api/`
- Heavy routes: `runtime = "nodejs"`, `maxDuration = 60`
- Strata processing: **chunked pipeline** (`src/lib/strata/process-chunked.ts`) — one step per request; status polling advances work

## Data (Firebase Firestore)

| Collection | Purpose |
|------------|---------|
| `users` | Profile, preferences, `workspace` blob |
| `property_cases` | Saved scans per user (canonical workspace ID) |
| `properties` | Raw scan snapshots from `/api/scan` |
| `developments`, `infrastructure`, `zoning`, `risk_overlays` | NSW seed + future live feeds |
| `strata_documents` + subcollections | Uploaded PDFs, findings |
| `meta/seed` | Seed provenance |

**Scan query:** Full collection read + haversine filter (`src/lib/firebase/scan.ts`) — acceptable for testing seed volume; replace with geohash/GeoFirestore before scale.

**Supabase/PostGIS:** Legacy migrations in `supabase/` — **not used at runtime**.

## Authentication & access

| Flow | Requirement |
|------|-------------|
| Strata upload | Firebase JWT required |
| Property cases, workspace, reports | Firebase JWT required |
| Scan | Public; creates `property_case` when signed in |
| Strata/inspection read | `userId` match (session fallback for legacy docs) |
| Internal process | `x-internal-process-secret` |
| Seed / cron | `SEED_SECRET` / `CRON_SECRET` |

## Testing / demo labelling

- `src/lib/config/app-mode.ts` — `APP_ENV=testing` default
- `DataSourceBanner` + `SourceBadge` on property reports
- Demo fallback only when `ALLOW_DEMO_DATA` true; never silent in production config

## Monetisation (stub)

- One-off buyer report $29 AUD
- `POST /api/reports/checkout` — Stripe stub; testing returns JSON report URL
- `GET /api/reports/[caseId]` — report payload

## Cron

- `GET /api/cron/retention` — deletes expired strata docs (`retentionExpiresAt`)

## Security headers

- CSP + standard headers in `next.config.ts`
