-- Risk overlay geospatial layers (flood, bushfire, heritage, etc.)

CREATE TYPE public.risk_overlay_category AS ENUM (
  'flood',
  'bushfire',
  'heritage',
  'aircraft_noise',
  'contamination'
);

CREATE TYPE public.risk_overlay_severity AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TABLE IF NOT EXISTS public.risk_overlays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.risk_overlay_category NOT NULL,
  severity public.risk_overlay_severity NOT NULL DEFAULT 'medium',
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  geometry GEOGRAPHY(GEOMETRY, 4326) NOT NULL,
  raw_source_data JSONB,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category, name, source)
);

CREATE INDEX IF NOT EXISTS risk_overlays_geometry_gix
  ON public.risk_overlays USING GIST (geometry);

CREATE INDEX IF NOT EXISTS risk_overlays_category_idx
  ON public.risk_overlays (category);

ALTER TABLE public.risk_overlays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read risk overlays"
  ON public.risk_overlays FOR SELECT USING (true);

-- Demo flood overlay covering inner Sydney CBD (for local testing)
INSERT INTO public.risk_overlays (
  category,
  severity,
  name,
  source,
  source_url,
  geometry,
  raw_source_data,
  last_updated
) VALUES (
  'flood',
  'medium',
  'Probable Maximum Flood — Harbour fringe (demo)',
  'NSW Department of Planning and Environment (demo)',
  'https://www.planningportal.nsw.gov.au/spatialviewer/',
  ST_GeogFromText(
    'SRID=4326;POLYGON((151.198 -33.882, 151.228 -33.882, 151.228 -33.858, 151.198 -33.858, 151.198 -33.882))'
  ),
  '{"demo": true}'::jsonb,
  NOW()
)
ON CONFLICT (category, name, source) DO NOTHING;

-- Extend nearby scan to intersect property point with risk overlays
CREATE OR REPLACE FUNCTION public.scan_nearby_property(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters INTEGER DEFAULT 500
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  origin GEOGRAPHY;
  result JSONB;
BEGIN
  origin := ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::GEOGRAPHY;

  SELECT jsonb_build_object(
    'radius_meters', p_radius_meters,
    'developments', COALESCE((
      SELECT jsonb_agg(row_to_json(d.*))
      FROM (
        SELECT
          da.id,
          da.council,
          da.application_number,
          da.address,
          da.application_type,
          da.development_type,
          da.estimated_cost,
          da.lodged_date,
          da.status,
          da.storeys,
          da.description,
          ROUND(ST_Distance(da.geometry, origin)::numeric, 0) AS distance_meters,
          ST_Y(da.geometry::geometry) AS lat,
          ST_X(da.geometry::geometry) AS lng
        FROM public.development_applications da
        WHERE ST_DWithin(da.geometry, origin, p_radius_meters)
        ORDER BY ST_Distance(da.geometry, origin)
        LIMIT 50
      ) d
    ), '[]'::jsonb),
    'infrastructure', COALESCE((
      SELECT jsonb_agg(row_to_json(i.*))
      FROM (
        SELECT
          ip.id,
          ip.title,
          ip.type,
          ip.status,
          ip.summary,
          ip.source,
          ROUND(ST_Distance(ip.geometry, origin)::numeric, 0) AS distance_meters
        FROM public.infrastructure_projects ip
        WHERE ST_DWithin(ip.geometry, origin, p_radius_meters)
        ORDER BY ST_Distance(ip.geometry, origin)
        LIMIT 20
      ) i
    ), '[]'::jsonb),
    'zoning', COALESCE((
      SELECT jsonb_agg(row_to_json(z.*))
      FROM (
        SELECT
          zo.id,
          zo.zoning_type,
          zo.council
        FROM public.zoning_overlays zo
        WHERE ST_DWithin(zo.geometry, origin, p_radius_meters * 2)
           OR ST_Intersects(zo.geometry, ST_Buffer(origin, p_radius_meters))
        LIMIT 10
      ) z
    ), '[]'::jsonb),
    'risk_overlays', COALESCE((
      SELECT jsonb_agg(row_to_json(ro.*))
      FROM (
        SELECT
          r.id,
          r.category::text,
          r.severity::text,
          r.name,
          r.source,
          r.source_url,
          r.last_updated
        FROM public.risk_overlays r
        WHERE ST_Intersects(r.geometry, origin)
        ORDER BY
          CASE r.severity
            WHEN 'high' THEN 0
            WHEN 'medium' THEN 1
            WHEN 'low' THEN 2
          END,
          r.category
        LIMIT 20
      ) ro
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
