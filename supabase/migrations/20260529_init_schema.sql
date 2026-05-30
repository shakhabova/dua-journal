-- Create user_duas table
create table if not exists public.user_duas (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text,
  text text not null,
  text_ar text,
  transcription text,
  reference text,
  date_added timestamp with time zone default timezone('utc'::text, now()) not null,
  answered_at timestamp with time zone,
  answer_note text,
  is_answered boolean default false not null,
  is_custom boolean default true not null,
  original_dua_id text
);

-- Enable Row Level Security (RLS)
alter table public.user_duas enable row level security;

-- Create policies for RLS
create policy "Users can insert their own duas"
  on public.user_duas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own duas"
  on public.user_duas for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own duas"
  on public.user_duas for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own duas"
  on public.user_duas for delete
  to authenticated
  using (auth.uid() = user_id);
