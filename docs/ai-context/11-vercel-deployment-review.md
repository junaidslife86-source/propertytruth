# Vercel Deployment Review

## Build configuration

| Item | Value |
|------|-------|
| Package manager | npm (`package-lock.json` present) |
| Build command | `npm run build` → `next build` |
| Start command | `next start` (Vercel uses serverless output) |
| Framework | Next.js 16.2.6 (auto-detected) |
| Node runtime | Explicit `nodejs` on heavy API routes |

**Build status:** Passes locally as of commit `707a284` (with `.env.local`).

**Build warnings:** Turbopack NFT trace warnings involving `firebase/admin.ts` file reads — may affect bundle tracing; monitor.

## Required environment variables (production)

### Must have (core app)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client auth |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client + admin |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage + admin |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Admin SDK on Vercel** (full JSON one line) |
| `INTERNAL_PROCESS_SECRET` | Strata background processing |

### Strongly recommended

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | AI summaries + strata |
| `GOOGLE_DOCUMENT_AI_PROJECT_ID` | OCR fallback |
| `GOOGLE_DOCUMENT_AI_PROCESSOR_ID` | OCR |
| `GOOGLE_DOCUMENT_AI_LOCATION` | OCR region |
| `ADDRESSFINDER_API_KEY` + secret | AU addresses |
| `NEXT_PUBLIC_MAPTILER_API_KEY` | Production map tiles |

### Optional / feature-specific

| Variable | Purpose |
|----------|---------|
| `GOOGLE_PLACES_API_KEY` | Geocoding fallback |
| `NEXT_PUBLIC_MAPLIBRE_STYLE_URL` | Map style |
| `DEFAULT_SCAN_RADIUS_METERS` | Scan default |
| `SUPABASE_*` | ETL only (not runtime scan today) |
| `STRIPE_*` | Not implemented |

### Do NOT use on Vercel

| Variable | Why |
|----------|-----|
| `FIREBASE_SERVICE_ACCOUNT_PATH` | File not in deployment bundle |

## Vercel compatibility

| Feature | Compatible | Notes |
|---------|------------|-------|
| App Router | Yes | |
| API Route Handlers | Yes | |
| `maxDuration = 300` | Needs Pro plan | **Unknown / needs verification** |
| Firebase Admin | Yes | With `FIREBASE_SERVICE_ACCOUNT_JSON` |
| File uploads (50MB PDF) | Risky | Body size limits — check Vercel plan |
| Edge runtime | Not used for Firebase | Correct — Admin needs Node |
| Static assets | Yes | |

## Serverless risks

| Risk | Detail | Mitigation |
|------|--------|------------|
| Function timeout | Strata pipeline up to 300s | Background queue; chunk processing |
| Memory limit | Large PDF buffers | Stream processing; page batching |
| Cold starts | Firebase Admin init | Keep functions warm or min instances (Enterprise) |
| Concurrent uploads | Multiple Gemini calls | Queue + concurrency cap |
| Request body size | 50MB PDF | May exceed default limits |

## Edge / runtime issues

- Firebase Admin **cannot** run on Edge — routes correctly use `nodejs`
- `readFileSync` in admin only for local `FIREBASE_SERVICE_ACCOUNT_PATH`

## File storage

- PDFs stored in **Firebase Storage**, not Vercel — correct for serverless
- Inspection photos → Firebase Storage when API used
- No Vercel Blob integration

## API timeout risks

| Route | maxDuration | Risk |
|-------|-------------|------|
| `/api/strata/[id]/process` | 300s | Large PDF failure |
| `/api/strata/upload` | 60s | Upload + trigger only — OK |
| `/api/scan` | Default (~10s) | OK for demo; slow if Firestore huge |

## Database connection risks

- **Firestore:** HTTP/gRPC via Admin SDK — serverless-friendly (no connection pool issue)
- **Supabase:** Only ETL script — not in request path

## Logging / monitoring gaps

| Gap | Recommendation |
|-----|----------------|
| No Sentry | Add error tracking |
| `console.error` only | Structured JSON logs |
| No uptime checks | Vercel monitoring or Better Uptime |
| No AI cost alerts | GCP billing alerts for Document AI + Gemini |
| No deploy env validation | Build-time env check script |

## Security headers

Configured in `next.config.ts` — partial set. Add CSP for production.

## Firebase Console checklist (non-Vercel)

- [ ] Auth: Google + Email enabled
- [ ] Authorized domains: `propertytruth.vercel.app` + custom domain
- [ ] Storage bucket created (Blaze plan)
- [ ] Firestore indexes for strata dedup query
- [ ] Document AI API enabled in GCP

---

## Deployment checklist

### Pre-deploy

- [ ] All `NEXT_PUBLIC_FIREBASE_*` set in Vercel
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` set (minified single line)
- [ ] `INTERNAL_PROCESS_SECRET` set (random 32+ bytes)
- [ ] `GEMINI_API_KEY` set
- [ ] Remove `FIREBASE_SERVICE_ACCOUNT_PATH` from Vercel env
- [ ] Google Document AI processor exists in same GCP project
- [ ] Firebase authorized domains updated

### Post-deploy smoke test

- [ ] Home loads with new copy
- [ ] `/login` — Google sign-in works
- [ ] `/account` — profile save returns JSON (not empty)
- [ ] Address scan completes
- [ ] Strata upload + processing completes on small PDF
- [ ] Strata ask returns answer
- [ ] Check Vercel function logs for Firebase admin init errors

### Production hardening

- [ ] Enable WAF / rate limiting at edge (Vercel Firewall or Cloudflare)
- [ ] Add Sentry DSN
- [ ] Set up Vercel Cron for retention cleanup
- [ ] Review function max duration on current plan
- [ ] Seed Firestore collections OR disable demo fallback in production

## Known production incident (resolved in code)

**Profile save JSON parse error** — Caused by missing Firebase Admin credentials on Vercel (`707a284`). Fix: `FIREBASE_SERVICE_ACCOUNT_JSON` + safer client parsing.

## TODO

- [ ] Confirm Vercel plan name and function timeout/memory limits
- [ ] Confirm max request body size for PDF uploads on current plan
