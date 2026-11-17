-- ═══════════════════════════════════════════════════════════════
--  Elite Portfolio — Supabase schema
--  Run this in Supabase Dashboard → SQL Editor (one click).
-- ═══════════════════════════════════════════════════════════════

-- Contact form submissions
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Newsletter subscribers (one per email)
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────────
-- The anon key may INSERT (public forms) but never SELECT.
-- The admin dashboard reads with the service_role key, which
-- bypasses RLS automatically.

alter table public.contacts enable row level security;
alter table public.subscribers enable row level security;

create policy "anon can submit contact"
  on public.contacts for insert to anon with check (true);

create policy "anon can subscribe"
  on public.subscribers for insert to anon with check (true);

-- (intentionally no SELECT policies for anon)

-- Optional: keep the tables small
create index if not exists contacts_created_idx on public.contacts (created_at desc);
create index if not exists subscribers_created_idx on public.subscribers (created_at desc);
