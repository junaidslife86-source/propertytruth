-- Inspection Copilot schema

CREATE TYPE public.property_type AS ENUM (
  'apartment',
  'townhouse',
  'freestanding_house'
);

CREATE TYPE public.inspection_room_type AS ENUM (
  'kitchen',
  'bathroom',
  'bedrooms',
  'balcony',
  'garage',
  'exterior',
  'common_areas'
);

CREATE TYPE public.inspection_severity AS ENUM (
  'ok',
  'minor',
  'major',
  'not_checked'
);

CREATE TYPE public.inspection_status AS ENUM (
  'draft',
  'in_progress',
  'completed'
);

CREATE TABLE IF NOT EXISTS public.inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  client_session_id TEXT,
  property_address TEXT NOT NULL DEFAULT '',
  property_type public.property_type NOT NULL,
  status public.inspection_status NOT NULL DEFAULT 'draft',
  readiness_score INTEGER CHECK (readiness_score >= 0 AND readiness_score <= 100),
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inspections_user_id_idx ON public.inspections (user_id);
CREATE INDEX IF NOT EXISTS inspections_session_id_idx ON public.inspections (client_session_id);

CREATE TABLE IF NOT EXISTS public.inspection_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  room_type public.inspection_room_type NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (inspection_id, room_type)
);

CREATE INDEX IF NOT EXISTS inspection_rooms_inspection_id_idx
  ON public.inspection_rooms (inspection_id);

CREATE TABLE IF NOT EXISTS public.inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.inspection_rooms(id) ON DELETE CASCADE,
  checklist_key TEXT NOT NULL,
  label TEXT NOT NULL,
  severity public.inspection_severity NOT NULL DEFAULT 'not_checked',
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, checklist_key)
);

CREATE INDEX IF NOT EXISTS inspection_items_room_id_idx
  ON public.inspection_items (room_id);

CREATE TABLE IF NOT EXISTS public.inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inspection_items(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inspection_photos_inspection_id_idx
  ON public.inspection_photos (inspection_id);
CREATE INDEX IF NOT EXISTS inspection_photos_item_id_idx ON public.inspection_photos (item_id);

-- Storage bucket for inspection photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inspection-photos',
  'inspection-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own inspections"
  ON public.inspections FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Manage rooms via inspection"
  ON public.inspection_rooms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_id
        AND (i.user_id = auth.uid() OR i.user_id IS NULL)
    )
  );

CREATE POLICY "Manage items via room"
  ON public.inspection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspection_rooms r
      JOIN public.inspections i ON i.id = r.inspection_id
      WHERE r.id = room_id
        AND (i.user_id = auth.uid() OR i.user_id IS NULL)
    )
  );

CREATE POLICY "Manage photos via inspection"
  ON public.inspection_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.inspections i
      WHERE i.id = inspection_id
        AND (i.user_id = auth.uid() OR i.user_id IS NULL)
    )
  );

CREATE POLICY "Upload inspection photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inspection-photos');

CREATE POLICY "Read own inspection photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspection-photos');
