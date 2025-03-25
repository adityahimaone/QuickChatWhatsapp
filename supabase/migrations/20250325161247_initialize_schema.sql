-- Create a clean messages table from scratch
DROP TABLE IF EXISTS public.messages;

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone_number TEXT NOT NULL,
  country_code TEXT NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Set up simple RLS that works with NextAuth's email authentication
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Allow access via email" ON public.messages;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.messages;

-- Create policies that work with email authentication
CREATE POLICY "Users can read their own messages" 
ON public.messages
FOR SELECT 
TO authenticated
USING (user_email = auth.email());

CREATE POLICY "Users can insert messages with their email" 
ON public.messages
FOR ALL 
TO authenticated
WITH CHECK (user_email = auth.email());

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.messages TO authenticated;