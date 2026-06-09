# Data Model

**Runtime database:** Firebase Firestore only. Geographic MVP: **all NSW** (seed data covers major centres).

---

## Firestore collections

### `users` (`src/lib/auth/user-schema.ts`)

| Field | Notes |
|-------|-------|
| `uid` | Document ID = Firebase Auth UID |
| `email`, `displayName`, `photoURL`, `phone` | |
| `preferences` | scan radius, default strata retention, notifications |
| `buyerProfile` | budget, dealbreakers, risk appetite |
| `workspace` | `{ shortlistIds, compareIds, dueDiligence }` — synced from client |
| `createdAt`, `updatedAt` | ISO strings |

### `property_cases`

User-owned workspace record created on scan when authenticated.

| Field | Notes |
|-------|-------|
| `userId` | Owner |
| `address`, `formattedAddress`, `latitude`, `longitude` | |
| `status` | `explore` \| `shortlist` \| `comparing` \| `archived` |
| `scanSnapshot` | Full `PropertyScanResult` |
| `confidenceScore`, `confidenceLabel` | |
| Subcollection `risk_signals` | Denormalised buyer signals |

### `properties`

Created per scan (`src/lib/firebase/scan.ts`) with `scanSnapshot`.

### Planning seed collections

`developments`, `infrastructure`, `zoning`, `risk_overlays`

- Seeded via `npm run seed:nsw` or `POST /api/admin/seed-nsw`
- Fields include `lat`, `lng`; overlays may include `overlayRadiusMeters`
- UI label: **Seeded sample (NSW)**

### `strata_documents`

| Field | Notes |
|-------|-------|
| `userId` | **Required** for new uploads |
| `clientSessionId` | Legacy / link helper |
| `propertyCaseId` | Optional workspace link |
| `storagePath` | Firebase Storage |
| `processingStatus` | Chunked pipeline stages |
| `pipelineMeta` | `{ sectionIds, nextSectionIndex, ... }` |
| `retentionPolicy`, `retentionExpiresAt` | Enforced by cron |
| `summary` | `StrataReviewSummary` |

**Subcollections:** `pages`, `sections`, `chunks`, `findings`

### `meta/seed`

Provenance for NSW seed run (`seededAt`, `region: NSW`).

---

## Scan result schema

`PropertyScanResult` in `src/lib/schemas.ts`:

- `dataSource`: `"database"` \| `"demo"` — drives `DataSourceBanner`
- `riskOverlays`: optional `lat`, `lng`, `overlayRadiusMeters`, `geometry`

---

## Local storage (client)

| Key | Store |
|-----|-------|
| `propertytruth-due-diligence` | Due diligence (synced to Firestore when signed in) |
| `propertytruth-compare` | Compare list |
| `propertytruth-shortlist` | Shortlist |
| `sessionStorage scan:{id}` | Scan cache for navigation |

---

## Legacy (not runtime)

`supabase/migrations/*.sql` — PostGIS schema reference; ETL not wired to live scan.
