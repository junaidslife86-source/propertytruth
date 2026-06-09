# Product Overview

## Product vision

**Help buyers avoid future regret** by organising due diligence, surfacing evidence-backed questions, and tracking missing checks — without replacing licensed professionals.

Positioning (from `src/lib/compliance/copy.ts`):

> PropertyTruth helps buyers organise due diligence, surface evidence-backed questions, and track missing checks before they speak with professionals.

Tagline (`src/lib/constants.ts`):

> Organise checks, surface red flags, and prepare questions for professionals.

## Target users

| Segment | Needs |
|---------|--------|
| First-home buyers | Checklist guidance, plain-English explanations, affordability tools |
| Experienced upgraders | Compare properties, strata red flags, planning context |
| Apartment buyers | Strata PDF analysis, levy/capital works signals |

Geographic focus: **Sydney, NSW** (bounds in `SYDNEY_BOUNDS` in `src/lib/constants.ts`).

## Core jobs-to-be-done

1. **Discover** — Find a property address and understand nearby planning/development context
2. **Assess** — See buyer risk signals, due diligence coverage, and missing checks
3. **Compare** — Side-by-side view of up to 4 properties
4. **Inspect** — Mobile checklist during open home with photos and notes
5. **Review strata** — Upload PDF bundle, get evidence-backed findings and Q&A
6. **Prepare to offer** — Pre-offer checklist, ownership cost estimate, professional review gate
7. **Account** — Save preferences and buyer profile (Firebase)

## Main features — fully or largely implemented

| Feature | Evidence |
|---------|----------|
| Home search + scan | `src/components/address-search.tsx`, `src/app/api/scan/route.ts` |
| Property report tabs (Overview / Issues / Map / Due diligence / Report) | `src/app/property/[id]/page.tsx`, `src/components/property/property-report-tabs.tsx` |
| Due diligence coverage score | `src/lib/due-diligence/coverage.ts`, `src/components/due-diligence/due-diligence-coverage-card.tsx` |
| Buyer risk signals | `src/lib/risk/signals.ts`, `src/components/buyer/risk-signal-grid.tsx` |
| Compare board (≤4 properties) | `src/app/compare/page.tsx`, `src/stores/compare-store.ts` |
| Shortlist | `src/app/shortlist/page.tsx`, `src/stores/shortlist-store.ts` |
| Inspection copilot | `src/app/inspection/new/page.tsx`, `src/stores/inspection-store.ts` |
| Strata async pipeline | `src/lib/strata/process-pipeline.ts`, `src/app/api/strata/*` |
| Firebase auth (Google + email) | `src/app/login/page.tsx`, `src/providers/auth-provider.tsx` |
| User profile & preferences | `src/app/account/page.tsx`, `src/lib/firebase/users.ts` |
| Compliance copy & disclaimers | `src/lib/compliance/copy.ts`, privacy/terms pages |
| PII redaction (strata) | `src/lib/compliance/redact.ts` |
| Map with DA markers + layer toggles | `src/components/interactive-map.tsx` |

## Features — partially implemented

| Feature | Gap |
|---------|-----|
| **Real property scan data** | Firebase collections often empty → demo data (`src/lib/data/demo-data.ts`) |
| **PostGIS spatial queries** | Supabase `scan_nearby_property()` exists in migrations; **not called** by app runtime |
| **Saved reports** | POST only (`src/app/api/saved/route.ts`); no UI to list saved reports |
| **Property cases / passport** | Firestore helpers in `src/lib/firebase/property-cases.ts`; **not wired** to UI |
| **Inspection cloud sync** | `POST /api/inspections` exists; UI creates inspections **locally only** |
| **Document vault** | Metadata in localStorage; files not uploaded to cloud (`src/stores/document-vault-store.ts`) |
| **Map risk overlays** | Circles drawn near pin, not real GIS polygons (`src/components/interactive-map.tsx`) |
| **Ownership cost simulator** | Works but uses **default $950k** price, not scan-linked |
| **Buyer profile sync** | Onboarding/account save to Firebase; other stores stay local |
| **Strata → property report** | Strata findings do not feed property `BuyerRiskSignal` grid |
| **Retention auto-delete** | Policy stored on strata docs; no scheduled enforcement |
| **Analytics** | PostHog stub only (`src/lib/analytics.ts`) |

## Future feature ideas (from code, README, comments)

| Idea | Source |
|------|--------|
| Paid PDF buyer report ($29 AUD) | `src/components/buyer/paid-report-preview.tsx` — "Stripe checkout coming soon" |
| Property Passport | `src/lib/journey/progress.ts` — "Save property passport when available" |
| Post-settlement ownership tools | Journey stage `own` — "coming soon" |
| Flood / bushfire / noise overlays (real GIS) | README "Future-ready"; map layers are visual placeholders |
| Sunlight simulation, insurance risk | README line 100-102 |
| Stripe Pro monthly/yearly | `.env.example` Stripe price IDs |
| NSW planning data ETL (live feeds) | `etl/README.md` — "Supported sources (future)" |

## What makes the product valuable (when data is real)

- **Unified buyer cockpit** — Search, compare, inspect, strata, and DD tracking in one flow
- **Evidence-backed strata scan** — Page quotes, section coverage, conveyancer questions (not just summaries)
- **Compliance-safe framing** — Due diligence coverage vs "confidence score"; heavy disclaimers
- **Professional handoff** — Questions for conveyancer, missing checks panel, review gate

## Product weaknesses / unclear areas

1. **Trust risk** — Demo data without clear persistent labeling on all surfaces (badge exists on hero when `dataSource === "demo"`)
2. **Positioning drift** — README says "Development Radar"; UI says PropertyTruth / due diligence workspace
3. **No clear "source of truth"** for planning data in production
4. **Account value unclear** — Sign-in saves profile and reports, but shortlist/compare/DD don't sync
5. **Paid tier undefined** — Locked report sections listed but no delivery mechanism
6. **Mobile-first inspection** vs desktop-heavy property report — uneven UX priority

## TODO for human input

- [ ] Confirm target launch market (Sydney only vs NSW vs Australia)
- [ ] Confirm primary monetisation hypothesis (paid report vs subscription vs B2B)
- [ ] Confirm whether Supabase project is provisioned in production or abandoned for Firebase-only
