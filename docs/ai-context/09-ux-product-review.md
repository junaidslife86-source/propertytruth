# UX & Product Review

**Last updated:** Property Passport reframe (PPOR-first, journey-oriented).

## North star

PropertyTruth is a **pre-offer cockpit** for Australian buyers — not a planning scan dashboard.

Central question:

> Am I ready to make an offer, and what still needs to be verified?

## Implemented UX direction

### Property Passport (`/properties/[id]`)

Each property file opens with a **Property Passport** summary:

- Pre-offer status and next best action
- Area rows: contract, strata, building/pest, planning, climate/insurance, finance, offer readiness
- Stats: missing checks, issues to clarify, documents, questions generated
- Primary actions: Add document, Create questions, Compare property

### Buyer-language navigation

Property tabs reframed:

| Tab | Label |
|-----|-------|
| `summary` | What we know |
| `risks` | Risks |
| `map` | Nearby |
| `verify` | What to verify |
| `questions` | Questions |
| `costs` | Costs |

### Homepage

- Hero: emotional first-home-buyer hook
- Primary CTA: **Start a property file** (was “Scan Area”)
- Secondary CTA: Upload strata report
- Feature grid reframed as pre-offer cockpit, not six disconnected tools

### Trust & labelling

- `DataSourceBanner` on property files
- `SourceBadge` on risk signals and AI summaries
- `WhatWeCheckedReceipt` — checked vs not checked (grey is not green)
- Property DNA shows **known / unknown / verify** completeness bars — not buy/safe scores

### Questions for professionals

`QuestionsToAskPanel` groups AI-assisted prompts by:

- Conveyancer, building inspector, strata manager, broker, insurance provider, selling agent

### First home buyer mode

- Onboarding: buyer journey type (first home, next home, apartment/strata, investment)
- `FirstHomeBuyerBanner` on property passport when profile matches

### NSW auction readiness

- Interactive checklist on **What to verify** tab with conveyancer disclaimer

### Costs

- `OwnershipCostSimulator` promoted to dedicated **Costs** tab

## Recently shipped (passport backlog)

| Item | Implementation |
|------|----------------|
| Strata → passport | `GET /api/property-cases/[id]/strata`, passport row links to `/strata/[id]` |
| Post-scan moment | `PostScanPrioritiesCard` after new property file |
| Compare readiness | `compare-readiness.ts` + updated comparison table |
| Plain-English issues | `PlainEnglishRiskCard` with expandable sections |
| Climate roadmap | `ClimateInsuranceRoadmap` — resilience checks framing |

## Remaining gaps

| Priority | Item |
|----------|------|
| P2 | Sign-in value explanation on homepage |
| P2 | Post-strata moment: “6 questions for your conveyancer” |
| P3 | Full climate data layers (beyond scan signals) |

## Principles (unchanged)

- Known / unknown / verify — never “safe to buy”
- AI invisible until useful; labelled AI-assisted
- Source badge on every insight
- Not legal, financial, or building advice

## Key files

| Area | Path |
|------|------|
| Passport logic | `src/lib/passport/build.ts` |
| Passport UI | `src/components/property/property-passport.tsx` |
| Questions panel | `src/components/property/questions-to-ask-panel.tsx` |
| Checked receipt | `src/components/property/what-we-checked-receipt.tsx` |
| Property page | `src/app/property/[id]/page.tsx` |
| Homepage | `src/app/page.tsx` |
| Onboarding | `src/app/onboarding/page.tsx` |
