# API & Integrations

## API routes overview

All routes live under `src/app/api/`. Auth column: **Firebase JWT** = `Authorization: Bearer`; **Session** = `x-strata-session` or `x-inspection-session`.

| Endpoint | Method | Purpose | Auth | Key files |
|----------|--------|---------|------|-----------|
| `/api/places/autocomplete` | GET | Address suggestions | None | `places/autocomplete/route.ts`, `lib/places/autocomplete.ts` |
| `/api/geocode` | POST | Resolve address → lat/lng | None | `geocode/route.ts`, `lib/places/geocode.ts` |
| `/api/scan` | POST | Property area scan | None | `scan/route.ts`, `lib/data/scan-service.ts` |
| `/api/property/[id]/insights` | POST | Gemini area summary | None | `insights/route.ts`, `lib/ai/gemini.ts` |
| `/api/saved` | POST | Save report to Firestore | Firebase JWT | `saved/route.ts` |
| `/api/user` | GET | Load user profile | Firebase JWT | `user/route.ts`, `lib/firebase/users.ts` |
| `/api/user` | PATCH | Update profile/preferences | Firebase JWT | `user/route.ts` |
| `/api/user/link-session` | POST | Link anonymous strata/inspection to user | Firebase JWT | `user/link-session/route.ts` |
| `/api/strata/upload` | POST | Upload PDF, queue processing | Session + optional JWT | `strata/upload/route.ts` |
| `/api/strata/[id]` | GET | Fetch strata document | Session/JWT + access check | `strata/[id]/route.ts` |
| `/api/strata/[id]` | PATCH | Update retention | Session/JWT | `strata/[id]/route.ts` |
| `/api/strata/[id]` | DELETE | Delete doc + storage | Session/JWT | `strata/[id]/route.ts` |
| `/api/strata/[id]/status` | GET | Processing status poll | Session/JWT | `strata/[id]/status/route.ts` |
| `/api/strata/[id]/process` | POST | Run analysis pipeline | Internal secret | `strata/[id]/process/route.ts` |
| `/api/strata/[id]/ask` | POST | Q&A over document | Session/JWT | `strata/[id]/ask/route.ts` |
| `/api/inspections` | POST | Create cloud inspection | Session | `inspections/route.ts` |
| `/api/inspections/[id]/photos` | POST | Upload inspection photo | Session + access | `inspections/[id]/photos/route.ts` |
| `/auth/callback` | GET | Legacy redirect stub | N/A | `auth/callback/route.ts` |

## Server actions

**None identified** for core flows. Business logic uses Route Handlers.

## Request / response shapes (key endpoints)

### POST `/api/scan`

**Input** (`scanRequestSchema`):
```json
{
  "formattedAddress": "string",
  "lat": number,
  "lng": number,
  "suburb": "string?",
  "postcode": "string?",
  "radiusMeters": 500
}
```

**Output:** `PropertyScanResult` — see `src/lib/schemas.ts` (`propertyScanResultSchema`)

---

### POST `/api/geocode`

**Input:** `placeId` OR `address` OR `lat`+`lng`

**Output:** `{ formattedAddress, lat, lng, suburb?, postcode? }`

**Fallback:** `demoGeocode()` for `demo-*` place IDs

---

### PATCH `/api/user`

**Input** (`userUpdateSchema`): partial `displayName`, `phone`, `preferences`, `buyerProfile`

**Output:** Full `UserDocument`

**Errors:** `503 FIREBASE_ADMIN_MISSING` if admin not configured on Vercel

---

### POST `/api/strata/upload`

**Input:** `multipart/form-data` — `file` (PDF), `retentionPolicy`, optional `propertyCaseId`

**Headers:** `x-strata-session` (required), `Authorization` (optional)

**Output:** `{ id: documentId }`

**Side effect:** Triggers `POST /api/strata/[id]/process` with internal secret

---

### POST `/api/strata/[id]/ask`

**Input:** `{ question: string }`

**Output:** `{ answer, sources: [{ pageNumber, excerpt }] }` + PII redaction on answer

---

## External integrations

| Integration | Called from | Auth |
|-------------|-------------|------|
| Firebase Auth (client) | `lib/firebase/client.ts` | API key (public) |
| Firebase Admin | `lib/firebase/admin.ts` | Service account |
| Google Gemini | `lib/ai/gemini.ts`, strata extractors | `GEMINI_API_KEY` |
| Google Document AI | `lib/document-ai/ocr.ts` | Service account / GCP |
| AddressFinder | `lib/places/addressfinder.ts` | Key + secret |
| Google Places | `lib/places/google-autocomplete.ts` | `GOOGLE_PLACES_API_KEY` |
| Nominatim | `lib/places/nominatim-autocomplete.ts` | User-Agent only |
| Supabase | `etl/pipelines/import-geojson.ts` only | Service role key |

## Auth / session behaviour

```
Anonymous strata user:
  localStorage strata-session UUID → x-strata-session header

Signed-in user:
  Firebase ID token → Authorization header
  + session header still sent (link-session merges docs to userId)

Strata process (server-to-server):
  x-internal-process-secret from upload route trigger
```

Access matching (`src/lib/auth/access.ts`):
- `userId` on document matches JWT uid, OR
- `clientSessionId` matches session header

## Error handling patterns

| Pattern | Example |
|---------|---------|
| Zod `safeParse` → 400 | Most POST bodies |
| `AccessDeniedError` → 403/404 | Strata/inspection |
| `rateLimit` → 429 | All major routes |
| try/catch → 500 + message | Firestore operations |
| Demo/offline codes | `{ code: "OFFLINE" }`, `{ code: "AUTH_REQUIRED" }` |
| Client parse guard | `src/lib/api/parse-response.ts` (empty body protection) |

## Security notes per endpoint

| Endpoint | Concern |
|----------|---------|
| `/api/scan` | Unauthenticated; burns compute; returns demo data |
| `/api/property/[id]/insights` | Unauthenticated Gemini calls |
| `/api/places/autocomplete` | Unauthenticated; external API cost |
| `/api/strata/upload` | PDF bomb, malware — PDF-only + 50MB cap |
| `/api/strata/[id]/process` | Protected by secret; dev allows without secret |
| `/api/saved` | Requires JWT — good |
| `/api/user` | Requires JWT — good |

## Rate limits (in-memory)

| Route | Limit | Window |
|-------|-------|--------|
| scan | 15/IP | 60s |
| strata upload | 5/session + 10/IP | 60s |
| strata ask | 20/session or IP | 60s |
| user read | 60/IP | 60s |
| user write | 30/IP | 60s |
| insights | 10/IP | 60s |

**Note:** Resets per serverless instance; not distributed.

## TODO

- [ ] Add OpenAPI spec generation (does not exist today)
- [ ] Document exact Firestore indexes required in Firebase console
