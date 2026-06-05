# Sydney Development Radar

Buyer-side property intelligence for Sydney — understand nearby development applications, infrastructure, and zoning context before you buy.

**Product philosophy:** *Help buyers avoid future regret.*

## Stack

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI, Framer Motion
- **Backend:** Supabase (PostgreSQL + PostGIS)
- **Maps:** MapLibre GL
- **Geocoding:** Google Places API (server-side only)
- **AI:** Gemini Flash (summarisation only)
- **State:** Zustand · **Data:** TanStack Query · **Validation:** Zod

## Quick start

```bash
cd ~/Documents/PropertyTruth
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). **Demo mode** works without API keys — try addresses like `George Street Sydney` or use autocomplete suggestions.

## Environment variables

See `.env.example`. Required for production:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth & RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server scans & ETL |
| `GOOGLE_PLACES_API_KEY` | Address autocomplete & geocoding |
| `GEMINI_API_KEY` | Plain-language summaries |
| `NEXT_PUBLIC_MAPLIBRE_STYLE_URL` | Optional custom map style |

## Supabase & PostGIS setup

1. Create a [Supabase](https://supabase.com) project.
2. Enable PostGIS: **Database → Extensions → postgis**.
3. Run migrations in order:

```bash
# Via Supabase SQL editor or CLI
supabase db push
# Or paste files from supabase/migrations/*.sql
```

4. Enable Auth providers: **Email** and **Google** in Authentication settings.
5. Add redirect URL: `https://your-domain.com/auth/callback`

### Spatial queries

The `scan_nearby_property(lat, lng, radius_meters)` function uses:

- `ST_DWithin` for radius searches (default **500m**)
- `ST_Distance` for ordering
- `ST_Intersects` / `ST_Buffer` for zoning overlays
- **GiST** indexes on all geometry columns

## ETL pipeline

```bash
npm run etl:import -- --file ./data/seed/sydney-sample.json --table development_applications
```

See [etl/README.md](./etl/README.md) for architecture, supported formats (GeoJSON, CSV, shapefiles via `ogr2ogr`), and retry/logging behaviour.

## Deploy to Vercel

1. Import the `PropertyTruth` repository/folder.
2. Set all environment variables from `.env.example`.
3. Deploy — Next.js 15+ App Router is detected automatically.
4. Add the Vercel deployment URL to Supabase Auth redirect URLs.

## Project structure

```
src/
├── app/                 # Routes, API handlers, pages
├── components/          # UI + feature components
├── lib/                 # Schemas, scan service, AI, Supabase
├── providers/           # React Query
└── stores/              # Zustand
etl/                     # Import pipelines
supabase/migrations/     # PostGIS schema
data/seed/               # Sample GeoJSON
```

## Core user flow

1. Enter a Sydney address → autocomplete
2. **Scan Area** → geocode → PostGIS scan (or demo data)
3. Property report: risk summary, developments, map, AI explanation
4. Optional: save report (Supabase Auth)

## Future-ready (not implemented)

Architecture supports later: flood overlays, bushfire, strata PDF analysis, sunlight simulation, insurance risk, inspection workflows.

## License

Private — solo founder iteration.
