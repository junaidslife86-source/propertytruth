# Codebase Map

## Top-level layout

```
PropertyTruth/
├── src/app/              # Routes + API handlers
├── src/components/       # React UI
├── src/lib/              # Domain logic, integrations
├── src/providers/        # React context providers
├── src/stores/           # Zustand client state
├── supabase/migrations/  # PostGIS SQL schema (not runtime-primary)
├── etl/                  # GeoJSON import to Supabase
├── data/seed/            # Sample GeoJSON
├── docs/ai-context/      # This context pack
├── stitch_propertytruth_due_diligence_workspace/  # Design references (HTML + screenshots)
├── .env.example
├── next.config.ts
└── package.json
```

## Important folders

| Path | Purpose |
|------|---------|
| `src/app/api/` | All HTTP API route handlers |
| `src/app/property/` | Property report + document vault |
| `src/app/strata/` | Strata upload + report pages |
| `src/app/inspection/` | Inspection copilot pages |
| `src/lib/firebase/` | Firebase Admin + client helpers, Firestore access |
| `src/lib/strata/` | Strata PDF pipeline (classify, extract, summarize) |
| `src/lib/risk/` | Buyer risk signals, compare helpers, scoring |
| `src/lib/due-diligence/` | Coverage calculation, templates |
| `src/lib/compliance/` | Disclaimers, PII redaction |
| `src/lib/auth/` | Session headers, access control, user schema |
| `src/lib/places/` | Geocoding + autocomplete providers |
| `src/lib/data/` | Scan service orchestration, demo data, risk engine |
| `src/components/buyer/` | Buyer cockpit UI cards |
| `src/components/compliance/` | Legal/safety UI panels |
| `src/components/strata/` | Strata report UI |
| `src/stores/` | Persisted client state |

## File responsibility map

| Path | Purpose | Importance | Notes |
|------|---------|------------|-------|
| `src/app/page.tsx` | Home / search entry | High | Hero + feature grid |
| `src/app/property/[id]/page.tsx` | Property report hub | High | Tabs, demo fallback on reload |
| `src/app/api/scan/route.ts` | Area scan API | High | Entry to scan pipeline |
| `src/lib/data/scan-service.ts` | Scan orchestration | High | Firebase → demo fallback |
| `src/lib/firebase/scan.ts` | Firestore spatial read | High | Full collection scan + haversine |
| `src/lib/data/demo-data.ts` | Synthetic scan data | High | Used heavily in dev/prod gaps |
| `src/lib/risk/signals.ts` | Buyer risk signal generation | High | Core product logic |
| `src/lib/due-diligence/coverage.ts` | DD coverage score | High | Replaces old confidence framing |
| `src/lib/strata/process-pipeline.ts` | Async strata analysis | High | 300s serverless job |
| `src/lib/firebase/strata.ts` | Strata Firestore CRUD | High | Upload, fetch, delete |
| `src/lib/firebase/users.ts` | User profile Firestore | High | Account settings |
| `src/lib/firebase/admin.ts` | Firebase Admin init | Critical | Vercel credential handling |
| `src/lib/auth/access.ts` | IDOR protection | Critical | Strata/inspection access |
| `src/providers/auth-provider.tsx` | Auth + profile state | High | Client auth hub |
| `src/components/address-search.tsx` | Search UX | High | Geocode + scan trigger |
| `src/components/interactive-map.tsx` | Map visualization | Medium | Synthetic overlay geometry |
| `src/stores/compare-store.ts` | Compare state | Medium | localStorage only |
| `src/stores/shortlist-store.ts` | Shortlist state | Medium | localStorage only |
| `src/stores/due-diligence-store.ts` | DD checklist state | Medium | localStorage only |
| `src/stores/inspection-store.ts` | Inspection state | Medium | localStorage only |
| `src/lib/firebase/property-cases.ts` | Property passport model | Low (unused) | No UI integration |
| `src/lib/db/property-cases.ts` | Re-export wrapper | Low | Unused |
| `src/lib/strata/fetch-document.ts` | Supabase strata fetch | Legacy | Not imported by app routes |
| `src/lib/strata/process-document.ts` | Supabase strata process | Legacy | Not imported by app routes |
| `src/components/property-confidence-card.tsx` | Old UI | Deleted | Replaced by due-diligence-coverage-card |
| `src/lib/rate-limit.ts` | Rate limiting | Medium | In-memory; fragile on Vercel |
| `src/lib/analytics.ts` | Analytics | Low | Console stub only |
| `supabase/migrations/*.sql` | DB schema | Medium | ETL target; runtime mismatch |
| `etl/pipelines/import-geojson.ts` | Data import | Medium | Supabase only |
| `stitch_propertytruth_due_diligence_workspace/` | Design specs | Reference | Not runtime code |
| `README.md` | Docs | Outdated | Describes Supabase-primary architecture |

## Core business logic files

- **Scan:** `scan-service.ts` → `firebase/scan.ts` → `risk/signals.ts` → `data/risk-engine.ts`
- **Strata:** `api/strata/upload` → `process-pipeline.ts` → `extractors/*` → `evidence.ts` → `summary.ts`
- **Coverage:** `due-diligence/coverage.ts` + `offer/readiness.ts`
- **Auth:** `auth/access.ts` + `firebase/users.ts` + `providers/auth-provider.tsx`

## UI control files

- Layout: `src/app/layout.tsx`, `site-header.tsx`, `site-footer.tsx`
- Design tokens: `src/app/globals.css`
- Property tabs: `src/components/property/property-report-tabs.tsx`
- Stitch-aligned cards: `src/components/due-diligence/`, `src/components/compliance/`

## API / backend control files

All under `src/app/api/` — see `06-api-and-integrations.md`.

## Data access layer

| System | Files |
|--------|-------|
| Firestore | `src/lib/firebase/*.ts` |
| Firebase Storage | `src/lib/firebase/storage.ts` |
| Supabase (ETL only) | `etl/pipelines/import-geojson.ts` |
| Client persist | `src/stores/*.ts` |

## Likely legacy / unused / risky

| Item | Risk |
|------|------|
| Supabase strata modules | Confusion for maintainers |
| `property-cases` Firestore without UI | Dead code path |
| README Supabase auth instructions | Wrong deployment guide |
| Demo data fallbacks in production paths | User trust / legal |
| `MAX_PAGES_HINT` in upload route | Defined but enforcement unclear |

## TODO

- [ ] Run dependency-cruiser or knip to confirm zero imports of legacy Supabase strata files
- [ ] Document which Firestore collections are actually populated in production
