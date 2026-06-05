-- Sydney Development Radar — core schema

-- Users (extends Supabase auth.users via trigger pattern; profile table)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formatted_address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  suburb TEXT,
  postcode TEXT,
  geometry GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS properties_geometry_gix ON public.properties USING GIST (geometry);

CREATE TABLE IF NOT EXISTS public.development_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  council TEXT NOT NULL,
  application_number TEXT NOT NULL,
  address TEXT,
  application_type TEXT,
  development_type TEXT,
  estimated_cost NUMERIC,
  lodged_date DATE,
  status TEXT,
  storeys INTEGER,
  description TEXT,
  geometry GEOGRAPHY(POINT, 4326) NOT NULL,
  raw_source_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (council, application_number)
);

CREATE INDEX IF NOT EXISTS development_applications_geometry_gix
  ON public.development_applications USING GIST (geometry);

CREATE TABLE IF NOT EXISTS public.infrastructure_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT,
  summary TEXT,
  geometry GEOGRAPHY(GEOMETRY, 4326) NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS infrastructure_projects_geometry_gix
  ON public.infrastructure_projects USING GIST (geometry);

CREATE TABLE IF NOT EXISTS public.zoning_overlays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoning_type TEXT NOT NULL,
  council TEXT,
  geometry GEOGRAPHY(GEOMETRY, 4326) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS zoning_overlays_geometry_gix
  ON public.zoning_overlays USING GIST (geometry);

CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_reports_user_id_idx ON public.saved_reports (user_id);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoning_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Public read DAs" ON public.development_applications FOR SELECT USING (true);
CREATE POLICY "Public read infrastructure" ON public.infrastructure_projects FOR SELECT USING (true);
CREATE POLICY "Public read zoning" ON public.zoning_overlays FOR SELECT USING (true);

CREATE POLICY "Users read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users manage own saved reports" ON public.saved_reports
  FOR ALL USING (auth.uid() = user_id);
