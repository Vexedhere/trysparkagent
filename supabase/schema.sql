-- =========================================================
-- SparkAgent — Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) for
-- project nzaelikbjumaidaombmp.
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_code text unique not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select using (auth.uid() = id);

create policy "Profiles are updatable by their owner"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.generate_user_code()
returns text language plpgsql as $$
declare candidate text; exists_already boolean;
begin
  loop
    candidate := 'usr_' || substr(md5(gen_random_uuid()::text), 1, 6);
    select exists(select 1 from public.profiles where user_code = candidate) into exists_already;
    exit when not exists_already;
  end loop;
  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, user_code)
  values (new.id, public.generate_user_code())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  chat_code text unique not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chats enable row level security;
create policy "Chats are viewable by their owner" on public.chats for select using (auth.uid() = owner_id);
create policy "Chats are insertable by their owner" on public.chats for insert with check (auth.uid() = owner_id);
create policy "Chats are updatable by their owner" on public.chats for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Chats are deletable by their owner" on public.chats for delete using (auth.uid() = owner_id);

create or replace function public.generate_chat_code()
returns text language plpgsql as $$
declare candidate text; exists_already boolean;
begin
  loop
    candidate := 'chat_' || upper(substr(md5(gen_random_uuid()::text), 1, 8));
    select exists(select 1 from public.chats where chat_code = candidate) into exists_already;
    exit when not exists_already;
  end loop;
  return candidate;
end;
$$;
