# User Flows

## Entry points

| Entry | Route | Component |
|-------|-------|-----------|
| Home / search | `/` | `src/app/page.tsx` |
| Direct property URL | `/property/[id]` | `src/app/property/[id]/page.tsx` |
| Compare | `/compare` | `src/app/compare/page.tsx` |
| Shortlist | `/shortlist` | `src/app/shortlist/page.tsx` |
| Strata upload | `/strata/upload` | `src/app/strata/upload/page.tsx` |
| Strata report | `/strata/[id]` | `src/app/strata/[id]/page.tsx` |
| Demo strata | `/strata/demo-strata` | `DEMO_STRATA_ID` in `src/lib/strata/demo.ts` |
| Inspection | `/inspection/new` | `src/app/inspection/new/page.tsx` |
| Login | `/login` | `src/app/login/page.tsx` |
| Account | `/account` | `src/app/account/page.tsx` |
| Onboarding | `/onboarding` | `src/app/onboarding/page.tsx` |
| Privacy / Terms | `/privacy`, `/terms` | Legal pages |

Header navigation: `src/components/site-header.tsx`  
Auth menu: `src/components/auth/user-menu.tsx`

---

## Flow 1: Address search → property report

**User goal:** Understand planning context and buyer risks for an address.

| Step | Screen | Files |
|------|--------|-------|
| 1. Enter address | Home | `src/components/address-search.tsx` |
| 2. Autocomplete | API | `src/app/api/places/autocomplete/route.ts` → `src/lib/places/autocomplete.ts` |
| 3. Geocode | API | `src/app/api/geocode/route.ts` |
| 4. Scan area | API | `src/app/api/scan/route.ts` → `src/lib/data/scan-service.ts` |
| 5. Cache & navigate | Client | `sessionStorage` key `scan:{propertyId}` |
| 6. Property report | `/property/[id]` | `src/app/property/[id]/page.tsx` |

**Tabs:** Overview | Issues | Map | Due diligence | Report (`PropertyReportTabs`)

**UX issues / missing states:**

- Direct URL without sessionStorage → **demo scan** loaded silently
- No error toast on home if scan fails (uses `alert()`)
- No empty state if scan returns zero developments (demo always has data)
- `dataSource: "demo"` badge only on some components (`property-hero.tsx`); property page may not show it prominently

---

## Flow 2: Sign up / login → account

**User goal:** Persist profile and preferences across devices.

| Step | Screen | Files |
|------|--------|-------|
| 1. Sign in | `/login` | `src/app/login/page.tsx` |
| 2. Google or email auth | Client | `src/lib/firebase/client.ts` |
| 3. Auth state | Provider | `src/providers/auth-provider.tsx` |
| 4. Link anonymous sessions | API | `src/app/api/user/link-session/route.ts` |
| 5. Load/create profile | API | `src/app/api/user/route.ts` GET |
| 6. Account settings | `/account` | `src/app/account/page.tsx` |

**Tabs:** Profile | Preferences | Buyer profile

**UX issues:**

- Vercel requires `FIREBASE_SERVICE_ACCOUNT_JSON` — misconfiguration caused empty API responses (fixed with better errors in `707a284`)
- Signed-in user visiting `/login` redirects via `useEffect` (fixed from render-time redirect)
- No email verification flow visible in code
- No password reset UI

---

## Flow 3: Strata PDF upload → analysis → Q&A

**User goal:** Extract red flags from strata report bundle with evidence.

| Step | Screen | Files |
|------|--------|-------|
| 1. Consent panel | Upload | `src/components/compliance/upload-consent-panel.tsx` |
| 2. Choose retention | Upload | `src/app/strata/upload/page.tsx` |
| 3. POST PDF | API | `src/app/api/strata/upload/route.ts` |
| 4. Background process | API | `src/app/api/strata/[id]/process/route.ts` (5 min max) |
| 5. Poll status | API | `src/app/api/strata/[id]/status/route.ts` |
| 6. View report | `/strata/[id]` | Findings, summary, section coverage |
| 7. Ask questions | Panel | `src/app/api/strata/[id]/ask/route.ts` |
| 8. Retention / delete | Settings | `src/components/strata/strata-document-settings.tsx` |

