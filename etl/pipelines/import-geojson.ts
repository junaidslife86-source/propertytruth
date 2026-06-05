/**
 * GeoJSON → PostGIS import pipeline
 * Usage: npx tsx etl/pipelines/import-geojson.ts --file path --table development_applications
 */
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { ETL_CONFIG } from "../config";
import { log } from "../lib/logger";
import { withRetry } from "../lib/retry";
import { pointFromFeature, toWktPoint } from "../lib/geometry";
import {
  developmentApplicationRowSchema,
  geoJsonFeatureCollectionSchema,
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

async function main() {
  const { file, table } = parseArgs();
  if (!file) {
    log("error", "Missing --file argument");
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
    const rows = batch
      .map((f) => {
        const pt = pointFromFeature(f.geometry as GeoJSON.Geometry);
        if (!pt) return null;
        const [lng, lat] = pt;
        const p = f.properties;
        return developmentApplicationRowSchema.parse({
          council: String(p.council ?? "Unknown"),
          application_number: String(p.application_number ?? `GEN-${i}`),
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
      })
      .filter(Boolean);

    await withRetry(async () => {
      for (const row of rows) {
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

    log("info", "Batch imported", { offset: i, count: rows.length });
  }

  log("info", "Import complete", { imported, table });
}

main().catch((e) => {
  log("error", "Import failed", { error: String(e) });
  process.exit(1);
});
