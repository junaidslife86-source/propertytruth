# PropertyTruth — AI Review Brief

## What this app is

**PropertyTruth** is a buyer-side property due diligence workspace for **NSW, Australia** (testing phase — not public beta). It helps prospective home buyers organise checks, surface evidence-backed red flags from public data and uploaded documents, and prepare questions for professionals (conveyancers, inspectors, brokers) before making an offer.

The npm package name is `sydney-development-radar` (v0.1.0). The public brand is **PropertyTruth**.

## Who it is for

- **Primary:** NSW property buyers (apartments, townhouses, houses) doing pre-purchase due diligence
- **Secondary:** Buyers comparing multiple properties, attending open inspections, and reviewing strata report bundles

## Main user problems it solves

1. **Information overload** — Planning data, DAs, zoning, and strata PDFs are hard to interpret
2. **Missed checks** — Buyers forget conveyancing, building, pest, strata, and planning steps
3. **False confidence** — Listings and agent copy do not surface neighbourhood change or document red flags
4. **Fragmented tools** — Search (Domain/REA), maps, inspections, and document review live in different places

## Key product flows (implemented)

| Flow | Route(s) | Status |
|------|----------|--------|
| Address search & area scan | `/` → `/properties/[caseId]` | Firestore seed + labelled demo fallback |
| Properties hub | `/properties` | Saved cases (auth required) |
| Property report (tabs) | `/property/[id]` | UI complete; data quality varies |
| Compare board | `/compare` | Local storage only |
| Shortlist | `/shortlist` | Local storage only |
| Inspection copilot | `/inspection/new` → `/inspection/[id]` | Local storage; partial cloud photo API |
| Strata red flag scan | `/strata/upload` → `/strata/[id]` | Auth required; chunked pipeline (60s steps) |
| Auth & profile | `/login`, `/account` | Firebase Auth + Firestore profiles |
| Onboarding / buyer profile | `/onboarding` | Local + Firebase sync when signed in |
| Document vault (per property) | `/property/[id]/documents` | Local storage metadata only |
| Save report | Property page button | POST to Firestore; no list UI |

## What we want Claude to review

This is a **solo-founder MVP** moving toward production. We need a brutally honest assessment of:

- Whether the product is differentiated and trustworthy enough for real buyers
- UX gaps that cause confusion or loss of trust
- Firestore scan performance at NSW scale (current: full collection + haversine)
- Security and privacy for strata PDF uploads (financial + PII)
- AI usage boundaries and hallucination risk
- Vercel deployment readiness and serverless limits for large PDF processing
- What to build next vs what to delete or simplify

## Links

| Resource | URL |
|----------|-----|
| **Deployed Vercel app** | https://propertytruth.vercel.app |
| **GitHub repository** | https://github.com/junaidslife86-source/propertytruth |
| **Latest commit (at time of writing)** | `707a284` — Fix profile save on Vercel when Firebase Admin credentials are missing |

> **TODO:** Confirm custom domain, Vercel project name, and whether production env vars are fully configured.

## Known concerns / areas needing review

1. **Dual database story** — README and Supabase migrations exist; live app reads scans from **Firebase Firestore** (`src/lib/firebase/scan.ts`). ETL loads **Supabase**. Data may not connect end-to-end.
2. **Demo data dominance** — Property scans, geocoding fallbacks, map overlay geometry, and strata demo report are mock or synthetic in many paths.
3. **Local-only state** — Shortlist, compare, due diligence tracker, inspections, document vault are **Zustand + localStorage**; not synced to user account.
4. **Legacy Supabase strata code** — `src/lib/strata/fetch-document.ts`, `process-document.ts` appear unused; Firebase path is active.
5. **Paid report / Stripe** — UI preview only; checkout not implemented (`src/components/buyer/paid-report-preview.tsx`).
6. **Property page reload** — Direct `/property/[id]` without `sessionStorage` falls back to hardcoded demo scan (`src/app/property/[id]/page.tsx`).
7. **Rate limiting** — In-memory (`src/lib/rate-limit.ts`); ineffective across Vercel serverless instances.
8. **Retention policy** — Strata document auto-delete is stored but **no cron/worker** enforces expiry.
9. **No automated tests** — No Jest/Vitest/Playwright found in repo.
10. **README outdated** — Still describes Supabase Auth and PostGIS as primary backend.

## Review request for Claude

Please review this app as a senior solution architect, product consultant, UX/CX expert, and full-stack engineer.

Focus on:

1. Product usefulness and differentiation
2. UX and user journey gaps
3. Technical architecture
4. Code quality and maintainability
5. Data model and backend design
6. Security and privacy risks
7. AI implementation quality, if applicable
8. Vercel deployment readiness
9. Scalability and future extensibility
10. Specific recommendations ranked by impact and effort

## Context pack index

Read all files in `/docs/ai-context/` before reviewing the live app or GitHub repo.
