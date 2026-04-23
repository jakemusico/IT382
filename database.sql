-- =============================================================
-- LaundryPro Database Schema (Complete & Final)
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (extends Supabase Auth)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'client')) default 'client',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Orders Table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('pending', 'processing', 'ready', 'completed')) default 'pending',
  total_price numeric not null,
  payment_method text check (payment_method in ('COP', 'COD', 'GCASH')) not null,
  payment_status text check (payment_status in ('unpaid', 'paid', 'verifying')) default 'unpaid',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Payments Table
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  method text check (method in ('COP', 'COD', 'GCASH')) not null,
  gcash_proof_url text,
  status text check (status in ('pending', 'verified')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Setup RLS
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;

-- =====================
-- Helper Function: Check Admin Status (Bypasses Recursion)
-- =====================
create or replace function public.is_admin()
returns boolean as $$
begin
  return (
    auth.jwt()->>'email' = 'manager@laundry.com'
    OR EXISTS (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
end;
$$ language plpgsql security definer;

-- =====================
-- RLS Policies: USERS
-- =====================
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.users;
create policy "Admins can view all profiles" on public.users
  for select using (public.is_admin());

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- =====================
-- RLS Policies: ORDERS
-- =====================
drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders
  for select using (public.is_admin());

drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Users can insert their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can update all orders" on public.orders
  for update using (public.is_admin());

-- =====================
-- RLS Policies: PAYMENTS
-- =====================
drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments" on public.payments
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments" on public.payments
  for select using (public.is_admin());

drop policy if exists "Users can insert payments for their orders" on public.payments;
create policy "Users can insert payments for their orders" on public.payments
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id and orders.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can update payments" on public.payments;
create policy "Admins can update payments" on public.payments
  for update using (public.is_admin());

-- =====================
-- Trigger: Auto-create user profile on signup
-- =====================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    case when new.email = 'manager@laundry.com' then 'admin' else 'client' end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- Storage: GCash Proofs
-- =====================
insert into storage.buckets (id, name, public)
  values ('gcash-proofs', 'gcash-proofs', true)
  on conflict do nothing;

drop policy if exists "Users can upload gcash proofs" on storage.objects;
create policy "Users can upload gcash proofs" on storage.objects
  for insert with check (
    bucket_id = 'gcash-proofs' and auth.role() = 'authenticated'
  );

drop policy if exists "Users can view gcash proofs" on storage.objects;
create policy "Users can view gcash proofs" on storage.objects
  for select using (
    bucket_id = 'gcash-proofs' and auth.role() = 'authenticated'
  );

-- =====================
-- FIX: Force admin role for manager@laundry.com
-- =====================
UPDATE public.users SET role = 'admin' WHERE email = 'manager@laundry.com';
