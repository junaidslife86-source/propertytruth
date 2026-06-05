-- Nearby scan function (meters, configurable radius)
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
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$$;
