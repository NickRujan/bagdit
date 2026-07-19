-- ============================================================
-- Outreach system — run AFTER migration.sql (already applied to
-- the live project on 2026-07-19 via the management API).
-- ============================================================

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  business text not null,
  category text not null default '',
  priority text not null default 'Medium',      -- High / Medium / Low
  owner_name text not null default '',           -- raw "Owner / Contact" cell
  greeting_name text not null default '',        -- what the email says after "Hi"
  phone text not null default '',
  address text not null default '',
  google_rating text not null default '',
  call_window text not null default '',
  offer_idea text not null default '',
  email text not null default '',                -- pasted in via /admin/outreach
  facebook text not null default '',
  hook text not null default '',                 -- personalized first line, editable
  status text not null default 'new'
    check (status in ('new','drafted','approved','sent','followup_drafted',
                      'followed_up','replied','opted_out','bounced',
                      'no_response_call','not_a_fit','called')),
  notes text not null default '',
  last_contacted timestamptz,
  followup_due date,
  created_at timestamptz not null default now()
);

create table if not exists outreach_emails (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id) on delete cascade,
  kind text not null default 'intro' check (kind in ('intro','followup')),
  subject text not null,
  body text not null,
  status text not null default 'draft'
    check (status in ('draft','approved','sent','failed','canceled')),
  sent_at timestamptz,
  error text not null default '',
  created_at timestamptz not null default now()
);

-- tiny key/value store: pause flag, counters, imap cursor, send spacing
create table if not exists outreach_state (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- hard-block list for opt-outs and bounces (checked before every send)
create table if not exists blocked_emails (
  email text primary key,
  reason text not null default '',
  created_at timestamptz not null default now()
);

alter table prospects enable row level security;
alter table outreach_emails enable row level security;
alter table outreach_state enable row level security;
alter table blocked_emails enable row level security;
