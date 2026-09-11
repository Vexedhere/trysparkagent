create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_code text not null unique default ('usr_' || lower(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chat_code text not null unique default ('chat_' || lower(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.chat_threads enable row level security;

create policy "profiles own row" on public.profiles for select using (auth.uid() = id);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id);
create policy "threads own rows" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id) on conflict (id) do nothing; return new; end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
