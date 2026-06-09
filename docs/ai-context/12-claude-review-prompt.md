# Claude Review Request

Copy everything below the line into Claude (or another reviewer) after attaching or pointing to this repository.

---

# Claude Review Request

## App

**PropertyTruth** — A buyer-side property due diligence workspace for Sydney, Australia. Helps buyers organise checks, surface evidence-backed red flags from public planning data and uploaded strata PDFs, and prepare questions for licensed professionals before making an offer.

**Not:** A valuation tool, legal advisor, or building inspection replacement.

## Vercel app

https://propertytruth.vercel.app

> Verify the deployed version matches GitHub `main` (commit `707a284` or later). Earlier deploys showed outdated home page copy.

## GitHub repo

https://github.com/juniidslife86-source/propertytruth

## Context files to read first

Read **all** of these before reviewing code or the live app:

- `/docs/ai-context/00-review-brief.md`
- `/docs/ai-context/01-product-overview.md`
- `/docs/ai-context/02-user-flows.md`
- `/docs/ai-context/03-architecture.md`
- `/docs/ai-context/04-codebase-map.md`
- `/docs/ai-context/05-data-model.md`
- `/docs/ai-context/06-api-and-integrations.md`
- `/docs/ai-context/07-ai-implementation.md`
- `/docs/ai-context/08-security-privacy-risk-review.md`
- `/docs/ai-context/09-ux-product-review.md`
- `/docs/ai-context/10-technical-debt-and-refactor-plan.md`
- `/docs/ai-context/11-vercel-deployment-review.md`

## What I want from you

Act as a **senior product consultant, solution architect, UX/CX expert, and full-stack engineer**. Give a **brutally honest** review.

### 1. Product & differentiation

- Is this differentiated from Domain/REA/conveyancer checklists?
- Is the "due diligence coverage" framing trustworthy and defensible?
- What would make a Sydney buyer pay for this?

### 2. UX / CX

- Walk the live app: home → scan → property report → strata upload → account
- Where do users get confused, lose trust, or drop off?
- Compare implementation to Stitch design intent in `stitch_propertytruth_due_diligence_workspace/`

### 3. Architecture

- The **Supabase (PostGIS) vs Firebase (runtime)** split — recommend keep, merge, or kill one
- Is the strata async pipeline appropriate for Vercel serverless?
- What breaks first at 100 / 1,000 / 10,000 users?

### 4. Code quality

- Maintainability for a solo founder
- What to delete vs finish
- Testing strategy from zero

### 5. Security & privacy

- Strata PDF handling (PII, retention, access control)
- Public API abuse (scan, insights, Gemini cost)
- Vercel/Firebase configuration risks

### 6. AI quality

- Is Gemini used appropriately?
- Hallucination and prompt-injection exposure
- Should Q&A move to RAG/embeddings?

### 7. Deployment readiness

- Is this safe to show real users with real strata documents today?
- Vercel env checklist gaps

### 8. Roadmap

Provide two ranked lists:

**A. Non-AI improvements** (data, UX, auth sync, maps, payments shell, etc.)

**B. AI improvements** (strata pipeline, RAG, better evidence, cost controls)

For each recommendation rate:

| Dimension | Score |
|-----------|-------|
| User value | 1–5 |
| Business value | 1–5 |
| Technical effort | S / M / L |
| Risk if ignored | 1–5 |

### 9. Kill / keep / finish list

Categorise major features:

- **Kill** — remove or stop investing
- **Keep** — good enough for now
- **Finish** — partially built, high ROI to complete

### 10. Open questions

Answer or flag as unknown:

- Should production ever show demo scan data?
- Is Supabase still needed?
- What's the MVP monetisation path — $29 report, subscription, or free growth?
- Is Firebase the long-term DB or a prototype choice?

## Constraints

- This is a **solo-founder MVP** — recommend pragmatically, not enterprise perfection
- Australian property market context (strata, conveyancing, NSW planning)
- Regulatory sensitivity — not providing legal/financial advice

## Output format

Structure your response as:

1. **Executive summary** (10 bullets max)
2. **What's working**
3. **Critical gaps** (blockers for real users)
4. **Architecture recommendation** (one paragraph decision on Supabase vs Firebase)
5. **Top 10 recommendations** (table with impact/effort)
6. **90-day roadmap** (phased)
7. **Questions for the founder**

Be specific. Cite file paths and routes. Do not assume features exist unless you verify them in the repo or live app.
