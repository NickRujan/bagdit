-- ============================================================
-- Bagdit pilot schema — run this ONCE in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- Then run seed.sql for the 6 example offers.
-- ============================================================

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  neighborhood text not null default '',
  category text not null check (category in ('food','stay','activity','nightlife')),
  headline text not null,
  value_desc text not null default '',
  the_ask text not null default '',
  spots_total int not null default 1,
  spots_remaining int not null default 1,
  deadline date,
  status text not null default 'open' check (status in ('open','filled','expired')),
  created_at timestamptz not null default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  name text not null,
  email text not null,
  social_handle text not null default '',
  planned_date date,
  status text not null default 'pending' check (status in ('pending','confirmed','declined')),
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete set null,
  offer_text text not null default '',
  name text not null,
  email text not null,
  video_url text not null,
  receipt_path text not null default '',
  receipt_total text not null default '',
  payout_method text not null default '',
  payout_handle text not null default '',
  status text not null default 'pending'
    check (status in ('pending','sent_to_business','approved','rejected','paid')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('creator','business')),
  name text not null default '',
  business_name text not null default '',
  email text not null,
  city text not null default '',
  created_at timestamptz not null default now()
);

-- Security: the app talks to the database ONLY from the server using the
-- service_role key (which bypasses RLS). Turning RLS on with no policies
-- means the public anon key can read/write NOTHING — safest default.
alter table offers enable row level security;
alter table claims enable row level security;
alter table submissions enable row level security;
alter table waitlist enable row level security;

-- Private storage bucket for receipt photos (viewed via signed URLs in admin).
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;
