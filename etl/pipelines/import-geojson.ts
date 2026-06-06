/**
 * GeoJSON → PostGIS import pipeline
 * Usage:
 *   npx tsx etl/pipelines/import-geojson.ts --file path --table development_applications
 *   npx tsx etl/pipelines/import-geojson.ts --file path --table risk_overlays
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { ETL_CONFIG } from "../config";
import { log } from "../lib/logger";
import { withRetry } from "../lib/retry";
import {
  geoJsonToEwkt,
  pointFromFeature,
  toWktPoint,
} from "../lib/geometry";
import {
  developmentApplicationRowSchema,
  geoJsonFeatureCollectionSchema,
  riskOverlayCategorySchema,
  riskOverlayRowSchema,
  riskOverlaySeveritySchema,
} from "../lib/validate";

function parseArgs() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  const tableIdx = args.indexOf("--table");
  return {
    file: fileIdx >= 0 ? args[fileIdx + 1] : undefined,
    table: tableIdx >= 0 ? args[tableIdx + 1] : "development_applications",
  };
}

function strProp(
  props: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const val = props[key];
    if (val != null && val !== "") return String(val);
  }
  return undefined;
}

type GeoFeature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
};

function buildDevelopmentRow(f: GeoFeature, index: number) {
  const pt = pointFromFeature(f.geometry as GeoJSON.Geometry);
  if (!pt) return null;
  const [lng, lat] = pt;
  const p = f.properties;
  return developmentApplicationRowSchema.parse({
    council: String(p.council ?? "Unknown"),
    application_number: String(p.application_number ?? `GEN-${index}`),
    address: p.address ? String(p.address) : undefined,
    application_type: p.application_type ? String(p.application_type) : undefined,
    development_type: p.development_type ? String(p.development_type) : undefined,
    estimated_cost: p.estimated_cost ? Number(p.estimated_cost) : undefined,
    lodged_date: p.lodged_date ? String(p.lodged_date) : undefined,
    status: p.status ? String(p.status) : undefined,
    storeys: p.storeys ? Number(p.storeys) : undefined,
    description: p.description ? String(p.description) : undefined,
    lng,
    lat,
    raw_source_data: p,
  });
}

function buildRiskOverlayRow(f: GeoFeature, index: number) {
  const ewkt = geoJsonToEwkt(f.geometry as GeoJSON.Geometry);
  if (!ewkt) return null;

  const p = f.properties;
  const category = riskOverlayCategorySchema.parse(
    String(p.category ?? p.CATEGORY ?? "flood").toLowerCase(),
  );
  const severity = riskOverlaySeveritySchema.parse(
    String(p.severity ?? p.SEVERITY ?? "medium").toLowerCase(),
  );

  return riskOverlayRowSchema.parse({
    category,
    name: strProp(p, "name", "NAME", "overlay_name") ?? `Overlay ${index}`,
    severity,
    source: strProp(p, "source", "SOURCE", "data_source") ?? "Unknown source",
    source_url: strProp(p, "source_url", "sourceUrl", "SOURCE_URL"),
    last_updated: strProp(p, "last_updated", "lastUpdated", "LAST_UPDATED"),
    geometry: ewkt,
    raw_source_data: p,
  });
}

async function main() {
  const { file, table } = parseArgs();
  if (!file) {
    log("error", "Missing --file argument");
    process.exit(1);
  }

  if (!ETL_CONFIG.supportedTables.includes(table as never)) {
    log("error", "Unsupported table", { table });
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    log("error", "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(file, "utf-8"));
  const collection = geoJsonFeatureCollectionSchema.parse(raw);
  const supabase = createClient(url, key);

  let imported = 0;
  for (let i = 0; i < collection.features.length; i += ETL_CONFIG.batchSize) {
    const batch = collection.features.slice(i, i + ETL_CONFIG.batchSize);

    await withRetry(async () => {
      for (let j = 0; j < batch.length; j++) {
        const feature = batch[j];
        const index = i + j;

        if (table === "risk_overlays") {
          const row = buildRiskOverlayRow(feature, index);
          if (!row) continue;

          const { error } = await supabase.from("risk_overlays").upsert(
            {
              category: row.category,
              name: row.name,
              severity: row.severity,
              source: row.source,
              source_url: row.source_url,
              last_updated: row.last_updated ?? new Date().toISOString(),
              geometry: row.geometry,
              raw_source_data: row.raw_source_data,
            },
            { onConflict: "category,name,source" },
          );
          if (error) throw error;
          imported++;
          continue;
        }

        const row = buildDevelopmentRow(feature, index);
        if (!row) continue;

        const { error } = await supabase.from(table).upsert(
          {
            council: row.council,
            application_number: row.application_number,
            address: row.address,
            application_type: row.application_type,
            development_type: row.development_type,
            estimated_cost: row.estimated_cost,
            lodged_date: row.lodged_date,
            status: row.status,
            storeys: row.storeys,
            description: row.description,
            raw_source_data: row.raw_source_data,
            geometry: toWktPoint(row.lng, row.lat),
          },
          { onConflict: "council,application_number" },
        );
        if (error) throw error;
        imported++;
      }
    }, `batch-${i}`);

    log("info", "Batch imported", { offset: i, count: batch.length });
  }

  log("info", "Import complete", { imported, table });
}

main().catch((e) => {
  log("error", "Import failed", { error: String(e) });
  process.exit(1);
});
