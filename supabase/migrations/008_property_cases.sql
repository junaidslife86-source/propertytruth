-- Buyer property cases and persisted risk signals

create table if not exists property_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  address text not null,
  formatted_address text,
  latitude double precision,
  longitude double precision,
  property_type text,
  status text not null default 'explore',
  confidence_score integer,
  confidence_label text,
  scan_snapshot jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists buyer_risk_signals (
  id uuid primary key default gen_random_uuid(),
  property_case_id uuid not null references property_cases(id) on delete cascade,
  category text not null,
  severity text not null,
  title text not null,
  plain_english_summary text not null,
  buyer_impact text,
  recommended_action text,
  confidence numeric,
  evidence_sources jsonb not null default '[]',
  raw_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists due_diligence_items (
  id uuid primary key default gen_random_uuid(),
  property_case_id uuid not null references property_cases(id) on delete cascade,
  category text not null,
  label text not null,
  status text not null default 'not_started',
  required boolean not null default false,
  notes text,
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists property_cases_user_id_idx on property_cases (user_id);
create index if not exists property_cases_lat_lng_idx on property_cases (latitude, longitude);
create index if not exists buyer_risk_signals_case_id_idx on buyer_risk_signals (property_case_id);
create index if not exists buyer_risk_signals_category_idx on buyer_risk_signals (category);
create index if not exists buyer_risk_signals_severity_idx on buyer_risk_signals (severity);
create index if not exists due_diligence_items_case_id_idx on due_diligence_items (property_case_id);

alter table property_cases enable row level security;
alter table buyer_risk_signals enable row level security;
alter table due_diligence_items enable row level security;

create policy "Users manage own property cases"
  on property_cases for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Risk signals via property case"
  on buyer_risk_signals for all
  using (
    exists (
      select 1 from property_cases pc
      where pc.id = property_case_id and pc.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from property_cases pc
      where pc.id = property_case_id and pc.user_id = auth.uid()
    )
  );

create policy "Due diligence via property case"
  on due_diligence_items for all
  using (
    exists (
      select 1 from property_cases pc
      where pc.id = property_case_id and pc.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from property_cases pc
      where pc.id = property_case_id and pc.user_id = auth.uid()
    )
  );
