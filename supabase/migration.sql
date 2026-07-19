-- ============================================================
-- Bagdit pilot schema — run this ONCE in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- Then run seed.sql for the 6 example offers.
-- ============================================================

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  neighborhood text not null default '',
  address text not null default '',
  lat double precision,
  lng double precision,
  category text not null check (category in ('food','stay','activity','nightlife')),
  headline text not null,
  retail_value text not null default '',      -- e.g. "$40", shown struck out
  cash_bonus int not null default 0,          -- dollars on top; 0 = perk only
  the_ask text not null default '',           -- one-liner on the card
  brief text not null default '',             -- full brief, auto-emailed on claim
  photo_url text not null default '',         -- optional real photo
  spots_total int not null default 1,
  spots_remaining int not null default 1,
  deadline date,
  status text not null default 'open' check (status in ('open','filled','expired')),
  created_at timestamptz not null default now()
);

-- Creator accounts ("wallet"): password is scrypt-hashed by the app.
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  social_handle text not null default '',
  payout_method text not null default '',
  payout_handle text not null default '',
  created_at timestamptz not null default now()
);

-- One-tap claims: created as 'confirmed', spot taken immediately,
-- expires_at = claim time + 7 days (spot released if no submission).
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  creator_id uuid references creators(id) on delete set null,
  name text not null,
  email text not null,
  social_handle text not null default '',
  planned_date date,
  status text not null default 'confirmed'
    check (status in ('pending','confirmed','declined','expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete set null,
  offer_text text not null default '',
  name text not null,
  email text not null,
  video_url text not null,
  social_post_url text not null default '',   -- public post link, for posting deals
  social_handles text not null default '',    -- creator's socials (optional)
  receipt_path text not null default '',
  receipt_total text not null default '',
  payout_method text not null default '',
  payout_handle text not null default '',
  status text not null default 'pending'
    check (status in ('pending','sent_to_business','approved','rejected','paid')),
  posted boolean not null default false,       -- creator marked it posted to their socials
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- Creator payout requests (fulfilled manually during the pilot).
create table if not exists withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  amount numeric not null default 0,
  payout_method text not null default '',
  payout_handle text not null default '',
  status text not null default 'requested'
    check (status in ('requested','processing','paid','rejected')),
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table withdrawal_requests enable row level security;

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
alter table creators enable row level security;
alter table claims enable row level security;
alter table submissions enable row level security;
alter table waitlist enable row level security;

-- Private storage bucket for receipt photos (viewed via signed URLs in admin).
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;
