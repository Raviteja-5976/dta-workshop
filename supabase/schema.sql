-- ============================================================================
-- DevTrackAcademy — Supabase / Postgres schema
-- ----------------------------------------------------------------------------
-- Paste this whole file into the Supabase SQL Editor and run it.
-- It is idempotent-ish (uses IF NOT EXISTS where possible). Run on a fresh DB.
--
-- Design summary
--   workshop           = reusable content (title, about, faq, outcomes...)
--   workshop_batch     = one run of a workshop (price, seats, dates, status)
--   batch_session      = per-batch session with its own timing & topics
--   profile            = extends auth.users with name/phone/role
--   registration       = who signed up for a batch + confirmation
--   payment            = who paid, how much, status
--   certificate        = credential issued on completion
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUM TYPES  (mirror the string unions in src/data/workshops.ts)
-- ----------------------------------------------------------------------------
do $$ begin
  create type difficulty_level as enum ('Beginner', 'Intermediate', 'Advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type workshop_category as enum
    ('Frontend', 'Backend', 'AI', 'Career', 'Dev Tools', 'Portfolio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type batch_status as enum ('Upcoming', 'Live', 'Completed', 'Cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type registration_status as enum
    ('pending', 'confirmed', 'waitlisted', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum
    ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('student', 'instructor', 'admin');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Utility: keep updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- 1. INSTRUCTORS  (optional but keeps "instructor" reusable & structured)
-- ============================================================================
create table if not exists instructors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  title       text,                 -- e.g. "Lead Architect"
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 2. WORKSHOPS  (the reusable content / "template")
--    Maps to the static, non-changing fields of the Workshop interface.
-- ============================================================================
create table if not exists workshops (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,              -- 'build-your-portfolio'
  title             text not null,
  description       text not null,                     -- short card text
  about_text        text,                              -- long "About this Workshop"
  cover_image       text,
  difficulty        difficulty_level not null,
  category          workshop_category not null,
  default_instructor_id uuid references instructors(id) on delete set null,

  -- Lightweight, rarely-queried arrays kept as JSONB so the whole workshop
  -- loads in one row. Shapes below match src/data/workshops.ts exactly.
  highlights        jsonb not null default '[]',       -- ["4 Live Classes", ...]
  learning_outcomes jsonb not null default '[]',       -- [{ "title":"", "desc":"" }]
  faq               jsonb not null default '[]',       -- [{ "q":"", "a":"" }]

  is_published      boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_workshops_updated on workshops;
create trigger trg_workshops_updated before update on workshops
  for each row execute function set_updated_at();

-- ============================================================================
-- 3. WORKSHOP_BATCHES  (one row per RUN — this is where price/seats/dates vary)
--    Maps to: price, originalPrice, date, status, seatLimit, sessions, duration
-- ============================================================================
create table if not exists workshop_batches (
  id              uuid primary key default gen_random_uuid(),
  workshop_id     uuid not null references workshops(id) on delete cascade,
  instructor_id   uuid references instructors(id) on delete set null, -- override per run
  batch_label     text not null default 'Batch 1',  -- "Join Batch 1"
  status          batch_status not null default 'Upcoming',

  -- Timing
  date_label      text,               -- human string shown on cards: "11 - 12 July"
  start_date      date,               -- machine-usable for sorting/filtering
  end_date        date,
  duration_label  text,               -- "2 Days"
  num_sessions    int not null default 0,
  timezone        text not null default 'Asia/Kolkata',

  -- Pricing (in the smallest sensible unit; here whole rupees to match the UI)
  currency        text not null default 'INR',
  price           numeric(10,2) not null default 0,
  original_price  numeric(10,2),

  -- Capacity.  seats_taken is DERIVED from confirmed registrations (see view
  -- batch_seat_status). Keep a seat_limit here; do not hand-maintain a counter.
  seat_limit      int not null default 50,

  registration_open boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_batches_workshop on workshop_batches(workshop_id);
create index if not exists idx_batches_status   on workshop_batches(status);

drop trigger if exists trg_batches_updated on workshop_batches;
create trigger trg_batches_updated before update on workshop_batches
  for each row execute function set_updated_at();

-- ============================================================================
-- 4. BATCH_SESSIONS  (per-batch schedule — timings differ between runs)
--    Maps to the SessionDetails interface (num, title, duration, topics,
--    assignment, resources).
-- ============================================================================
create table if not exists batch_sessions (
  id            uuid primary key default gen_random_uuid(),
  batch_id      uuid not null references workshop_batches(id) on delete cascade,
  session_order int not null,                 -- 1,2,3,4  (drives "Session 1")
  title         text not null,
  duration_label text,                        -- "2 Hours"
  scheduled_at  timestamptz,                  -- actual real timing of this run
  topics        jsonb not null default '[]',  -- ["VS Code Config", ...]
  assignment    text,
  resources     jsonb not null default '[]',  -- ["Cursor Cheat Sheet", ...]
  created_at    timestamptz not null default now(),
  unique (batch_id, session_order)
);

create index if not exists idx_sessions_batch on batch_sessions(batch_id);

-- ============================================================================
-- 5. PROFILES  (extends Supabase auth.users — the "their info" you asked for)
-- ============================================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'student',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- 6. REGISTRATIONS  (who signed up for a batch + confirmation)
-- ============================================================================
create table if not exists registrations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  batch_id          uuid not null references workshop_batches(id) on delete cascade,
  status            registration_status not null default 'pending',

  -- Snapshot of registrant info at time of signup (name/email can change later)
  full_name         text,
  email             text,
  phone             text,

  -- Confirmation
  confirmation_code text unique,           -- e.g. 'DTA-PORT-7F3A9'
  confirmed_at      timestamptz,

  registered_at     timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (user_id, batch_id)               -- one registration per person per run
);

create index if not exists idx_reg_batch on registrations(batch_id);
create index if not exists idx_reg_user  on registrations(user_id);
create index if not exists idx_reg_status on registrations(status);

drop trigger if exists trg_reg_updated on registrations;
create trigger trg_reg_updated before update on registrations
  for each row execute function set_updated_at();

-- ============================================================================
-- 7. PAYMENTS  (who paid, how much, status — linked to a registration)
-- ============================================================================
create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  registration_id     uuid not null references registrations(id) on delete cascade,
  user_id             uuid not null references profiles(id) on delete cascade,
  batch_id            uuid not null references workshop_batches(id) on delete cascade,

  amount              numeric(10,2) not null,
  currency            text not null default 'INR',
  status              payment_status not null default 'pending',

  -- Gateway details (Razorpay / Stripe / etc.)
  provider            text,               -- 'razorpay'
  provider_order_id   text,
  provider_payment_id text unique,
  payment_method      text,               -- 'upi' | 'card' | 'netbanking'
  receipt_url         text,

  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_pay_reg   on payments(registration_id);
create index if not exists idx_pay_user  on payments(user_id);
create index if not exists idx_pay_batch on payments(batch_id);

drop trigger if exists trg_pay_updated on payments;
create trigger trg_pay_updated before update on payments
  for each row execute function set_updated_at();

-- ============================================================================
-- 8. CERTIFICATES  (credential issued on completion — powers /certificate)
-- ============================================================================
create table if not exists certificates (
  id                uuid primary key default gen_random_uuid(),
  certificate_code  text not null unique,          -- 'DTA-PORT-99321-A'
  user_id           uuid references profiles(id) on delete set null,
  batch_id          uuid references workshop_batches(id) on delete set null,

  -- Snapshots so the printed certificate never changes even if source rows do
  student_name      text not null,
  student_email     text,
  workshop_name     text not null,
  workshop_date     text,
  duration_label    text,
  completion_date   date,
  issued_at         timestamptz not null default now(),
  is_revoked        boolean not null default false
);

create index if not exists idx_cert_user on certificates(user_id);

-- ============================================================================
-- 9. SEAT STATUS VIEW  (the "seats filled / remaining" numbers, always correct)
--    Confirmed registrations = a filled seat.
-- ============================================================================
create or replace view batch_seat_status as
select
  b.id                                             as batch_id,
  b.seat_limit,
  count(r.id) filter (where r.status = 'confirmed') as seats_taken,
  greatest(b.seat_limit
    - count(r.id) filter (where r.status = 'confirmed'), 0) as seats_remaining
from workshop_batches b
left join registrations r on r.batch_id = b.id
group by b.id, b.seat_limit;

-- ============================================================================
-- 10. ROW LEVEL SECURITY
--     Public content is readable by anyone; personal rows only by their owner.
--     Writes to catalog/payments should go through the service_role key
--     (server-side), which bypasses RLS.
-- ============================================================================
alter table workshops        enable row level security;
alter table workshop_batches enable row level security;
alter table batch_sessions   enable row level security;
alter table instructors      enable row level security;
alter table profiles         enable row level security;
alter table registrations    enable row level security;
alter table payments         enable row level security;
alter table certificates     enable row level security;

-- Public catalog: anyone (even logged-out) can read
create policy "public read workshops"
  on workshops for select using (is_published = true);
create policy "public read batches"
  on workshop_batches for select using (true);
create policy "public read sessions"
  on batch_sessions for select using (true);
create policy "public read instructors"
  on instructors for select using (true);
-- Certificates are verifiable by anyone who has the code (public verify page)
create policy "public read certificates"
  on certificates for select using (true);

-- Profiles: a user sees & edits only their own
create policy "own profile read"
  on profiles for select using (auth.uid() = id);
create policy "own profile update"
  on profiles for update using (auth.uid() = id);

-- Registrations: user manages only their own rows
create policy "own registrations read"
  on registrations for select using (auth.uid() = user_id);
create policy "own registrations insert"
  on registrations for insert with check (auth.uid() = user_id);
create policy "own registrations update"
  on registrations for update using (auth.uid() = user_id);

-- Payments: user can read only their own; inserts/updates via service role
create policy "own payments read"
  on payments for select using (auth.uid() = user_id);

-- ============================================================================
-- 11. SEED — the Portfolio workshop, ported from src/data/workshops.ts
--     (Delete or edit this block; it's just to show the shape working.)
-- ============================================================================
with ins_ws as (
  insert into workshops (slug, title, description, about_text, difficulty, category,
                         highlights, learning_outcomes, faq)
  values (
    'build-your-portfolio',
    'Build Your Portfolio Website Using AI',
    'Build a complete developer portfolio website from scratch using AI-assisted development, modern frontend tools, and deployment best practices.',
    'This intensive 2-day live workshop is designed specifically for developers who want to escape tutorial hell and launch a production-grade portfolio...',
    'Beginner', 'Portfolio',
    '["4 Interactive Live Classes","Verified Github PR Reviews","Life-time community access","Free developer resources bundle"]'::jsonb,
    '[{"title":"Deploy Live App","desc":"Deploy a responsive React site on Vercel mapped to your domain."},
      {"title":"AI Developer Flow","desc":"Master prompt chains, vibe coding, and AI context libraries."},
      {"title":"Portfolio Project","desc":"Add a premium, responsive project to show recruiters."},
      {"title":"Framer Animations","desc":"Implement magnetic cards, scroll effects, and custom triggers."}]'::jsonb,
    '[{"q":"Why only 50 students per batch?","a":"We cap classes strictly so instructors can give detailed reviews."},
      {"q":"Do I need prior programming experience?","a":"Basic HTML, CSS, and JavaScript is recommended, but it is beginner friendly."}]'::jsonb
  )
  returning id
),
ins_batch as (
  insert into workshop_batches (workshop_id, batch_label, status, date_label,
                                start_date, end_date, duration_label, num_sessions,
                                price, original_price, seat_limit)
  select id, 'Batch 1', 'Live', '11 - 12 July',
         date '2026-07-11', date '2026-07-12', '2 Days', 4,
         999, 2999, 50
  from ins_ws
  returning id
)
insert into batch_sessions (batch_id, session_order, title, duration_label, topics, assignment, resources)
select id, 1, 'Setting Up Development Environment', '2 Hours',
       '["VS Code Configuration","Git & GitHub Setup","AI Code Tools Integration","Cursor IDE Settings"]'::jsonb,
       'Setup your complete development environment and push a template repo to GitHub.',
       '["Cursor Settings Cheat Sheet","DTA Starter Boilerplate"]'::jsonb
from ins_batch;

-- ============================================================================
-- Handy query examples
-- ----------------------------------------------------------------------------
-- Catalog card data with live seat counts:
--   select w.title, b.price, b.original_price, b.date_label, s.seats_remaining
--   from workshops w
--   join workshop_batches b on b.workshop_id = w.id
--   join batch_seat_status s on s.batch_id = b.id;
--
-- Everyone who paid for a batch + their info:
--   select p.full_name, p.email, pay.amount, pay.status, r.confirmation_code
--   from payments pay
--   join profiles p on p.id = pay.user_id
--   join registrations r on r.id = pay.registration_id
--   where pay.batch_id = '<batch-uuid>' and pay.status = 'paid';
-- ============================================================================
