-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_id TEXT, -- Changed to TEXT to support both UUID and string IDs from static data
  package_name TEXT NOT NULL,
  package_duration TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_companion_id ON public.bookings(companion_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON public.bookings(payment_id);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Companions can view bookings for them (supports both UUID and TEXT companion_id)
CREATE POLICY "Companions can view their bookings"
ON public.bookings
FOR SELECT
USING (
  bookings.companion_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      -- Match by UUID string comparison (all as text)
      profiles.user_id::text = bookings.companion_id 
      -- Or match by profile id as text
      OR profiles.id::text = bookings.companion_id
    )
  )
);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can create their own bookings
CREATE POLICY "Users can create own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending bookings
CREATE POLICY "Users can update own pending bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Companions can update bookings for them (supports both UUID and TEXT companion_id)
CREATE POLICY "Companions can update their bookings"
ON public.bookings
FOR UPDATE
USING (
  bookings.companion_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND (
      -- Match by UUID string comparison (all as text)
      profiles.user_id::text = bookings.companion_id 
      -- Or match by profile id as text
      OR profiles.id::text = bookings.companion_id
    )
  )
);

-- Admins can update all bookings
CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

