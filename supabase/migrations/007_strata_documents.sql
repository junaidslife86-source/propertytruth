-- Strata report document analysis

CREATE TYPE public.document_status AS ENUM (
  'uploaded',
  'processing',
  'ready',
  'failed'
);

CREATE TYPE public.finding_severity AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE public.finding_confidence AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  client_session_id TEXT,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  page_count INTEGER,
  status public.document_status NOT NULL DEFAULT 'uploaded',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents (user_id);
CREATE INDEX IF NOT EXISTS documents_session_id_idx ON public.documents (client_session_id);
CREATE INDEX IF NOT EXISTS documents_status_idx ON public.documents (status);

CREATE TABLE IF NOT EXISTS public.document_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  text_content TEXT NOT NULL DEFAULT '',
  char_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, page_number)
);

CREATE INDEX IF NOT EXISTS document_pages_document_id_idx
  ON public.document_pages (document_id);

CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.document_pages(id) ON DELETE SET NULL,
  page_number INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  char_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, page_number, chunk_index)
);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx
  ON public.document_chunks (document_id);

CREATE TABLE IF NOT EXISTS public.document_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  severity public.finding_severity NOT NULL DEFAULT 'medium',
  plain_english_explanation TEXT NOT NULL,
  supporting_quote TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  confidence public.finding_confidence NOT NULL DEFAULT 'medium',
  chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_findings_document_id_idx
  ON public.document_findings (document_id);
CREATE INDEX IF NOT EXISTS document_findings_category_idx
  ON public.document_findings (category);

-- Storage bucket for strata PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'strata-documents',
  'strata-documents',
  false,
  15728640,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Manage pages via document"
  ON public.document_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND (d.user_id = auth.uid() OR d.user_id IS NULL)
    )
  );

CREATE POLICY "Manage chunks via document"
  ON public.document_chunks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND (d.user_id = auth.uid() OR d.user_id IS NULL)
    )
  );

CREATE POLICY "Manage findings via document"
  ON public.document_findings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_id
        AND (d.user_id = auth.uid() OR d.user_id IS NULL)
    )
  );

CREATE POLICY "Upload strata documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'strata-documents');

CREATE POLICY "Read strata documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'strata-documents');