**Access control:** `x-strata-session` header + optional Firebase JWT (`src/lib/auth/access.ts`)

**UX issues:**

- Long processing with 3s polling — no WebSocket/SSE
- Failed processing shows error but retry UX unclear
- No progress % for large PDFs
- Demo strata bypasses upload entirely

---

## Flow 4: Inspection copilot

**User goal:** Checklist + photos during open home.

| Step | Screen | Files |
|------|--------|-------|
| 1. Address + property type | `/inspection/new` | `src/app/inspection/new/page.tsx` |
| 2. Select rooms | Same | `src/lib/inspection/checklists.ts` |
| 3. Create inspection | Client | `src/stores/inspection-store.ts` (localStorage) |
| 4. Room checklist | `/inspection/[id]` | `src/app/inspection/[id]/page.tsx` |
| 5. Photo upload (optional) | Component | `src/components/inspection/photo-upload.tsx` → `src/app/api/inspections/[id]/photos/route.ts` |

**Gap:** Inspection **creation** does not call `POST /api/inspections` — cloud path only works if inspection ID exists in Firestore.

---

## Flow 5: Compare & shortlist

**User goal:** Track and compare candidate properties.

| Flow | Storage | Files |
|------|---------|-------|
| Add to compare (max 4) | localStorage | `src/stores/compare-store.ts`, `src/app/compare/page.tsx` |
| Shortlist (max 20) | localStorage | `src/stores/shortlist-store.ts`, `src/app/shortlist/page.tsx` |

**UX issues:** Data lost on new device; not tied to Firebase user account.

---

## Flow 6: Due diligence tracker

**User goal:** Track checklist items per property.

| Step | Files |
|------|-------|
| Init template on property load | `src/stores/due-diligence-store.ts`, `src/lib/due-diligence/templates.ts` |
| Update item status | `src/components/buyer/due-diligence-tracker.tsx` |
| Coverage calculation | `src/lib/due-diligence/coverage.ts` |

**Storage:** localStorage only — not synced to Firestore `due_diligence_items` (Supabase schema exists in migration `008_property_cases.sql` but unused at runtime).

---

## Flow 7: Onboarding / buyer profile

**User goal:** Set budget, dealbreakers, risk appetite.

| Step | Files |
|------|-------|
| `/onboarding` form | `src/app/onboarding/page.tsx` |
| Local store | `src/stores/buyer-profile-store.ts` |
| Firebase sync (if signed in) | `updateUser({ buyerProfile })` via auth provider |

---

## Flow 8: Save property report

**User goal:** Persist scan for later.

| Step | Files |
|------|-------|
| Save button | `src/components/save-property-button.tsx` |
| Requires auth | Redirect to `/login` if unsigned |
| API | `src/app/api/saved/route.ts` → Firestore `saved_reports` |

**Gap:** No "My saved reports" page or GET endpoint.

---

## Error / empty / loading states

| Area | Loading | Empty | Error |
|------|---------|-------|-------|
| Home scan | Spinner on button | "No results" in autocomplete | `alert()` |
| Property page | `ReportPageSkeleton` | N/A (demo fallback) | Falls back to demo |
| Strata processing | `StrataProcessingTimeline` | N/A | Error message + link to re-upload |
| Login | Spinner while auth loads | N/A | Toast on failure |
| Account save | Button spinner | N/A | Toast with API error |
| Compare | Hydration wait | Empty compare CTA | Unknown |
| AI insight | Card skeleton | Static fallback if no Gemini key | 500 from API |

---

## TODO

- [ ] Map complete flow diagram for signed-in vs anonymous users
- [ ] Verify mobile breakpoints on inspection flow vs property report
