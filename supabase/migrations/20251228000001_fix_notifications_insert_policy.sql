-- Fix notifications insert policy to allow users to create notifications for themselves
-- Drop existing policy if exists
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON public.notifications;

-- Create policy that allows users to insert notifications for themselves
CREATE POLICY "Users can create own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to create notifications for any user
CREATE POLICY "Admins can create notifications for any user"
ON public.notifications
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);

