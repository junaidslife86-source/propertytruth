# Technical Debt & Refactor Plan

## Duplicate / parallel implementations

| Area | Duplication | Recommendation |
|------|-------------|----------------|
| Strata backend | Supabase (`fetch-document.ts`, `process-document.ts`) vs Firebase pipeline | Delete Supabase strata modules or move to `/legacy` |
| Property cases | Supabase migration + Firestore `property-cases.ts` | Wire one path or remove |
| Scan backend | Supabase PostGIS vs Firestore haversine | **Choose one**; bridge ETL → Firestore OR restore PostGIS scan |
| Buyer profile | Zustand store + Firestore `users.buyerProfile` | Single source of truth with sync layer |
| Confidence vs coverage | `propertyConfidenceScore` in schema + `dueDiligenceCoverage` in UI | Deprecate schema field or alias |

## Large / complex files

| File | Lines (approx) | Concern |
|------|----------------|---------|
| `src/lib/strata/process-pipeline.ts` | ~230 | Monolithic pipeline — hard to test |
| `src/lib/strata/analyze.ts` | ~270 | Mixed demo + Gemini + Q&A |
| `src/lib/risk/signals.ts` | ~370 | Many signal builders in one file |
| `src/app/property/[id]/page.tsx` | ~220 | Client page does too much orchestration |
| `src/app/account/page.tsx` | ~400 | Form + tabs + save logic inline |

## Weak abstractions

| Issue | Location |
|-------|----------|
| Provider fallback chain hardcoded | `lib/places/autocomplete.ts` |
| Demo fallback at every layer | scan-service, geocode, gemini, analyze |
| Auth headers duplicated pattern | `api-headers.ts` helps but not used everywhere |
| No repository layer for Firestore | Direct collection calls scattered |

## Missing tests

**No test framework configured** (no Jest, Vitest, Playwright in `package.json`).

Priority test targets:
1. `assertStrataDocumentAccess` / IDOR cases
2. `validateFindings` evidence matching
3. `redactPii` patterns
4. `calculateDueDiligenceCoverage` scoring
5. API route integration (scan, user PATCH)
6. `userUpdateSchema` validation edge cases

## Fragile logic

| Logic | Risk |
|-------|------|
| Property page demo fallback | Silent wrong data |
| Firestore `collection.get()` + filter | O(n) per scan |
| Keyword chunk retrieval | Poor Q&A on synonyms |
| `sessionStorage` scan cache | Lost on new tab |
| In-memory rate limit | Bypass / inconsistent |
| File hash dedup query | Needs Firestore composite index |

## Over-engineered parts

| Item | Note |
|------|------|
| Dual database migrations | Supabase schema far ahead of usage |
| Property DNA + journey + coverage + readiness | Overlapping "progress" concepts |
| Multiple autocomplete providers | May be justified for AU coverage |

## Under-engineered parts

| Item | Note |
|------|------|
| Saved reports | Write without read |
| Retention enforcement | Policy without worker |
| Error monitoring | No Sentry |
| CI/CD checks | Unknown |
| Firestore indexes | Likely incomplete |
| Property reload | No server fetch by ID |

---

## Quick wins (days)

1. Delete or archive legacy Supabase strata files
2. Update README to reflect Firebase-primary architecture
3. Add demo data banner component to property page
4. Replace `alert()` in address search with toast
5. Document Vercel env vars in `docs/DEPLOY.md`
6. Add `export const runtime = "nodejs"` consistently on Firebase routes
7. Fail scan API with explicit `{ dataSource: "demo", warning }` instead of silent demo

## Medium effort (1–2 weeks)

1. Sync shortlist/compare/DD to Firestore per user
2. Property page: fetch scan from Firestore by `propertyId` on reload
3. Wire `createPropertyCase` on scan completion
4. Strata findings → property risk signals integration
5. Upstash Redis rate limiting
6. Add Vitest for core lib functions
7. Scheduled retention cleanup (Vercel Cron)
8. Saved reports list page + GET API

## Larger architectural improvements (weeks+)

1. **Unify data platform** — PostGIS via Supabase OR Firestore geohashes; deprecate the other
2. **Background job queue** — Move strata pipeline off HTTP (Inngest, Cloud Tasks, Trigger.dev)
3. **Vector RAG** for strata Q&A with citation enforcement
4. **Real overlay GIS** — Serve GeoJSON from ETL into map layers
5. **Stripe entitlements** — Paid report generation pipeline
6. **E2E tests** — Playwright for critical flows
7. **Observability** — Sentry + structured logs + cost dashboards for Gemini/Document AI

## Refactor priority order

1. Data truth (demo vs real) — blocks trust
2. Vercel/Firebase admin reliability — blocks auth features
3. User data sync — blocks retention
4. Strata job queue — blocks scale
5. Test harness — blocks safe iteration
6. Supabase cleanup — blocks maintainer sanity
