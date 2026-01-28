-- Create enum for info categories
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'info_category') THEN
    CREATE TYPE public.info_category AS ENUM ('tips', 'announcement', 'guide', 'system_update');
  END IF;
END $$;

-- Create info table
CREATE TABLE IF NOT EXISTS public.info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category public.info_category NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.info ENABLE ROW LEVEL SECURITY;

-- Timestamps trigger
CREATE OR REPLACE FUNCTION public.update_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_info_updated_at ON public.info;
CREATE TRIGGER update_info_updated_at
  BEFORE UPDATE ON public.info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_info_updated_at();

-- Read policy for everyone (including anonymous)
CREATE POLICY IF NOT EXISTS "Anyone can read info"
  ON public.info
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Insert policy: only admins
CREATE POLICY IF NOT EXISTS "Admins can insert info"
  ON public.info
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update policy: only admins
CREATE POLICY IF NOT EXISTS "Admins can update info"
  ON public.info
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Delete policy: only admins
CREATE POLICY IF NOT EXISTS "Admins can delete info"
  ON public.info
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS info_category_idx ON public.info (category);
CREATE INDEX IF NOT EXISTS info_updated_at_idx ON public.info (updated_at DESC);

-- Grants for reading via client
GRANT SELECT ON public.info TO authenticated, anon;
