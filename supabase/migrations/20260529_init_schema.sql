-- Create user_duas_v2 table
create table if not exists public.user_duas_v2 (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data text not null
);

-- Enable Row Level Security (RLS)
alter table public.user_duas_v2 enable row level security;

-- Create policies for RLS
create policy "Users can insert their own duas"
  on public.user_duas_v2 for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view their own duas"
  on public.user_duas_v2 for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own duas"
  on public.user_duas_v2 for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own duas"
  on public.user_duas_v2 for delete
  to authenticated
  using (auth.uid() = user_id);
