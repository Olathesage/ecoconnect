-- EcoConnect Ekiti backend database schema
-- Supabase (PostgreSQL)

create extension if not exists "pgcrypto";

-- Reports submitted by citizens
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  description text not null,
  category text not null,
  severity text not null,
  location_text text,
  latitude numeric,
  longitude numeric,
  summary text,
  language text not null default 'en',
  needs_review boolean not null default false,
  review_reason text,
  detected_issue text,
  ai_reason text,
  forward_message text,
  recommended_agency_id uuid,
  status text not null default 'pending',
  photo_url text,
  audio_url text,
  contact text,
  raw_ai_output jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reports
  add constraint reports_category_check
  check (category in (
    'waste', 'drainage', 'road', 'water', 'streetlight',
    'power_outage', 'hostel_facility', 'other'
  ));

alter table public.reports
  add constraint reports_severity_check
  check (severity in ('low', 'medium', 'high', 'urgent'));

alter table public.reports
  add constraint reports_status_check
  check (status in ('pending', 'forwarded', 'in_progress', 'resolved'));

alter table public.reports
  add constraint reports_language_check
  check (language in ('en', 'yo', 'pcm'));

-- Status history for every report status transition
create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  old_status text,
  new_status text not null,
  updated_by text,
  note text,
  created_at timestamptz not null default now()
);

-- Agency directory (placeholder records only)
create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  agency_name text not null,
  category text not null,
  location text,
  contact_email text,
  contact_phone text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.agencies
  add constraint agencies_category_check
  check (category in (
    'waste', 'drainage', 'road', 'water', 'streetlight',
    'power_outage', 'hostel_facility', 'other'
  ));

-- Atomic status update that writes the matching status_history row
create or replace function public.handle_report_status_update()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.status_history (report_id, old_status, new_status, updated_by, note)
    values (new.id, old.status, new.status, null, null);
  end if;
  return new;
end;
$$;

create trigger if not exists reports_status_history_trigger
  before update on public.reports
  for each row
  execute function public.handle_report_status_update();

-- Atomic RPC used by the admin status update endpoint
create or replace function public.apply_report_status_update(
  p_report_id uuid,
  p_status text,
  p_note text,
  p_updated_by text
)
returns public.reports
language plpgsql
as $$
declare
  updated_record public.reports;
begin
  update public.reports
  set status = p_status,
      updated_at = now()
  where id = p_report_id
  returning * into updated_record;

  if not found then
    raise exception 'Report not found';
  end if;

  insert into public.status_history (report_id, old_status, new_status, updated_by, note)
  values (p_report_id, (select status from public.reports where id = p_report_id), p_status, p_updated_by, p_note);

  return updated_record;
end;
$$;

-- Reference sequence: ECO-0001, ECO-0002, ...
create sequence if not exists public.report_reference_seq;

create or replace function public.generate_report_reference()
returns text
language plpgsql
as $$
declare
  next_value int;
begin
  next_value := nextval('public.report_reference_seq');
  return 'ECO-' || lpad(next_value::text, 4, '0');
end;
$$;

-- Indexes
create index if not exists reports_reference_idx on public.reports (reference);
create index if not exists reports_category_idx on public.reports (category);
create index if not exists reports_severity_idx on public.reports (severity);
create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_created_at_idx on public.reports (created_at);

-- Row Level Security: no public access; server-side service role only.
alter table public.reports enable row level security;
alter table public.status_history enable row level security;
alter table public.agencies enable row level security;
