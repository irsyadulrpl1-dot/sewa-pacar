-- ============================================
-- MIGRATION: CREATE NOTIFICATIONS TABLE
-- ============================================
-- Copy dan paste script ini ke Supabase Dashboard → SQL Editor
-- Lalu klik RUN
-- ============================================

-- Step 1: Create notification type enum (only if it doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'payment_approved',
      'payment_rejected',
      'payment_pending',
      'booking_confirmed',
      'booking_cancelled',
      'system_announcement',
      'payment_created',
      'payment_expired'
    );
    RAISE NOTICE 'Enum notification_type created';
  ELSE
    RAISE NOTICE 'Enum notification_type already exists';
  END IF;
END $$;

-- Step 2: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  related_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Step 3: Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);

-- Step 5: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON public.notifications;

-- Step 6: Create RLS Policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, delete)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Users can create notifications for themselves
CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can create notifications for any user
CREATE POLICY "Admins can create notifications for any user"
ON public.notifications
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

-- Step 7: Create helper functions
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_all_read_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE user_id = auth.uid() AND is_read = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Enable realtime for notifications
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    RAISE NOTICE 'Realtime enabled for notifications table';
  ELSE
    RAISE NOTICE 'Realtime already enabled for notifications table';
  END IF;
END $$;

-- Step 9: Create trigger for read_at
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.read_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notifications_read_at ON public.notifications;
CREATE TRIGGER update_notifications_read_at
BEFORE UPDATE OF is_read ON public.notifications
FOR EACH ROW
WHEN (NEW.is_read = true AND OLD.is_read = false)
EXECUTE FUNCTION public.update_notifications_updated_at();

-- ============================================
-- VERIFICATION
-- ============================================
-- Setelah menjalankan script ini, verifikasi dengan:
-- 1. Buka Table Editor → cek apakah tabel 'notifications' ada
-- 2. Buka Authentication → Policies → cek policies untuk 'notifications'
-- 3. Refresh browser dan coba akses halaman Notifications
-- ============================================

SELECT 'Migration completed successfully!' as status;

