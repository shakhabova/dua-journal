-- Migration to drop user_duas and create user_duas_v2
DROP TABLE IF EXISTS public.user_duas CASCADE;

CREATE TABLE IF NOT EXISTS public.user_duas_v2 (
  id text PRIMARY key,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data text NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_duas_v2 ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can insert their own duas"
  ON public.user_duas_v2 FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own duas"
  ON public.user_duas_v2 FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own duas"
  ON public.user_duas_v2 FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own duas"
  ON public.user_duas_v2 FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
