-- 한몽 카드 v2 — Supabase schema
-- Supabase Dashboard → SQL Editor → New query → энэ бүхнийг хуулж Run дарна

create table public.user_data (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  custom_cards jsonb not null default '[]'::jsonb,
  srs          jsonb not null default '{}'::jsonb,
  settings     jsonb,
  updated_at   timestamptz not null default now()
);

-- Row Level Security: хэрэглэгч зөвхөн өөрийн мөрөнд хандана
alter table public.user_data enable row level security;

create policy "select own row"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "insert own row"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "update own row"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
