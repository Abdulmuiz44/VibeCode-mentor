-- Enable UUID extension for generating unique IDs
create extension if not exists "uuid-ossp";

-- 1. Users Table
-- Stores user profiles, authentication details (for manual auth), and Pro status.
create table if not exists users (
  user_id text primary key, -- Can be Google ID or generated UUID
  email text not null unique,
  name text,
  password text, -- Hashed password for manual auth (nullable for Google auth)
  profile_image text,
  is_pro boolean default false, -- Tracks subscription status
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on email for faster lookups
create index if not exists idx_users_email on users(email);

-- 2. Payments Table
-- Stores transaction history from PayPal and Flutterwave.
create table if not exists payments (
  id uuid default uuid_generate_v4() primary key,
  user_id text references users(user_id),
  email text not null,
  amount numeric not null,
  currency text not null,
  payment_method text not null, -- 'paypal' or 'flutterwave'
  transaction_id text not null unique,
  status text not null, -- 'completed', 'pending', 'failed', 'refunded'
  metadata jsonb default '{}'::jsonb, -- Stores full webhook payload or extra details
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index on transaction_id for faster lookups
create index if not exists idx_payments_transaction_id on payments(transaction_id);

-- 3. Blueprints Table
-- Stores the history of generated blueprints for users.
create table if not exists blueprints (
  id uuid default uuid_generate_v4() primary key,
  user_id text references users(user_id),
  project_idea text not null,
  content text not null, -- The generated markdown content
  vibe text default 'default',
  created_at timestamp with time zone default now()
);

-- 4. Public Prompts Table
-- Stores prompts that are shared publicly.
create table if not exists public_prompts (
  id text primary key,
  user_id text references users(user_id),
  prompt text not null,
  blueprint_id text,
  created_at bigint not null -- Storing as timestamp (number) based on usage
);

-- 5. Row Level Security (RLS) Policies
-- Optional: Enable RLS if you want to restrict access from the client-side.
-- Since most operations are handled server-side with Service Role, these are for extra safety.

alter table users enable row level security;
alter table payments enable row level security;
alter table blueprints enable row level security;
alter table public_prompts enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" on users
  for select using (auth.uid()::text = user_id);

-- Policy: Allow user creation during signup (service role bypass)
create policy "Allow user insert via service role" on users
  for insert with check (true);

-- Policy: Users can update their own profile
create policy "Users can update own profile" on users
  for update using (auth.uid()::text = user_id);

-- Policy: Users can view their own payments
create policy "Users can view own payments" on payments
  for select using (auth.uid()::text = user_id);

-- Policy: Users can view their own blueprints
create policy "Users can view own blueprints" on blueprints
  for select using (auth.uid()::text = user_id);

-- Policy: Public prompts are viewable by everyone
create policy "Public prompts are viewable by everyone" on public_prompts
  for select using (true);
