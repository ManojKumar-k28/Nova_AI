-- Supabase Database Schema for Nova AI
-- Paste this script into the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query) to set up all required tables.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text unique not null,
    hashed_password text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security) on Users
alter table public.users enable row level security;
create policy "Allow public read/write on users table" on public.users for all using (true);

-- 2. SESSIONS TABLE
create table if not exists public.sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    title text default 'New Conversation' not null,
    model text default 'qwen2.5' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Sessions
alter table public.sessions enable row level security;
create policy "Allow users to manage their own sessions" on public.sessions for all using (true);

-- 3. MESSAGES TABLE
create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references public.sessions(id) on delete cascade not null,
    role text not null, -- 'user' or 'assistant'
    content text not null,
    used_rag boolean default false not null,
    sources jsonb, -- stores document sources details if used_rag is true
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Messages
alter table public.messages enable row level security;
create policy "Allow users to manage their own messages" on public.messages for all using (true);

-- 4. DOCUMENTS TABLE
create table if not exists public.documents (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    filename text not null,
    file_path text not null,
    chunk_count integer not null,
    uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Documents
alter table public.documents enable row level security;
create policy "Allow users to manage their own documents" on public.documents for all using (true);

-- 5. TRIAL USAGE TABLE (Used for anonymous or quick trial check)
create table if not exists public.trial_usage (
    session_key text primary key,
    message_count integer default 1 not null,
    used_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trial_usage
add column if not exists message_count integer default 1 not null;

-- Enable RLS on Trial Usage
alter table public.trial_usage enable row level security;
create policy "Allow public access to trial usage" on public.trial_usage for all using (true);

-- 6. OTP CODES TABLE
-- Stores OTP login codes in Supabase so any load-balanced backend instance can verify them.
create table if not exists public.otp_codes (
    email text primary key,
    otp text not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.otp_codes enable row level security;
create policy "Allow public access to otp codes" on public.otp_codes for all using (true);

-- 7. USER LEARNINGS TABLE
-- Stores self-learning memory centrally so all backend instances share the same user preferences.
create table if not exists public.user_learnings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete cascade not null,
    learning text not null,
    normalized_learning text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, normalized_learning)
);

alter table public.user_learnings enable row level security;
create policy "Allow users to manage their own learnings" on public.user_learnings for all using (true);
