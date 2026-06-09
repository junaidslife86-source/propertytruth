# Security & Privacy Risk Review

Evidence-based review of the codebase as of commit `707a284`.

## Environment variables

| Variable class | Exposure | Notes |
|----------------|----------|-------|
| `NEXT_PUBLIC_FIREBASE_*` | Client bundle | Expected for Firebase client SDK |
| `GEMINI_API_KEY` | Server only | Correct — used in API routes / lib |
| `GOOGLE_PLACES_API_KEY` | Server only | Correct |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Server only | Required on Vercel; must not leak |
| `INTERNAL_PROCESS_SECRET` | Server only | Protects process endpoint |
| `STRIPE_*` | Server / public publishable | Not wired yet |

**`.env.local` is gitignored.** `.env.example` documents vars without secrets.

## Client vs server boundaries

| Data | Boundary | Status |
|------|----------|--------|
| Firebase client config | Client | OK |
| Service account | Server Admin SDK | OK if env configured |
| Scan results | sessionStorage | OK for UX; not secret |
| Strata session ID | localStorage | Predictable UUID — access control relies on secrecy |
| Gemini calls | Server-side | OK |

## Authentication gaps

| Gap | Severity | Evidence |
|-----|----------|----------|
| Most read APIs unauthenticated | Medium | `/api/scan`, `/api/geocode`, insights |
| Session ID as sole strata auth for anonymous users | Medium | `clientSessionId` in localStorage — XSS steals docs |
| No Firebase Auth email verification enforced | Low | Not in code |
| Supabase Auth unused despite migrations | Low | Confusion only |

## Authorisation gaps

| Gap | Severity | Evidence |
|-----|----------|----------|
| Demo strata publicly readable | Low | By design — `DEMO_STRATA_ID` bypass |
| Saved reports no list/delete API | Low | Data accumulation |
| Firestore security rules | Unknown | App uses Admin SDK server-side; client direct Firestore access not found |

**Mitigations implemented:**
- `assertStrataDocumentAccess` / `assertInspectionAccess` (`src/lib/auth/access.ts`)
- Internal secret on process route
- JWT on `/api/user`, `/api/saved`

## Data privacy risks

| Risk | Severity | Evidence |
|------|----------|----------|
| Strata PDFs contain owner PII | High | Financials, minutes, owner names |
| PII redaction incomplete | Medium | Regex-based `redact.ts`; quotes may leak edge cases |
| Retention not enforced | Medium | `retentionExpiresAt` stored, no worker |
| No account/data export | Medium | GDPR-style portability not implemented |
| No account deletion API | Medium | Only strata doc delete |
| `NO_TRAINING_STATEMENT` | — | Claim only; no code enforcement vs Google API terms |

## File upload risks

| Control | Status |
|---------|--------|
| PDF-only strata | Enforced |
| 50 MB cap strata | Enforced |
| 8 MB photos | Enforced on inspection photos |
| MIME check photos | Whitelist |
| Virus scanning | **Not implemented** |
| Malicious PDF (parser exploits) | Risk to unpdf/Document AI pipelines |

## Prompt injection risks (AI)

| Vector | Severity | Mitigation |
|--------|----------|------------|
| User question in strata Q&A | Medium | Grounded in chunks only; no tool use |
| Crafted PDF text | Medium-High | Could influence Gemini extraction |
| Area insight POST body | Low | Scan schema validated; still user-controlled content |

## Logging risks

| Item | Status |
|------|--------|
| `console.error` on scan/admin failures | May log addresses/errors in Vercel logs |
| Structured logging | Not implemented |
| PII in logs | Unknown — needs verification of log content |

## Vercel deployment risks

| Risk | Severity | Evidence |
|------|----------|----------|
| Missing Firebase admin creds | High | Caused empty API responses (profile save) |
| `FIREBASE_SERVICE_ACCOUNT_PATH` on Vercel | High | File not present serverless |
| 300s function timeout | High | Strata pipeline may fail on large PDFs |
| In-memory rate limits | Medium | `src/lib/rate-limit.ts` |
| No CSP header | Medium | `next.config.ts` has partial security headers |
| Turbopack NFT warnings | Low | `firebase/admin.ts` file reads traced |

## Security headers (present)

From `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera/mic/geo disabled)

**Missing:** Content-Security-Policy, Strict-Transport-Security (Vercel may add HSTS at edge — Unknown)

## Risk register

| Risk | Severity | Evidence | Recommendation |
|------|----------|----------|----------------|
| Firebase Admin misconfig on Vercel | High | Profile save failures | Use `FIREBASE_SERVICE_ACCOUNT_JSON`; document in deploy checklist |
| Strata docs accessible via session theft | High | XSS → `x-strata-session` | CSP, httpOnly impossible for header; prefer auth for sensitive docs |
| Unauthenticated Gemini/scan abuse | High | Public API routes | Auth or stricter rate limits + WAF |
| Dual DB architecture confusion | High | README vs runtime | Pick one source of truth; document |
| Demo data shown as real | High | `buildDemoScanResult` fallbacks | Block or banner when demo; fail closed in prod |
| PII in strata outputs | High | Financial PDFs | Expand redaction; legal review of flows |
| No retention enforcement | Medium | `retentionExpiresAt` unused | Cloud Scheduler + delete function |
| Firestore full-table scan | Medium | `firebase/scan.ts` | PostGIS or geohash indexes |
| In-memory rate limits | Medium | `rate-limit.ts` | Upstash Redis or Vercel KV |
| Legacy Supabase code | Low | Unused strata files | Delete or archive |
| No automated security tests | Medium | No test suite | Add API auth integration tests |
| Large PDF timeout | High | 300s `maxDuration` | Queue + worker (Inngest, Cloud Tasks) |

## TODO

- [ ] Review Firebase Storage rules in console
- [ ] Review Firestore security rules (if any client SDK writes added later)
- [ ] Pen-test strata IDOR with guessed document IDs
