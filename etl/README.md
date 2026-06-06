# ETL Pipeline — Sydney Development Radar

Scalable ingestion for NSW planning and infrastructure datasets.

## Structure

```
etl/
├── config.ts          # Shared ETL configuration
├── lib/
│   ├── logger.ts      # Structured logging
│   ├── retry.ts       # Retry with backoff
│   ├── geometry.ts    # CRS normalization, validation
│   └── validate.ts    # Zod schema validation
└── pipelines/
    └── import-geojson.ts
```

## Pipeline steps

1. **Ingest** — read GeoJSON, CSV, or shapefile (via `ogr2ogr` for shapefiles)
2. **Validate** — schema check with Zod
3. **Clean** — fix invalid geometries, drop null coords
4. **Normalize** — WGS84 (EPSG:4326)
5. **Load** — upsert into PostGIS via Supabase service role

## Run import

```bash
npm run etl:import -- --file ./data/seed/sydney-sample.json --table development_applications
npm run etl:import -- --file ./data/seed/risk-overlays-sample.geojson --table risk_overlays
```

### Risk overlay GeoJSON properties

| Property | Required | Description |
|----------|----------|-------------|
| `category` | yes | `flood`, `bushfire`, `heritage`, `aircraft_noise`, `contamination` |
| `name` | yes | Overlay display name |
| `severity` | no | `low`, `medium`, `high` (default: medium) |
| `source` | no | Dataset authority |
| `source_url` | no | Link to source dataset |
| `last_updated` | no | ISO date string |

Geometry must be `Polygon` or `MultiPolygon` (or `Point` for single-location markers).

Requires `SUPABASE_SERVICE_ROLE_KEY` and applied migrations.

## Supported sources (future)

- NSW Planning Portal open data
- NSW Spatial Services
- Council open datasets
- Transport infrastructure datasets

## Logging

Logs are written to stdout as JSON lines for easy ingestion into Vercel/log drains.
