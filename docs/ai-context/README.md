# AI Reviewer Start Here

This folder helps external AI reviewers understand PropertyTruth — the product, codebase, architecture, and current risks — **without relying on chat history**.

## Start with these four files

Read in this order:

1. [`00-review-brief.md`](./00-review-brief.md) — What the app is, who it's for, key flows, review goals
2. [`03-architecture.md`](./03-architecture.md) — Stack, dual-database layout, integrations, env vars
3. [`04-codebase-map.md`](./04-codebase-map.md) — Folders, important files, legacy vs active code
4. [`12-claude-review-prompt.md`](./12-claude-review-prompt.md) — Full review request and output format

## Live app & repo

| Resource | URL |
|----------|-----|
| **Vercel (production)** | https://propertytruth.vercel.app |
| **GitHub** | https://github.com/juniidslife86-source/propertytruth |

Verify the deployed app matches `main` before reviewing UX copy or feature completeness.

## Full context pack

| # | File | Topic |
|---|------|--------|
| 00 | [review-brief](./00-review-brief.md) | Executive brief |
| 01 | [product-overview](./01-product-overview.md) | Vision, features, gaps |
| 02 | [user-flows](./02-user-flows.md) | Routes, journeys, UX issues |
| 03 | [architecture](./03-architecture.md) | Technical architecture |
| 04 | [codebase-map](./04-codebase-map.md) | File/folder map |
| 05 | [data-model](./05-data-model.md) | Firestore, Supabase, local state |
| 06 | [api-and-integrations](./06-api-and-integrations.md) | API routes & third parties |
| 07 | [ai-implementation](./07-ai-implementation.md) | Gemini, Document AI, guardrails |
| 08 | [security-privacy-risk-review](./08-security-privacy-risk-review.md) | Risk register |
| 09 | [ux-product-review](./09-ux-product-review.md) | UX/CX assessment |
| 10 | [technical-debt-and-refactor-plan](./10-technical-debt-and-refactor-plan.md) | Debt & refactor priorities |
| 11 | [vercel-deployment-review](./11-vercel-deployment-review.md) | Deploy checklist |
| 12 | [claude-review-prompt](./12-claude-review-prompt.md) | Paste-ready reviewer prompt |

## Critical context (read the brief for detail)

- **Runtime backend is Firebase** (Auth, Firestore, Storage); **Supabase/PostGIS** exists for migrations/ETL but is **not wired to live scans**.
- **Demo data fallbacks** are common when Firestore collections are empty.
- **Strata PDF pipeline** is the most production-ready AI feature; property scans and map overlays are weaker.
- **Local-only state:** shortlist, compare, due diligence, inspections (not fully synced to account).

## Rules for reviewers

- Be **evidence-based** — cite file paths and routes; do not invent features.
- Mark unknowns as **Unknown / needs verification** (e.g. Vercel plan limits, Firestore security rules in console).
- This is a **solo-founder MVP** — recommend pragmatically, not enterprise perfection.
- Australian context: NSW planning, strata schemes, conveyancing — not legal/financial advice product.

## Suggested review order after the start four

**Product & UX:** 01 → 02 → 09  
**Engineering:** 05 → 06 → 07 → 10  
**Risk & deploy:** 08 → 11

Then use **12** as the structured output template.
