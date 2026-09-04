-- Create Notes Table
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null default 'New Note',
  content text default '',
  images jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security (RLS)
alter table public.notes enable row level security;

-- Create RLS Policies
create policy "Users can view their own notes"
  on public.notes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own notes"
  on public.notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own notes"
  on public.notes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own notes"
  on public.notes for delete
  using ( auth.uid() = user_id );
