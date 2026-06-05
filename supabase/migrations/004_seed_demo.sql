-- Optional demo seed (run after migrations in dev)
INSERT INTO public.development_applications (
  council, application_number, address, application_type, development_type,
  estimated_cost, lodged_date, status, storeys, description, geometry
) VALUES
(
  'City of Sydney', 'DA-2024-00142', '120 George Street, Sydney NSW',
  'Development Application', 'Mixed-use', 45000000, '2024-03-15', 'Under assessment', 12,
  'Mixed-use tower with retail podium',
  ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326)::geography
),
(
  'City of Sydney', 'DA-2024-00089', '45 Pitt Street, Sydney NSW',
  'Modification', 'Residential', 12000000, '2024-01-22', 'Approved', 8,
  'Boutique residential apartments',
  ST_SetSRID(ST_MakePoint(151.208, -33.8675), 4326)::geography
)
ON CONFLICT (council, application_number) DO NOTHING;

INSERT INTO public.infrastructure_projects (title, type, status, summary, geometry, source)
VALUES (
  'CBD Metro Line upgrade', 'Transport', 'Planning',
  'Station accessibility and concourse expansion works',
  ST_SetSRID(ST_MakePoint(151.21, -33.87), 4326)::geography,
  'Transport for NSW'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.zoning_overlays (zoning_type, council, geometry)
VALUES (
  'B8 Metropolitan Centre', 'City of Sydney',
  ST_Buffer(ST_SetSRID(ST_MakePoint(151.2093, -33.8688), 4326)::geography, 800)
);
